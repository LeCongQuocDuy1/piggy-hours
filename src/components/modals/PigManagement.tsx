import { useState } from 'react'
import { pigStatus } from '../../domain/pigs'
import { parseLocalDate } from '../../domain/stats'
import { formatMinutesShort } from '../../domain/time'
import type { Pig } from '../../domain/types'
import { useApp } from '../../state/AppProvider'
import { useToast } from '../ui/Toast'
import { ConfirmModal } from './ConfirmModal'
import { EditDepositModal } from './EditDepositModal'
import { EditPigModal } from './EditPigModal'
import { PigDetailsModal } from './PigDetailsModal'

type Props = {
  pig: Pig | null
  onClose: () => void
  /** An edit made the pig full: the page shows the celebration. */
  onFull: (pigId: string) => void
}

type Sub =
  | { kind: 'editPig' }
  | { kind: 'deletePig' }
  | { kind: 'editDeposit'; id: string }
  | { kind: 'deleteDeposit'; id: string }

/**
 * Pig details and everything opened from it (US-05, US-06). The details dialog stays open underneath, so closing
 * an edit or a confirmation brings the user back to the history.
 */
export function PigManagement({ pig, onClose, onFull }: Props) {
  const { data, deletePig, deleteDeposit } = useApp()
  const toast = useToast()
  const [sub, setSub] = useState<Sub | null>(null)
  const closeSub = () => setSub(null)

  const deposit =
    sub && (sub.kind === 'editDeposit' || sub.kind === 'deleteDeposit')
      ? (data.deposits.find((d) => d.id === sub.id) ?? null)
      : null
  const pigDeposits = pig ? data.deposits.filter((d) => d.pigId === pig.id) : []
  const savedAll = pigDeposits.reduce((t, d) => t + d.minutes, 0)

  function close() {
    setSub(null)
    onClose()
  }

  function confirmDeletePig() {
    if (!pig) return
    const result = deletePig(pig.id)
    if (result.ok) toast.show(`${pig.name} deleted`)
    close()
  }

  function confirmDeleteDeposit() {
    if (deposit) {
      const result = deleteDeposit(deposit.id)
      if (result.ok) toast.show('Deposit deleted')
    }
    closeSub()
  }

  return (
    <>
      <PigDetailsModal
        pig={pig}
        onClose={close}
        onEditPig={() => setSub({ kind: 'editPig' })}
        onDeletePig={() => setSub({ kind: 'deletePig' })}
        onEditDeposit={(d) => setSub({ kind: 'editDeposit', id: d.id })}
        onDeleteDeposit={(d) => setSub({ kind: 'deleteDeposit', id: d.id })}
      />
      <EditPigModal pig={sub?.kind === 'editPig' ? pig : null} onClose={closeSub} />
      <EditDepositModal
        pig={sub?.kind === 'editDeposit' ? pig : null}
        deposit={sub?.kind === 'editDeposit' ? deposit : null}
        onClose={closeSub}
        onFull={(id) => {
          close()
          onFull(id)
        }}
      />
      <ConfirmModal
        open={sub?.kind === 'deletePig' && pig !== null}
        danger
        title="Delete this pig?"
        description={
          pig
            ? pigDeposits.length === 0
              ? `“${pig.name}” will be deleted. This can't be undone.`
              : `“${pig.name}” and its ${pigDeposits.length} ${pigDeposits.length === 1 ? 'entry' : 'entries'} (${formatMinutesShort(savedAll)} saved) will be deleted. This can't be undone.`
            : ''
        }
        confirmLabel="Delete pig"
        onConfirm={confirmDeletePig}
        onCancel={closeSub}
      />
      <ConfirmModal
        open={sub?.kind === 'deleteDeposit' && deposit !== null}
        danger
        title="Delete this entry?"
        description={
          deposit && pig
            ? `${formatMinutesShort(deposit.minutes)} on ${parseLocalDate(deposit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} will be removed from “${pig.name}”.${pigStatus(pig, data.deposits) === 'full' ? ' The pig will no longer be full.' : ''}`
            : ''
        }
        confirmLabel="Delete entry"
        onConfirm={confirmDeleteDeposit}
        onCancel={closeSub}
      />
    </>
  )
}
