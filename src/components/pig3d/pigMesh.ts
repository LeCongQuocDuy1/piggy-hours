import {
  BufferGeometry,
  CatmullRomCurve3,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Shape,
  TubeGeometry,
  Vector3,
} from 'three'

/**
 * A sculpted-looking pig body made in code: ellipsoids are blended smoothly with a signed distance
 * field and turned into a mesh with surface nets. Head, belly and legs melt into one smooth surface
 * (no seams between spheres), and colors are painted per vertex. No model file, so no license to track.
 */

export type PigShape = 'chibi' | 'classic' | 'round' | 'ball' | 'pig'
type V3 = readonly [number, number, number]

type Ellipsoid = { c: V3; r: V3 }
/** A leg: a capsule that can taper (radius `r` at the top, `r2` at the foot). */
type Leg = { a: V3; b: V3; r: number; r2: number }

type Layout = {
  bodies: Ellipsoid[]
  head: Ellipsoid
  jowls: Ellipsoid[]
  snout: Ellipsoid
  legs: Leg[]
  kBody: number
  kHead: number
  tail: V3
}

const leg = (
  x: number,
  z: number,
  top: number,
  bottom: number,
  r: number,
  r2: number,
): Leg => ({
  a: [x, top, z],
  b: [x + (x > 0 ? 0.02 : -0.02), bottom, z * 1.04],
  r,
  r2,
})

