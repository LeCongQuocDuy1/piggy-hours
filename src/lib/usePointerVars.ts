import { useEffect, type RefObject } from 'react'
import { prefersReducedMotion } from './usePrefersReducedMotion'

type Options = {
  /** Names of the CSS variables to write: x and y run from -1 to 1 across the element. */
  x?: string
  y?: string
  /** Extra variables that run from 0 to 100 (%) for light effects. */
  px?: string
  py?: string
}

/**
 * Writes the mouse position over an element into CSS variables (one animation frame at a time), so CSS can do
 * parallax and tilt without React re-rendering. Does nothing for touch, pen, or when reduced motion is on.
 */
export function usePointerVars<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { x = '--px', y = '--py', px, py }: Options = {},
) {
  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    let frame = 0
    let last: PointerEvent | null = null

    const write = () => {
      frame = 0
      if (!last) return
      const r = el.getBoundingClientRect()
      const fx = r.width ? (last.clientX - r.left) / r.width : 0.5
      const fy = r.height ? (last.clientY - r.top) / r.height : 0.5
      el.style.setProperty(x, String(Math.max(-1, Math.min(1, fx * 2 - 1))))
      el.style.setProperty(y, String(Math.max(-1, Math.min(1, fy * 2 - 1))))
      if (px) el.style.setProperty(px, `${Math.round(fx * 100)}%`)
      if (py) el.style.setProperty(py, `${Math.round(fy * 100)}%`)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      last = e
      if (!frame) frame = requestAnimationFrame(write)
    }
    const onLeave = () => {
      last = null
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      el.style.setProperty(x, '0')
      el.style.setProperty(y, '0')
      el.dataset.pointer = 'off'
    }
    const onEnter = () => {
      el.dataset.pointer = 'on'
    }
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [ref, x, y, px, py])
}
