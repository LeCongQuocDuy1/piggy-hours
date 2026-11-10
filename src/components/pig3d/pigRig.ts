import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  OctahedronGeometry,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
  TubeGeometry,
  Vector3,
  type Material,
} from 'three'
import { MOOD_SCALE, PIG_MOODS, type PigMood } from '../pig/pigMood'
import {
  buildEarGeometry,
  buildPigGeometry,
  buildTailGeometry,
  flatPalette,
  headPoint,
  snoutDisc,
  tailAnchor,
  type PigShape,
} from './pigMesh'

/** The 3D pig is always this pink. Only the background behind the pig changes color. */
export const PIG_PINK = '#FF9EBE'

const FOOT = -1.32
const BASE_YAW = -0.75
const TAU = Math.PI * 2
const INK = '#2E1B27'
const MOUTH = '#4A1F33'

type SymbolKind = 'z' | 'q' | 'note' | 'spark' | 'heart' | 'ring'

type Face = {
  eye: 'open' | 'happy' | 'sleepy'
  eyeScale: number
  mouth: 'flat' | 'o' | 'smile' | 'open'
  /** Brow height and tilt for the left and right eye (null = no brows). */
  brow: { l: [number, number]; r: [number, number] } | null
  blush: number
  earL: number
  earR: number
  roll: number
  pitch: number
  /** Height of the little bounce while idling. */
  hop: number
  symbol: SymbolKind
  tail: number
}

/** One face per mood, in PIG_MOODS order. Each is meant to be readable at a glance. */
const FACES: Face[] = [
  {
    eye: 'sleepy',
    eyeScale: 1,
    mouth: 'flat',
    brow: null,
    blush: 0.25,
    earL: 1.1,
    earR: 1.1,
    roll: 0,
    pitch: 0,
    hop: 0,
    symbol: 'z',
    tail: 0,
  },
  {
    eye: 'open',
    eyeScale: 1.15,
    mouth: 'o',
    brow: { l: [0.1, 0.4], r: [0.02, -0.15] },
    blush: 0.2,
    earL: -0.45,
    earR: 0.2,
    roll: 0.16,
    pitch: 0.05,
    hop: 0,
    symbol: 'q',
    tail: 0.1,
  },
  {
    eye: 'open',
    eyeScale: 1,
    mouth: 'smile',
    brow: null,
    blush: 0.5,
    earL: 0,
    earR: 0,
    roll: 0,
    pitch: 0,
    hop: 0.02,
    symbol: 'note',
    tail: 0.25,
  },
  {
    eye: 'open',
    eyeScale: 1.25,
    mouth: 'open',
    brow: { l: [0.12, 0.2], r: [0.12, -0.2] },
    blush: 0.8,
    earL: -0.4,
    earR: -0.4,
    roll: 0,
    pitch: 0.03,
    hop: 0.07,
    symbol: 'spark',
    tail: 0.5,
  },
  {
    eye: 'happy',
    eyeScale: 1,
    mouth: 'open',
    brow: null,
    blush: 1,
    earL: -0.3,
    earR: -0.3,
    roll: 0,
    pitch: 0,
    hop: 0.14,
    symbol: 'heart',
    tail: 0.7,
  },
]

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const ease = (x: number) => x * x * (3 - 2 * x)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeOutBack = (x: number) => 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2

