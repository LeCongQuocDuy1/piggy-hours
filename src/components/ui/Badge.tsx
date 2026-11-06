import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'neutral' | 'gold' | 'danger'

const VARIANT: Record<Variant, string> = {
  neutral: 'bg-track text-text',
  gold: 'bg-warning-bg text-warning-text',
  danger: 'bg-danger-bg text-danger',
}

export function Badge({
  variant = 'neutral',
  children,
  className,
}: {
  variant?: Variant
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-0.5 text-sm font-bold leading-snug',
        VARIANT[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
