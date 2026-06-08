'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { authApi, setTokens, ApiError, type TipoUsuario } from '@/lib/api'

// A qué dashboard redirigir según el rol que devuelve el backend.
const DASHBOARD_POR_ROL: Record<TipoUsuario, string> = {
  estudiante: '/estudiante/dashboard',
  empresa: '/empresa/dashboard',
  administrador_institucional: '/admin/dashboard',
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [showPass, setShow]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1) Autenticar y guardar los tokens
      const tokens = await authApi.login(email, password)
      setTokens(tokens.access_token, tokens.refresh_token)

      // 2) Obtener el usuario para saber su rol y redirigir
      const me = await authApi.me()
      router.push(DASHBOARD_POR_ROL[me.tipo_usuario] ?? '/')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 401 || err.status === 422
            ? 'Correo o contraseña incorrectos.'
            : `Error del servidor (HTTP ${err.status}).`,
        )
      } else {
        setError('No se pudo conectar con el servidor. ¿Está corriendo el backend?')
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-1 flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[44%] bg-brand-blue flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: `${120 + i * 80}px`,
                height: `${120 + i * 80}px`,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
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

          <div className="space-y-4 max-w-xs">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Tu carrera<br />comienza aquí.
            </h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Conectamos estudiantes universitarios con las mejores oportunidades laborales y de práctica en Colombia.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { n: '500+',  label: 'Vacantes activas' },
            { n: '120+',  label: 'Empresas aliadas' },
            { n: '1.200', label: 'Estudiantes activos' },
          ].map(({ n, label }) => (
            <div key={label} className="bg-white/10 rounded-xl p-4">
              <p className="text-white font-bold text-xl leading-none">{n}</p>
              <p className="text-white/60 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <p className="font-bold text-ink-primary">Emplea Humboldt</p>
          </div>

          <h1 className="text-2xl font-bold text-ink-primary mb-1">Iniciar sesión</h1>
          <p className="text-sm text-ink-tertiary mb-7">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-brand-blue font-medium hover:underline">
              Regístrate aquí
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink-secondary">
                Correo electrónico <span className="text-brand-red">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                required
                placeholder="correo@unihumboldt.edu.co"
                className="h-10 px-3 bg-surface-2 border border-default rounded text-sm text-ink-primary placeholder:text-ink-muted outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-ink-secondary">
                  Contraseña <span className="text-brand-red">*</span>
                </label>
                <Link href="/forgot-password" className="text-xs text-brand-blue hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPass(e.target.value); setError('') }}
                  required
                  placeholder="••••••••"
                  className="w-full h-10 pl-3 pr-10 bg-surface-2 border border-default rounded text-sm text-ink-primary placeholder:text-ink-muted outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShow(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-semantic-error bg-semantic-error-bg border border-semantic-error-border rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold text-sm rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
