import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Pig3D } from './Pig3D'
import { hasWebGL, isLowEndDevice } from './webgl'

function mockMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  }))
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Pig3D fallback', () => {
  it('shows the labelled 2D pig when WebGL is not available (jsdom)', () => {
    render(<Pig3D label="A happy pink piggy bank" />)
    expect(
      screen.getByRole('img', { name: 'A happy pink piggy bank' }),
    ).toBeInTheDocument()
    expect(document.querySelector('[data-pig-3d]')).toHaveAttribute('data-pig-3d', 'off')
    expect(document.querySelector('canvas')).toBeNull()
  })

  it('keeps the 2D pig under reduced motion and never mounts a canvas', () => {
    mockMotion(true)
    render(<Pig3D label="A happy pink piggy bank" />)
    expect(document.querySelector('canvas')).toBeNull()
    expect(
      screen.getByRole('img', { name: 'A happy pink piggy bank' }),
    ).toBeInTheDocument()
  })

  it('shows the 2D clock drop only when the clock is wanted', () => {
    const { container, rerender } = render(<Pig3D label="Pig" />)
    expect(container.querySelector('.hero-clock')).not.toBeNull()
    rerender(<Pig3D label="Pig" clock={false} />)
    expect(container.querySelector('.hero-clock')).toBeNull()
  })
})

describe('webgl checks', () => {
  it('reports no WebGL when a context cannot be created', () => {
    expect(hasWebGL()).toBe(false)
  })

  it('treats 2-core and 2 GB devices as low-end', () => {
    vi.stubGlobal('navigator', { hardwareConcurrency: 2 })
    expect(isLowEndDevice()).toBe(true)
    vi.stubGlobal('navigator', { hardwareConcurrency: 8, deviceMemory: 2 })
    expect(isLowEndDevice()).toBe(true)
    vi.stubGlobal('navigator', { hardwareConcurrency: 8, deviceMemory: 8 })
    expect(isLowEndDevice()).toBe(false)
  })
})
