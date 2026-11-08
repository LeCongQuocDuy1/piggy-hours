import { useState, type FormEvent } from 'react'
import type { PigFieldErrors, PigInput } from '../../domain/validation'
import { MAX_TARGET_HOURS, NAME_MAX_LENGTH } from '../../domain/validation'
import { cn } from '../../lib/cn'
import { PIG_COLOR_LIST } from '../pig/pigColors'
import { EMOJIS } from './emojis'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export type PigFormOutcome = { fields?: PigFieldErrors; formError?: string } | null

type Props = {
  initial?: {
    name: string
    targetHours: string
    emoji: string
    color: string
    deadline: string
  }
  submitLabel: string
  /** When set, the target field is disabled and this text explains why (a full pig keeps its target). */
  targetLockedReason?: string
  /** Replaces the default hint under the target field. */
  targetHint?: string
  /** Return `null` on success, or the errors to show. */
  onSubmit: (input: PigInput) => PigFormOutcome
  onCancel: () => void
}

/** The pig form shared by Create (US-01) and Edit (US-05). Typed values are kept when there is an error. */
export function PigForm({
  initial,
  submitLabel,
  targetLockedReason,
  targetHint,
  onSubmit,
  onCancel,
}: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [hours, setHours] = useState(initial?.targetHours ?? '')
  const [emoji, setEmoji] = useState(initial?.emoji ?? EMOJIS[0])
  const [color, setColor] = useState(initial?.color ?? 'pink')
  const [deadline, setDeadline] = useState(initial?.deadline ?? '')
  const [errors, setErrors] = useState<PigFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const outcome = onSubmit({ name, targetHours: hours, emoji, color, deadline })
    if (!outcome) return
    setFormError(outcome.formError ?? null)
    const fields = outcome.fields ?? {}
    setErrors(fields)
    const first = (['name', 'targetHours', 'deadline'] as const).find((f) => fields[f])
    if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus()
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Input
        name="name"
        label="Name"
        placeholder="Japanese N3"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        maxLength={NAME_MAX_LENGTH * 2}
        autoComplete="off"
        autoFocus
      />
      <Input
        name="targetHours"
        label="Target"
        suffix="hours"
        inputMode="numeric"
        placeholder="50"
        value={hours}
        onChange={(e) => setHours(e.target.value)}
        error={errors.targetHours}
        hint={
          targetLockedReason ??
          targetHint ??
          `Whole hours, up to ${MAX_TARGET_HOURS.toLocaleString('en-US')}.`
        }
        disabled={Boolean(targetLockedReason)}
        autoComplete="off"
      />

      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-1.5 p-0 text-sm font-bold">Emoji</legend>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((em) => (
            <label key={em} className="cursor-pointer">
              <input
                type="radio"
                name="emoji"
                value={em}
                checked={emoji === em}
                onChange={() => setEmoji(em)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full border-2 text-xl peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary',
                  emoji === em ? 'border-primary bg-track' : 'border-border bg-surface',
                )}
              >
                <span aria-hidden="true">{em}</span>
                <span className="sr-only">{em}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-1.5 p-0 text-sm font-bold">Color</legend>
        <div className="flex flex-wrap gap-3">
          {PIG_COLOR_LIST.map((c) => (
            <label key={c.name} className="cursor-pointer">
              <input
                type="radio"
                name="color"
                value={c.name}
                checked={color === c.name}
                onChange={() => setColor(c.name)}
                className="peer sr-only"
              />
              <span
                style={{
                  background: c.soft,
                  borderColor: color === c.name ? 'var(--color-text)' : c.outline,
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full border-2 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
              >
                {color === c.name && (
                  <span aria-hidden="true" className="h-3 w-3 rounded-full bg-text" />
                )}
                <span className="sr-only">{c.label}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Input
        name="deadline"
        label="Deadline (optional)"
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        error={errors.deadline}
      />

      {formError && (
        <p
          role="alert"
          className="m-0 rounded-md bg-danger-bg px-4 py-3 text-sm font-bold text-danger"
        >
          {formError}
        </p>
      )}

      {/* Stays visible at the bottom of the card on small screens. */}
      <div className="sticky -bottom-7 -mx-7 mt-2 flex gap-3 bg-surface px-7 pb-7 pt-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-[2]">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
