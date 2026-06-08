'use client'

import { PageHeader, Card, Badge, StatCard } from '@/components/ui'
import { mockPractica } from '@/lib/mock-data'
import { formatFecha } from '@/lib/utils'

export default function PracticasPage() {
  const p = mockPractica

  return (
    <div className="max-w-4xl">
      <PageHeader title="Mi práctica" subtitle="Seguimiento de tu práctica profesional en curso" />

      <Card className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-ink-primary">{p.cargo}</p>
            <p className="text-sm text-ink-tertiary mt-0.5">{p.empresa}</p>
          </div>
          <Badge tone={p.estado === 'activa' ? 'green' : 'gray'}>
            {p.estado === 'activa' ? 'Activa' : p.estado}
          </Badge>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-2xs text-ink-tertiary mb-1.5">
            <span>Avance</span>
            <span>{p.avancePorcentaje}%</span>
          </div>
          <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
            <div className="h-full bg-brand-blue rounded-full" style={{ width: `${p.avancePorcentaje}%` }} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Inicio" value={formatFecha(p.fechaInicio)} />
        <StatCard label="Finaliza" value={formatFecha(p.fechaFin)} />
        <StatCard label="Próxima evaluación" value={formatFecha(p.proximaEvaluacion)} />
        <StatCard label="Informes pendientes" value={p.informesPendientes} hint={p.informesPendientes > 0 ? 'Entrega antes del cierre' : 'Al día'} />
        <StatCard label="Calificación" value={p.calificacion ?? '—'} />
      </div>
    </div>
  )
}
