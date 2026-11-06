import { PigIllustration } from '../pig/PigIllustration'
import { buttonStyles } from '../ui/buttonStyles'

const LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#pigs', label: 'Your pigs' },
  { href: '#moods', label: 'Meet the pig' },
]

export function Header() {
  return (
    <header className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-3 px-6 py-5">
      <a href="#top" className="flex items-center gap-2.5 text-text no-underline">
        <PigIllustration mood="curious" decorative className="h-10 w-12" />
        <span className="font-heading text-2xl font-medium leading-tight">
          Piggy Hours
        </span>
      </a>
      <nav
        aria-label="Page sections"
        className="flex flex-wrap items-center gap-x-6 gap-y-2"
      >
        {LINKS.map((l) => (
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
    </header>
  )
}
