import { useApp } from '../../state/AppProvider'
import { Modal } from '../ui/Modal'
import { useToast } from '../ui/Toast'
import { PigForm, type PigFormOutcome } from './PigForm'
import type { PigInput } from '../../domain/validation'

type Props = { open: boolean; onOpenChange: (open: boolean) => void }

/** Create-pig dialog (US-01). Typed values are kept when there is an error. */
export function CreatePigModal({ open, onOpenChange }: Props) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="New pig"
      description="Give your goal a name and a target. You can fill it up bit by bit."
    >
      {/* The form lives in its own component so it starts fresh every time the modal opens. */}
      <CreatePigForm onDone={() => onOpenChange(false)} />
    </Modal>
  )
}

function CreatePigForm({ onDone }: { onDone: () => void }) {
  const { createPig } = useApp()
  const toast = useToast()

  function onSubmit(input: PigInput): PigFormOutcome {
    const result = createPig(input)
    if (result.ok) {
      toast.show(`${result.value.name} is ready for its first hours`)
      onDone()
      return null
    }
    if (result.error.kind === 'NO_SLOT') {
      return { formError: 'All pig slots are in use. Complete a pig to free a slot.' }
    }
    return { fields: result.error.fields }
  }

  return <PigForm submitLabel="Create pig" onSubmit={onSubmit} onCancel={onDone} />
}
