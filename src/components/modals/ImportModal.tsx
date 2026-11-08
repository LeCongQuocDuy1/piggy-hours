import { useState } from 'react'
import { describeData, type ParsedBackup } from '../../domain/backup'
import { cn } from '../../lib/cn'
import { useApp } from '../../state/AppProvider'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { useToast } from '../ui/Toast'

type Props = { backup: ParsedBackup | null; onClose: () => void }

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`

/** Asks how to import a valid backup: merge with the current data or replace it (US-07). */
export function ImportModal({ backup, onClose }: Props) {
  return (
    <Modal
      open={backup !== null}
      onOpenChange={(open) => !open && onClose()}
      title="Import backup"
      description={
        backup?.exportedAt
          ? `Backup made on ${dateFormat.format(new Date(backup.exportedAt))}.`
          : 'Choose how to bring this backup in.'
      }
      width={520}
    >
      {backup && <ImportForm backup={backup} onClose={onClose} />}
    </Modal>
  )
}

function ImportForm({ backup, onClose }: { backup: ParsedBackup; onClose: () => void }) {
  const { data, importBackup } = useApp()
  const toast = useToast()
  const [mode, setMode] = useState<'merge' | 'replace'>('merge')
  const file = describeData(backup.data)
  const mine = describeData(data)

  function submit() {
    const s = importBackup(backup.data, mode)
    if (s.mode === 'replace') {
      toast.show(
        `Replaced your data: ${plural(s.addedPigs, 'pig')} and ${plural(s.addedDeposits, 'entry', 'entries')}`,
      )
    } else {
      const skipped = s.skippedPigs + s.skippedDeposits
      toast.show(
        `Added ${plural(s.addedPigs, 'pig')} and ${plural(s.addedDeposits, 'entry', 'entries')}` +
          (skipped > 0 ? `. ${skipped} did not fit and were skipped.` : ''),
      )
    }
    onClose()
  }

  const options = [
    {
      value: 'merge' as const,
      title: 'Merge with my data',
      text: 'Adds what is missing. If a pig or entry is in both, yours stays as it is. Pigs that do not fit in your free slots are skipped.',
    },
    {
      value: 'replace' as const,
      title: 'Replace everything',
      text: `Deletes your current ${plural(mine.pigs, 'pig')} and ${plural(mine.deposits, 'entry', 'entries')} and uses the backup instead.`,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 rounded-md bg-bg px-4 py-3 text-sm">
        <strong>In the file:</strong> {plural(file.pigs, 'pig')},{' '}
        {plural(file.deposits, 'entry', 'entries')}, {file.completed} completed.
        <br />
        <strong>In the app now:</strong> {plural(mine.pigs, 'pig')},{' '}
        {plural(mine.deposits, 'entry', 'entries')}, {mine.completed} completed.
      </p>

      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="mb-1.5 p-0 text-sm font-bold">
          How should it be imported?
        </legend>
        {options.map((o) => (
          <label key={o.value} className="cursor-pointer">
            <input
              type="radio"
              name="import-mode"
              value={o.value}
              checked={mode === o.value}
              onChange={() => setMode(o.value)}
              className="peer sr-only"
            />
            <span
              className={cn(
                'block rounded-md border-2 px-4 py-3 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary',
                mode === o.value ? 'border-primary bg-track' : 'border-border bg-surface',
              )}
            >
              <span className="block font-bold">{o.title}</span>
              <span className="mt-0.5 block text-sm text-text-muted">{o.text}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {mode === 'replace' && (
        <p role="note" className="m-0 text-sm text-warning-text">
          This cannot be undone. Export a backup of your current data first if you might
          need it.
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant={mode === 'replace' ? 'danger' : 'primary'}
          className="flex-[2] whitespace-nowrap"
          onClick={submit}
        >
          {mode === 'replace' ? 'Replace all' : 'Merge backup'}
        </Button>
      </div>
    </div>
  )
}
