import { Pencil, Trash2 } from 'lucide-react'
import { pigStatus, progressPercent, savedMinutes } from '../../domain/pigs'
import { parseLocalDate } from '../../domain/stats'
import { formatMinutesShort } from '../../domain/time'
import type { Deposit, Pig } from '../../domain/types'
import { useApp } from '../../state/AppProvider'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

const dayFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

type Props = {
  pig: Pig | null
  onClose: () => void
  onEditPig: (pig: Pig) => void
  onDeletePig: (pig: Pig) => void
  onEditDeposit: (deposit: Deposit) => void
  onDeleteDeposit: (deposit: Deposit) => void
}

/** Pig details (US-05, US-06): progress, the deposit history (newest first) and the edit and delete actions. */
export function PigDetailsModal({
  pig,
  onClose,
  onEditPig,
  onDeletePig,
  onEditDeposit,
  onDeleteDeposit,
}: Props) {
  const { data } = useApp()
  const deposits = pig
    ? data.deposits
        .filter((d) => d.pigId === pig.id)
        // Newest first: by date, then by when it was entered.
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
        )
    : []
  const status = pig ? pigStatus(pig, data.deposits) : 'active'

  return (
    <Modal
      open={pig !== null}
      onOpenChange={(open) => !open && onClose()}
      title={pig ? `${pig.name}` : 'Pig details'}
      description={
        pig
          ? `${formatMinutesShort(savedMinutes(pig, data.deposits))} of ${formatMinutesShort(pig.targetMinutes)} saved, ${progressPercent(pig, data.deposits)}%`
          : undefined
      }
      width={560}
    >
      {pig && (
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            {status === 'full' && <Badge variant="gold">Full</Badge>}
            {status === 'completed' && <Badge variant="gold">Completed</Badge>}
            {status !== 'completed' && (
              <Button variant="secondary" size="sm" onClick={() => onEditPig(pig)}>
                <Pencil size={18} strokeWidth={2.5} aria-hidden="true" />
                Edit pig
              </Button>
            )}
            <Button variant="danger-outline" size="sm" onClick={() => onDeletePig(pig)}>
              <Trash2 size={18} strokeWidth={2.5} aria-hidden="true" />
              Delete pig
            </Button>
          </div>

          <h3 className="mb-2 mt-0 font-heading text-xl font-medium">History</h3>
          {deposits.length === 0 ? (
            <p className="m-0 rounded-md bg-bg px-4 py-5 text-center text-text-muted">
              No time yet. Add your first hours from the pig card.
            </p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {deposits.map((d) => {
                const day = dayFormat.format(parseLocalDate(d.date))
                const amount = formatMinutesShort(d.minutes)
                return (
                  <li
                    key={d.id}
                    className="flex items-center gap-2 rounded-md border-2 border-border bg-surface py-2 pl-4 pr-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="m-0 font-bold tabular-nums">{amount}</p>
                      <p className="m-0 text-sm text-text-muted">{day}</p>
                      {d.note && (
                        <p className="m-0 mt-0.5 break-words text-sm text-text">
                          {d.note}
                        </p>
                      )}
                    </div>
                    {status !== 'completed' && (
                      <div className="flex flex-none gap-1">
                        <button
                          type="button"
                          aria-label={`Edit ${amount} on ${day}`}
                          onClick={() => onEditDeposit(d)}
                          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-transparent text-text hover:bg-track"
                        >
                          <Pencil size={18} strokeWidth={2.5} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${amount} on ${day}`}
                          onClick={() => onDeleteDeposit(d)}
                          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-transparent text-danger hover:bg-danger-bg"
                        >
                          <Trash2 size={18} strokeWidth={2.5} aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </Modal>
  )
}
