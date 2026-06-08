import { AppShell } from '@/components/layout/AppShell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="admin" userName="María Fernanda López">
      {children}
    </AppShell>
  )
}
