# Guía de Despliegue - Emplea Humboldt

Esta guía detalla el proceso completo para desplegar la plataforma Emplea Humboldt desde cero en AWS.

## Tabla de Contenidos

1. [Prerequisitos](#prerequisitos)
2. [Configuración Inicial](#configuración-inicial)
3. [Despliegue de Infraestructura](#despliegue-de-infraestructura)
4. [Despliegue de Microservicios](#despliegue-de-microservicios)
5. [Despliegue del Frontend](#despliegue-del-frontend)
6. [Verificación en AWS](#verificación-en-aws)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisitos

### Herramientas Necesarias

- **AWS CLI** (v2.x o superior)
- **Terraform** (v1.5.x o superior)
- **Git**
- **Cuenta de AWS** con permisos de administrador
- **GitHub Account** con acceso a los repositorios

### Repositorios del Proyecto

```
emplea-humboldt/
├── emplea-humboldt-infraestructura/
├── microservicio-autenticacion-usuarios/
├── microservicio-empleos/
├── microservicio-postulaciones/
├── microservicio-seguimiento/
├── microservicio-notificaciones/
└── emplea-humboldt-frontend/
```

---

## Configuración Inicial

### 1. Configurar AWS CLI

```bash
aws configure
```

Ingresa:
- **AWS Access Key ID**: Tu access key
- **AWS Secret Access Key**: Tu secret key
- **Default region**: `us-east-1`
- **Default output format**: `json`

Verifica la configuración:
```bash
aws sts get-caller-identity
```

### 2. Clonar Repositorios

```bash
# Crear directorio del proyecto
mkdir emplea-humboldt
cd emplea-humboldt

# Clonar todos los repositorios
git clone https://github.com/123samuel10/emplea-humboldt-infraestructura.git
git clone https://github.com/123samuel10/microservicio-autenticacion-usuarios.git
git clone https://github.com/123samuel10/microservicio-empleos.git
git clone https://github.com/123samuel10/microservicio-postulaciones.git
git clone https://github.com/123samuel10/microservicio-seguimiento.git
git clone https://github.com/123samuel10/microservicio-notificaciones.git
git clone https://github.com/123samuel10/emplea-humboldt-frontend.git
```

---

## Despliegue de Infraestructura

### 1. Configurar Secrets de GitHub para Infraestructura

Ve a: `https://github.com/123samuel10/emplea-humboldt-infraestructura/settings/secrets/actions`

Crea los siguientes secrets:

| Secret Name | Descripción | Cómo obtenerlo |
|-------------|-------------|----------------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key | IAM Console → Users → Security credentials |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | IAM Console → Users → Security credentials |
| `AWS_REGION` | Región AWS | `us-east-1` |

### 2. Inicializar Backend de Terraform

El backend S3 se creará automáticamente en el primer deploy. Verifica el archivo `backend.tf`:

```hcl
terraform {
  backend "s3" {
    bucket         = "emplea-humboldt-terraform-state"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
  }
}
```

### 3. Desplegar Infraestructura

**Opción A: Desde GitHub Actions (Recomendado)**

1. Ve al repositorio en GitHub: `emplea-humboldt-infraestructura`
2. Click en **Actions** → **Terraform CI/CD**
3. Click en **Run workflow** → **Run workflow** (en main branch)
4. Espera 10-15 minutos a que complete

**Opción B: Desde Local**

```bash
cd emplea-humboldt-infraestructura

# Inicializar Terraform
terraform init

# Ver plan de ejecución
terraform plan

# Aplicar cambios
terraform apply
```

Escribe `yes` cuando te lo solicite.

### 4. Guardar Outputs de Infraestructura

Una vez completado el despliegue, obtén los outputs:

```bash
terraform output
```

Guarda esta información (la necesitarás después):

```
alb_dns_name = "emplea-humboldt-alb-XXXXXXXXXX.us-east-1.elb.amazonaws.com"
api_gateway_url = "https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/prd/"
amplify_app_url = "https://main.XXXXXXXXXX.amplifyapp.com"
rds_endpoint = "emplea-humboldt-postgres.XXXXXXXXXX.us-east-1.rds.amazonaws.com"
ecr_repository_urls = {
  "autenticacion" = "XXXXXXXXXXXX.dkr.ecr.us-east-1.amazonaws.com/emplea-humboldt-autenticacion"
  "empleos" = "XXXXXXXXXXXX.dkr.ecr.us-east-1.amazonaws.com/emplea-humboldt-empleos"
  ...
}
```

---

## Despliegue de Microservicios

### 1. Obtener Credenciales de RDS

```bash
# Obtener ARN del secret
terraform output rds_secret_arn

# Obtener credenciales
aws secretsmanager get-secret-value \
  --secret-id <ARN_DEL_SECRET> \
  --region us-east-1 \
  --query SecretString \
  --output text | jq .
```

Guarda estos valores:
- `username`
- `password`
- `dbname` (normalmente `postgres`)
- `host` (el RDS endpoint)
- `port` (normalmente `5432`)

### 2. Configurar Secrets para Cada Microservicio

Configura los siguientes secrets en **CADA** repositorio de microservicio:

#### Microservicio Autenticación
Repositorio: `microservicio-autenticacion-usuarios/settings/secrets/actions`

| Secret Name | Valor |
|-------------|-------|
| `AWS_ACCESS_KEY_ID` | Tu AWS Access Key |
| `AWS_SECRET_ACCESS_KEY` | Tu AWS Secret Key |
| `AWS_REGION` | `us-east-1` |
| `ECR_REPOSITORY` | `emplea-humboldt-autenticacion` |
| `ECS_SERVICE` | `autenticacion-service` |
| `ECS_CLUSTER` | `emplea-humboldt-cluster` |
| `DATABASE_URL` | `postgresql+asyncpg://[username]:[password]@[rds_endpoint]:5432/auth_db` |
| `SECRET_KEY` | Generar: `openssl rand -hex 32` |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` |

#### Microservicio Empleos
Repositorio: `microservicio-empleos/settings/secrets/actions`

| Secret Name | Valor |
|-------------|-------|
| `AWS_ACCESS_KEY_ID` | Tu AWS Access Key |
| `AWS_SECRET_ACCESS_KEY` | Tu AWS Secret Key |
| `AWS_REGION` | `us-east-1` |
| `ECR_REPOSITORY` | `emplea-humboldt-empleos` |
| `ECS_SERVICE` | `empleos-service` |
| `ECS_CLUSTER` | `emplea-humboldt-cluster` |
| `DATABASE_URL` | `postgresql+asyncpg://[username]:[password]@[rds_endpoint]:5432/emp_db` |
| `AUTENTICACION_SERVICE_URL` | `http://autenticacion-service.emplea-humboldt-internal:8000` |

#### Microservicio Postulaciones
Repositorio: `microservicio-postulaciones/settings/secrets/actions`

| Secret Name | Valor |
|-------------|-------|
| `AWS_ACCESS_KEY_ID` | Tu AWS Access Key |
| `AWS_SECRET_ACCESS_KEY` | Tu AWS Secret Key |
| `AWS_REGION` | `us-east-1` |
| `ECR_REPOSITORY` | `emplea-humboldt-postulaciones` |
| `ECS_SERVICE` | `postulaciones-service` |
| `ECS_CLUSTER` | `emplea-humboldt-cluster` |
| `DATABASE_URL` | `postgresql+asyncpg://[username]:[password]@[rds_endpoint]:5432/post_db` |
| `AUTENTICACION_SERVICE_URL` | `http://autenticacion-service.emplea-humboldt-internal:8000` |
| `EMPLEOS_SERVICE_URL` | `http://empleos-service.emplea-humboldt-internal:8000` |
| `NOTIFICACIONES_SERVICE_URL` | `http://notificaciones-service.emplea-humboldt-internal:8000` |

#### Microservicio Seguimiento
Repositorio: `microservicio-seguimiento/settings/secrets/actions`

| Secret Name | Valor |
|-------------|-------|
| `AWS_ACCESS_KEY_ID` | Tu AWS Access Key |
| `AWS_SECRET_ACCESS_KEY` | Tu AWS Secret Key |
| `AWS_REGION` | `us-east-1` |
| `ECR_REPOSITORY` | `emplea-humboldt-seguimiento_practicas` |
| `ECS_SERVICE` | `seguimiento_practicas-service` |
| `ECS_CLUSTER` | `emplea-humboldt-cluster` |
| `DATABASE_URL` | `postgresql+asyncpg://[username]:[password]@[rds_endpoint]:5432/pra_db` |
| `AUTENTICACION_SERVICE_URL` | `http://autenticacion-service.emplea-humboldt-internal:8000` |
| `POSTULACIONES_SERVICE_URL` | `http://postulaciones-service.emplea-humboldt-internal:8000` |

#### Microservicio Notificaciones
Repositorio: `microservicio-notificaciones/settings/secrets/actions`

| Secret Name | Valor |
|-------------|-------|
| `AWS_ACCESS_KEY_ID` | Tu AWS Access Key |
| `AWS_SECRET_ACCESS_KEY` | Tu AWS Secret Key |
| `AWS_REGION` | `us-east-1` |
| `ECR_REPOSITORY` | `emplea-humboldt-notificaciones` |
| `ECS_SERVICE` | `notificaciones-service` |
| `ECS_CLUSTER` | `emplea-humboldt-cluster` |
| `DATABASE_URL` | `postgresql+asyncpg://[username]:[password]@[rds_endpoint]:5432/noti_db` |

### 3. Ejecutar Pipelines de Microservicios

Para cada microservicio, ve a su repositorio en GitHub:

1. Click en **Actions**
2. Selecciona el workflow (ejemplo: "Autenticacion CI/CD Pipeline")
3. Click en **Run workflow** → Selecciona `main` → **Run workflow**

**Orden recomendado de despliegue:**

1. ✅ **Autenticación** (primero, otros dependen de él)
2. ✅ **Notificaciones** (segundo, postulaciones depende de él)
3. ✅ **Empleos** (tercero, postulaciones depende de él)
4. ✅ **Postulaciones** (cuarto, seguimiento depende de él)
5. ✅ **Seguimiento** (último)

Cada pipeline toma aproximadamente 5-7 minutos.

### 4. Verificar que las Bases de Datos se Crearon

Las bases de datos se crean automáticamente con las migraciones de Alembic. Verifica:

```bash
# Conectarse a RDS (usando el endpoint de terraform output)
psql -h emplea-humboldt-postgres.XXXXXXXXXX.us-east-1.rds.amazonaws.com \
     -U [username] \
     -d postgres

# Una vez conectado, listar bases de datos
\l

# Deberías ver:
# - auth_db
# - emp_db
# - post_db
# - pra_db
# - noti_db
```

---

## Despliegue del Frontend

### 1. Configurar Variables de Entorno en Amplify

1. Ve a la **Consola de AWS** → **AWS Amplify**
2. Selecciona la app: `emplea-humboldt-frontend`
3. Click en **Environment variables** (panel izquierdo)
4. Agrega la siguiente variable:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | El `api_gateway_url` de terraform output (ejemplo: `https://XXXXXXXXXX.execute-api.us-east-1.amazonaws.com/prd`) |

### 2. Conectar Repositorio y Desplegar

Si no está conectado automáticamente:

1. En AWS Amplify → Click en **Host web app**
2. Selecciona **GitHub**
3. Autoriza AWS Amplify
4. Selecciona el repositorio: `emplea-humboldt-frontend`
5. Branch: `main`
6. Click en **Save and deploy**

El build tomará aproximadamente 5-10 minutos.

### 3. Obtener URL del Frontend

Una vez completado:

```bash
cd emplea-humboldt-infraestructura
terraform output amplify_app_url
```

O desde la consola de Amplify, verás el dominio generado (ejemplo: `https://main.d2pzb9m4eoaiu0.amplifyapp.com`).

---

## Verificación en AWS

### 1. Verificar VPC y Redes

**AWS Console → VPC**

✅ Verificar que existe:
- **VPC**: `emplea-humboldt-vpc` con CIDR `10.0.0.0/16`
- **Subnets**:
  - 2 subnets públicas: `10.0.1.0/24`, `10.0.2.0/24`
  - 2 subnets privadas: `10.0.101.0/24`, `10.0.102.0/24`
- **Internet Gateway**: Conectado a la VPC
- **NAT Gateways**: 2 NAT gateways (uno en cada subnet pública)
- **Route Tables**:
  - Route table pública (rutas a Internet Gateway)
  - Route tables privadas (rutas a NAT Gateway)

### 2. Verificar RDS (Base de Datos)

**AWS Console → RDS → Databases**

✅ Verificar:
- **DB Identifier**: `emplea-humboldt-postgres`
- **Engine**: PostgreSQL 15.x
- **Status**: ✅ Available (verde)
- **Endpoint**: Coincide con `terraform output rds_endpoint`
- **VPC**: `emplea-humboldt-vpc`
- **Subnets**: Privadas (no accesible desde internet)
- **Security Group**: Permite puerto 5432 desde subnets privadas

**Conectarse para verificar bases de datos:**

```bash
# Necesitas estar en la VPC o usar un bastion host
# Alternativa: usar AWS Systems Manager Session Manager

# Listar bases de datos
psql -h [rds_endpoint] -U [username] -d postgres -c "\l"
```

Deberías ver 5 bases de datos creadas:
- `auth_db` (autenticación)
- `emp_db` (empleos)
- `post_db` (postulaciones)
- `pra_db` (prácticas/seguimiento)
- `noti_db` (notificaciones)

### 3. Verificar ECR (Container Registry)

**AWS Console → ECR → Repositories**

✅ Verificar que existen 5 repositorios:
- `emplea-humboldt-autenticacion`
- `emplea-humboldt-empleos`
- `emplea-humboldt-postulaciones`
- `emplea-humboldt-seguimiento_practicas`
- `emplea-humboldt-notificaciones`

Cada repositorio debe tener al menos 1 imagen con tag `latest`.

**Desde CLI:**
```bash
# Listar imágenes en un repositorio
aws ecr describe-images \
  --repository-name emplea-humboldt-autenticacion \
  --region us-east-1
```

### 4. Verificar ECS (Contenedores)

**AWS Console → ECS → Clusters**

✅ Verificar Cluster:
- **Cluster Name**: `emplea-humboldt-cluster`
- **Status**: ACTIVE
- **Services**: 5 servicios
- **Tasks running**: 5 tasks (uno por servicio)

**Verificar cada servicio:**

Click en el cluster → Tab **Services**

| Service Name | Desired tasks | Running tasks | Status |
|--------------|---------------|---------------|--------|
| `autenticacion-service` | 1 | 1 | ✅ ACTIVE |
| `empleos-service` | 1 | 1 | ✅ ACTIVE |
| `postulaciones-service` | 1 | 1 | ✅ ACTIVE |
| `seguimiento_practicas-service` | 1 | 1 | ✅ ACTIVE |
| `notificaciones-service` | 1 | 1 | ✅ ACTIVE |

**Verificar Tasks (contenedores):**

Click en un servicio → Tab **Tasks** → Click en el Task ID

✅ Verificar:
- **Last status**: RUNNING
- **Health status**: HEALTHY (después de ~30 segundos)
- **Containers**: 1 container RUNNING

**Ver logs de un contenedor:**

1. En la página del Task → Tab **Logs**
2. O desde CLI:
   ```bash
   # Listar tasks
   aws ecs list-tasks \
     --cluster emplea-humboldt-cluster \
     --service-name autenticacion-service \
     --region us-east-1

   # Ver logs (reemplaza TASK_ID)
   aws logs tail /ecs/autenticacion-service \
     --follow \
     --region us-east-1
   ```

Deberías ver logs como:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 5. Verificar Application Load Balancer (ALB)

**AWS Console → EC2 → Load Balancers**

✅ Verificar ALB:
- **Name**: `emplea-humboldt-alb`
- **State**: ✅ active
- **DNS name**: Coincide con `terraform output alb_dns_name`
- **VPC**: `emplea-humboldt-vpc`
- **Availability Zones**: 2 zonas (us-east-1a, us-east-1b)
- **Scheme**: internet-facing

**Verificar Listeners:**

Tab **Listeners** → Debería haber 1 listener:
- **Protocol**: HTTP
- **Port**: 80
- **Default action**: Forward to target group

**Verificar Target Groups:**

**AWS Console → EC2 → Target Groups**

Deberías ver 5 target groups:

| Target Group | Protocol | Port | Health checks | Registered targets |
|--------------|----------|------|---------------|-------------------|
| `autenticacion-tg-*` | HTTP | 8000 | `/autenticacion/health` | 1 healthy |
| `empleos-tg-*` | HTTP | 8000 | `/empleos/health` | 1 healthy |
| `postulaciones-tg-*` | HTTP | 8000 | `/postulaciones/health` | 1 healthy |
| `seguimiento-tg-*` | HTTP | 8000 | `/seguimiento_practicas/health` | 1 healthy |
| `notificaciones-tg-*` | HTTP | 8000 | `/notificaciones/health` | 1 healthy |

**Verificar health de targets:**

Click en un target group → Tab **Targets**

✅ Status: **healthy** (verde)

Si aparece "unhealthy" o "initial":
- Espera 30-60 segundos (el health check toma tiempo)
- Si persiste, revisa los logs del ECS task

**Probar ALB directamente:**

```bash
# Obtener DNS del ALB
ALB_DNS=$(cd emplea-humboldt-infraestructura && terraform output -raw alb_dns_name)

# Probar health check de autenticación
curl http://$ALB_DNS/autenticacion/health

# Debería retornar:
# {"status":"healthy","service":"autenticacion-usuarios"}

# Probar otros servicios
curl http://$ALB_DNS/empleos/health
curl http://$ALB_DNS/postulaciones/health
curl http://$ALB_DNS/seguimiento_practicas/health
curl http://$ALB_DNS/notificaciones/health
```

### 6. Verificar API Gateway

**AWS Console → API Gateway**

✅ Verificar:
- **API Name**: `emplea-humboldt-api`
- **Type**: HTTP API
- **Stage**: `prd`
- **Invoke URL**: Coincide con `terraform output api_gateway_url`

**Verificar Integrations:**

Click en la API → **Integrations** (panel izquierdo)

Deberías ver 5 integraciones HTTP_PROXY:
- `ANY /autenticacion/{proxy+}` → ALB
- `ANY /empleos/{proxy+}` → ALB
- `ANY /postulaciones/{proxy+}` → ALB
- `ANY /seguimiento_practicas/{proxy+}` → ALB
- `ANY /notificaciones/{proxy+}` → ALB

**Probar API Gateway:**

```bash
# Obtener URL del API Gateway
API_URL=$(cd emplea-humboldt-infraestructura && terraform output -raw api_gateway_url)

# Probar health checks
curl ${API_URL}autenticacion/health
curl ${API_URL}empleos/health
curl ${API_URL}postulaciones/health
curl ${API_URL}seguimiento_practicas/health
curl ${API_URL}notificaciones/health
```

Todos deberían retornar `{"status":"healthy","service":"..."}`.

### 7. Verificar AWS Amplify (Frontend)

**AWS Console → AWS Amplify**

✅ Verificar:
- **App name**: `emplea-humboldt-frontend`
- **Branch**: `main`
- **Status**: ✅ Deployed (verde)
- **Last deploy**: Exitoso
- **Domain**: `https://main.[app-id].amplifyapp.com`

**Verificar Build:**

Click en la app → Tab **Build history**

✅ Último build:
- **Status**: ✅ Succeed
- **Duration**: ~3-8 minutos
- **Steps completados**:
  - Provision
  - Build (npm install + npm run build)
  - Deploy
  - Verify

**Ver logs del build:**

Click en el último build para ver logs detallados.

**Verificar Variables de Entorno:**

Tab **Environment variables** → Debería estar configurado:
- `NEXT_PUBLIC_API_URL` = URL del API Gateway

**Probar el Frontend:**

```bash
# Obtener URL del frontend
FRONTEND_URL=$(cd emplea-humboldt-infraestructura && terraform output -raw amplify_app_url)

# Abrir en navegador
echo "Abre en tu navegador: $FRONTEND_URL"
```

O simplemente visita la URL en tu navegador.

### 8. Verificar CloudWatch Logs

**AWS Console → CloudWatch → Log groups**

Deberías ver 5 log groups:
- `/ecs/autenticacion-service`
- `/ecs/empleos-service`
- `/ecs/postulaciones-service`
- `/ecs/seguimiento_practicas-service`
- `/ecs/notificaciones-service`

**Ver logs en tiempo real:**

```bash
# Ver logs de autenticación
aws logs tail /ecs/autenticacion-service --follow --region us-east-1

# Ver logs de empleos
aws logs tail /ecs/empleos-service --follow --region us-east-1
```

### 9. Pruebas End-to-End

#### Prueba 1: Health Checks

```bash
API_URL="https://qjvf7f8jgd.execute-api.us-east-1.amazonaws.com/prd"

echo "=== Probando health checks ==="
curl ${API_URL}/autenticacion/health
curl ${API_URL}/empleos/health
curl ${API_URL}/postulaciones/health
curl ${API_URL}/seguimiento_practicas/health
curl ${API_URL}/notificaciones/health
```

Todos deben retornar status `200 OK`.

#### Prueba 2: Registro de Usuario

```bash
# Registrar estudiante
curl -X POST "${API_URL}/autenticacion/api/v1/usuarios/registro/estudiante" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "Test1234!",
    "nombre_completo": "Usuario Test",
    "programa_academico": "Ingeniería de Sistemas",
    "semestre_actual": 5
  }'
```

Debería retornar `201 Created` con los datos del usuario.

#### Prueba 3: Login

```bash
# Login
TOKEN=$(curl -X POST "${API_URL}/autenticacion/api/v1/usuarios/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "Test1234!"
  }' | jq -r '.access_token')

echo "Token: $TOKEN"
```

#### Prueba 4: Listar Vacantes

```bash
# Listar vacantes (sin autenticación)
curl "${API_URL}/empleos/api/v1/vacantes" | jq .
```

Debería retornar un array (vacío si no hay vacantes, o con datos).

#### Prueba 5: Frontend

1. Abre el frontend en tu navegador
2. Verifica que carga correctamente
3. Intenta registrarte como estudiante
4. Intenta hacer login
5. Navega por las secciones (Empleos, Postulaciones, etc.)

---

## Troubleshooting

### Problema: ECS Tasks no inician (status STOPPED)

**Síntomas:**
- En ECS, los tasks aparecen como STOPPED
- No hay tasks running

**Solución:**
1. Ve a ECS → Cluster → Service → Tab "Events"
2. Lee el mensaje de error (común: "CannotPullContainerError")
3. Si es "CannotPullContainerError":
   - Verifica que la imagen existe en ECR
   - Verifica que el ECS Task Execution Role tiene permisos para ECR
4. Si es "Essential container exited":
   - Ve a CloudWatch Logs y busca errores de la aplicación
   - Común: error de conexión a base de datos

### Problema: Health checks "unhealthy" en ALB

**Síntomas:**
- Target groups muestran targets como "unhealthy"
- ALB no puede conectarse a los servicios

**Solución:**
1. Verifica que el ECS task está RUNNING
2. Revisa los logs en CloudWatch:
   ```bash
   aws logs tail /ecs/[service-name] --follow
   ```
3. Verifica que la app esté escuchando en el puerto 8000
4. Verifica la ruta del health check en el target group
5. Verifica el Security Group permite tráfico del ALB a los containers

### Problema: Base de datos no existe

**Síntomas:**
- Error en logs: "database does not exist"
- Tasks se detienen con error de DB

**Solución:**
Las bases de datos se crean automáticamente con Alembic. Si no se crearon:

1. Conéctate a RDS manualmente:
   ```bash
   psql -h [rds_endpoint] -U [username] -d postgres
   ```

2. Crea las bases de datos manualmente:
   ```sql
   CREATE DATABASE auth_db;
   CREATE DATABASE emp_db;
   CREATE DATABASE post_db;
   CREATE DATABASE pra_db;
   CREATE DATABASE noti_db;
   ```

3. Reinicia los ECS services para que corran las migraciones:
   ```bash
   aws ecs update-service \
     --cluster emplea-humboldt-cluster \
     --service autenticacion-service \
     --force-new-deployment \
     --region us-east-1
   ```

### Problema: Frontend no puede conectarse al backend

**Síntomas:**
- "No se pudo conectar con el servidor" en el frontend
- Errores de CORS en la consola del navegador

**Solución:**
1. Verifica que `NEXT_PUBLIC_API_URL` está configurado en Amplify
2. Verifica que apunta al API Gateway (no al ALB directamente)
3. Verifica que el API Gateway está funcionando:
   ```bash
   curl https://[api-gateway-url]/autenticacion/health
   ```
4. Si hay errores 307 (redirects), verifica que las rutas en FastAPI no tengan trailing slash:
   - Usar `@router.get("")` en lugar de `@router.get("/")`

### Problema: 404 Not Found en endpoints

**Síntomas:**
- Endpoints retornan 404
- Health checks funcionan pero otros endpoints no

**Solución:**
1. Verifica que `root_path` está configurado en cada microservicio:
   ```python
   app = FastAPI(
       root_path="/autenticacion",  # ← Importante
       ...
   )
   ```
2. Verifica las rutas en el ALB Listener Rules
3. Prueba directamente contra el ALB (sin API Gateway)

### Problema: Terraform apply falla

**Error común: State locked**
```
Error: Error acquiring the state lock
```

**Solución:**
```bash
# Forzar desbloqueo (usa el Lock ID del error)
terraform force-unlock [LOCK_ID]
```

**Error común: Resource already exists**
```
Error: resource already exists
```

**Solución:**
```bash
# Importar el recurso existente
terraform import [resource_type].[resource_name] [resource_id]

# O destruir y recrear
terraform destroy -target=[resource_type].[resource_name]
terraform apply
```

### Problema: Pipelines de GitHub Actions fallan

**Error: AWS credentials not configured**

**Solución:**
Verifica que los secrets están configurados en GitHub:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

**Error: No tests ran (exit code 5)**

**Solución:**
Ya está solucionado con `continue-on-error: true` en el paso de tests.

### Problema: Amplify build falla

**Error: Module not found**

**Solución:**
1. Verifica que `package.json` tiene todas las dependencias
2. Verifica que `next.config.mjs` tiene `output: 'standalone'`
3. Si el error persiste, verifica los archivos en el repositorio

**Error: Build timeout**

**Solución:**
Amplify tiene timeout de 30 minutos. Si excede:
1. Optimiza dependencias (elimina las no usadas)
2. Considera usar npm ci en lugar de npm install

---

## Resumen de URLs y Recursos

Después del despliegue, tendrás:

| Recurso | URL/Endpoint |
|---------|--------------|
| **Frontend** | `https://main.[app-id].amplifyapp.com` |
| **API Gateway** | `https://[api-id].execute-api.us-east-1.amazonaws.com/prd` |
| **ALB** | `http://emplea-humboldt-alb-[id].us-east-1.elb.amazonaws.com` |
| **RDS** | `emplea-humboldt-postgres.[id].us-east-1.rds.amazonaws.com:5432` |
| **ECS Cluster** | `emplea-humboldt-cluster` |
| **ECR Repositories** | `[account-id].dkr.ecr.us-east-1.amazonaws.com/emplea-humboldt-[service]` |

### Endpoints de API

| Servicio | Health Check | Base Path |
|----------|--------------|-----------|
| Autenticación | `/autenticacion/health` | `/autenticacion/api/v1` |
| Empleos | `/empleos/health` | `/empleos/api/v1` |
| Postulaciones | `/postulaciones/health` | `/postulaciones/api/v1` |
| Seguimiento | `/seguimiento_practicas/health` | `/seguimiento_practicas/api/v1` |
| Notificaciones | `/notificaciones/health` | `/notificaciones/api/v1` |

---

## Comandos Útiles

### Ver estado de todos los servicios

```bash
#!/bin/bash
CLUSTER="emplea-humboldt-cluster"
SERVICES=(
  "autenticacion-service"
  "empleos-service"
  "postulaciones-service"
  "seguimiento_practicas-service"
  "notificaciones-service"
)

for service in "${SERVICES[@]}"; do
  echo "=== $service ==="
  aws ecs describe-services \
    --cluster $CLUSTER \
    --services $service \
    --region us-east-1 \
    --query 'services[0].[serviceName,status,runningCount,desiredCount]' \
    --output table
done
```

### Reiniciar todos los servicios (force new deployment)

```bash
#!/bin/bash
CLUSTER="emplea-humboldt-cluster"
SERVICES=(
  "autenticacion-service"
  "empleos-service"
  "postulaciones-service"
  "seguimiento_practicas-service"
  "notificaciones-service"
)

for service in "${SERVICES[@]}"; do
  echo "Reiniciando $service..."
  aws ecs update-service \
    --cluster $CLUSTER \
    --service $service \
    --force-new-deployment \
    --region us-east-1
done
```

### Ver logs en tiempo real de todos los servicios

```bash
#!/bin/bash
# Requiere instalar "aws-logs" o usar tmux/screen

aws logs tail /ecs/autenticacion-service --follow &
aws logs tail /ecs/empleos-service --follow &
aws logs tail /ecs/postulaciones-service --follow &
aws logs tail /ecs/seguimiento_practicas-service --follow &
aws logs tail /ecs/notificaciones-service --follow &

wait
```

---

## Limpieza / Destrucción de Recursos

Si necesitas eliminar toda la infraestructura:

```bash
cd emplea-humboldt-infraestructura

# Ver qué se va a eliminar
terraform plan -destroy

# Eliminar todo
terraform destroy
```

**ADVERTENCIA:** Esto eliminará:
- Todos los servicios ECS
- El cluster ECS
- El ALB y target groups
- El API Gateway
- La instancia RDS (y sus datos)
- Todos los repositorios ECR (y las imágenes)
- La VPC y todos sus componentes
- La app de Amplify

---

## Contacto y Soporte

Para problemas o preguntas:
- Revisa primero la sección de [Troubleshooting](#troubleshooting)
- Revisa los logs en CloudWatch
- Revisa los eventos en ECS Services
- Consulta la documentación de AWS

---

**Última actualización:** Junio 2026
**Versión:** 1.0.0