/** Small canvas sprites for the floating symbols (z, ?, note, sparkle, heart) and the landing ring. */
function symbolTexture(kind: SymbolKind): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  if (g) {
    g.lineJoin = 'round'
    g.lineCap = 'round'
    const paint = (fill: string, stroke = '#ffffff', width = 10) => {
      g.lineWidth = width
      g.strokeStyle = stroke
      g.fillStyle = fill
      g.stroke()
      g.fill()
    }
    g.beginPath()
    if (kind === 'z') {
      g.moveTo(34, 34)
      g.lineTo(94, 34)
      g.lineTo(34, 94)
      g.lineTo(94, 94)
      g.lineWidth = 16
      g.strokeStyle = '#ffffff'
      g.stroke()
      g.lineWidth = 11
      g.strokeStyle = '#6D58BE'
      g.stroke()
    } else if (kind === 'q') {
      g.font = 'bold 104px Arial, sans-serif'
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      g.lineWidth = 14
      g.strokeStyle = '#ffffff'
      g.strokeText('?', 64, 70)
      g.fillStyle = '#F29A1F'
      g.fillText('?', 64, 70)
    } else if (kind === 'note') {
      g.arc(46, 92, 17, 0, TAU)
      g.moveTo(62, 90)
      g.lineTo(62, 30)
      g.lineTo(98, 44)
      g.lineTo(98, 62)
      g.lineTo(62, 50)
      paint('#E1559A')
    } else if (kind === 'spark') {
      g.moveTo(64, 8)
      g.quadraticCurveTo(68, 60, 120, 64)
      g.quadraticCurveTo(68, 68, 64, 120)
      g.quadraticCurveTo(60, 68, 8, 64)
      g.quadraticCurveTo(60, 60, 64, 8)
      paint('#FFD84D', '#ffffff', 8)
    } else if (kind === 'heart') {
      g.moveTo(64, 112)
      g.bezierCurveTo(8, 72, 14, 18, 64, 44)
      g.bezierCurveTo(114, 18, 120, 72, 64, 112)
      paint('#FF5A8C', '#ffffff', 9)
    } else {
      g.arc(64, 64, 52, 0, TAU)
      g.lineWidth = 8
      g.strokeStyle = '#F5B833'
      g.stroke()
    }
  }
  return new CanvasTexture(c)
}

/** Ray-casts onto the pig so faces and cheeks sit exactly on the surface. */
function surfacePoint(geo: BufferGeometry, origin: Vector3, dir: Vector3) {
  const probe = new Mesh(geo, new MeshBasicMaterial({ side: DoubleSide }))
  const hit = new Raycaster(origin, dir.clone().normalize(), 0, 20).intersectObject(
    probe,
  )[0]
  probe.material.dispose()
  if (!hit || !hit.face) return null
  return { point: hit.point.clone(), normal: hit.face.normal.clone().normalize() }
}

const X_AXIS = new Vector3(1, 0, 0)
const _quat = new Quaternion()

type Eye = {
  open: Group
  ball: Mesh
  happy: Group
  sleepy: Group
  brow: Group
  cheek: Mesh
  mouths: Record<Face['mouth'], Object3D>
}

type Variant = { group: Group; eyes: Eye[]; ears: Group[]; tail: Group }

