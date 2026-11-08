import { CheckCircle2, MoreHorizontal, Plus } from 'lucide-react'
import {
  moodForProgress,
  pigStatus,
  progressPercent,
  savedMinutes,
} from '../../domain/pigs'
import { formatMinutesShort } from '../../domain/time'
import type { Deposit, Pig } from '../../domain/types'
import { cn } from '../../lib/cn'
import { usePulseOnIncrease } from '../../lib/usePulseOnIncrease'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { ProgressBar } from '../ui/ProgressBar'
import { PigIllustration } from './PigIllustration'

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function formatDeadline(value: string): string {
  const [y, m, d] = value.split('-').map(Number)
  return dateFormat.format(new Date(y, m - 1, d))
}

type Props = {
  pig: Pig
  deposits: Deposit[]
  onAddTime: (pig: Pig) => void
  onComplete: (pig: Pig) => void
  onDetails: (pig: Pig) => void
}

/** One pig: illustration, name, progress and its action (add time while active, complete once full). */
export function PigCard({ pig, deposits, onAddTime, onComplete, onDetails }: Props) {
  const percent = progressPercent(pig, deposits)
  const status = pigStatus(pig, deposits)
  const full = status === 'full'
  const saved = savedMinutes(pig, deposits)
  // Every time more is saved, the coin drops and the pig squishes (the key restarts the animation).
  const pulse = usePulseOnIncrease(saved)
  const valueText = `${formatMinutesShort(saved)} of ${formatMinutesShort(pig.targetMinutes)}`

  return (
    <article
      className={cn(
        'rounded-lg border-2 bg-surface p-5 shadow-card transition-[transform,box-shadow] duration-200 ease-[var(--ease-out)] motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_12px_28px_rgba(201,58,111,0.18)]',
        full ? 'border-coin shadow-card-gold' : 'border-border',
      )}
    >
      <div className="flex items-center gap-3.5">
        <div className="relative h-[70px] w-[84px] flex-none">
          <div key={pulse} className={cn('h-full w-full', pulse > 0 && 'pig-squish')}>
            <PigIllustration
              mood={moodForProgress(percent)}
              color={pig.color}
              label={`${pig.name} pig, ${Math.floor(percent)}% full`}
              className="h-full w-full"
            />
          </div>
          {pulse > 0 && (
            <span
              key={`coin-${pulse}`}
              data-testid="coin-drop"
              aria-hidden="true"
              className="coin-drop pointer-events-none absolute left-[35px] top-[-4px] size-3.5 rounded-full border-2 border-coin-strong bg-coin"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="m-0 min-w-0 break-words font-heading text-[22px] font-medium leading-snug">
              {pig.name}
            </h3>
            <span
              aria-hidden="true"
              className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-track text-base"
            >
              {pig.emoji}
            </span>
          </div>
          {full && <Badge variant="gold">Full</Badge>}
          {pig.deadline && !full && (
            <p className="m-0 text-sm text-text-muted">
              Due {formatDeadline(pig.deadline)}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label={`Details and history for ${pig.name}`}
          onClick={() => onDetails(pig)}
          className="-mr-2 flex h-11 w-11 flex-none cursor-pointer items-center justify-center self-start rounded-full bg-transparent text-text hover:bg-track"
        >
          <MoreHorizontal size={22} strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>
      <div className="mt-4">
        <ProgressBar
          label={pig.name}
          value={percent}
          valueText={valueText}
          color={pig.color}
          full={full}
        />
      </div>
      <div className="mt-2 flex justify-between text-sm tabular-nums text-text-muted">
        <span>
          {formatMinutesShort(saved)} / {formatMinutesShort(pig.targetMinutes)}
        </span>
        <span className="font-bold text-text">{percent}%</span>
      </div>
      <div className="mt-4">
        {full ? (
          <Button
            className="w-full"
            aria-label={`Mark ${pig.name} as completed`}
            onClick={() => onComplete(pig)}
          >
            <CheckCircle2 size={20} strokeWidth={2.5} aria-hidden="true" />
            Mark as completed
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="w-full"
            aria-label={`Add time to ${pig.name}`}
            onClick={() => onAddTime(pig)}
          >
            <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
            Add time
          </Button>
        )}
      </div>
    </article>
  )
}
