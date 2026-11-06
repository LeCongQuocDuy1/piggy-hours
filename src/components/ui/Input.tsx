import { useId, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string
  /** Error text shown under the field and linked with aria-describedby. */
  error?: string
  hint?: string
  /** Text after the field, e.g. "hours". */
  suffix?: string
}

export function Input({ label, error, hint, suffix, className, ...rest }: Props) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold">
        {label}
      </label>
      <div className="flex items-center gap-2.5">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-12 w-full rounded-md border-2 bg-surface px-4 text-base text-text placeholder:text-text-muted',
            error ? 'border-danger' : 'border-border',
            className,
          )}
          {...rest}
        />
        {suffix && <span className="font-bold text-text-muted">{suffix}</span>}
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm font-bold text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
