'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'

const schema = z.object({
  email: z.string().email('Correo no válido'),
})
type Form = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  })
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  function onSubmit(_data: Form) {
    setLoading(true)
    // TODO: conectar a un endpoint real de recuperación cuando exista en el backend.
    setTimeout(() => { setLoading(false); setEnviado(true) }, 700)
  }

  return (
    <div className="min-h-screen bg-surface-1 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-ink-tertiary hover:text-ink-secondary mb-8">
          <ArrowLeft size={15} /> Volver a iniciar sesión
        </Link>

        {enviado ? (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-semantic-success-bg flex items-center justify-center mx-auto mb-4">
              <MailCheck size={22} className="text-semantic-success" />
            </div>
            <h1 className="text-xl font-bold text-ink-primary mb-1">Revisa tu correo</h1>
            <p className="text-sm text-ink-tertiary">
              Si la cuenta existe, te enviamos un enlace para restablecer tu contraseña.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-ink-primary mb-1">¿Olvidaste tu contraseña?</h1>
            <p className="text-sm text-ink-tertiary mb-7">
              Ingresa tu correo y te enviaremos instrucciones para restablecerla.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-secondary">
                  Correo electrónico <span className="text-brand-red">*</span>
                </label>
                <input
                  type="email"
                  placeholder="correo@unihumboldt.edu.co"
                  className={cn(
                    'h-10 px-3 bg-surface-2 border rounded text-sm text-ink-primary placeholder:text-ink-muted outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 transition-colors',
                    errors.email ? 'border-semantic-error' : 'border-default',
                  )}
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-semantic-error">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold text-sm rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar instrucciones'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
