import { History } from 'lucide-react'
import { useState } from 'react'
import { nextUnlock, slotLimit } from '../../domain/slots'
import { formatMinutesShort } from '../../domain/time'
import { useApp } from '../../state/AppProvider'
import { PigManagement } from '../modals/PigManagement'
import { PigIllustration } from '../pig/PigIllustration'
import { Button } from '../ui/Button'

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

/** "Your shelf": completed pigs, newest first, and how close the next slot is (US-08, US-09). */
export function Shelf() {
  const { data } = useApp()
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const done = data.pigs
    .filter((p) => p.completedAt)
    .sort((a, b) => b.completedAt!.localeCompare(a.completedAt!))
  const count = data.achievements.completedPigsCount
  if (count === 0 && done.length === 0) return null

  const next = nextUnlock(count)
  const detailsPig = done.find((p) => p.id === detailsId) ?? null

  return (
    <section
      id="shelf"
      aria-labelledby="shelf-title"
      className="mx-auto max-w-[1120px] px-4 pb-14 sm:px-6 md:pb-[72px]"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="shelf-title"
            className="mb-1 font-heading text-3xl font-medium leading-tight md:text-4xl"
          >
            Your shelf
          </h2>
          <p className="m-0 text-text-muted">
            {count === 1 ? '1 pig completed' : `${count} pigs completed`}. You have{' '}
            {slotLimit(count)} pig slots.{' '}
            {next
              ? `Complete ${next.remaining} more ${next.remaining === 1 ? 'pig' : 'pigs'} to unlock slot ${next.slots}.`
              : 'That is the most slots for now.'}
          </p>
        </div>
      </div>

      {done.length === 0 ? (
        <p className="m-0 rounded-lg border-2 border-border bg-surface px-5 py-6 text-center text-text-muted">
          The pigs you completed were deleted from the shelf, but they still count toward
          your slots.
        </p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {done.map((pig) => (
            <li
              key={pig.id}
              className="flex items-center gap-3 rounded-lg border-2 border-border bg-surface p-4 shadow-card"
            >
              <PigIllustration
                mood="overjoyed"
                color={pig.color}
                label={`${pig.name}, completed`}
                className="h-[60px] w-[72px] flex-none"
              />
              <div className="min-w-0 flex-1">
                <h3 className="m-0 break-words font-heading text-lg font-medium leading-snug">
                  <span aria-hidden="true">{pig.emoji} </span>
                  {pig.name}
                </h3>
                <p className="m-0 text-sm text-text-muted">
                  {formatMinutesShort(pig.targetMinutes)} · done{' '}
                  {dateFormat.format(new Date(pig.completedAt!))}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                aria-label={`History of ${pig.name}`}
                className="flex-none px-3"
                onClick={() => setDetailsId(pig.id)}
              >
                <History size={20} strokeWidth={2.5} aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <PigManagement
        pig={detailsPig}
        onClose={() => setDetailsId(null)}
        onFull={() => {}}
      />
    </section>
  )
}