function buildVariant(
  shape: PigShape,
  track: Material[],
  geos: BufferGeometry[],
): Variant {
  const group = new Group()
  const geo = buildPigGeometry(shape, flatPalette(PIG_PINK))
  geos.push(geo)
  const skin = new MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.55,
    emissive: new Color(PIG_PINK),
    emissiveIntensity: 0.1,
  })
  const part = new MeshPhysicalMaterial({
    color: PIG_PINK,
    roughness: 0.62,
    emissive: new Color(PIG_PINK),
    emissiveIntensity: 0.1,
  })
  const dark = new MeshBasicMaterial({ color: MOUTH })
  const ink = new MeshBasicMaterial({ color: INK, side: DoubleSide })
  const eyeMat = new MeshPhysicalMaterial({ color: INK, roughness: 0.12, clearcoat: 1 })
  const white = new MeshBasicMaterial({ color: '#ffffff' })
  const tongueMat = new MeshBasicMaterial({ color: '#FF7FA6' })
  const nostrilMat = new MeshStandardMaterial({ color: '#7B2347' })
  track.push(skin, part, dark, ink, eyeMat, white, tongueMat, nostrilMat)
  group.add(new Mesh(geo, skin))

  const earGeo = buildEarGeometry()
  const tailGeo = buildTailGeometry()
  geos.push(earGeo, tailGeo)
  const head = headPoint(shape, 0, 0, 1).p
  const eyes: Eye[] = []
  const ears: Group[] = []
  const eyeR = 0.17
  const sphere = (r: number, w: number, h: number) => {
    const g = new SphereGeometry(r, w, h)
    geos.push(g)
    return g
  }

  for (const side of [1, -1]) {
    const e = headPoint(shape, side * 55, 17, 0.985)
    const g = new Group()
    g.position.set(...e.p)
    g.rotation.y = e.yaw

    const ball = new Mesh(sphere(eyeR, 32, 24), eyeMat)
    ball.scale.set(0.55, 1, 0.92)
    const h1 = new Mesh(sphere(eyeR * 0.34, 14, 14), white)
    h1.position.set(eyeR * 0.42, eyeR * 0.4, eyeR * 0.1)
    const h2 = new Mesh(sphere(eyeR * 0.17, 10, 10), white)
    h2.position.set(eyeR * 0.42, -eyeR * 0.38, -eyeR * 0.3)
    const open = new Group()
    open.add(ball, h1, h2)

    const arc = new TorusGeometry(0.15, 0.03, 8, 24, Math.PI)
    geos.push(arc)
    const happyArc = new Mesh(arc, ink)
    happyArc.rotation.y = Math.PI / 2
    happyArc.position.set(0.03, -0.04, 0)
    const happy = new Group()
    happy.add(happyArc)

    // Sleeping eye: a gentle downward curve with two lashes.
    const curve: Vector3[] = []
    for (let i = 0; i <= 14; i++) {
      const u = i / 14
      curve.push(new Vector3(0.05, 0.07 * (2 * u - 1) ** 2 - 0.04, (u - 0.5) * 0.34))
    }
    const sleepGeo = new TubeGeometry(new CatmullRomCurve3(curve), 24, 0.026, 8, false)
    geos.push(sleepGeo)
    const sleepy = new Group()
    sleepy.add(new Mesh(sleepGeo, ink))
    const lashGeo = new CapsuleGeometry(0.014, 0.07, 4, 6)
    geos.push(lashGeo)
    for (const lz of [-1, 1]) {
      const lash = new Mesh(lashGeo, ink)
      lash.position.set(0.05, 0, lz * 0.2)
      lash.rotation.x = lz * 0.9
      sleepy.add(lash)
    }

    const browGeo = new CapsuleGeometry(0.026, 0.17, 4, 8)
    geos.push(browGeo)
    const browMesh = new Mesh(browGeo, new MeshBasicMaterial({ color: INK }))
    track.push(browMesh.material)
    browMesh.rotation.x = Math.PI / 2
    const brow = new Group()
    brow.position.set(0.03, 0.28, 0)
    brow.add(browMesh)

    g.add(open, happy, sleepy, brow)

    // Cheeks and mouth are placed on the real surface.
    const lying = shape === 'lying'
    const cheekHit = surfacePoint(
      geo,
      new Vector3(head[0] - 0.3, (lying ? -0.98 : -0.12) - 0.02, side * 3),
      new Vector3(0, 0, -side),
    )
    const cheekMat = new MeshBasicMaterial({
      color: '#FF4F86',
      transparent: true,
      opacity: 0,
    })
    track.push(cheekMat)
    const cheek = new Mesh(sphere(0.2, 20, 16), cheekMat)
    cheek.scale.set(0.22, 0.7, 1)
    if (cheekHit) {
      cheek.position.copy(cheekHit.point)
      cheek.quaternion.copy(_quat.setFromUnitVectors(X_AXIS, cheekHit.normal))
    }

    const mouthHit = surfacePoint(
      geo,
      new Vector3(1.86, lying ? -1.12 : -0.27, side * 3),
      new Vector3(0, 0, -side),
    )
    const mouth = new Group()
    if (mouthHit) {
      mouth.position.copy(mouthHit.point).addScaledVector(mouthHit.normal, 0.012)
      mouth.quaternion.copy(_quat.setFromUnitVectors(X_AXIS, mouthHit.normal))
    }
    const flatGeo = new CapsuleGeometry(0.02, 0.12, 4, 8)
    const flat = new Mesh(flatGeo, dark)
    flat.rotation.x = Math.PI / 2
    const ringGeo = new TorusGeometry(0.05, 0.02, 8, 20)
    const o = new Mesh(ringGeo, dark)
    o.rotation.y = Math.PI / 2
    const smilePts: Vector3[] = []
    for (let i = 0; i <= 14; i++) {
      const u = i / 14
      smilePts.push(new Vector3(0, 0.1 * (2 * u - 1) ** 2 - 0.03, (u - 0.5) * 0.4))
    }
    const smileGeo = new TubeGeometry(new CatmullRomCurve3(smilePts), 24, 0.021, 8, false)
    const smile = new Mesh(smileGeo, dark)
    const inside = new Mesh(sphere(0.14, 24, 18), dark)
    inside.scale.set(0.22, 0.95, 1.3)
    inside.position.set(0.004, -0.04, 0)
    const tongue = new Mesh(sphere(0.08, 14, 12), tongueMat)
    tongue.scale.set(0.2, 0.7, 1.1)
    tongue.position.set(0.03, -0.1, 0)
    const wide = new Group()
    wide.add(inside, tongue)
    geos.push(flatGeo, ringGeo, smileGeo)
    mouth.add(flat, o, smile, wide)

    group.add(cheek, mouth, g)
    eyes.push({
      open,
      ball,
      happy,
      sleepy,
      brow,
      cheek,
      mouths: { flat, o, smile, open: wide },
    })

    const ep = headPoint(shape, side * 78, 52, 0.97)
    const ear = new Group()
    ear.position.set(...ep.p)
    ear.userData = { side, yaw: ep.yaw }
    ear.scale.setScalar(0.9)
    ear.add(new Mesh(earGeo, part))
    group.add(ear)
    ears.push(ear)
  }

  const d = snoutDisc(shape)
  const snout = new Mesh(sphere(d.r, 40, 30), part)
  snout.position.set(...d.p)
  snout.scale.set(d.flat, 1, 1.02)
  group.add(snout)
  for (const side of [1, -1]) {
    const n = new Mesh(sphere(d.r * 0.17, 12, 12), nostrilMat)
    n.position.set(d.p[0] + d.r * d.flat * 0.93, d.p[1] + 0.03, side * d.r * 0.36)
    n.scale.set(0.35, 1.3, 0.8)
    group.add(n)
  }
  const tail = new Group()
  tail.position.set(...tailAnchor(shape))
  tail.add(new Mesh(tailGeo, part))
  group.add(tail)
  return { group, eyes, ears, tail }
}

