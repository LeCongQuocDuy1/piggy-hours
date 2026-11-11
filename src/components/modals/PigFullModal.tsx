import { useEffect } from 'react'
import { fireConfetti } from '../../lib/celebrate'
import { formatMinutesShort } from '../../domain/time'
import type { Pig } from '../../domain/types'
import { Pig3D } from '../pig3d/Pig3D'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

type Props = {
  pig: Pig | null
  onClose: () => void
  /** The user wants to complete the pig now (opens the confirmation). */
  onComplete: (pigId: string) => void
}

/** Shown when a deposit fills a pig (US-02). The pig bounces and confetti flies; reduced motion skips both (US-12, no sound). */
export function PigFullModal({ pig, onClose, onComplete }: Props) {
  const pigId = pig?.id
  useEffect(() => {
    if (pigId) void fireConfetti()
  }, [pigId])

  return (
    <Modal
      open={pig !== null}
      onOpenChange={(open) => !open && onClose()}
      title="Your pig is full!"
      width={440}
      hideClose
      centered
      hero={
        <div className="mx-auto mb-4 flex h-[200px] w-[200px] items-center justify-center rounded-full bg-coin-soft">
          <Pig3D
            mood="overjoyed"
            color={pig?.color}
            clock={false}
            label="An overjoyed pig with a gold clock and sparkles"
            className="pig-bounce w-[190px]"
          />
        </div>
      }
    >
      {pig && (
        <div className="text-center">
          <p className="mb-6 mt-0 text-text-muted">
            You saved{' '}
            <strong className="text-text">{formatMinutesShort(pig.targetMinutes)}</strong>{' '}
            for “{pig.name}”. Mark it as completed to free up a slot for your next goal.
          </p>
          <div className="flex flex-col gap-2.5">
            <Button onClick={() => onComplete(pig.id)}>Mark as completed</Button>
            <Button variant="secondary" onClick={onClose}>
              Later
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