const SHAPES: Record<PigShape, Layout> = {
  chibi: {
    bodies: [{ c: [-0.4, -0.5, 0], r: [1.05, 0.88, 0.9] }],
    head: { c: [0.5, 0.2, 0], r: [0.98, 0.9, 0.95] },
    jowls: [],
    snout: { c: [1.42, 0.02, 0], r: [0.4, 0.34, 0.4] },
    legs: [
      leg(0.1, 0.5, -1.0, -1.38, 0.26, 0.26),
      leg(0.1, -0.5, -1.0, -1.38, 0.26, 0.26),
      leg(-0.95, 0.5, -1.0, -1.38, 0.26, 0.26),
      leg(-0.95, -0.5, -1.0, -1.38, 0.26, 0.26),
    ],
    kBody: 0.3,
    kHead: 0.45,
    tail: [-1.42, -0.35, 0],
  },
  // Plump rump, rounder chest, a clear neck, chubby cheeks and short tapered legs.
  classic: {
    bodies: [
      { c: [-0.62, -0.28, 0], r: [0.98, 1.0, 0.94] },
      { c: [0.2, -0.36, 0], r: [0.95, 0.9, 0.86] },
    ],
    head: { c: [1.2, 0.0, 0], r: [0.76, 0.73, 0.73] },
    jowls: [
      { c: [1.18, -0.2, 0.45], r: [0.45, 0.4, 0.32] },
      { c: [1.18, -0.2, -0.45], r: [0.45, 0.4, 0.32] },
    ],
    snout: { c: [1.9, -0.06, 0], r: [0.36, 0.32, 0.38] },
    legs: [
      leg(0.5, 0.46, -0.85, -1.3, 0.34, 0.25),
      leg(0.5, -0.46, -0.85, -1.3, 0.34, 0.25),
      leg(-0.95, 0.5, -0.85, -1.3, 0.36, 0.26),
      leg(-0.95, -0.5, -0.85, -1.3, 0.36, 0.26),
    ],
    kBody: 0.5,
    kHead: 0.2,
    tail: [-1.58, -0.1, 0],
  },
  // Rounder: a plump, short body, a big head that melts into it, puffy cheeks and stubby legs.
  round: {
    bodies: [
      { c: [-0.3, -0.38, 0], r: [1.18, 1.1, 1.04] },
      { c: [0.4, -0.38, 0], r: [0.9, 0.92, 0.9] },
    ],
    head: { c: [1.08, 0.12, 0], r: [0.84, 0.8, 0.82] },
    jowls: [
      { c: [1.02, -0.22, 0.52], r: [0.5, 0.44, 0.36] },
      { c: [1.02, -0.22, -0.52], r: [0.5, 0.44, 0.36] },
    ],
    snout: { c: [1.82, 0.0, 0], r: [0.34, 0.3, 0.37] },
    legs: [
      leg(0.5, 0.5, -1.0, -1.38, 0.38, 0.3),
      leg(0.5, -0.5, -1.0, -1.38, 0.38, 0.3),
      leg(-0.8, 0.55, -1.0, -1.38, 0.4, 0.31),
      leg(-0.8, -0.55, -1.0, -1.38, 0.4, 0.31),
    ],
    kBody: 0.6,
    kHead: 0.5,
    tail: [-1.42, -0.2, 0],
  },
  // Rounder still: almost a ball with a head, like a squishy toy.
  ball: {
    bodies: [{ c: [-0.12, -0.35, 0], r: [1.22, 1.18, 1.12] }],
    head: { c: [1.0, 0.18, 0], r: [0.86, 0.82, 0.84] },
    jowls: [
      { c: [0.95, -0.2, 0.55], r: [0.5, 0.46, 0.38] },
      { c: [0.95, -0.2, -0.55], r: [0.5, 0.46, 0.38] },
    ],
    snout: { c: [1.78, 0.04, 0], r: [0.34, 0.3, 0.37] },
    legs: [
      leg(0.45, 0.52, -1.05, -1.4, 0.4, 0.32),
      leg(0.45, -0.52, -1.05, -1.4, 0.4, 0.32),
      leg(-0.7, 0.58, -1.05, -1.4, 0.42, 0.33),
      leg(-0.7, -0.58, -1.05, -1.4, 0.42, 0.33),
    ],
    kBody: 0.5,
    kHead: 0.55,
    tail: [-1.32, -0.2, 0],
  },
  // A proper pig: tapered head that runs into a big flat snout, small cheeks, barrel body with
  // a plump rump, and slim legs ending in dark trotters.
  pig: {
    bodies: [
      { c: [-0.7, -0.3, 0], r: [1.0, 0.98, 0.92] },
      { c: [0.1, -0.38, 0], r: [0.95, 0.88, 0.84] },
    ],
    head: { c: [1.15, 0.02, 0], r: [0.72, 0.67, 0.67] },
    jowls: [
      { c: [1.22, -0.17, 0.4], r: [0.4, 0.34, 0.28] },
      { c: [1.22, -0.17, -0.4], r: [0.4, 0.34, 0.28] },
      { c: [1.72, -0.04, 0], r: [0.55, 0.42, 0.45] },
    ],
    snout: { c: [2.0, -0.04, 0], r: [0.3, 0.3, 0.36] },
    legs: [
      leg(0.5, 0.45, -0.85, -1.32, 0.31, 0.23),
      leg(0.5, -0.45, -0.85, -1.32, 0.31, 0.23),
      leg(-0.95, 0.5, -0.85, -1.32, 0.33, 0.24),
      leg(-0.95, -0.5, -0.85, -1.32, 0.33, 0.24),
    ],
    kBody: 0.5,
    kHead: 0.28,
    tail: [-1.68, -0.1, 0],
  },
}

function ellipsoid(p: V3, e: Ellipsoid): number {
  const x = (p[0] - e.c[0]) / e.r[0]
  const y = (p[1] - e.c[1]) / e.r[1]
  const z = (p[2] - e.c[2]) / e.r[2]
  const k0 = Math.hypot(x, y, z)
  const x1 = x / e.r[0]
  const y1 = y / e.r[1]
  const z1 = z / e.r[2]
  const k1 = Math.hypot(x1, y1, z1)
  return k1 < 1e-9 ? -Math.min(...e.r) : (k0 * (k0 - 1)) / k1
}

