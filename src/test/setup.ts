import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'

// jsdom has no canvas; confetti is mocked everywhere (motion.flow.test.tsx checks the calls).
vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

afterEach(() => {
  localStorage.clear()
})
