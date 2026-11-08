import { pigStatus } from '../../domain/pigs'
import type { Pig } from '../../domain/types'
import type { PigInput } from '../../domain/validation'
import { useApp } from '../../state/AppProvider'
import { Modal } from '../ui/Modal'
import { useToast } from '../ui/Toast'
import { PigForm, type PigFormOutcome } from './PigForm'

type Props = { pig: Pig | null; onClose: () => void }

/** Edit-pig dialog (US-05). A full pig keeps its target; an active pig's target cannot go below what is saved. */
export function EditPigModal({ pig, onClose }: Props) {
  return (
    <Modal
      open={pig !== null}
      onOpenChange={(open) => !open && onClose()}
      title="Edit pig"
      description="Change how your pig looks or its goal."
    >
      {pig && <EditPigForm key={pig.id} pig={pig} onClose={onClose} />}
    </Modal>
  )
}

function EditPigForm({ pig, onClose }: { pig: Pig; onClose: () => void }) {
  const { data, updatePig } = useApp()
  const toast = useToast()
  const locked = pigStatus(pig, data.deposits) !== 'active'

  function onSubmit(input: PigInput): PigFormOutcome {
    const result = updatePig(pig.id, input)
    if (result.ok) {
      toast.show(`${result.value.changes.name} updated`)
      onClose()
      return null
    }
    if (result.error.kind === 'NO_PIG') return { formError: 'This pig no longer exists.' }
    const { pig: pigError, ...fields } = result.error.errors
    return { fields, formError: pigError }
  }

  return (
    <PigForm
      initial={{
        name: pig.name,
        targetHours: String(pig.targetMinutes / 60),
        emoji: pig.emoji,
        color: pig.color,
        deadline: pig.deadline ?? '',
      }}
      submitLabel="Save changes"
      targetLockedReason={locked ? 'A full pig keeps its target.' : undefined}
      targetHint="Whole hours. It cannot be lower than the time you already saved."
      onSubmit={onSubmit}
      onCancel={onClose}
    />
  )
}
