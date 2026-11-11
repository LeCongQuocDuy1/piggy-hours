import { useEffect, useRef, useState } from 'react'
import { moodForProgress } from '../domain/pigs'
import { MOOD_LABEL, type PigMood } from './pig/pigMood'
import { PigSprite } from './pig3d/PigSprite'

/** It appears once the visitor has scrolled roughly one screen, like the back-to-top button. */
const SHOW_AFTER_PX = 600

/** The disc behind the pig changes with the mood; the pig itself stays pink. */
const MOOD_DISC: Record<PigMood, string> = {
  sleepy: '#ECE6FB',
  curious: '#FFF0CC',
  happy: '#FFE3EC',
  excited: '#FFE9D6',
  overjoyed: '#FFF1C9',
}

/** How far down the page the visitor is, as a whole number from 0 to 100. */
function scrollPercent() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  return max > 0 ? Math.round(Math.max(0, Math.min(1, window.scrollY / max)) * 100) : 0
}

/**
 * A small pig in the corner that reads the page: sleepy at the top, happier as you scroll, overjoyed at the end.
 * It changes mood with a little hop. Decorative only (hidden from screen readers) and never takes clicks.
 */
export function ScrollPig() {
  const [percent, setPercent] = useState(0)
  const [visible, setVisible] = useState(false)
  const [hops, setHops] = useState(0)
  const lastMood = useRef<PigMood>('sleepy')
  const mood = moodForProgress(percent)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setVisible(window.scrollY > SHOW_AFTER_PX)
      setPercent(scrollPercent())
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    if (lastMood.current === mood) return
    lastMood.current = mood
    // Restart the hop animation on every mood change (the key on the pig box changes).
    setHops((n) => n + 1)
  }, [mood])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      data-testid="scroll-pig"
      data-mood={mood}
      className="pointer-events-none fixed bottom-4 left-4 z-30 hidden w-[88px] flex-col items-center gap-1.5 sm:flex md:bottom-6 md:left-6 md:w-[104px]"
    >
      <div
        className="relative flex aspect-square w-full items-center justify-center rounded-full border-2 border-border shadow-card transition-colors duration-500"
        style={{ backgroundColor: MOOD_DISC[mood] }}
      >
        <div key={hops} className={hops > 0 ? 'scroll-pig-hop w-[88%]' : 'w-[88%]'}>
          <PigSprite mood={mood} decorative className="aspect-[6/5] w-full" />
        </div>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-track">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-150"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="rounded-full bg-surface/90 px-2 text-xs font-bold tabular-nums text-text-muted">
        {MOOD_LABEL[mood]} · {percent}%
      </span>
    </div>
  )
}
