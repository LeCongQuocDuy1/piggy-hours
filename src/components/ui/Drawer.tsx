import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useRef } from 'react'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
}

/** Side sheet that slides in from the right (mobile menu). Same behavior as Modal: focus trap, Esc, focus return. */
export function Drawer({ open, onOpenChange, title, children }: Props) {
  const opener = useRef<HTMLElement | null>(null)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay fixed inset-0 z-50 bg-[rgba(61,43,53,0.5)]" />
        <Dialog.Content
          onOpenAutoFocus={() => {
            opener.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            opener.current?.focus()
          }}
          className="drawer-card fixed right-0 top-0 z-50 flex h-dvh w-[min(320px,86vw)] flex-col rounded-l-xl bg-surface p-6 shadow-dialog"
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="font-heading text-2xl font-medium">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close menu"
              className="-mr-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-bg"
            >
              <X size={20} strokeWidth={2.5} aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Jump to a section of the page
          </Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
