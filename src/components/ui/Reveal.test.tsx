import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CountUp } from './CountUp'
import { Reveal } from './Reveal'

type Callback = (entries: { isIntersecting: boolean }[]) => void
let trigger: Callback | null = null

function mockObserver() {
  class FakeObserver {
    constructor(cb: Callback) {
      trigger = cb
    }
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', FakeObserver)
}

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia
}

afterEach(() => {
  vi.unstubAllGlobals()
  trigger = null
  // @ts-expect-error restore the jsdom default (no matchMedia)
  delete window.matchMedia
})

describe('Reveal', () => {
  it('shows its content straight away where IntersectionObserver is missing', () => {
    render(<Reveal>Hello</Reveal>)
    expect(screen.getByText('Hello')).toHaveAttribute('data-shown', 'true')
  })

  it('stays hidden until it scrolls into view, then shows once', () => {
    mockObserver()
    render(<Reveal>Hello</Reveal>)
    const el = screen.getByText('Hello')
    expect(el).toHaveAttribute('data-shown', 'false')
    act(() => trigger?.([{ isIntersecting: false }]))
    expect(el).toHaveAttribute('data-shown', 'false')
    act(() => trigger?.([{ isIntersecting: true }]))
    expect(el).toHaveAttribute('data-shown', 'true')
  })

  it('never hides content when reduced motion is on', () => {
    mockObserver()
    mockReducedMotion(true)
    render(<Reveal>Hello</Reveal>)
    expect(screen.getByText('Hello')).toHaveAttribute('data-shown', 'true')
  })

  it('passes the stagger delay to CSS', () => {
    render(<Reveal delay={240}>Hello</Reveal>)
    expect(screen.getByText('Hello').style.getPropertyValue('--reveal-delay')).toBe(
      '240ms',
    )
  })
})

describe('CountUp', () => {
  it('is plain text without an observer', () => {
    render(<CountUp value={7} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('is plain text with reduced motion', () => {
    mockObserver()
    mockReducedMotion(true)
    render(<CountUp value={7} format={(n) => `${n} days`} />)
    expect(screen.getByText('7 days')).toBeInTheDocument()
  })

  it('shows 0 for sighted users until in view, but gives screen readers the final value', () => {
    mockObserver()
    render(<CountUp value={7} />)
    expect(screen.getByText('7')).toHaveClass('sr-only')
    expect(screen.getByText('0')).toHaveAttribute('aria-hidden', 'true')
  })

  it('counts up to the value once in view', async () => {
    mockObserver()
    render(<CountUp value={7} />)
    act(() => trigger?.([{ isIntersecting: true }]))
    // The count finishes on its own and then collapses to plain text.
    expect(await screen.findByText('7', {}, { timeout: 2000 })).toBeInTheDocument()
    await vi.waitFor(() => expect(document.querySelector('.sr-only')).toBeNull(), {
      timeout: 2000,
    })
  })
})
