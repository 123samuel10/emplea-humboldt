'use client'

import { PageHeader, Card, Badge } from '@/components/ui'
import { mockEstudiantesAdmin, mockVacantes } from '@/lib/mock-data'

const ESTADO_TONE: Record<string, 'green' | 'amber' | 'gray'> = {
  activa: 'green',
  buscando: 'amber',
  finalizada: 'gray',
}

export default function PostulantesPage() {
  return (
    <div className="max-w-5xl">
      <PageHeader title="Postulantes" subtitle="Candidatos que aplicaron a tus vacantes" />

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-1 border-b border-default text-left">
              <th className="px-5 py-3 text-2xs font-semibold text-ink-tertiary uppercase tracking-wide">Candidato</th>
              <th className="px-5 py-3 text-2xs font-semibold text-ink-tertiary uppercase tracking-wide">Programa</th>
              <th className="px-5 py-3 text-2xs font-semibold text-ink-tertiary uppercase tracking-wide">Vacante</th>
              <th className="px-5 py-3 text-2xs font-semibold text-ink-tertiary uppercase tracking-wide">Estado</th>
            </tr>
          </thead>
          <tbody>
            {mockEstudiantesAdmin.map((e, i) => (
              <tr key={i} className="border-b border-subtle last:border-0 hover:bg-surface-1">
                <td className="px-5 py-3">
                  <p className="text-sm font-semibold text-ink-primary">{e.nombre}</p>
                  <p className="text-2xs text-ink-muted">Semestre {e.sem}</p>
                </td>
                <td className="px-5 py-3 text-ink-secondary">{e.programa}</td>
                <td className="px-5 py-3 text-ink-secondary">{mockVacantes[i % mockVacantes.length].titulo}</td>
                <td className="px-5 py-3">
                  <Badge tone={ESTADO_TONE[e.estado] ?? 'gray'}>{e.estado}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
