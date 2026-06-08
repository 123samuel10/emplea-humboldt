'use client'

import Link from 'next/link'
import { PageHeader, Card, StatCard, Badge } from '@/components/ui'
import { mockVacantes, mockEstudiantesAdmin } from '@/lib/mock-data'

export default function EmpresaDashboard() {
  const vacantes = mockVacantes.slice(0, 4)
  const totalPostulaciones = mockVacantes.reduce((s, v) => s + v.postulaciones, 0)

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Panel de empresa"
        subtitle="TechCorp Colombia S.A.S"
        action={
          <button className="h-9 px-4 bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold rounded-lg transition-colors">
            + Publicar vacante
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Vacantes activas" value={mockVacantes.length} />
        <StatCard label="Postulaciones" value={totalPostulaciones} />
        <StatCard label="En entrevista" value={6} />
        <StatCard label="Contratados" value={3} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Vacantes publicadas */}
        <Card>
          <p className="text-sm font-semibold text-ink-primary mb-4">Tus vacantes</p>
          <div className="space-y-3">
            {vacantes.map(v => (
              <div key={v.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink-primary truncate">{v.titulo}</p>
                  <p className="text-2xs text-ink-muted">{v.ciudad}</p>
                </div>
                <Badge tone="blue">{v.postulaciones} postulantes</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Últimos postulantes */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-ink-primary">Últimos postulantes</p>
            <Link href="/empresa/postulantes" className="text-2xs text-brand-blue hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-3">
            {mockEstudiantesAdmin.slice(0, 4).map((e, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue text-2xs font-bold flex items-center justify-center flex-shrink-0">
                  {e.nombre.split(' ').map(p => p[0]).slice(0, 2).join('')}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-primary">{e.nombre}</p>
                  <p className="text-2xs text-ink-muted">{e.programa} · Sem {e.sem}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
