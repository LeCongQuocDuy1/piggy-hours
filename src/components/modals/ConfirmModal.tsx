import type { ReactNode } from 'react'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

type Props = {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  cancelLabel?: string
  /** Use the red button for actions that cannot be undone. */
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** A small yes/no dialog used before deleting things. */
export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  danger,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      open={open}
      onOpenChange={(next) => !next && onCancel()}
      title={title}
      description={typeof description === 'string' ? description : undefined}
      width={440}
      hideClose
    >
      {typeof description !== 'string' && (
        <div className="mb-5 text-text-muted">{description}</div>
      )}
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          className="flex-1"
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
