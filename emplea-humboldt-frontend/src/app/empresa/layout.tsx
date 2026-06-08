import { AppShell } from '@/components/layout/AppShell'

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="empresa" userName="Carlos Herrera">
      {children}
    </AppShell>
  )
}
