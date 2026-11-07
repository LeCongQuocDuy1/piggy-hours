import { TriangleAlert, X } from 'lucide-react'
import { useApp } from '../state/AppProvider'
import type { StorageError } from '../storage/storage'

function messageFor(error: StorageError): string {
  switch (error.kind) {
    case 'UNAVAILABLE':
      return "Your browser is blocking storage, so your progress can't be saved. The app still works, but everything disappears when you close this tab."
    case 'CORRUPTED':
      return error.backupKey
        ? "We couldn't read your saved data. A backup copy was kept in your browser and you're starting fresh."
        : "We couldn't read your saved data, and a backup copy could not be made. You're starting fresh."
    case 'NEWER_VERSION':
      return 'Your saved data comes from a newer version of Piggy Hours. It was left untouched, and changes made here will not be saved over it.'
  }
}

export function StorageBanner() {
  const { storageError, dismissStorageError } = useApp()
  if (!storageError) return null
  return (
    <div role="alert" className="bg-danger-bg text-danger">
      <div className="mx-auto flex max-w-[1120px] items-start gap-3 px-4 py-3 text-sm font-bold sm:px-6">
        <TriangleAlert size={20} aria-hidden="true" className="mt-0.5 flex-none" />
        <p className="m-0 flex-1">{messageFor(storageError)}</p>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={dismissStorageError}
          className="-my-1 flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-full"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
