'use client'

import { useState } from 'react'
import { Search, MapPin, Briefcase } from 'lucide-react'
import { PageHeader, Card, Badge } from '@/components/ui'
import { mockVacantes } from '@/lib/mock-data'
import { formatCOP } from '@/lib/utils'
import type { Modalidad, TipoVacante } from '@/lib/types'

const MODALIDAD_LABEL: Record<Modalidad, string> = { remoto: 'Remoto', hibrido: 'Híbrido', presencial: 'Presencial' }
const TIPO_LABEL: Record<TipoVacante, string> = { practica: 'Práctica', medio_tiempo: 'Medio tiempo', tiempo_completo: 'Tiempo completo' }

export default function EmpleosPage() {
  const [q, setQ] = useState('')
  const [modalidad, setModalidad] = useState<string>('')

  const vacantes = mockVacantes.filter(v => {
    const matchQ = `${v.titulo} ${v.empresa} ${v.habilidades.join(' ')}`.toLowerCase().includes(q.toLowerCase())
    const matchM = !modalidad || v.modalidad === modalidad
    return matchQ && matchM
  })

  return (
    <div className="max-w-5xl">
      <PageHeader title="Empleos y prácticas" subtitle={`${mockVacantes.length} vacantes disponibles`} />

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar por cargo, empresa o habilidad..."
            className="w-full h-10 pl-9 pr-3 bg-surface-2 border border-default rounded-lg text-sm text-ink-primary placeholder:text-ink-muted outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15"
          />
        </div>
        <select
          value={modalidad}
          onChange={e => setModalidad(e.target.value)}
          className="h-10 px-3 bg-surface-2 border border-default rounded-lg text-sm text-ink-secondary outline-none focus:border-brand-blue"
        >
          <option value="">Todas las modalidades</option>
          <option value="remoto">Remoto</option>
          <option value="hibrido">Híbrido</option>
          <option value="presencial">Presencial</option>
        </select>
      </div>

      <div className="space-y-3">
        {vacantes.map(v => (
          <Card key={v.id} className="hover:border-brand-blue/40 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-ink-primary">{v.titulo}</p>
                  <Badge tone="green">{v.compatibilidad}% match</Badge>
                </div>
                <p className="text-xs text-ink-tertiary mt-1">{v.empresa}</p>

                <div className="flex items-center gap-3 mt-3 text-2xs text-ink-tertiary flex-wrap">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {v.ciudad}</span>
                  <span className="flex items-center gap-1"><Briefcase size={12} /> {MODALIDAD_LABEL[v.modalidad]}</span>
                  <Badge tone="blue">{TIPO_LABEL[v.tipo]}</Badge>
                </div>

                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {v.habilidades.map(h => (
                    <span key={h} className="text-2xs px-2 py-0.5 rounded bg-surface-3 text-ink-secondary">{h}</span>
                  ))}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-xs font-semibold text-ink-primary whitespace-nowrap">{formatCOP(v.salario.min)}</p>
                <p className="text-2xs text-ink-muted">a {formatCOP(v.salario.max)}</p>
                <button className="mt-3 h-8 px-4 bg-brand-blue hover:bg-brand-blue-dark text-white text-xs font-semibold rounded-lg transition-colors">
                  Postularme
                </button>
              </div>
            </div>
          </Card>
        ))}

        {vacantes.length === 0 && (
          <Card><p className="text-sm text-ink-tertiary text-center py-6">No se encontraron vacantes con esos filtros.</p></Card>
        )}
      </div>
    </div>
  )
}
