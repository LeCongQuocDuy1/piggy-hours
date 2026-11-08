import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Group, Mesh } from 'three'
import { MathUtils } from 'three'
import { MOOD_SCALE, type PigMood } from '../pig/pigMood'
import { PIG_COLORS, type PigColorName } from '../pig/pigColors'

export type Pig3DSceneProps = {
  mood: PigMood
  color: PigColorName
  /** Show the clock that drops into the slot every few seconds. */
  clock: boolean
  /** Whether the canvas is on screen; offscreen scenes stop rendering. */
  visible: boolean
  onReady: () => void
}

const INK = '#3D2B35'
const GOLD = '#F5B833'
const GOLD_DARK = '#C98B0B'
const BASE_YAW = -1.0
const DROP_CYCLE = 5

/** Shared pointer position (-1..1) so the pig can look at the cursor anywhere on the page. */
function usePagePointer() {
  const pointer = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
  return pointer
}

const easeInQuad = (t: number) => t * t

function Pig({ mood, color, clock }: Pick<Pig3DSceneProps, 'mood' | 'color' | 'clock'>) {
  const c = PIG_COLORS[color]
  const target = MOOD_SCALE[mood]
  const pointer = usePagePointer()

  const root = useRef<Group>(null)
  const body = useRef<Group>(null)
  const eyeL = useRef<Mesh>(null)
  const eyeR = useRef<Mesh>(null)
  const earL = useRef<Mesh>(null)
  const earR = useRef<Mesh>(null)
  const clockRef = useRef<Group>(null)
  const scale = useRef(target)
  const squish = useRef(0)
  const dropped = useRef(false)

  const closedEyes = mood === 'sleepy'
  const happyEyes = mood === 'overjoyed'
  const blush = mood === 'excited' || mood === 'overjoyed'

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const g = root.current
    const b = body.current
    if (!g || !b) return

    // Look at the cursor and bob gently.
    g.rotation.y = MathUtils.damp(
      g.rotation.y,
      BASE_YAW + pointer.current.x * 0.4,
      4,
      delta,
    )
    g.rotation.x = MathUtils.damp(g.rotation.x, pointer.current.y * 0.18, 4, delta)
    g.position.y = Math.sin(t * 1.6) * 0.05

    // The belly swells (and shrinks) smoothly as the mood changes.
    scale.current = MathUtils.damp(scale.current, target, 3, delta)
    const s = scale.current

    // Squish when the clock lands: quick dip, springy recovery.
    squish.current = MathUtils.damp(squish.current, 0, 7, delta)
    const sq = squish.current
    b.scale.set(s * (1 + sq * 0.5), s * (1 - sq), s * (1 + sq * 0.5))

    // Blink every few seconds, and ears wiggle once in a while.
    const blinkPhase = t % 3.6
    const blinking = blinkPhase > 3.45
    const eyeY = closedEyes ? 0.12 : happyEyes ? 0.45 : blinking ? 0.1 : 1
    for (const eye of [eyeL.current, eyeR.current]) {
      if (eye) eye.scale.y = MathUtils.damp(eye.scale.y, eyeY, 30, delta)
    }
    const wiggle = t % 6 > 5.5 ? Math.sin(t * 28) * 0.18 : 0
    if (earL.current) earL.current.rotation.z = -0.35 + wiggle
    if (earR.current) earR.current.rotation.z = -0.35 - wiggle

    // The clock falls, spins, then slides into the slot.
    const c3d = clockRef.current
    if (c3d) {
      const p = t % DROP_CYCLE
      const slotY = 0.95 * s
      const fallEnd = 1
      const slideEnd = 1.3
      if (!clock || p > slideEnd) {
        c3d.visible = false
        dropped.current = false
      } else if (p <= fallEnd) {
        const k = easeInQuad(p / fallEnd)
        c3d.visible = true
        c3d.position.y = MathUtils.lerp(2.1, slotY + 0.42, k)
        c3d.rotation.y = (1 - k) * Math.PI * 2
        c3d.scale.setScalar(Math.min(1, p / 0.15))
      } else {
        const k = (p - fallEnd) / (slideEnd - fallEnd)
        c3d.visible = true
        c3d.position.y = MathUtils.lerp(slotY + 0.42, slotY - 0.1, k)
        c3d.rotation.y = 0
        c3d.scale.set(1, 1, 1)
        if (!dropped.current && k > 0.5) {
          dropped.current = true
          squish.current = 0.14
        }
      }
    }
  })

  const material = (col: string, rough = 0.55) => (
    <meshStandardMaterial color={col} roughness={rough} metalness={0.05} />
  )

  return (
    <group ref={root} rotation={[0, BASE_YAW, 0]}>
      <group ref={body}>
        {/* body */}
        <mesh scale={[1.25, 0.95, 0.95]}>
          <sphereGeometry args={[1, 40, 32]} />
          {material(c.soft)}
        </mesh>
        {/* head */}
        <mesh position={[1.05, 0.25, 0]}>
          <sphereGeometry args={[0.66, 32, 24]} />
          {material(c.soft)}
        </mesh>
        {/* snout */}
        <mesh position={[1.62, 0.17, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.26, 28]} />
          {material(c.snout)}
        </mesh>
        <mesh position={[1.76, 0.2, 0.1]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          {material(c.nostril)}
        </mesh>
        <mesh position={[1.76, 0.2, -0.1]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          {material(c.nostril)}
        </mesh>
        {/* eyes */}
        <mesh ref={eyeL} position={[1.52, 0.5, 0.28]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          {material(INK, 0.3)}
        </mesh>
        <mesh ref={eyeR} position={[1.52, 0.5, -0.28]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          {material(INK, 0.3)}
        </mesh>
        {/* cheeks */}
        {blush && (
          <>
            <mesh position={[1.4, 0.2, 0.43]} scale={[1, 0.65, 0.4]}>
              <sphereGeometry args={[0.12, 14, 14]} />
              {material('#FF7FA6', 0.9)}
            </mesh>
            <mesh position={[1.4, 0.2, -0.43]} scale={[1, 0.65, 0.4]}>
              <sphereGeometry args={[0.12, 14, 14]} />
              {material('#FF7FA6', 0.9)}
            </mesh>
          </>
        )}
        {/* ears */}
        <mesh ref={earL} position={[0.92, 0.85, 0.38]} rotation={[0.35, 0, -0.35]}>
          <coneGeometry args={[0.24, 0.5, 20]} />
          {material(c.ear)}
        </mesh>
        <mesh ref={earR} position={[0.92, 0.85, -0.38]} rotation={[-0.35, 0, -0.35]}>
          <coneGeometry args={[0.24, 0.5, 20]} />
          {material(c.ear)}
        </mesh>
        {/* legs */}
        {[
          [0.6, 0.42],
          [0.6, -0.42],
          [-0.6, 0.42],
          [-0.6, -0.42],
        ].map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, -0.9, z]}>
            <cylinderGeometry args={[0.2, 0.22, 0.5, 18]} />
            {material(c.ear)}
          </mesh>
        ))}
        {/* tail */}
        <mesh position={[-1.32, 0.25, 0]} rotation={[0, 0, 0.6]}>
          <torusGeometry args={[0.14, 0.04, 10, 20, Math.PI * 1.6]} />
          {material(c.outline)}
        </mesh>
        {/* the slot the clock drops into */}
        <mesh position={[0, 0.94, 0]} scale={[1, 1, 1]}>
          <boxGeometry args={[0.62, 0.05, 0.12]} />
          {material(INK, 0.4)}
        </mesh>
      </group>

      {/* the clock that drops in */}
      <group ref={clockRef} position={[0, 2.1, 0]} visible={false}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.08, 32]} />
          <meshStandardMaterial color={GOLD} roughness={0.35} metalness={0.3} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.36, 0.04, 12, 32]} />
          <meshStandardMaterial color={GOLD_DARK} roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.1, 0.05]}>
          <boxGeometry args={[0.04, 0.2, 0.02]} />
          <meshStandardMaterial color="#7A4E00" />
        </mesh>
        <mesh position={[0.08, 0, 0.05]}>
          <boxGeometry args={[0.16, 0.04, 0.02]} />
          <meshStandardMaterial color="#7A4E00" />
        </mesh>
      </group>
    </group>
  )
}

export default function Pig3DScene({
  mood,
  color,
  clock,
  visible,
  onReady,
}: Pig3DSceneProps) {
  return (
    <Canvas
      flat
      dpr={[1, 2]}
      frameloop={visible ? 'always' : 'never'}
      camera={{ position: [0, 0.8, 5.0], fov: 34 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      aria-hidden="true"
      onCreated={() => onReady()}
    >
      <ambientLight intensity={2.1} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} />
      <directionalLight position={[-4, 1, -2]} intensity={0.6} color="#ffd9e6" />
      <Pig mood={mood} color={color} clock={clock} />
    </Canvas>
  )
}
