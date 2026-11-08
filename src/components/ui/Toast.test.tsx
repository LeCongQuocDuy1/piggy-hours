import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider, useToast } from './Toast'

function Trigger() {
  const toast = useToast()
  return <button onClick={() => toast.show('Saved')}>Show</button>
}

afterEach(() => vi.useRealTimers())

describe('Toast', () => {
  it('disappears on its own after a few seconds', () => {
    vi.useFakeTimers()
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    )
    act(() => screen.getByRole('button', { name: 'Show' }).click())
    expect(screen.getByText('Saved')).toBeInTheDocument()
    act(() => void vi.advanceTimersByTime(4100))
    expect(screen.queryByText('Saved')).not.toBeInTheDocument()
  })

  it('clears pending timers when the provider unmounts', () => {
    vi.useFakeTimers()
    const { unmount } = render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    )
    act(() => screen.getByRole('button', { name: 'Show' }).click())
    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