function capsule(p: V3, c: Leg): number {
  const pax = p[0] - c.a[0]
  const pay = p[1] - c.a[1]
  const paz = p[2] - c.a[2]
  const bax = c.b[0] - c.a[0]
  const bay = c.b[1] - c.a[1]
  const baz = c.b[2] - c.a[2]
  const h = Math.max(
    0,
    Math.min(
      1,
      (pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz),
    ),
  )
  return (
    Math.hypot(pax - bax * h, pay - bay * h, paz - baz * h) - (c.r + (c.r2 - c.r) * h)
  )
}

/** Polynomial smooth minimum: joins two shapes with a soft fillet of size k. */
function smin(a: number, b: number, k: number): number {
  const h = Math.max(k - Math.abs(a - b), 0) / k
  return Math.min(a, b) - h * h * k * 0.25
}

export function pigField(shape: PigShape): (p: V3) => number {
  const s = SHAPES[shape]
  return (p) => {
    let d = ellipsoid(p, s.bodies[0])
    for (let i = 1; i < s.bodies.length; i++)
      d = smin(d, ellipsoid(p, s.bodies[i]), s.kBody)
    d = smin(d, ellipsoid(p, s.head), s.kHead)
    for (const j of s.jowls) d = smin(d, ellipsoid(p, j), 0.25)
    d = smin(d, ellipsoid(p, s.snout), 0.18)
    for (const l of s.legs) d = smin(d, capsule(p, l), 0.32)
    return d
  }
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (t: number) => Math.max(0, Math.min(1, t))
const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
/** Vertex colors are read as linear light, so the sRGB hex palette is converted once here. */
const hex = (h: string): V3 => [
  toLinear(parseInt(h.slice(1, 3), 16) / 255),
  toLinear(parseInt(h.slice(3, 5), 16) / 255),
  toLinear(parseInt(h.slice(5, 7), 16) / 255),
]

export type PigPalette = {
  base: string
  belly: string
  deep: string
  blush: string
  hoof?: string
}

/** Builds the pig body. `step` is the grid size in world units (smaller is smoother and slower). */
export function buildPigGeometry(
  shape: PigShape,
  palette: PigPalette,
  step = 0.05,
): BufferGeometry {
  const f = pigField(shape)
  const s = SHAPES[shape]
  const min: V3 = [-2.2, -1.75, -1.3]
  const max: V3 = [2.4, 1.2, 1.3]
  const nx = Math.ceil((max[0] - min[0]) / step) + 1
  const ny = Math.ceil((max[1] - min[1]) / step) + 1
  const nz = Math.ceil((max[2] - min[2]) / step) + 1
  const id = (i: number, j: number, k: number) => i + nx * (j + ny * k)
  const val = new Float32Array(nx * ny * nz)
  for (let k = 0; k < nz; k++)
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++)
        val[id(i, j, k)] = f([min[0] + i * step, min[1] + j * step, min[2] + k * step])

  const grad = (p: V3): V3 => {
    const e = step * 0.5
    const gx = f([p[0] + e, p[1], p[2]]) - f([p[0] - e, p[1], p[2]])
    const gy = f([p[0], p[1] + e, p[2]]) - f([p[0], p[1] - e, p[2]])
    const gz = f([p[0], p[1], p[2] + e]) - f([p[0], p[1], p[2] - e])
    const l = Math.hypot(gx, gy, gz) || 1
    return [gx / l, gy / l, gz / l]
  }

  const cellVert = new Int32Array((nx - 1) * (ny - 1) * (nz - 1)).fill(-1)
  const cid = (i: number, j: number, k: number) => i + (nx - 1) * (j + (ny - 1) * k)
  const pos: number[] = []
  const nor: number[] = []
  const col: number[] = []
  const corner = [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
    [1, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 1],
  ]
  const edges = [
    [0, 1],
    [2, 3],
    [4, 5],
    [6, 7],
    [0, 2],
    [1, 3],
    [4, 6],
    [5, 7],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
  ]
  const base = hex(palette.base)
  const belly = hex(palette.belly)
  const deep = hex(palette.deep)
  const blush = hex(palette.blush)
  const hoof = hex(palette.hoof ?? '#8A4A62')

  const paint = (p: V3, n: V3): V3 => {
    // lighter belly underneath, deeper pink toward the snout, ears and feet, blush on the cheeks
    let t = clamp01((-n[1] - 0.2) * 1.4)
    let c: [number, number, number] = [
      mix(base[0], belly[0], t),
      mix(base[1], belly[1], t),
      mix(base[2], belly[2], t),
    ]
    const sn = Math.hypot(
      ...(p.map((v, i) => (v - s.snout.c[i]) / s.snout.r[i]) as unknown as V3),
    )
    t = clamp01(1.25 - sn * 0.85)
    c = [mix(c[0], deep[0], t), mix(c[1], deep[1], t), mix(c[2], deep[2], t)]
    t = clamp01((-1.05 - p[1]) * 5)
    c = [
      mix(c[0], deep[0], t * 0.9),
      mix(c[1], deep[1], t * 0.9),
      mix(c[2], deep[2], t * 0.9),
    ]
    if (shape === 'pig') {
      // dark trotters
      t = clamp01((-1.2 - p[1]) * 9)
      c = [mix(c[0], hoof[0], t), mix(c[1], hoof[1], t), mix(c[2], hoof[2], t)]
    }
    for (const side of [1, -1]) {
      const cx = s.head.c[0] + s.head.r[0] * 0.5
      const cy = s.head.c[1] - s.head.r[1] * 0.28
      const cz = side * s.head.r[2] * 0.78
      const d = Math.hypot((p[0] - cx) / 0.3, (p[1] - cy) / 0.2, (p[2] - cz) / 0.3)
      t = clamp01(1.1 - d) * 0.85
      c = [mix(c[0], blush[0], t), mix(c[1], blush[1], t), mix(c[2], blush[2], t)]
    }
    return c
  }

  for (let k = 0; k < nz - 1; k++)
    for (let j = 0; j < ny - 1; j++)
      for (let i = 0; i < nx - 1; i++) {
        let mask = 0
        const v = corner.map(([a, b, c], n) => {
          const x = val[id(i + a, j + b, k + c)]
          if (x < 0) mask |= 1 << n
          return x
        })
        if (mask === 0 || mask === 255) continue
        let sx = 0,
          sy = 0,
          sz = 0,
          cnt = 0
        for (const [a, b] of edges) {
          if (v[a] < 0 === v[b] < 0) continue
          const t = v[a] / (v[a] - v[b])
          sx += corner[a][0] + (corner[b][0] - corner[a][0]) * t
          sy += corner[a][1] + (corner[b][1] - corner[a][1]) * t
          sz += corner[a][2] + (corner[b][2] - corner[a][2]) * t
          cnt++
        }
        let p: V3 = [
          min[0] + (i + sx / cnt) * step,
          min[1] + (j + sy / cnt) * step,
          min[2] + (k + sz / cnt) * step,
        ]
        // one step toward the true surface, then read the smooth normal there
        const g0 = grad(p)
        const d0 = f(p)
        p = [p[0] - g0[0] * d0, p[1] - g0[1] * d0, p[2] - g0[2] * d0]
        const n = grad(p)
        cellVert[cid(i, j, k)] = pos.length / 3
        pos.push(...p)
        nor.push(...n)
        col.push(...paint(p, n))
      }

  const idx: number[] = []
  const quad = (a: number, b: number, c: number, d: number, flip: boolean) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return
    if (flip) idx.push(a, c, b, a, d, c)
    else idx.push(a, b, c, a, c, d)
  }
  for (let k = 1; k < nz - 1; k++)
    for (let j = 1; j < ny - 1; j++)
      for (let i = 1; i < nx - 1; i++) {
        const v0 = val[id(i, j, k)] < 0
        if (v0 !== val[id(i + 1, j, k)] < 0)
          quad(
            cellVert[cid(i, j - 1, k - 1)],
            cellVert[cid(i, j, k - 1)],
            cellVert[cid(i, j, k)],
            cellVert[cid(i, j - 1, k)],
            !v0,
          )
        if (v0 !== val[id(i, j + 1, k)] < 0)
          quad(
            cellVert[cid(i - 1, j, k - 1)],
            cellVert[cid(i - 1, j, k)],
            cellVert[cid(i, j, k)],
            cellVert[cid(i, j, k - 1)],
            !v0,
          )
        if (v0 !== val[id(i, j, k + 1)] < 0)
          quad(
            cellVert[cid(i - 1, j - 1, k)],
            cellVert[cid(i, j - 1, k)],
            cellVert[cid(i, j, k)],
            cellVert[cid(i - 1, j, k)],
            !v0,
          )
      }

  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(pos, 3))
  geo.setAttribute('normal', new Float32BufferAttribute(nor, 3))
  geo.setAttribute('color', new Float32BufferAttribute(col, 3))
  geo.setIndex(idx)
  return geo
}

