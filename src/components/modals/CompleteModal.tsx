import type { Pig } from '../../domain/types'
import { useApp } from '../../state/AppProvider'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { useToast } from '../ui/Toast'

type Props = { pig: Pig | null; onClose: () => void }

/** Confirmation before completing a pig (US-04, design decision D4). Completing cannot be undone in the MVP. */
export function CompleteModal({ pig, onClose }: Props) {
  const { completePig } = useApp()
  const toast = useToast()

  function confirm() {
    if (!pig) return
    const result = completePig(pig.id)
    if (result.ok) toast.show(`${pig.name} completed. A slot is free.`)
    onClose()
  }

  return (
    <Modal
      open={pig !== null}
      onOpenChange={(open) => !open && onClose()}
      title="Complete this pig?"
      description={
        pig
          ? `“${pig.name}” will move to your shelf and free up a slot. You can't add more time to it afterward.`
          : undefined
      }
      width={440}
      hideClose
    >
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={confirm}>
          Complete
        </Button>
      </div>
    </Modal>
  )
}
