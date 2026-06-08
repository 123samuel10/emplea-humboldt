'use client'

import Link from 'next/link'
import { PageHeader, Card, StatCard, Badge } from '@/components/ui'
import { mockKpisAdmin, mockEstudiantesAdmin } from '@/lib/mock-data'

const ESTADO_TONE: Record<string, 'green' | 'amber' | 'gray'> = {
  activa: 'green',
  buscando: 'amber',
  finalizada: 'gray',
}

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Administración"
        subtitle="Universidad Alexander Von Humboldt · Coordinación de Prácticas"
        action={
          <Link href="/admin/reportes" className="h-9 px-4 bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center">
            Ver reportes
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {mockKpisAdmin.map(k => (
          <StatCard key={k.label} label={k.label} value={k.valor} />
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-default">
          <p className="text-sm font-semibold text-ink-primary">Estudiantes</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-1 border-b border-default text-left">
              <th className="px-5 py-3 text-2xs font-semibold text-ink-tertiary uppercase tracking-wide">Nombre</th>
              <th className="px-5 py-3 text-2xs font-semibold text-ink-tertiary uppercase tracking-wide">Programa</th>
              <th className="px-5 py-3 text-2xs font-semibold text-ink-tertiary uppercase tracking-wide">Sem</th>
              <th className="px-5 py-3 text-2xs font-semibold text-ink-tertiary uppercase tracking-wide">Estado</th>
              <th className="px-5 py-3 text-2xs font-semibold text-ink-tertiary uppercase tracking-wide">Empresa</th>
            </tr>
          </thead>
          <tbody>
            {mockEstudiantesAdmin.map((e, i) => (
              <tr key={i} className="border-b border-subtle last:border-0 hover:bg-surface-1">
                <td className="px-5 py-3 font-semibold text-ink-primary">{e.nombre}</td>
                <td className="px-5 py-3 text-ink-secondary">{e.programa}</td>
                <td className="px-5 py-3 text-ink-secondary">{e.sem}</td>
                <td className="px-5 py-3"><Badge tone={ESTADO_TONE[e.estado] ?? 'gray'}>{e.estado}</Badge></td>
                <td className="px-5 py-3 text-ink-secondary">{e.empresa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
