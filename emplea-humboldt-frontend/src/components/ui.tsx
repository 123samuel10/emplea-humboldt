import { cn } from '@/lib/utils'

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div>
        <h1 className="text-xl font-bold text-ink-primary">{title}</h1>
        {subtitle && <p className="text-sm text-ink-tertiary mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('bg-surface-2 border border-default rounded-xl p-5', className)}>
      {children}
    </div>
  )
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <p className="text-xs text-ink-tertiary">{label}</p>
      <p className="text-2xl font-bold text-ink-primary mt-1">{value}</p>
      {hint && <p className="text-2xs text-ink-muted mt-1">{hint}</p>}
    </Card>
  )
}

const BADGE_TONES: Record<string, string> = {
  blue: 'bg-brand-blue/10 text-brand-blue',
  green: 'bg-semantic-success-bg text-semantic-success',
  amber: 'bg-semantic-warning-bg text-semantic-warning',
  red: 'bg-semantic-error-bg text-semantic-error',
  gray: 'bg-surface-3 text-ink-tertiary',
}

export function Badge({ tone = 'gray', children }: { tone?: keyof typeof BADGE_TONES; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium', BADGE_TONES[tone])}>
      {children}
    </span>
  )
}
