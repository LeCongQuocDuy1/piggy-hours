import { Menu } from 'lucide-react'
import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { PigIllustration } from '../pig/PigIllustration'
import { buttonStyles } from '../ui/buttonStyles'
import { Drawer } from '../ui/Drawer'

const LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#pigs', label: 'Your pigs' },
  { href: '#moods', label: 'Meet the pig' },
  { href: '#faq', label: 'FAQ' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="mx-auto flex max-w-[1120px] items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-5">
      <a
        id="site-logo"
        href="#top"
        className="flex items-center gap-2 text-text no-underline sm:gap-2.5"
      >
        <PigIllustration mood="curious" decorative className="h-9 w-11 sm:h-10 sm:w-12" />
        <span className="font-heading text-xl font-medium leading-tight sm:text-2xl">
          Piggy Hours
        </span>
      </a>

      {/* Desktop navigation */}
      <nav aria-label="Page sections" className="hidden items-center gap-x-6 md:flex">
        {LINKS.slice(0, 3).map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="flex min-h-11 items-center font-bold text-text no-underline hover:text-primary"
          >
            {l.label}
          </a>
        ))}
        <a href="#pigs" className={buttonStyles({ size: 'sm' })}>
          Start saving
        </a>
      </nav>

      {/* Mobile menu button and side drawer */}
      <button
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        onClick={() => setMenuOpen(true)}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-border bg-surface text-text md:hidden"
      >
        <Menu size={22} strokeWidth={2.5} aria-hidden="true" />
      </button>
      <Drawer open={menuOpen} onOpenChange={setMenuOpen} title="Menu">
        <nav aria-label="Menu" className="flex flex-1 flex-col">
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Dialog.Close asChild>
                  <a
                    href={l.href}
                    className="flex min-h-12 items-center rounded-md px-3 font-heading text-lg font-medium text-text no-underline active:bg-track"
                  >
                    {l.label}
                  </a>
                </Dialog.Close>
              </li>
            ))}
          </ul>
          <Dialog.Close asChild>
            <a
              href="#pigs"
              className={buttonStyles({ size: 'lg', className: 'mt-auto w-full' })}
            >
              Start saving
            </a>
          </Dialog.Close>
        </nav>
      </Drawer>
    </header>
  )
}
