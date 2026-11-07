import { Plus } from 'lucide-react'
import { useState } from 'react'
import { slotLimit, usedSlots } from '../../domain/slots'
import type { Pig } from '../../domain/types'
import { useApp } from '../../state/AppProvider'
import { AddTimeModal } from '../modals/AddTimeModal'
import { CompleteModal } from '../modals/CompleteModal'
import { useCreatePig } from '../modals/CreatePigProvider'
import { PigFullModal } from '../modals/PigFullModal'
import { PigCard } from '../pig/PigCard'
import { PigIllustration } from '../pig/PigIllustration'
import { Button } from '../ui/Button'

/** The app area: the user's pigs, the slot counter and the New pig button (US-01, US-03). */
export function YourPigs() {
  const { data } = useApp()
  const { canCreate, open } = useCreatePig()
  const pigs = data.pigs.filter((p) => !p.completedAt)
  // The dialogs only keep a pig id; the pig itself is read from state so it is never stale.
  const [addingId, setAddingId] = useState<string | null>(null)
  const [fullId, setFullId] = useState<string | null>(null)
  const [completingId, setCompletingId] = useState<string | null>(null)
  const byId = (id: string | null): Pig | null => pigs.find((p) => p.id === id) ?? null
  const used = usedSlots(data)
  const limit = slotLimit(data.achievements.completedPigsCount)

  return (
    <section
      id="pigs"
      aria-labelledby="pigs-title"
      className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6 md:py-[72px]"
    >
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="pigs-title"
            className="mb-1 font-heading text-3xl font-medium leading-tight md:text-4xl"
          >
            Your pigs
          </h2>
          <p className="m-0 text-text-muted">
            This is where you save your hours. {limit === 2 ? 'Two' : limit} pig slots to
            start.
          </p>
        </div>
        <span
          aria-label={`${used} of ${limit} pig slots used`}
          className="rounded-full bg-track px-3.5 py-1.5 text-sm font-bold tabular-nums"
        >
          {used} / {limit} slots
        </span>
      </div>

      {pigs.length === 0 ? (
        <div className="flex flex-col items-center rounded-lg border-2 border-border bg-surface px-5 py-10 text-center shadow-card sm:px-6 sm:py-12">
          <PigIllustration
            mood="sleepy"
            label="A sleepy pig waiting for its first hours"
            className="w-48"
          />
          <h3 className="mb-2 mt-4 font-heading text-[28px] font-medium leading-tight">
            Your piggy bank is empty
          </h3>
          <p className="mb-6 mt-0 max-w-md text-text-muted">
            Create your first pig, pick a goal in hours, and start dropping time into it.
          </p>
          <Button size="lg" onClick={open}>
            Create your first pig
          </Button>
        </div>
      ) : (
        <>
          <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-2">
            {pigs.map((pig) => (
              <li key={pig.id}>
                <PigCard
                  pig={pig}
                  deposits={data.deposits}
                  onAddTime={(p) => setAddingId(p.id)}
                  onComplete={(p) => setCompletingId(p.id)}
                />
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col items-center gap-2">
            <Button
              variant="secondary"
              disabled={!canCreate}
              aria-describedby="new-pig-hint"
              onClick={open}
            >
              <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
              New pig
            </Button>
            <p id="new-pig-hint" className="m-0 text-center text-sm text-text-muted">
              {canCreate
                ? 'Add another goal.'
                : 'All pig slots are in use. Complete a pig to free a slot.'}
            </p>
          </div>
        </>
      )}

      <AddTimeModal
        pig={byId(addingId)}
        onOpenChange={(open) => !open && setAddingId(null)}
        onFull={setFullId}
      />
      <PigFullModal
        pig={byId(fullId)}
        onClose={() => setFullId(null)}
        onComplete={(id) => {
          setFullId(null)
          setCompletingId(id)
        }}
      />
      <CompleteModal pig={byId(completingId)} onClose={() => setCompletingId(null)} />
    </section>
  )
}
