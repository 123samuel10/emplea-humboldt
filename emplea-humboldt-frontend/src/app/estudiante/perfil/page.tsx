'use client'

import { PageHeader, Card } from '@/components/ui'
import { mockEstudiante } from '@/lib/mock-data'

const DISPONIBILIDAD_LABEL: Record<string, string> = {
  tiempo_completo: 'Tiempo completo',
  medio_tiempo: 'Medio tiempo',
  fines_de_semana: 'Fines de semana',
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-2xs text-ink-muted uppercase tracking-wide">{label}</p>
      <p className="text-sm text-ink-primary mt-0.5">{value}</p>
    </div>
  )
}

export default function PerfilPage() {
  const e = mockEstudiante
  const iniciales = e.nombre.split(' ').map(p => p[0]).slice(0, 2).join('')

  return (
    <div className="max-w-3xl">
      <PageHeader title="Mi perfil" subtitle="Información visible para las empresas" />

      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <span className="w-16 h-16 rounded-full bg-brand-blue text-white text-xl font-bold flex items-center justify-center">
            {iniciales}
          </span>
          <div>
            <p className="text-lg font-bold text-ink-primary">{e.nombre}</p>
            <p className="text-sm text-ink-tertiary">{e.email}</p>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <p className="text-sm font-semibold text-ink-primary mb-4">Información académica</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Universidad" value={e.universidad} />
          <Field label="Programa" value={e.programa} />
          <Field label="Semestre" value={e.semestre} />
          <Field label="Disponibilidad" value={DISPONIBILIDAD_LABEL[e.disponibilidad] ?? e.disponibilidad} />
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold text-ink-primary mb-4">Habilidades</p>
        <div className="flex gap-2 flex-wrap">
          {e.habilidades.map(h => (
            <span key={h} className="text-xs px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue font-medium">{h}</span>
          ))}
        </div>
      </Card>
    </div>
  )
}
