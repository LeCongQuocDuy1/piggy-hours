import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PigSprite } from './PigSprite'
import { canRender3D, isLowEndDevice } from './webgl'

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

describe('PigSprite fallback (hero use)', () => {
  it('shows the labelled 2D pig when WebGL is not available (jsdom)', () => {
    render(<PigSprite mood="happy" frame="wide" label="A happy pink piggy bank" />)
    expect(
      screen.getByRole('img', { name: 'A happy pink piggy bank' }),
    ).toBeInTheDocument()
    expect(document.querySelector('[data-pig-sprite]')).toHaveAttribute(
      'data-pig-sprite',
      '2d',
    )
    expect(document.querySelector('canvas')).toBeNull()
  })

  it('keeps the 2D pig under reduced motion and never mounts a canvas', () => {
    mockMotion(true)
    render(<PigSprite mood="happy" label="A happy pink piggy bank" />)
    expect(document.querySelector('canvas')).toBeNull()
    expect(
      screen.getByRole('img', { name: 'A happy pink piggy bank' }),
    ).toBeInTheDocument()
  })
})

describe('webgl checks', () => {
  it('reports no 3D where the WebGL interface does not exist (jsdom)', () => {
    expect(canRender3D()).toBe(false)
  })

  it('allows 3D where WebGL exists on a capable device', () => {
    vi.stubGlobal('WebGL2RenderingContext', class {})
    vi.stubGlobal('navigator', { hardwareConcurrency: 8, deviceMemory: 8 })
    expect(canRender3D()).toBe(true)
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
