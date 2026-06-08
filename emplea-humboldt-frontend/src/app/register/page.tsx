'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GraduationCap, Building2, Eye, EyeOff, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { authApi, setTokens, ApiError } from '@/lib/api'

type Role = 'estudiante' | 'empresa'

const ROLES: { key: Role; label: string; desc: string; icon: React.ElementType }[] = [
  {
    key: 'estudiante',
    label: 'Soy estudiante',
    desc: 'Busco prácticas y empleos acordes a mi carrera',
    icon: GraduationCap,
  },
  {
    key: 'empresa',
    label: 'Soy empresa',
    desc: 'Quiero publicar vacantes y encontrar talento universitario',
    icon: Building2,
  },
]

// Shared fields
const baseSchema = {
  email:     z.string().email('Correo no válido'),
  password:  z.string().min(8, 'Mínimo 8 caracteres'),
  confirmar: z.string(),
}

const estudianteSchema = z.object({
  ...baseSchema,
  nombre:        z.string().min(3, 'Requerido'),
  apellido:      z.string().min(3, 'Requerido'),
  universidad:   z.string().min(3, 'Requerido'),
  programa:      z.string().min(3, 'Requerido'),
  semestre:      z.coerce.number().min(1).max(12),
  disponibilidad:z.enum(['tiempo_completo', 'medio_tiempo', 'fines_de_semana']),
  terminos:      z.literal(true, { errorMap: () => ({ message: 'Debes aceptar los términos' }) }),
}).refine(d => d.password === d.confirmar, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar'],
})

const empresaSchema = z.object({
  ...baseSchema,
  nombre:       z.string().min(3, 'Requerido'),
  razonSocial:  z.string().min(3, 'Requerido'),
  nit:          z.string().min(9, 'NIT no válido'),
  sector:       z.string().min(2, 'Requerido'),
  ciudad:       z.string().min(2, 'Requerido'),
  terminos:     z.literal(true, { errorMap: () => ({ message: 'Debes aceptar los términos' }) }),
}).refine(d => d.password === d.confirmar, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar'],
})

type EstudianteForm = z.infer<typeof estudianteSchema>
type EmpresaForm    = z.infer<typeof empresaSchema>

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Mínimo 8 caracteres', ok: password.length >= 8 },
    { label: 'Una mayúscula',        ok: /[A-Z]/.test(password) },
    { label: 'Un número',            ok: /\d/.test(password) },
  ]
  if (!password) return null
  return (
    <div className="flex gap-3 mt-1.5">
      {checks.map(c => (
        <span key={c.label} className={cn('flex items-center gap-1 text-2xs', c.ok ? 'text-semantic-success' : 'text-ink-muted')}>
          <Check size={10} />
          {c.label}
        </span>
      ))}
    </div>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-semantic-error mt-1">{msg}</p>
}

function FormInput({
  label, error, required: req, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-ink-secondary">
        {label}{req && <span className="text-brand-red ml-0.5">*</span>}
      </label>
      <input
        className={cn(
          'h-9 px-3 bg-surface-2 border rounded text-sm text-ink-primary placeholder:text-ink-muted',
          'outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-colors',
          error ? 'border-semantic-error' : 'border-default',
        )}
        {...props}
      />
      <FieldError msg={error} />
    </div>
  )
}

function FormSelect({
  label, error, required: req, children, ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-ink-secondary">
        {label}{req && <span className="text-brand-red ml-0.5">*</span>}
      </label>
      <select
        className={cn(
          'h-9 px-3 bg-surface-2 border rounded text-sm text-ink-primary',
          'outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-colors',
          error ? 'border-semantic-error' : 'border-default',
        )}
        {...props}
      >
        {children}
      </select>
      <FieldError msg={error} />
    </div>
  )
}

