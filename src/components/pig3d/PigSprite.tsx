import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { usePrefersReducedMotion } from '../../lib/usePrefersReducedMotion'
import { PigIllustration } from '../pig/PigIllustration'
import type { PigColorName } from '../pig/pigColors'
import type { PigMood } from '../pig/pigMood'
import type { PigFrame } from './pigStage'
import { canRender3D } from './webgl'

type Props = {
  mood: PigMood
  /** Only used by the 2D fallback: the 3D pig is always pink. */
  color?: PigColorName
  label?: string
  decorative?: boolean
  /** `wide` leaves room above the pig for the floating symbols; use it where the box is big enough. */
  frame?: PigFrame
  /** Changes every time one clock should drop in. */
  pulse?: number
  /** A clock that drops in every few seconds. */
  clock?: boolean
  /** The box. Give it a size; the 3D picture fills it exactly like the 2D pig does. */
  className?: string
  /** What shows instead of the 3D pig (and underneath it for screen readers). Defaults to the 2D pig. */
  children?: ReactNode
}

/**
 * A small 3D pig that lives in the layout like an image. The 2D pig is what you see first and what stays for
 * reduced motion, devices without WebGL, low-end devices and any error. The 3D picture is drawn by one shared
 * renderer (see pigStage), so a page can hold many of them.
 */
export function PigSprite({
  mood,
  color = 'pink',
  label,
  decorative = false,
  frame = 'tight',
  pulse = 0,
  clock = false,
  className,
  children,
}: Props) {
  const reduced = usePrefersReducedMotion()
  const [capable, setCapable] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  // The stage reads the latest props every frame from here, so props never restart the pig.
  const live = useRef({ mood, clock, pulse })
  useEffect(() => {
    live.current = { mood, clock, pulse }
  })

  const use3D = capable && !reduced && !failed

  // Decide after the page is idle, like the hero pig: the WebGL probe is not free.
  useEffect(() => {
    if (reduced) return
    const start = () => setCapable(canRender3D())
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(start, { timeout: 2500 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(start, 900)
    return () => window.clearTimeout(id)
  }, [reduced])

  useEffect(() => {
    const el = canvas.current
    const holder = box.current
    if (!use3D || !el || !holder) return
    let cancelled = false
    let handle: { setVisible: (v: boolean) => void; dispose: () => void } | undefined
    let io: IntersectionObserver | undefined
    import('./pigStage')
      .then(({ registerSprite }) => {
        if (cancelled) return
        handle = registerSprite({
          canvas: el,
          frame,
          read: () => live.current,
          onFirstFrame: () => setReady(true),
        })
        if (typeof IntersectionObserver === 'undefined') {
          handle.setVisible(true)
          return
        }
        io = new IntersectionObserver(
          ([entry]) => handle?.setVisible(entry.isIntersecting),
          {
            rootMargin: '80px',
          },
        )
        io.observe(holder)
      })
      .catch(() => setFailed(true))
    return () => {
      cancelled = true
      io?.disconnect()
      handle?.dispose()
      setReady(false)
    }
  }, [use3D, frame])

  const show3D = use3D && ready

  return (
    <div
      ref={box}
      className={cn('relative', className)}
      data-pig-sprite={show3D ? '3d' : '2d'}
    >
      <div className={cn('h-full w-full', show3D && 'invisible')}>
        {children ?? (
          <PigIllustration
            mood={mood}
            color={color}
            label={label}
            decorative={decorative}
            className="h-full w-full"
          />
        )}
      </div>
      {use3D && (
        <canvas
          ref={canvas}
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-500',
            ready ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}
    </div>
  )
}
