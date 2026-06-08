'use client'

import { PageHeader, Card, Badge } from '@/components/ui'
import { mockPostulaciones } from '@/lib/mock-data'
import { formatFecha } from '@/lib/utils'
import type { EstadoPostulacion } from '@/lib/types'

const ESTADO: Record<EstadoPostulacion, { label: string; tone: 'blue' | 'green' | 'amber' | 'red' | 'gray' }> = {
  postulado:   { label: 'Postulado',   tone: 'gray' },
  en_revision: { label: 'En revisión', tone: 'amber' },
  entrevista:  { label: 'Entrevista',  tone: 'blue' },
  aceptado:    { label: 'Aceptado',    tone: 'green' },
  rechazado:   { label: 'Rechazado',   tone: 'red' },
}

export default function PostulacionesPage() {
  return (
    <div className="max-w-5xl">
      <PageHeader title="Mis postulaciones" subtitle={`${mockPostulaciones.length} postulaciones en total`} />

      <div className="space-y-3">
        {mockPostulaciones.map(p => (
          <Card key={p.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-ink-primary">{p.vacantetitulo}</p>
                <p className="text-xs text-ink-tertiary mt-0.5">{p.empresa} · {p.sector}</p>
                <p className="text-2xs text-ink-muted mt-2">Postulado el {formatFecha(p.fechaPostulacion)}</p>
                {p.proximoPaso && (
                  <p className="text-2xs text-brand-blue mt-2 bg-brand-blue/5 rounded px-2 py-1 inline-block">
                    {p.proximoPaso}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0 space-y-2">
                <Badge tone={ESTADO[p.estado].tone}>{ESTADO[p.estado].label}</Badge>
                <p className="text-2xs text-ink-muted">{p.compatibilidad}% match</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