export type PigInput = {
  mood: PigMood
  /** Whether the clock drops into the slot every few seconds. */
  clock: boolean
  /** Cursor position on the page, -1..1. */
  pointerX: number
  pointerY: number
}

export type PigRig = {
  object: Group
  update: (dt: number, time: number, input: PigInput) => void
  dispose: () => void
}

/**
 * The whole 3D pig as plain three.js objects, driven by `update`. It owns five moods (sleepy lies
 * down), the squash, jump and ring burst between moods, the falling clock, and the floating symbols.
 */
export function createPigRig(): PigRig {
  const tracked: Material[] = []
  const geometries: BufferGeometry[] = []
  const textures: CanvasTexture[] = []

  const object = new Group()
  const root = new Group() // yaw, bounce
  const body = new Group() // belly scale and squish
  object.add(root)
  root.add(body)

  // contact shadow
  const sc = document.createElement('canvas')
  sc.width = sc.height = 128
  const sg = sc.getContext('2d')
  if (sg) {
    const rg = sg.createRadialGradient(64, 64, 4, 64, 64, 62)
    rg.addColorStop(0, 'rgba(120,30,70,0.38)')
    rg.addColorStop(1, 'rgba(120,30,70,0)')
    sg.fillStyle = rg
    sg.fillRect(0, 0, 128, 128)
  }
  const shadowTex = new CanvasTexture(sc)
  textures.push(shadowTex)
  const shadowMat = new MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
  })
  tracked.push(shadowMat)
  const shadowGeo = new PlaneGeometry(4.6, 3.4)
  geometries.push(shadowGeo)
  const shadow = new Mesh(shadowGeo, shadowMat)
  shadow.rotation.x = -Math.PI / 2
  shadow.position.set(0.1, FOOT - 0.02, 0)
  object.add(shadow)

  // The sleeping variant is only built the first time a mood needs it (most pigs never sleep).
  const standing = buildVariant('pig', tracked, geometries)
  body.add(standing.group)
  let lying: Variant | null = null
  const eyes = [...standing.eyes]
  const ears = [...standing.ears]
  const tails = [standing.tail]
  const ensureLying = () => {
    if (lying) return lying
    lying = buildVariant('lying', tracked, geometries)
    lying.group.visible = false
    body.add(lying.group)
    eyes.push(...lying.eyes)
    ears.push(...lying.ears)
    tails.push(lying.tail)
    return lying
  }

  // the clock
  const clock = new Group()
  const discGeo = new CylinderGeometry(0.36, 0.36, 0.09, 40)
  const rimGeo = new TorusGeometry(0.36, 0.05, 14, 40)
  const h1Geo = new BoxGeometry(0.045, 0.22, 0.02)
  const h2Geo = new BoxGeometry(0.18, 0.045, 0.02)
  geometries.push(discGeo, rimGeo, h1Geo, h2Geo)
  const gold = new MeshPhysicalMaterial({
    color: '#F5B833',
    roughness: 0.3,
    metalness: 0.35,
    clearcoat: 0.6,
  })
  const rimMat = new MeshPhysicalMaterial({
    color: '#C98B0B',
    roughness: 0.35,
    metalness: 0.4,
  })
  const handMat = new MeshStandardMaterial({ color: '#7A4E00' })
  tracked.push(gold, rimMat, handMat)
  const disc = new Mesh(discGeo, gold)
  disc.rotation.x = Math.PI / 2
  const hand1 = new Mesh(h1Geo, handMat)
  hand1.position.set(0, 0.1, 0.06)
  const hand2 = new Mesh(h2Geo, handMat)
  hand2.position.set(0.08, 0, 0.06)
  clock.add(disc, new Mesh(rimGeo, rimMat), hand1, hand2)
  clock.visible = false
  root.add(clock)

  // sparks that burst out when the clock lands
  const sparkGeo = new OctahedronGeometry(0.1, 0)
  geometries.push(sparkGeo)
  const sparks: Mesh[] = []
  for (let i = 0; i < 10; i++) {
    const m = new MeshBasicMaterial({ color: i % 2 ? '#FFE27A' : '#F5B833' })
    tracked.push(m)
    const s = new Mesh(sparkGeo, m)
    s.visible = false
    root.add(s)
    sparks.push(s)
  }

  // floating symbols and the landing ring
  const symbols: { kind: SymbolKind; i: number; sprite: Sprite }[] = []
  for (const kind of ['z', 'q', 'note', 'spark', 'heart'] as const) {
    const map = symbolTexture(kind)
    textures.push(map)
    for (let i = 0; i < 3; i++) {
      const mat = new SpriteMaterial({ map, transparent: true, depthTest: false })
      tracked.push(mat)
      const sprite = new Sprite(mat)
      sprite.visible = false
      root.add(sprite)
      symbols.push({ kind, i, sprite })
    }
  }
  const ringTex = symbolTexture('ring')
  textures.push(ringTex)
  const ringMat = new SpriteMaterial({
    map: ringTex,
    transparent: true,
    depthTest: false,
    blending: AdditiveBlending,
  })
  tracked.push(ringMat)
  const ring = new Sprite(ringMat)
  ring.visible = false
  root.add(ring)

  // ----- state -----
  let started = false
  let target = 2 // mood the pig is heading to
  let shown = 2 // mood whose face is on screen
  let prev = 2
  let tt = Infinity // seconds since the last mood change
  let landed = true
  let yaw = BASE_YAW
  let pitchLook = 0
  let scale = MOOD_SCALE.happy
  let squish = 0
  let squishVel = 0
  let dropT = 0
  let dropLanded = false
  let burst = Infinity

  const applyFace = (index: number, time: number, pop: number, blink: boolean) => {
    const f = FACES[index]
    standing.group.visible = index !== 0
    if (lying) lying.group.visible = index === 0
    eyes.forEach((e, k) => {
      const side = k % 2
      e.open.visible = f.eye === 'open'
      e.happy.visible = f.eye === 'happy'
      e.sleepy.visible = f.eye === 'sleepy'
      e.ball.scale.set(
        0.55 * f.eyeScale,
        (blink ? 0.08 : 1) * f.eyeScale,
        0.92 * f.eyeScale,
      )
      if (f.brow) {
        const b = side === 0 ? f.brow.l : f.brow.r
        e.brow.visible = true
        e.brow.position.y = 0.26 + b[0]
        e.brow.rotation.x = b[1]
      } else e.brow.visible = false
      for (const [name, m] of Object.entries(e.mouths)) m.visible = name === f.mouth
      ;(e.cheek.material as MeshBasicMaterial).opacity = f.blush * 0.75
    })
    for (const { kind, i, sprite } of symbols) {
      sprite.visible = false
      if (kind !== f.symbol) continue
      const ph = (time * 0.55 + i / 3) % 1
      let x = 1 + (i - 1) * 0.5
      let y = 1.5 + ph * 0.8
      let size = 0.5
      let op = Math.sin(ph * Math.PI)
      if (kind === 'z') {
        x = 1.2 + i * 0.3
        y = ph
        size = 0.4 + 0.22 * i
      } else if (kind === 'q') {
        if (i > 0) continue
        x = 1.05
        y = 1.55 + Math.sin(time * 3) * 0.06
        size = 0.62
        op = 1
      } else if (kind === 'note') {
        x = 0.7 + i * 0.5 + Math.sin(ph * 6) * 0.08
        y = 1.45 + ph * 0.7
        size = 0.34
      } else if (kind === 'spark') {
        const a = (i / 3) * TAU + time * 1.4
        x = 1 + Math.cos(a) * 0.95
        y = 1.2 + Math.sin(a) * 0.75
        size = 0.3 + 0.12 * Math.sin(time * 6 + i * 2)
        op = 1
      } else if (kind === 'heart') {
        x = 0.55 + i * 0.55 + Math.sin(ph * 7 + i) * 0.1
        y = 1.4 + ph
        size = 0.34 + 0.08 * i
      }
      sprite.position.set(x, y, 0.3)
      sprite.scale.setScalar(size * 1.35 * Math.max(0.01, pop))
      sprite.material.opacity = Math.max(0, op) * Math.min(1, pop * 2)
      sprite.visible = true
    }
  }

  const update = (dt: number, time: number, input: PigInput) => {
    const idx = PIG_MOODS.indexOf(input.mood)
    if (idx === 0) ensureLying()
    if (!started) {
      started = true
      target = shown = prev = idx
      scale = MOOD_SCALE[input.mood]
    } else if (idx !== target) {
      prev = shown
      target = idx
      tt = 0
      landed = false
    }
    if (tt !== Infinity) tt += dt

    // Which face is on screen: the old one until the pig is in the air, then the new one.
    const changing = tt < 1.2
    shown = changing && tt < 0.3 ? prev : target
    const f = FACES[shown]

    // belly size follows the mood
    scale += (MOOD_SCALE[PIG_MOODS[target]] - scale) * Math.min(1, 4 * dt)

    // ----- squash, jump and land when the mood changes -----
    let sqDirect: number | null = null
    let hop = 0
    if (changing) {
      if (tt < 0.16) sqDirect = 0.16 * (tt / 0.16)
      else if (tt < 0.42) {
        const k = (tt - 0.16) / 0.26
        hop = 0.55 * Math.sin(Math.PI * k)
        sqDirect = -0.1 * Math.sin(Math.PI * k)
      } else if (!landed) {
        landed = true
        squish = 0.18
        squishVel = 0
        burst = 0
      }
    }
    if (tt >= 1.2) tt = Infinity

    // ----- idle motion of the current mood -----
    const lyingNow = shown === 0
    if (lyingNow) {
      scale *= 1 + 0.02 * Math.sin(time * 2.2) // slow breathing
    } else if (f.hop && !changing) {
      hop += Math.abs(Math.sin(time * (shown === 4 ? 5.5 : 4))) * f.hop
    } else if (!changing) hop += 0.03 * (1 - Math.cos(time * 3.2)) * 0.5

    // ----- falling clock (not while asleep or changing mood) -----
    const slotY = 1.02 * scale
    let clockOn = false
    if (input.clock && !lyingNow && tt === Infinity) {
      dropT += dt
      const p = dropT % 5
      const fall = 0.85
      const slide = 0.22
      if (p < fall) {
        const k = ease(clamp01(p / fall)) * 0.5 + (p / fall) ** 2 * 0.5
        clock.visible = clockOn = true
        clock.position.set(0.05, lerp(3.6, slotY + 0.45, k), 0)
        clock.rotation.set(0, (1 - k) * TAU * 1.5 - yaw, 0) // -yaw keeps its face to the camera
        clock.scale.setScalar(1)
        dropLanded = false
      } else if (p < fall + slide) {
        const k = clamp01((p - fall) / slide)
        clock.visible = clockOn = true
        clock.position.set(0.05, lerp(slotY + 0.45, slotY - 0.12, k), 0)
        clock.rotation.set(0, -yaw, 0)
        clock.scale.set(1, 1, 1 - k * 0.2)
        if (k > 0.5 && !dropLanded) {
          dropLanded = true
          squish = 0.17
          squishVel = 0
          burst = 0
        }
      }
    }
    if (!clockOn) clock.visible = false

    // spring for the squash
    if (sqDirect === null) {
      squishVel += (-170 * squish - 9 * squishVel) * dt
      squish += squishVel * dt
    } else {
      squish = sqDirect
      squishVel = 0
    }

    // ----- ring and sparks -----
    ring.visible = false
    sparks.forEach((s) => (s.visible = false))
    if (burst !== Infinity) {
      burst += dt
      const k = burst / 0.55
      if (k < 1) {
        ring.visible = true
        ring.position.set(0.3, -0.2, 0.6)
        ring.scale.setScalar(0.5 + 3.2 * ease(k))
        ringMat.opacity = 1 - k
      }
      if (dropLanded || burst < 0.9) {
        sparks.forEach((s, i) => {
          const a = (i / 10) * TAU + 0.3
          const life = burst / 0.9
          if (life >= 1) return
          s.visible = true
          const r = 0.5 + 1.5 * life
          s.position.set(
            Math.cos(a) * r * 1.15,
            slotY + 0.2 + Math.sin(a) * r * 0.9 + 0.5 * life - 0.7 * life * life,
            Math.sin(a * 2) * 0.4,
          )
          s.scale.setScalar(Math.max(0.01, 1 - life) * (i % 3 === 0 ? 1.3 : 0.9))
          s.rotation.set(life * 6, life * 4, 0)
        })
      }
      if (burst > 1.2) burst = Infinity
    }

    // ----- face, ears, tail -----
    const blink = !lyingNow && (shown === 1 || shown === 2) && time % 3.6 > 3.45
    const pop =
      tt === Infinity ? 1 : shown === prev ? 0 : easeOutBack(clamp01((tt - 0.3) / 0.5))
    applyFace(shown, time, pop, blink)
    const wiggle = time % 6 > 5.5 ? Math.sin(time * 28) * 0.18 : 0
    ears.forEach((ear) => {
      const side = ear.userData.side as number
      const lift =
        (side > 0 ? f.earL : f.earR) +
        (shown >= 3 ? Math.sin(time * 16 + side) * 0.12 : 0)
      ear.rotation.set(
        side * 0.95 + side * lift * 0.8,
        ear.userData.yaw as number,
        -0.2 - lift * 0.6 + wiggle,
      )
    })
    const wag = Math.sin(time * (6 + f.tail * 10)) * f.tail
    tails.forEach((t) => {
      t.rotation.set(wag * 0.4, wag, 0)
    })

    // ----- look at the cursor -----
    const look = lyingNow ? 0.12 : 0.4
    yaw += (BASE_YAW + input.pointerX * look - yaw) * Math.min(1, 4 * dt)
    pitchLook +=
      (input.pointerY * (lyingNow ? 0.04 : 0.16) - pitchLook) * Math.min(1, 4 * dt)
    root.rotation.set(
      pitchLook + f.pitch,
      yaw,
      f.roll * (shown === prev && tt !== Infinity ? 0 : 1),
      'YXZ',
    )
    root.position.y = hop

    body.scale.set(
      scale * (1 + squish * 0.5),
      scale * (1 - squish),
      scale * (1 + squish * 0.5),
    )
    body.position.y = -FOOT * (scale * (1 - squish) - 1)
    shadow.scale.setScalar((1 + (scale - 1) * 1.2) / (1 + hop * 0.6))
    shadowMat.opacity = 1 - Math.min(0.5, hop * 1.2)
  }

  const dispose = () => {
    geometries.forEach((g) => g.dispose())
    tracked.forEach((m) => m.dispose())
    textures.forEach((t) => t.dispose())
    object.removeFromParent()
  }

  return { object, update, dispose }
}
