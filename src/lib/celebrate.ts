import { prefersReducedMotion } from './usePrefersReducedMotion'

const COLORS = ['#F5B833', '#FF8FAF', '#7FD6B0', '#8EC5FF', '#FFFFFF']

/**
 * Confetti for about 1.5 seconds. The library is loaded on demand, so it stays out of the main bundle, and it is
 * skipped completely when the system asks for reduced motion (DESIGN section 17). Failing to load is harmless.
 */
export async function fireConfetti(): Promise<void> {
  if (prefersReducedMotion()) return
  try {
    const { default: confetti } = await import('canvas-confetti')
    const base = {
      colors: COLORS,
      ticks: 90,
      gravity: 1.1,
      disableForReducedMotion: true,
      zIndex: 70,
    }
    confetti({
      ...base,
      particleCount: 70,
      spread: 75,
      startVelocity: 42,
      origin: { x: 0.5, y: 0.55 },
    })
    setTimeout(() => {
      confetti({
        ...base,
        particleCount: 35,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
      })
      confetti({
        ...base,
        particleCount: 35,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
      })
    }, 250)
  } catch {
    // The celebration is a bonus; ignore network or canvas problems.
  }
}
