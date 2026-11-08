/** True when the browser can create a WebGL context. Checked before the 3D libraries are even loaded. */
export function hasWebGL(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return gl != null
  } catch {
    return false
  }
}

/** Very small devices stay on the light 2D pig: 2 cores or fewer, or 2 GB of memory or less. */
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency
  return (
    (cores != null && cores <= 2) || (nav.deviceMemory != null && nav.deviceMemory <= 2)
  )
}

export function canRender3D(): boolean {
  return !isLowEndDevice() && hasWebGL()
}
