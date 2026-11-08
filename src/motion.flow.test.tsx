import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const confetti = vi.hoisted(() => vi.fn())
vi.mock('canvas-confetti', () => ({ default: confetti }))

const pigsSection = () => screen.getByRole('region', { name: 'Your pigs' })

function setReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia
}

async function createPig(name: string, hours: string) {
  await userEvent.click(
    within(pigsSection()).getByRole('button', { name: /Create your first pig|New pig/ }),
  )
  const dialog = await screen.findByRole('dialog', { name: 'New pig' })
  await userEvent.type(within(dialog).getByLabelText('Name'), name)
  await userEvent.type(within(dialog).getByLabelText('Target'), hours)
  await userEvent.click(within(dialog).getByRole('button', { name: 'Create pig' }))
}

async function deposit(name: string, hours: string) {
  await userEvent.click(
    within(pigsSection()).getByRole('button', { name: `Add time to ${name}` }),
  )
  const dialog = await screen.findByRole('dialog', { name: `Add time to ${name}` })
  await userEvent.type(within(dialog).getByLabelText('Hours'), hours)
  await userEvent.click(within(dialog).getByRole('button', { name: 'Drop into pig' }))
}

beforeEach(() => {
  confetti.mockClear()
  setReducedMotion(false)
})
afterEach(() => vi.restoreAllMocks())

describe('pig motion (US-12)', () => {
  it('drops a clock and squishes the pig each time time is added, not before', async () => {
    render(<App />)
    await createPig('Piano', '10')
    expect(screen.queryByTestId('time-drop')).not.toBeInTheDocument()

    await deposit('Piano', '1')
    const clock = await screen.findByTestId('time-drop')
    expect(clock).toHaveAttribute('aria-hidden', 'true')
    expect(clock.parentElement?.querySelector('.pig-squish')).not.toBeNull()
  })

  it('fires confetti and bounces the pig when a pig becomes full', async () => {
    render(<App />)
    await createPig('Piano', '1')
    await deposit('Piano', '1')

    const dialog = await screen.findByRole('dialog', { name: 'Your pig is full!' })
    await waitFor(() => expect(confetti).toHaveBeenCalledTimes(3)) // centre burst, then both sides
    expect(dialog.querySelector('.pig-bounce')).not.toBeNull()
  })

  it('does not fire confetti while the pig is only partly full', async () => {
    render(<App />)
    await createPig('Piano', '2')
    await deposit('Piano', '1')
    await screen.findByTestId('time-drop')
    expect(confetti).not.toHaveBeenCalled()
  })

  it('skips confetti with reduced motion but still shows the full dialog and sparkles', async () => {
    setReducedMotion(true)
    render(<App />)
    await createPig('Piano', '1')
    await deposit('Piano', '1')

    const dialog = await screen.findByRole('dialog', { name: 'Your pig is full!' })
    // The sparkle is part of the overjoyed pig; index.css stops it twinkling under reduced motion.
    expect(dialog.querySelector('.pig-sparkle')).not.toBeNull()
    await new Promise((r) => setTimeout(r, 50))
    expect(confetti).not.toHaveBeenCalled()
  })
})
