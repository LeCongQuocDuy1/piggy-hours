import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

/** The button appears once the visitor has scrolled roughly one screen. */
const SHOW_AFTER_PX = 600

/** Floating back-to-top button (a round button with just an arrow) for the long landing page. Keyboard accessible, respects reduced motion. */
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
      className="group fixed bottom-4 right-4 z-40 flex size-12 cursor-pointer items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_4px_0_var(--color-primary-shadow)] hover:bg-primary-hover active:translate-y-[2px] active:scale-[0.97] active:shadow-[0_2px_0_var(--color-primary-shadow)] sm:bottom-6 sm:right-6"
    >
      <ArrowUp
        size={24}
        strokeWidth={3}
        aria-hidden="true"
        className="transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5"
      />
    </button>
  )
}
