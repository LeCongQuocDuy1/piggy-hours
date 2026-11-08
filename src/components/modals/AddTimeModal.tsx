import { useState, type FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import {
  exceedsDayLimit,
  NOTE_MAX_LENGTH,
  type DepositErrors,
} from '../../domain/deposits'
import { remainingMinutes, savedMinutes } from '../../domain/pigs'
import { formatMinutes, formatMinutesShort, toLocalDate } from '../../domain/time'
import type { Deposit, Pig } from '../../domain/types'
import { cn } from '../../lib/cn'
import { useApp } from '../../state/AppProvider'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'
import { useToast } from '../ui/Toast'

type Props = {
  pig: Pig | null
  onOpenChange: (open: boolean) => void
  /** Called after a deposit that makes the pig full. */
  onFull: (pigId: string) => void
}

/** Add-time dialog (US-02). */
export function AddTimeModal({ pig, onOpenChange, onFull }: Props) {
  return (
    <Modal
      open={pig !== null}
      onOpenChange={onOpenChange}
      title={pig ? `Add time to ${pig.name}` : 'Add time'}
      description="Drop in the time you spent. No timer needed."
    >
      {/* Mounted only while open, so the form starts fresh every time. */}
      {pig && (
        <AddTimeForm
          key={pig.id}
          pig={pig}
          onDone={() => onOpenChange(false)}
          onFull={onFull}
        />
      )}
    </Modal>
  )
}

const QUICK_PICKS = [
  { label: '30m', hours: '', minutes: '30' },
  { label: '1h', hours: '1', minutes: '' },
  { label: '2h', hours: '2', minutes: '' },
]

/**
 * The add-time form (US-02). With `deposit` it edits that deposit instead (US-06): the fields start with its values,
 * and the deposit itself does not count against the room left in the pig.
 */
export function AddTimeForm({
  pig,
  deposit,
  onDone,
  onFull,
}: {
  pig: Pig
  deposit?: Deposit
  onDone: () => void
  onFull: (id: string) => void
}) {
  const { data, addDeposit, updateDeposit } = useApp()
  const toast = useToast()
  const today = toLocalDate(new Date())
  const [hours, setHours] = useState(
    deposit ? String(Math.floor(deposit.minutes / 60)) : '',
  )
  const [minutes, setMinutes] = useState(deposit ? String(deposit.minutes % 60) : '')
  const [date, setDate] = useState(deposit?.date ?? today)
  const [note, setNote] = useState(deposit?.note ?? '')
  const [errors, setErrors] = useState<DepositErrors>({})

  const others = deposit
    ? data.deposits.filter((d) => d.id !== deposit.id)
    : data.deposits
  const remaining = remainingMinutes(pig, others)
  const durationErrorId = 'duration-error'
  const typedMinutes = Number(hours || 0) * 60 + Number(minutes || 0)
  const dayWarning =
    /^\d+$/.test(hours || '0') &&
    /^\d+$/.test(minutes || '0') &&
    typedMinutes > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? exceedsDayLimit(others, date, typedMinutes)
      : false

  function pick(h: string, m: string) {
    setHours(h)
    setMinutes(m)
    setErrors((e) => ({ ...e, duration: undefined, tooMuch: undefined }))
  }

  function fillThePig() {
    pick(String(Math.floor(remaining / 60)), String(remaining % 60))
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const input = { hours, minutes, date, note }
    const result = deposit ? updateDeposit(deposit.id, input) : addDeposit(pig.id, input)
    if (result.ok) {
      const value = deposit
        ? (result.value as { changes: { minutes: number } }).changes.minutes
        : (result.value as { minutes: number }).minutes
      toast.show(
        deposit ? 'Deposit updated' : `Added ${formatMinutesShort(value)} to ${pig.name}`,
      )
      onDone()
      if (savedMinutes(pig, others) + value >= pig.targetMinutes) onFull(pig.id)
      return
    }
    if (result.error.kind === 'NO_PIG' || result.error.kind === 'NO_DEPOSIT') {
      setErrors({ pig: 'This entry no longer exists.' })
      return
    }
    const found = result.error.errors
    setErrors(found)
    const first = found.duration
      ? 'hours'
      : found.date
        ? 'date'
        : found.note
          ? 'note'
          : null
    if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus()
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-1.5 p-0 text-sm font-bold">How long did you spend?</legend>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <Input
            name="hours"
            label="Hours"
            hideLabel
            suffix="hours"
            inputMode="numeric"
            placeholder="0"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            invalidBy={errors.duration ? durationErrorId : undefined}
            autoComplete="off"
            autoFocus
            className="w-20! text-center font-heading text-2xl"
          />
          <Input
            name="minutes"
            label="Minutes"
            hideLabel
            suffix="minutes"
            inputMode="numeric"
            placeholder="0"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            invalidBy={errors.duration ? durationErrorId : undefined}
            autoComplete="off"
            className="w-20! text-center font-heading text-2xl"
          />
        </div>
        <div
          className="mt-3 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Quick picks"
        >
          <span className="text-sm text-text-muted">Quick:</span>
          {QUICK_PICKS.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => pick(q.hours, q.minutes)}
              className="h-11 min-w-14 cursor-pointer rounded-full border-2 border-border bg-surface px-4 font-heading font-medium text-text active:scale-[0.97]"
            >
              {q.label}
            </button>
          ))}
        </div>
        {errors.duration && (
          <div
            id={durationErrorId}
            role="alert"
            className="mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-2.5 rounded-md bg-danger-bg px-4 py-3"
          >
            <AlertCircle size={20} aria-hidden="true" className="flex-none text-danger" />
            <span className="min-w-0 flex-[1_1_160px] text-sm font-bold text-[#8a1c16]">
              {errors.duration}
            </span>
            {errors.tooMuch && (
              <button
                type="button"
                onClick={fillThePig}
                className="h-11 cursor-pointer rounded-full border-2 border-danger bg-surface px-[18px] font-heading text-[15px] font-medium text-[#8a1c16]"
              >
                Fill the pig
              </button>
            )}
          </div>
        )}
      </fieldset>

      {errors.pig && (
        <p
          role="alert"
          className="m-0 rounded-md bg-danger-bg px-4 py-3 text-sm font-bold text-danger"
        >
          {errors.pig}
        </p>
      )}

      <Input
        name="date"
        label="Date"
        type="date"
        max={today}
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
      />
      {dayWarning && (
        <p role="status" className="m-0 -mt-2 text-sm text-warning-text">
          That is more than 24 hours on this day across all your pigs. Double-check the
          date and time.
        </p>
      )}

      <Input
        name="note"
        label="Note (optional)"
        placeholder="Chapter 5 vocabulary"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        error={errors.note}
        maxLength={NOTE_MAX_LENGTH * 2}
        autoComplete="off"
      />

      <div className="flex items-center justify-between rounded-md bg-bg px-4 py-3 text-sm text-text-muted">
        <span>{deposit ? 'Room left for this entry' : 'Remaining in this pig'}</span>
        <span className={cn('font-bold tabular-nums text-text')}>
          {formatMinutes(remaining)}
        </span>
      </div>

      <div className="sticky -bottom-7 -mx-7 flex gap-3 bg-surface px-7 pb-7 pt-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" className="flex-[2]">
          {deposit ? 'Save changes' : 'Drop into pig'}
        </Button>
      </div>
    </form>
  )
}
