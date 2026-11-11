import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ScrollPig } from './ScrollPig'

function setScroll(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
  act(() => {
    window.dispatchEvent(new Event('scroll'))
  })
}

describe('ScrollPig', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 3000,
      configurable: true,
    })
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  })
  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  })

  it('stays hidden near the top of the page', () => {
    render(<ScrollPig />)
    expect(screen.queryByTestId('scroll-pig')).toBeNull()
  })

  it('shows after one screen and gets happier as the page scrolls', async () => {
    render(<ScrollPig />)
    setScroll(800)
    const pig = await screen.findByTestId('scroll-pig')
    expect(pig).toHaveAttribute('aria-hidden', 'true')
    expect(pig).toHaveAttribute('data-mood', 'curious') // 800 / 2200 = 36%
    setScroll(1500)
    await waitFor(() => expect(pig).toHaveAttribute('data-mood', 'happy')) // 68%
    setScroll(2200)
    await waitFor(() => expect(pig).toHaveAttribute('data-mood', 'overjoyed')) // 100%
    expect(pig).toHaveTextContent('100%')
  })
})
