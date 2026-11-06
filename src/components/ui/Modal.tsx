import * as Dialog from '@radix-ui/react-dialog'
import { useRef } from 'react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  /** Width of the card in px (desktop). Phones always get the full width minus a gutter. */
  width?: number
  /** Hide the close button (confirmation dialogs use explicit buttons). */
  hideClose?: boolean
  className?: string
}

/**
 * Shared modal: dimmed overlay, centered white card, focus trap, Esc to close, focus returns to the
 * trigger. Built on Radix Dialog (docs/ARCHITECTURE.md T2).
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  width = 520,
  hideClose,
  className,
}: Props) {
  // The modal is controlled from outside (no Dialog.Trigger), so remember the opener ourselves and give it focus
  // back on close (docs/DESIGN.md section 9).
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
          style={{ maxWidth: width }}
          className={cn(
            'dialog-card fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto',
            'rounded-[28px] bg-surface p-7 shadow-dialog',
            className,
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <Dialog.Title className="font-heading text-[26px] font-medium leading-tight">
              {title}
            </Dialog.Title>
            {!hideClose && (
              <Dialog.Close
                aria-label="Close"
                className="-mr-2 -mt-1 flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-full bg-bg"
              >
                <X size={20} strokeWidth={2.5} aria-hidden="true" />
              </Dialog.Close>
            )}
          </div>
          {description ? (
            <Dialog.Description className="mb-5 text-text-muted">
              {description}
            </Dialog.Description>
          ) : (
            <Dialog.Description className="sr-only">{title}</Dialog.Description>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
