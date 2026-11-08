import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

/** The button appears once the visitor has scrolled roughly one screen. */
const SHOW_AFTER_PX = 600

/** Floating back-to-top button (a pig looking up, with an arrow badge) for the long landing page. Keyboard accessible, respects reduced motion. */
export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const update = () => setVisible(window.scrollY > SHOW_AFTER_PX)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  function goTop() {
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
    // Keep keyboard users oriented: the button disappears, so move focus to the top of the page.
    document.getElementById('site-logo')?.focus({ preventScroll: true })
  }

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={goTop}
      aria-label="Back to top"
      className="group fixed bottom-4 right-4 z-40 flex size-14 cursor-pointer items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_4px_0_var(--color-primary-shadow)] hover:bg-primary-hover active:translate-y-[2px] active:scale-[0.97] active:shadow-[0_2px_0_var(--color-primary-shadow)] sm:bottom-6 sm:right-6"
    >
      <PigLookingUp />
      <span
        aria-hidden="true"
        className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full border-2 border-primary bg-surface text-primary"
      >
        <ArrowUp size={14} strokeWidth={3.5} />
      </span>
    </button>
  )
}

/** A small pig face with its eyes and snout tipped upward, as if looking at the top of the page. */
function PigLookingUp() {
  const ink = '#3D2B35'
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className="size-9 transition-transform duration-200 ease-[var(--ease-spring)] motion-safe:group-hover:-translate-y-1"
    >
      <polygon
        points="9,15 10,4 19,10"
        fill="#F7A9C4"
        stroke="#E58FAF"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <polygon
        points="31,15 30,4 21,10"
        fill="#F7A9C4"
        stroke="#E58FAF"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <ellipse
        cx="20"
        cy="22"
        rx="14"
        ry="13"
        fill="#FFC2D6"
        stroke="#E58FAF"
        strokeWidth="1.8"
      />
      <circle cx="14.5" cy="17" r="2.6" fill={ink} />
      <circle cx="25.5" cy="17" r="2.6" fill={ink} />
      <circle cx="15.3" cy="15.9" r="0.9" fill="#fff" />
      <circle cx="26.3" cy="15.9" r="0.9" fill="#fff" />
      <ellipse
        cx="20"
        cy="26"
        rx="6.2"
        ry="4.6"
        fill="#FF8FAF"
        stroke="#E58FAF"
        strokeWidth="1.4"
      />
      <ellipse cx="17.6" cy="25.4" rx="1" ry="1.5" fill="#A12C58" />
      <ellipse cx="22.4" cy="25.4" rx="1" ry="1.5" fill="#A12C58" />
    </svg>
  )
}
