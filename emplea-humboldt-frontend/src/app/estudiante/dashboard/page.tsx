'use client'

import Link from 'next/link'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { PageHeader, Card, StatCard, Badge } from '@/components/ui'
import { mockEstudiante, mockPostulaciones, mockPractica, mockVacantes, mockPostulacionesMes } from '@/lib/mock-data'
import type { EstadoPostulacion } from '@/lib/types'
import { formatCOP } from '@/lib/utils'

const ESTADO: Record<EstadoPostulacion, { label: string; tone: 'blue' | 'green' | 'amber' | 'red' | 'gray' }> = {
  postulado:   { label: 'Postulado',   tone: 'gray' },
  en_revision: { label: 'En revisión', tone: 'amber' },
  entrevista:  { label: 'Entrevista',  tone: 'blue' },
  aceptado:    { label: 'Aceptado',    tone: 'green' },
  rechazado:   { label: 'Rechazado',   tone: 'red' },
}

export default function EstudianteDashboard() {
  const activas = mockPostulaciones.filter(p => p.estado !== 'rechazado').length
  const recomendadas = [...mockVacantes].sort((a, b) => b.compatibilidad - a.compatibilidad).slice(0, 3)

  return (
    <div className="max-w-6xl">
      <PageHeader
        title={`Hola, ${mockEstudiante.nombre.split(' ')[0]} 👋`}
        subtitle={`${mockEstudiante.programa} · Semestre ${mockEstudiante.semestre}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Postulaciones activas" value={activas} />
        <StatCard label="Entrevistas" value={mockPostulaciones.filter(p => p.estado === 'entrevista').length} />
        <StatCard label="Práctica en curso" value={mockPractica.estado === 'activa' ? '1' : '0'} hint={mockPractica.empresa} />
        <StatCard label="Avance práctica" value={`${mockPractica.avancePorcentaje}%`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <p className="text-sm font-semibold text-ink-primary mb-4">Tus postulaciones por mes</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockPostulacionesMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="postulaciones" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aceptadas" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Postulaciones recientes */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-ink-primary">Postulaciones recientes</p>
            <Link href="/estudiante/postulaciones" className="text-2xs text-brand-blue hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {mockPostulaciones.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink-primary truncate">{p.vacantetitulo}</p>
                  <p className="text-2xs text-ink-muted">{p.empresa}</p>
                </div>
                <Badge tone={ESTADO[p.estado].tone}>{ESTADO[p.estado].label}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recomendadas */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-ink-primary">Vacantes recomendadas para ti</p>
          <Link href="/estudiante/empleos" className="text-2xs text-brand-blue hover:underline">Ver todas</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {recomendadas.map(v => (
            <Card key={v.id}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-ink-primary">{v.titulo}</p>
                <Badge tone="green">{v.compatibilidad}%</Badge>
              </div>
              <p className="text-xs text-ink-tertiary mt-0.5">{v.empresa} · {v.ciudad}</p>
              <p className="text-xs text-ink-secondary mt-3">{formatCOP(v.salario.min)} – {formatCOP(v.salario.max)}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
