import { Download, HardDrive, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import {
  backupErrorMessage,
  backupFileName,
  createBackup,
  MAX_BACKUP_BYTES,
  parseBackup,
  type ParsedBackup,
} from '../../domain/backup'
import { toLocalDate } from '../../domain/time'
import { useApp } from '../../state/AppProvider'
import { ImportModal } from '../modals/ImportModal'
import { Button } from '../ui/Button'
import { useToast } from '../ui/Toast'

function readText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

/** "Your data": export and import a JSON backup, and the reminder that data lives in this browser (US-07). */
export function DataSection() {
  const { data } = useApp()
  const toast = useToast()
  const picker = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [backup, setBackup] = useState<ParsedBackup | null>(null)

  function exportBackup() {
    const now = new Date()
    const file = createBackup(data, now)
    const name = backupFileName(toLocalDate(now))
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast.show(`Backup saved as ${name}`)
  }

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // lets the same file be chosen again
    if (!file) return
    setError(null)
    if (file.size > MAX_BACKUP_BYTES) {
      setError(backupErrorMessage({ kind: 'TOO_LARGE' }))
      return
    }
    let text: string
    try {
      text = await readText(file)
    } catch {
      setError(backupErrorMessage({ kind: 'NOT_JSON' }))
      return
    }
    const parsed = parseBackup(text)
    if (!parsed.ok) {
      setError(backupErrorMessage(parsed.error))
      return
    }
    setBackup(parsed.value)
  }

  return (
    <section id="data" aria-labelledby="data-title" className="scroll-mt-20">
      <div className="mx-auto max-w-[760px] px-4 py-14 sm:px-6 md:py-[72px]">
        <h2
          id="data-title"
          className="mb-2 text-center font-heading text-3xl font-medium leading-tight md:text-4xl"
        >
          Your data
        </h2>
        <p className="mx-auto mb-8 max-w-[520px] text-center text-text-muted">
          Save a copy of your pigs, or bring one back.
        </p>

        <div className="rounded-lg border-2 border-border bg-surface p-5 sm:p-6">
          <div className="flex items-start gap-3 rounded-md bg-warning-bg px-4 py-3 text-warning-text">
            <HardDrive size={22} aria-hidden="true" className="mt-0.5 flex-none" />
            <p className="m-0 text-sm">
              Your pigs live only in this browser. Clearing browser data, or switching to
              another browser or device, will not bring them along, so download a backup
              now and then.
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" onClick={exportBackup}>
              <Download size={20} strokeWidth={2.5} aria-hidden="true" />
              Export backup
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => picker.current?.click()}
            >
              <Upload size={20} strokeWidth={2.5} aria-hidden="true" />
              Import backup
            </Button>
            <input
              ref={picker}
              type="file"
              accept="application/json,.json"
              aria-label="Backup file"
              tabIndex={-1}
              onChange={onPick}
              className="sr-only"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="m-0 mt-4 rounded-md bg-danger-bg px-4 py-3 text-sm font-bold text-danger"
            >
              {error}
            </p>
          )}
        </div>
      </div>

      <ImportModal backup={backup} onClose={() => setBackup(null)} />
    </section>
  )
}
