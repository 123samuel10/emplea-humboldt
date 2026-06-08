'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Briefcase, FileText, GraduationCap, User,
  Users, BarChart3, type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TopBar } from './TopBar'

type Role = 'estudiante' | 'empresa' | 'admin'

type NavItem = { href: string; label: string; icon: LucideIcon }

const NAV: Record<Role, NavItem[]> = {
  estudiante: [
    { href: '/estudiante/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
    { href: '/estudiante/empleos',        label: 'Empleos',       icon: Briefcase },
    { href: '/estudiante/postulaciones',  label: 'Postulaciones', icon: FileText },
    { href: '/estudiante/practicas',      label: 'Prácticas',     icon: GraduationCap },
    { href: '/estudiante/perfil',         label: 'Mi perfil',     icon: User },
  ],
  empresa: [
    { href: '/empresa/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
    { href: '/empresa/postulantes', label: 'Postulantes', icon: Users },
  ],
  admin: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/reportes',  label: 'Reportes',  icon: BarChart3 },
  ],
}

const SUBTITULO: Record<Role, string> = {
  estudiante: 'Estudiante',
  empresa: 'Empresa',
  admin: 'Administración',
}

export function AppShell({
  role, userName, children,
}: { role: Role; userName: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const items = NAV[role]

  return (
    <div className="min-h-screen flex bg-surface-1">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-surface-2 border-r border-default">
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-default">
          <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <p className="font-bold text-ink-primary text-sm">Emplea Humboldt</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand-blue/10 text-brand-blue'
                    : 'text-ink-secondary hover:bg-surface-3',
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-default">
          <p className="text-2xs text-ink-muted">© 2026 Emplea Humboldt</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar userName={userName} subtitle={SUBTITULO[role]} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
