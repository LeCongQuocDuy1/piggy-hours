import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { PigMood } from '../pig/pigMood'
import { createPigRig } from './pigRig'

export type Pig3DSceneProps = {
  mood: PigMood
  /** Show the clock that drops into the slot every few seconds. */
  clock: boolean
  /** Whether the canvas is on screen; offscreen scenes stop rendering. */
  visible: boolean
  onReady: () => void
}

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

function Pig({ mood, clock }: Pick<Pig3DSceneProps, 'mood' | 'clock'>) {
  const pointer = usePagePointer()
  const rig = useMemo(() => createPigRig(), [])
  useEffect(() => () => rig.dispose(), [rig])

  useFrame((state, delta) => {
    rig.update(Math.min(delta, 0.05), state.clock.elapsedTime, {
      mood,
      clock,
      pointerX: pointer.current.x,
      pointerY: pointer.current.y,
    })
  })

  return <primitive object={rig.object} />
}

/** Soft studio reflections so the glossy eyes and the pink skin catch some light. */
function Studio() {
  const get = useThree((s) => s.get)
  useEffect(() => {
    const { gl, scene, camera } = get()
    camera.lookAt(0.2, 0.15, 0)
    const pmrem = new PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.28
    pmrem.dispose()
    return () => {
      scene.environment = null
      env.dispose()
    }
  }, [get])
  return null
}

export default function Pig3DScene({ mood, clock, visible, onReady }: Pig3DSceneProps) {
  return (
    <Canvas
      flat
      dpr={[1, 2]}
      frameloop={visible ? 'always' : 'never'}
      camera={{ position: [0.1, 0.9, 9.3], fov: 34 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
      aria-hidden="true"
      onCreated={() => onReady()}
    >
      <Studio />
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 5, 4]} intensity={1.15} />
      <directionalLight position={[-4, 2, -3]} intensity={0.55} color="#ffd9e6" />
      <Pig mood={mood} clock={clock} />
    </Canvas>
  )
}
