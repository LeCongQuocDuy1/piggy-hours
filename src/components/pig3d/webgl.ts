/** Very small devices stay on the light 2D pig: 2 cores or fewer, or 2 GB of memory or less. */
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency
  return (
    (cores != null && cores <= 2) || (nav.deviceMemory != null && nav.deviceMemory <= 2)
  )
}

/**
 * Cheap check: the WebGL interface exists and the device is not tiny. It does not create a context, because that is
 * the slow part (it starts the GPU process) and the real renderer would then have to do it all again. If the real
 * renderer cannot start after all, PigSprite catches the error and stays on the 2D pig.
 */
export function canRender3D(): boolean {
  return (
    typeof WebGL2RenderingContext !== 'undefined' &&
    !isLowEndDevice() &&
    typeof HTMLCanvasElement !== 'undefined'
  )
}
