import { parseLocalDate } from '../../domain/stats'
import type { Deposit, Pig } from '../../domain/types'
import { Modal } from '../ui/Modal'
import { AddTimeForm } from './AddTimeModal'

type Props = {
  pig: Pig | null
  deposit: Deposit | null
  onClose: () => void
  /** Called when the edit fills the pig. */
  onFull: (pigId: string) => void
}

/** Edit one deposit (US-06). It uses the same form as Add time, filled with the current values. */
export function EditDepositModal({ pig, deposit, onClose, onFull }: Props) {
  const open = pig !== null && deposit !== null
  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title="Edit time"
      description={
        deposit
          ? `Entry from ${parseLocalDate(deposit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
          : undefined
      }
    >
      {pig && deposit && (
        <AddTimeForm
          key={deposit.id}
          pig={pig}
          deposit={deposit}
          onDone={onClose}
          onFull={onFull}
        />
      )}
    </Modal>
  )
}