function EstudianteFields() {
  const { register, watch, formState: { errors }, handleSubmit } = useForm<EstudianteForm>({
    resolver: zodResolver(estudianteSchema),
  })
  const router  = useRouter()
  const [show, setShow]   = useState(false)
  const [show2, setShow2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const pw = watch('password', '')

  async function onSubmit(data: EstudianteForm) {
    setServerError('')
    setLoading(true)
    try {
      await authApi.registroEstudiante({
        email: data.email,
        password: data.password,
        nombres: data.nombre,
        apellidos: data.apellido,
        universidad: data.universidad,
        programa: data.programa,
      })
      // Iniciar sesión automáticamente tras el registro
      const tokens = await authApi.login(data.email, data.password)
      setTokens(tokens.access_token, tokens.refresh_token)
      router.push('/estudiante/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(
          err.status === 400 || err.status === 409
            ? 'Ese correo ya está registrado.'
            : `No se pudo crear la cuenta (HTTP ${err.status}).`,
        )
      } else {
        setServerError('No se pudo conectar con el servidor. ¿Está corriendo el backend?')
      }
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <FormInput label="Nombre" required error={errors.nombre?.message} placeholder="Samuel" {...register('nombre')} />
        <FormInput label="Apellido" required error={errors.apellido?.message} placeholder="Salcedo" {...register('apellido')} />
      </div>
      <FormInput label="Correo institucional" type="email" required error={errors.email?.message} placeholder="correo@unihumboldt.edu.co" {...register('email')} />
      <FormInput label="Universidad" required error={errors.universidad?.message} placeholder="Universidad Alexander Von Humboldt" {...register('universidad')} />
      <div className="grid sm:grid-cols-2 gap-4">
        <FormInput label="Programa académico" required error={errors.programa?.message} placeholder="Ingeniería de Software" {...register('programa')} />
        <FormInput label="Semestre actual" type="number" min={1} max={12} required error={errors.semestre?.message} placeholder="7" {...register('semestre')} />
      </div>
      <FormSelect label="Disponibilidad" required error={errors.disponibilidad?.message} {...register('disponibilidad')}>
        <option value="">Selecciona...</option>
        <option value="tiempo_completo">Tiempo completo</option>
        <option value="medio_tiempo">Medio tiempo</option>
        <option value="fines_de_semana">Fines de semana</option>
      </FormSelect>

      {/* Password */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink-secondary">Contraseña <span className="text-brand-red">*</span></label>
        <div className="relative">
          <input type={show ? 'text' : 'password'} placeholder="Mínimo 8 caracteres"
            className={cn('w-full h-9 pl-3 pr-10 bg-surface-2 border rounded text-sm text-ink-primary placeholder:text-ink-muted outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-colors', errors.password ? 'border-semantic-error' : 'border-default')}
            {...register('password')} />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <PasswordStrength password={pw} />
        <FieldError msg={errors.password?.message} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink-secondary">Confirmar contraseña <span className="text-brand-red">*</span></label>
        <div className="relative">
          <input type={show2 ? 'text' : 'password'} placeholder="Repite tu contraseña"
            className={cn('w-full h-9 pl-3 pr-10 bg-surface-2 border rounded text-sm text-ink-primary placeholder:text-ink-muted outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-colors', errors.confirmar ? 'border-semantic-error' : 'border-default')}
            {...register('confirmar')} />
          <button type="button" onClick={() => setShow2(!show2)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
            {show2 ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <FieldError msg={errors.confirmar?.message} />
      </div>

      <div className="flex items-start gap-2.5 pt-1">
        <input type="checkbox" id="terminos-est" {...register('terminos')}
          className="mt-0.5 accent-brand-blue w-4 h-4 flex-shrink-0" />
        <label htmlFor="terminos-est" className="text-xs text-ink-secondary leading-relaxed">
          Acepto los{' '}
          <a href="#" className="text-brand-blue hover:underline">términos y condiciones</a>
          {' '}y la{' '}
          <a href="#" className="text-brand-blue hover:underline">política de tratamiento de datos</a>
          {' '}(Ley 1581 de 2012)
        </label>
      </div>
      {errors.terminos && <FieldError msg={errors.terminos.message} />}

      {serverError && (
        <p className="text-xs text-semantic-error bg-semantic-error-bg border border-semantic-error-border rounded px-3 py-2">{serverError}</p>
      )}
      <button type="submit" disabled={loading}
        className="w-full h-10 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold text-sm rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center">
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>
  )
}

function EmpresaFields() {
  const { register, watch, formState: { errors }, handleSubmit } = useForm<EmpresaForm>({
    resolver: zodResolver(empresaSchema),
  })
  const router  = useRouter()
  const [show, setShow]   = useState(false)
  const [show2, setShow2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const pw = watch('password', '')

  async function onSubmit(data: EmpresaForm) {
    setServerError('')
    setLoading(true)
    try {
      await authApi.registroEmpresa({
        email: data.email,
        password: data.password,
        nombre_empresa: data.razonSocial,
        nit: data.nit,
        contacto_nombre: data.nombre,
      })
      // Iniciar sesión automáticamente tras el registro
      const tokens = await authApi.login(data.email, data.password)
      setTokens(tokens.access_token, tokens.refresh_token)
      router.push('/empresa/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(
          err.status === 400 || err.status === 409
            ? 'Ese correo ya está registrado.'
            : `No se pudo crear la cuenta (HTTP ${err.status}).`,
        )
      } else {
        setServerError('No se pudo conectar con el servidor. ¿Está corriendo el backend?')
      }
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput label="Nombre del contacto" required error={errors.nombre?.message} placeholder="Carlos Herrera" {...register('nombre')} />
      <FormInput label="Correo corporativo" type="email" required error={errors.email?.message} placeholder="contacto@empresa.com.co" {...register('email')} />
      <FormInput label="Razón social" required error={errors.razonSocial?.message} placeholder="TechCorp Colombia S.A.S" {...register('razonSocial')} />
      <div className="grid sm:grid-cols-2 gap-4">
        <FormInput label="NIT" required error={errors.nit?.message} placeholder="900.123.456-7" {...register('nit')} />
        <FormInput label="Ciudad" required error={errors.ciudad?.message} placeholder="Armenia, Quindío" {...register('ciudad')} />
      </div>
      <FormInput label="Sector / Industria" required error={errors.sector?.message} placeholder="Tecnología" {...register('sector')} />

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink-secondary">Contraseña <span className="text-brand-red">*</span></label>
        <div className="relative">
          <input type={show ? 'text' : 'password'} placeholder="Mínimo 8 caracteres"
            className={cn('w-full h-9 pl-3 pr-10 bg-surface-2 border rounded text-sm text-ink-primary placeholder:text-ink-muted outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-colors', errors.password ? 'border-semantic-error' : 'border-default')}
            {...register('password')} />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <PasswordStrength password={pw} />
        <FieldError msg={errors.password?.message} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink-secondary">Confirmar contraseña <span className="text-brand-red">*</span></label>
        <div className="relative">
          <input type={show2 ? 'text' : 'password'} placeholder="Repite tu contraseña"
            className={cn('w-full h-9 pl-3 pr-10 bg-surface-2 border rounded text-sm text-ink-primary placeholder:text-ink-muted outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-colors', errors.confirmar ? 'border-semantic-error' : 'border-default')}
            {...register('confirmar')} />
          <button type="button" onClick={() => setShow2(!show2)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">
            {show2 ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <FieldError msg={errors.confirmar?.message} />
      </div>

      <div className="flex items-start gap-2.5 pt-1">
        <input type="checkbox" id="terminos-emp" {...register('terminos')}
          className="mt-0.5 accent-brand-blue w-4 h-4 flex-shrink-0" />
        <label htmlFor="terminos-emp" className="text-xs text-ink-secondary leading-relaxed">
          Acepto los{' '}
          <a href="#" className="text-brand-blue hover:underline">términos y condiciones</a>
          {' '}y la{' '}
          <a href="#" className="text-brand-blue hover:underline">política de tratamiento de datos</a>
          {' '}(Ley 1581 de 2012)
        </label>
      </div>
      {errors.terminos && <FieldError msg={errors.terminos.message} />}

      {serverError && (
        <p className="text-xs text-semantic-error bg-semantic-error-bg border border-semantic-error-border rounded px-3 py-2">{serverError}</p>
      )}
      <button type="submit" disabled={loading}
        className="w-full h-10 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold text-sm rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center">
        {loading ? 'Creando cuenta...' : 'Crear cuenta empresarial'}
      </button>
    </form>
  )
}

export default function RegisterPage() {
  const [role, setRole] = useState<Role>('estudiante')

  return (
    <div className="min-h-screen bg-surface-1 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[40%] bg-brand-blue flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width: `${120 + i * 80}px`, height: `${120 + i * 80}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          ))}
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">Emplea Humboldt</p>
              <p className="text-white/60 text-xs mt-0.5">Universidad Alexander Von Humboldt</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight max-w-xs">
            Únete a la comunidad.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mt-4 max-w-xs">
            Crea tu cuenta y empieza a conectar con oportunidades reales o con el mejor talento universitario.
          </p>
        </div>

        <p className="relative z-10 text-white/50 text-xs">
          © 2026 Emplea Humboldt · Universidad Alexander Von Humboldt
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <p className="font-bold text-ink-primary">Emplea Humboldt</p>
          </div>

          <h1 className="text-2xl font-bold text-ink-primary mb-1">Crear cuenta</h1>
          <p className="text-sm text-ink-tertiary mb-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-brand-blue font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map(({ key, label, desc, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setRole(key)}
                className={cn(
                  'text-left p-3 rounded-lg border transition-colors',
                  role === key
                    ? 'border-brand-blue bg-brand-blue/5 ring-2 ring-brand-blue/15'
                    : 'border-default bg-surface-2 hover:border-ink-muted',
                )}
              >
                <Icon size={18} className={role === key ? 'text-brand-blue' : 'text-ink-tertiary'} />
                <p className="text-sm font-semibold text-ink-primary mt-2">{label}</p>
                <p className="text-2xs text-ink-tertiary mt-0.5 leading-snug">{desc}</p>
              </button>
            ))}
          </div>

          {role === 'estudiante' ? <EstudianteFields /> : <EmpresaFields />}
        </div>
      </div>
    </div>
  )
}
