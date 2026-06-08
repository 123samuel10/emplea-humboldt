'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, ChevronDown } from 'lucide-react'
import { mockNotificaciones } from '@/lib/mock-data'
import { clearTokens } from '@/lib/api'
import { cn } from '@/lib/utils'

const TIPO_DOT: Record<string, string> = {
  success: 'bg-semantic-success',
  warning: 'bg-semantic-warning',
  info: 'bg-semantic-info',
  error: 'bg-semantic-error',
}

export function TopBar({ userName, subtitle }: { userName: string; subtitle?: string }) {
  const router = useRouter()
  const [openNotif, setOpenNotif] = useState(false)
  const [openUser, setOpenUser]   = useState(false)
  const noLeidas = mockNotificaciones.filter(n => !n.leida).length

  function logout() {
    clearTokens()
    router.push('/login')
  }

  const iniciales = userName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <header className="h-14 bg-surface-2 border-b border-default flex items-center justify-end gap-2 px-6">
      {/* Notificaciones */}
      <div className="relative">
        <button
          onClick={() => { setOpenNotif(v => !v); setOpenUser(false) }}
          className="relative w-9 h-9 rounded-lg hover:bg-surface-3 flex items-center justify-center text-ink-tertiary"
        >
          <Bell size={18} />
          {noLeidas > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-red" />
          )}
        </button>

        {openNotif && (
          <div className="absolute right-0 mt-2 w-80 bg-surface-2 border border-default rounded-xl shadow-lg z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-subtle">
              <p className="text-sm font-semibold text-ink-primary">Notificaciones</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {mockNotificaciones.map(n => (
                <div key={n.id} className={cn('px-4 py-3 border-b border-subtle last:border-0 flex gap-3', !n.leida && 'bg-surface-1')}>
                  <span className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', TIPO_DOT[n.tipo])} />
                  <div>
                    <p className="text-xs font-medium text-ink-primary">{n.titulo}</p>
                    <p className="text-2xs text-ink-tertiary mt-0.5 leading-snug">{n.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Usuario */}
      <div className="relative">
        <button
          onClick={() => { setOpenUser(v => !v); setOpenNotif(false) }}
          className="flex items-center gap-2 h-9 pl-1.5 pr-2 rounded-lg hover:bg-surface-3"
        >
          <span className="w-7 h-7 rounded-full bg-brand-blue text-white text-2xs font-bold flex items-center justify-center">
            {iniciales}
          </span>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-ink-primary leading-none">{userName}</p>
            {subtitle && <p className="text-2xs text-ink-muted mt-0.5">{subtitle}</p>}
          </div>
          <ChevronDown size={14} className="text-ink-muted" />
        </button>

        {openUser && (
          <div className="absolute right-0 mt-2 w-44 bg-surface-2 border border-default rounded-xl shadow-lg z-20 overflow-hidden">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ink-secondary hover:bg-surface-3"
            >
              <LogOut size={15} /> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