/** Point on the head ellipsoid (yaw from +x toward +z, pitch up), for placing eyes and ears. */
export function headPoint(
  shape: PigShape,
  yawDeg: number,
  pitchDeg: number,
  lift = 1,
): { p: V3; yaw: number } {
  const { head } = SHAPES[shape]
  const y = (yawDeg * Math.PI) / 180
  const t = (pitchDeg * Math.PI) / 180
  return {
    p: [
      head.c[0] + head.r[0] * lift * Math.cos(t) * Math.cos(y),
      head.c[1] + head.r[1] * lift * Math.sin(t),
      head.c[2] + head.r[2] * lift * Math.cos(t) * Math.sin(y),
    ],
    yaw: -y,
  }
}

export function snoutFront(shape: PigShape): V3 {
  const { snout } = SHAPES[shape]
  return [snout.c[0] + snout.r[0], snout.c[1], snout.c[2]]
}

/** Where the tail attaches (the rump). */
export function tailAnchor(shape: PigShape): V3 {
  return SHAPES[shape].tail
}

/** A rounded-triangle ear, cupped forward. Its base sits at the origin and it points up (+y). */
export function buildEarGeometry(): BufferGeometry {
  const sh = new Shape()
  sh.moveTo(-0.27, 0)
  sh.quadraticCurveTo(-0.34, 0.36, -0.05, 0.64)
  sh.quadraticCurveTo(0, 0.69, 0.05, 0.64)
  sh.quadraticCurveTo(0.34, 0.36, 0.27, 0)
  sh.quadraticCurveTo(0, -0.07, -0.27, 0)
  const g = new ExtrudeGeometry(sh, {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 4,
    curveSegments: 14,
  })
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    pos.setZ(i, pos.getZ(i) + y * y * 0.55)
  }
  g.computeVertexNormals()
  return g
}

