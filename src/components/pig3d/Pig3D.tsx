import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '../../lib/cn'
import { usePrefersReducedMotion } from '../../lib/usePrefersReducedMotion'
import { PigIllustration } from '../pig/PigIllustration'
import { TimeToken } from '../pig/TimeToken'
import type { PigColorName } from '../pig/pigColors'
import type { PigMood } from '../pig/pigMood'
import { canRender3D } from './webgl'

// The 3D libraries live in their own chunk and never touch the main bundle.
const Pig3DScene = lazy(() => import('./Pig3DScene'))

type Props = {
  mood?: PigMood
  color?: PigColorName
  label: string
  /** The clock that drops into the pig's slot every few seconds. */
  clock?: boolean
  className?: string
}

class SceneBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * A pig that turns to follow the cursor. The 2D pig shows first and stays for reduced motion,
 * devices without WebGL, low-end devices and any 3D failure.
 */
export function Pig3D({
  mood = 'happy',
  color = 'pink',
  label,
  clock = true,
  className,
}: Props) {
  const reduced = usePrefersReducedMotion()
  // `capable` is decided after the page is idle: creating a WebGL context to test it is not free.
  const [capable, setCapable] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [visible, setVisible] = useState(true)
  const box = useRef<HTMLDivElement>(null)

  const use3D = capable && !reduced && !failed

  // Check the device and start loading only after the page has settled, so the first paint stays light.
  useEffect(() => {
    if (reduced) return
    const start = () => setCapable(canRender3D())
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(start, { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(start, 800)
    return () => window.clearTimeout(id)
  }, [reduced])

  // Stop drawing while the pig is scrolled out of view.
  useEffect(() => {
    const el = box.current
    if (!el || !use3D || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [use3D])

  const show3D = use3D && ready

  return (
    <div
      ref={box}
      className={cn('relative', className)}
      data-pig-3d={show3D ? 'on' : 'off'}
    >
      <div className={cn(show3D && 'invisible')}>
        <PigIllustration
          mood={mood}
          color={color}
          label={label}
          alive
          className="w-full"
        />
        {clock && (
          <TimeToken className="hero-clock absolute left-[44.6%] top-[-10%] w-[10.7%]" />
        )}
      </div>
      {use3D && (
        <div
          className={cn(
            'absolute -inset-[10%] transition-opacity duration-500',
            ready ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden="true"
        >
          <SceneBoundary onError={() => setFailed(true)}>
            <Suspense fallback={null}>
              <Pig3DScene
                mood={mood}
                clock={clock}
                visible={visible}
                onReady={() => setReady(true)}
              />
            </Suspense>
          </SceneBoundary>
        </div>
      )}
    </div>
  )
}
