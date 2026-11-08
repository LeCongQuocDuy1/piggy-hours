import { cn } from '../../lib/cn'

/** A small gold clock: the thing you drop into the pig. Savings here are time, not money, so there are no coins. */
export function TimeToken({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('block', className)}>
      <circle cx="12" cy="12" r="9" fill="#F5B833" stroke="#C98B0B" strokeWidth="2" />
      <path
        d="M12 6.8V12l3.4 2"
        fill="none"
        stroke="#7A4E00"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
