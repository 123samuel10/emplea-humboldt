import { AppShell } from '@/components/layout/AppShell'

export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="estudiante" userName="Samuel Salcedo">
      {children}
    </AppShell>
  )
}
