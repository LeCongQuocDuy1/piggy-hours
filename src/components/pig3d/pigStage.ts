import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import type { PigMood } from '../pig/pigMood'
import { createPigRig, type PigRig } from './pigRig'

/**
 * One shared WebGL renderer draws every small 3D pig on the page. Each pig is an ordinary 2D `<canvas>` in the
 * layout, so scrolling, clipping and dialogs just work, and the page never needs more than one extra WebGL context.
 */

/** How the camera frames the pig. `tight` fills a small box; `wide` leaves room above for the floating symbols. */
export type PigFrame = 'tight' | 'wide'

export type SpriteOptions = {
  canvas: HTMLCanvasElement
  frame: PigFrame
  /** Read every frame, so the pig can follow props without re-registering. */
  read: () => { mood: PigMood; clock: boolean; pulse: number }
  /** Called after the first picture has been drawn. */
  onFirstFrame: () => void
}

type Sprite = SpriteOptions & {
  rig: PigRig
  visible: boolean
  drawn: boolean
  ctx: CanvasRenderingContext2D
  acc: number
}

const GL_SIZE = 640 // pixels: the shared canvas is big enough for the biggest pig
const FRAME_TIME = 1 / 30 // small pigs animate at 30 frames per second

const sprites = new Set<Sprite>()
const pointer = { x: 0, y: 0 }
let renderer: WebGLRenderer | undefined
let scene: Scene
let camera: PerspectiveCamera
let frameId = 0
let lastTime = 0
let started = false

/** Lets the browser paint and handle input between two heavy steps, so starting up never freezes the page. */
const breathe = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

let ready: Promise<void> | undefined

/** Creates the renderer and its lighting in small steps (each is a separate task). Runs once. */
function setup(): Promise<void> {
  ready ??= (async () => {
    const gl = new WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    })
    gl.setPixelRatio(1)
    gl.setSize(GL_SIZE, GL_SIZE, false)
    gl.setScissorTest(true)
    gl.setClearColor(0x000000, 0)
    scene = new Scene()
    camera = new PerspectiveCamera(30, 1, 0.1, 50)
    camera.position.set(0.1, 0.9, 9.3)
    scene.add(new AmbientLight(0xffffff, 0.75))
    const key = new DirectionalLight(0xffffff, 1.15)
    key.position.set(3, 5, 4)
    const rim = new DirectionalLight(0xffd9e6, 0.55)
    rim.position.set(-4, 2, -3)
    scene.add(key, rim)
    await breathe()
    const pmrem = new PMREMGenerator(gl)
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environmentIntensity = 0.28
    pmrem.dispose()
    renderer = gl
    window.addEventListener(
      'pointermove',
      (e) => {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1
        pointer.y = (e.clientY / window.innerHeight) * 2 - 1
      },
      { passive: true },
    )
    document.addEventListener('visibilitychange', () =>
      document.hidden ? stop() : maybeStart(),
    )
    await breathe()
  })()
  return ready
}

function stop() {
  if (frameId) cancelAnimationFrame(frameId)
  frameId = 0
  started = false
}

function anyVisible() {
  for (const s of sprites) if (s.visible) return true
  return false
}

function maybeStart() {
  if (started || document.hidden || !anyVisible()) return
  started = true
  lastTime = performance.now() / 1000
  frameId = requestAnimationFrame(tick)
}

function draw(s: Sprite, dt: number, time: number) {
  const gl = renderer
  if (!gl) return
  const rect = s.canvas.getBoundingClientRect()
  if (rect.width < 2 || rect.height < 2) return
  const scale = Math.min(
    window.devicePixelRatio || 1,
    2,
    GL_SIZE / rect.width,
    GL_SIZE / rect.height,
  )
  const w = Math.max(2, Math.round(rect.width * scale))
  const h = Math.max(2, Math.round(rect.height * scale))
  if (s.canvas.width !== w || s.canvas.height !== h) {
    s.canvas.width = w
    s.canvas.height = h
  }
  const { mood, clock, pulse } = s.read()
  s.rig.update(dt, time, {
    mood,
    clock,
    pulse,
    pointerX: pointer.x,
    pointerY: pointer.y,
    symbols: s.frame === 'wide',
  })

  const aspect = w / h
  if (s.frame === 'wide') {
    camera.fov = 34
    camera.lookAt(0.2, 0.15, 0)
  } else {
    // The pig is about 3.9 wide and 2.4 tall; pick the field of view that fits both with a little air.
    const needH = Math.max(2.9, 4.4 / aspect)
    camera.fov = 2 * Math.atan(needH / 2 / 9.3) * (180 / Math.PI)
    camera.lookAt(0.2, -0.25, 0)
  }
  camera.aspect = aspect
  camera.updateProjectionMatrix()

  scene.add(s.rig.object)
  gl.setViewport(0, 0, w, h)
  gl.setScissor(0, 0, w, h)
  gl.clear()
  gl.render(scene, camera)
  scene.remove(s.rig.object)

  s.ctx.clearRect(0, 0, w, h)
  s.ctx.drawImage(gl.domElement, 0, GL_SIZE - h, w, h, 0, 0, w, h)
  if (!s.drawn) {
    s.drawn = true
    s.onFirstFrame()
  }
}

function tick(now: number) {
  frameId = 0
  started = false
  const time = now / 1000
  const dt = Math.min(0.05, time - lastTime)
  lastTime = time
  for (const s of sprites) {
    if (!s.visible) continue
    s.acc += dt
    if (s.acc < FRAME_TIME && s.drawn) continue
    const step = s.acc
    s.acc = 0
    draw(s, step, time)
  }
  maybeStart()
}

/** Warms up one pig's shaders without blocking: the first picture is drawn only after they are ready. */
let compiling: Promise<void> = Promise.resolve()
function compile(rig: PigRig) {
  compiling = compiling.then(async () => {
    const gl = renderer
    if (!gl) return
    scene.add(rig.object)
    camera.aspect = 1
    camera.updateProjectionMatrix()
    try {
      await gl.compileAsync(scene, camera)
    } finally {
      scene.remove(rig.object)
    }
    await breathe()
  })
  return compiling
}

/**
 * Starts drawing a pig into the given canvas. The renderer, the pig and its shaders are prepared in separate small
 * steps, so even the first pig on the page never blocks the main thread for long. Resolves with its controls.
 */
export async function registerSprite(options: SpriteOptions) {
  const ctx = options.canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas is not available')
  await setup()
  const rig = createPigRig()
  await breathe()
  await compile(rig)
  const sprite: Sprite = { ...options, rig, visible: false, drawn: false, ctx, acc: 0 }
  sprites.add(sprite)
  return {
    setVisible(visible: boolean) {
      sprite.visible = visible
      if (visible) maybeStart()
    },
    dispose() {
      sprites.delete(sprite)
      sprite.rig.dispose()
      if (!anyVisible()) stop()
    },
  }
}
