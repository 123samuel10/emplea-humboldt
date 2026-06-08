/**
 * Cliente central de API.
 *
 * Aquí viven las URLs base de cada microservicio (leídas del .env) y el helper
 * `apiFetch` que arma las rutas y maneja JWT/errores. Cada pantalla debe llamar
 * a las funciones de este archivo en lugar de usar `mock-data`.
 *
 * Al desplegar, solo se cambian las variables NEXT_PUBLIC_API_* en el entorno;
 * este código no se toca.
 */

// ── URLs base por microservicio ─────────────────────────────────────────────
// El fallback a localhost permite trabajar aunque falte el .env.local.
export const API = {
  auth:           process.env.NEXT_PUBLIC_API_AUTH           ?? 'http://localhost:8000',
  empleos:        process.env.NEXT_PUBLIC_API_EMPLEOS        ?? 'http://localhost:8001',
  postulaciones:  process.env.NEXT_PUBLIC_API_POSTULACIONES  ?? 'http://localhost:8002',
  seguimiento:    process.env.NEXT_PUBLIC_API_SEGUIMIENTO    ?? 'http://localhost:8003',
  notificaciones: process.env.NEXT_PUBLIC_API_NOTIFICACIONES ?? 'http://localhost:8004',
} as const

// ── Manejo del token JWT (localStorage) ─────────────────────────────────────
const ACCESS_KEY  = 'eh_access_token'
const REFRESH_KEY = 'eh_refresh_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_KEY)
}

export function setTokens(access: string, refresh?: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACCESS_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

// ── Helper de fetch ─────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type FetchOptions = Omit<RequestInit, 'body'> & {
  /** Adjunta el JWT en Authorization. Por defecto true. */
  auth?: boolean
  /** Body como objeto JS; se serializa a JSON automáticamente. */
  body?: unknown
}

/**
 * Realiza una petición a `${base}${path}` y devuelve el JSON tipado.
 * Lanza `ApiError` si la respuesta no es 2xx.
 */
export async function apiFetch<T>(base: string, path: string, options: FetchOptions = {}): Promise<T> {
  const { auth = true, body, headers, ...rest } = options
  const token = auth ? getToken() : null

  const res = await fetch(`${base}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  if (!res.ok) {
    let detail: unknown
    try { detail = await res.json() } catch { /* respuesta sin cuerpo JSON */ }
    throw new ApiError(res.status, `HTTP ${res.status} en ${path}`, detail)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ── Tipos de respuesta del backend ──────────────────────────────────────────
export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export type TipoUsuario = 'estudiante' | 'empresa' | 'administrador_institucional'

export interface UsuarioResponse {
  id: string
  email: string
  tipo_usuario: TipoUsuario
  activo: boolean
  email_verificado: boolean
  created_at: string
  perfil_estudiante?: unknown
  perfil_empresa?: unknown
}

// ── Endpoints: Autenticación y Usuarios (puerto 8000) ───────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<TokenResponse>(API.auth, '/api/v1/auth/login', {
      method: 'POST', auth: false, body: { email, password },
    }),

  me: () => apiFetch<UsuarioResponse>(API.auth, '/api/v1/usuarios/me'),

  registroEstudiante: (data: {
    email: string; password: string; nombres: string; apellidos: string
    universidad?: string; programa?: string
  }) =>
    apiFetch<UsuarioResponse>(API.auth, '/api/v1/usuarios/registro/estudiante', {
      method: 'POST', auth: false, body: data,
    }),

  registroEmpresa: (data: {
    email: string; password: string; nombre_empresa: string
    nit?: string; contacto_nombre?: string
  }) =>
    apiFetch<UsuarioResponse>(API.auth, '/api/v1/usuarios/registro/empresa', {
      method: 'POST', auth: false, body: data,
    }),

  logout: () =>
    apiFetch<void>(API.auth, '/api/v1/auth/logout', { method: 'POST' }),
}

// ── Otros servicios: añadir endpoints aquí a medida que se conecten ──────────
// Patrón a seguir (ejemplo cuando conectes el de empleos):
//
// export const empleosApi = {
//   listar: () => apiFetch<Vacante[]>(API.empleos, '/api/v1/vacantes'),
//   detalle: (id: string) => apiFetch<Vacante>(API.empleos, `/api/v1/vacantes/${id}`),
// }
//
// Revisa las rutas reales de cada servicio en su Swagger:
//   empleos        -> http://localhost:8001/docs
//   postulaciones  -> http://localhost:8002/docs
//   seguimiento    -> http://localhost:8003/docs
//   notificaciones -> http://localhost:8004/docs