/** A little curly tail: a thin tube that spirals away from the rump along -x. */
export function buildTailGeometry(): BufferGeometry {
  const pts: Vector3[] = []
  for (let i = 0; i <= 24; i++) {
    const t = i / 24
    const a = t * Math.PI * 3
    const r = 0.16 * (1 - t * 0.35)
    pts.push(
      new Vector3(-t * 0.28, 0.05 + Math.sin(a) * r + t * 0.12, Math.cos(a) * r - r),
    )
  }
  return new TubeGeometry(new CatmullRomCurve3(pts), 64, 0.055, 10, false)
}

/** The flat, round snout plate at the front of the muzzle: where it sits and how big it is. */
export function snoutDisc(shape: PigShape): { p: V3; r: number; flat: number } {
  const { snout } = SHAPES[shape]
  if (shape === 'pig')
    return { p: [snout.c[0] + snout.r[0] - 0.14, snout.c[1], 0], r: 0.4, flat: 0.5 }
  const r = shape === 'chibi' ? 0.31 : 0.29
  return { p: [snout.c[0] + snout.r[0] - 0.1, snout.c[1] + 0.02, 0], r, flat: 0.5 }
}

/** A single-color palette: the whole pig is one color and only the light shapes it. `blush` is optional. */
export function flatPalette(color: string, blush: string = color): PigPalette {
  return { base: color, belly: color, deep: color, hoof: color, blush }
}
