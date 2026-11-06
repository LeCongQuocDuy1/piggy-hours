import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary shadow-[0_4px_0_var(--color-primary-shadow)] hover:bg-primary-hover active:translate-y-[2px] active:scale-[0.97] active:shadow-[0_2px_0_var(--color-primary-shadow)]',
  secondary:
    'border-2 border-border bg-surface text-text hover:bg-bg active:scale-[0.97]',
  ghost: 'bg-transparent text-primary hover:bg-track active:scale-[0.97]',
}

const SIZE = {
  sm: 'h-11 px-5 text-base',
  md: 'h-[52px] px-6 text-[17px]',
  lg: 'h-14 px-8 text-lg',
}

/** Class names for a button, so links (anchors) can look like buttons too. */
export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-heading font-medium no-underline transition duration-[var(--duration-fast)] ease-[var(--ease-out)]',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
    VARIANT[variant],
    SIZE[size],
    className,
  )
}
