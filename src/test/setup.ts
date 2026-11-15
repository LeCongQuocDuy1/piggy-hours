import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'

// jsdom has no canvas; confetti is mocked everywhere (motion.flow.test.tsx checks the calls).
vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

// jsdom has no WebGL either: say so quietly, so the 3D pig falls back to the 2D one without noisy logs.
HTMLCanvasElement.prototype.getContext = (() =>
  null) as typeof HTMLCanvasElement.prototype.getContext

afterEach(() => {
  localStorage.clear()
})
