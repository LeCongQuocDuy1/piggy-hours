import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { BackToTop } from './components/BackToTop'
import { STORAGE_KEY } from './storage/localStorage'

const pigsSection = () => screen.getByRole('region', { name: 'Your pigs' })

async function createPig(name: string, hours: string) {
  await userEvent.click(
    within(pigsSection()).getByRole('button', { name: /Create your first pig|New pig/ }),
  )
  const dialog = await screen.findByRole('dialog', { name: 'New pig' })
  await userEvent.type(within(dialog).getByLabelText('Name'), name)
  await userEvent.type(within(dialog).getByLabelText('Target'), hours)
  await userEvent.click(within(dialog).getByRole('button', { name: 'Create pig' }))
}

async function openAddTime(name: string) {
  await userEvent.click(
    within(pigsSection()).getByRole('button', { name: `Add time to ${name}` }),
  )
  return screen.findByRole('dialog', { name: `Add time to ${name}` })
}

async function deposit(name: string, hours: string, minutes = '') {
  const dialog = await openAddTime(name)
  if (hours) await userEvent.type(within(dialog).getByLabelText('Hours'), hours)
  if (minutes) await userEvent.type(within(dialog).getByLabelText('Minutes'), minutes)
  await userEvent.click(within(dialog).getByRole('button', { name: 'Drop into pig' }))
}

afterEach(() => vi.restoreAllMocks())

describe('add time (US-02)', () => {
  it('adds hours and minutes, updates progress and shows a toast', async () => {
    render(<App />)
    await createPig('Piano', '10')
    await deposit('Piano', '1', '30')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const bar = within(pigsSection()).getByRole('progressbar', { name: 'Piano' })
    expect(bar).toHaveAttribute('aria-valuenow', '15')
    expect(within(pigsSection()).getByText('1h 30m / 10h')).toBeInTheDocument()
    expect(
      screen
        .getAllByRole('status')
        .some((s) => /Added 1h 30m to Piano/.test(s.textContent ?? '')),
    ).toBe(true)
  })

  it('fills the fields from a quick pick', async () => {
    render(<App />)
    await createPig('Piano', '10')
    const dialog = await openAddTime('Piano')
    await userEvent.click(within(dialog).getByRole('button', { name: '30m' }))
    expect(within(dialog).getByLabelText('Hours')).toHaveValue('')
    expect(within(dialog).getByLabelText('Minutes')).toHaveValue('30')
    await userEvent.click(within(dialog).getByRole('button', { name: '2h' }))
    expect(within(dialog).getByLabelText('Hours')).toHaveValue('2')
    expect(within(dialog).getByLabelText('Minutes')).toHaveValue('')
  })

  it('asks for at least one minute when nothing is entered and keeps the dialog open', async () => {
    render(<App />)
    await createPig('Piano', '10')
    const dialog = await openAddTime('Piano')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Drop into pig' }))
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'Enter at least 1 minute.',
    )
    expect(within(dialog).getByLabelText('Hours')).toHaveFocus()
    expect(localStorage.getItem(STORAGE_KEY)).toContain('"deposits":[]')
  })

  it('refuses more than the remaining time and offers "Fill the pig"', async () => {
    render(<App />)
    await createPig('Piano', '2')
    await deposit('Piano', '1')
    const dialog = await openAddTime('Piano')
    await userEvent.type(within(dialog).getByLabelText('Hours'), '3')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Drop into pig' }))

    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      'Only 1h left in this pig.',
    )
    expect(within(dialog).getByLabelText('Hours')).toHaveAccessibleDescription(
      /Only 1h left/,
    )
    await userEvent.click(within(dialog).getByRole('button', { name: 'Fill the pig' }))
    expect(within(dialog).getByLabelText('Hours')).toHaveValue('1')
    expect(within(dialog).getByLabelText('Minutes')).toHaveValue('0')
    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument()
  })

  it('rejects a future date', async () => {
    render(<App />)
    await createPig('Piano', '10')
    const dialog = await openAddTime('Piano')
    await userEvent.type(within(dialog).getByLabelText('Minutes'), '20')
    fireEvent.change(within(dialog).getByLabelText('Date'), {
      target: { value: '2999-01-01' },
    })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Drop into pig' }))
    expect(within(dialog).getByLabelText('Date')).toHaveAccessibleDescription(
      'Choose today or an earlier date.',
    )
    expect(screen.getByRole('dialog', { name: 'Add time to Piano' })).toBeInTheDocument()
  })

  it('warns, without blocking, when a day goes above 24 hours', async () => {
    render(<App />)
    await createPig('Piano', '100')
    await deposit('Piano', '20')
    const dialog = await openAddTime('Piano')
    await userEvent.type(within(dialog).getByLabelText('Hours'), '5')
    expect(within(dialog).getByText(/more than 24 hours on this day/)).toBeInTheDocument()
    await userEvent.click(within(dialog).getByRole('button', { name: 'Drop into pig' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes with Cancel and keeps the data unchanged', async () => {
    render(<App />)
    await createPig('Piano', '10')
    const dialog = await openAddTime('Piano')
    await userEvent.type(within(dialog).getByLabelText('Hours'), '1')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(within(pigsSection()).getByText('0m / 10h')).toBeInTheDocument()
  })

  it('keeps deposits after a reload', async () => {
    const first = render(<App />)
    await createPig('Piano', '10')
    await deposit('Piano', '2')
    first.unmount()
    render(<App />)
    expect(within(pigsSection()).getByText('2h / 10h')).toBeInTheDocument()
  })
})

describe('fill and complete a pig (US-02, US-04)', () => {
  async function fillPig() {
    await createPig('Piano', '1')
    await deposit('Piano', '1')
  }

  it('celebrates when the pig becomes full', async () => {
    render(<App />)
    await fillPig()
    const dialog = await screen.findByRole('dialog', { name: 'Your pig is full!' })
    expect(
      within(dialog).getByRole('button', { name: 'Mark as completed' }),
    ).toBeInTheDocument()
    await userEvent.click(within(dialog).getByRole('button', { name: 'Later' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // The full pig keeps its slot and can be completed from its card.
    expect(within(pigsSection()).getByText('Full')).toBeInTheDocument()
    expect(within(pigsSection()).getByText('1 / 2 slots')).toBeInTheDocument()
    expect(
      within(pigsSection()).queryByRole('button', { name: /Add time to/ }),
    ).not.toBeInTheDocument()
    expect(
      within(pigsSection()).getByRole('button', { name: 'Mark as completed, Piano' }),
    ).toBeInTheDocument()
  })

  it('completes after confirmation and frees the slot', async () => {
    render(<App />)
    await fillPig()
    await userEvent.click(
      within(await screen.findByRole('dialog', { name: 'Your pig is full!' })).getByRole(
        'button',
        {
          name: 'Mark as completed',
        },
      ),
    )
    const confirm = await screen.findByRole('dialog', { name: 'Complete this pig?' })
    await userEvent.click(within(confirm).getByRole('button', { name: 'Complete' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      within(pigsSection()).queryByRole('heading', { name: 'Piano' }),
    ).not.toBeInTheDocument()
    expect(within(pigsSection()).getByText('0 / 2 slots')).toBeInTheDocument()
    expect(
      screen
        .getAllByRole('status')
        .some((s) => /Piano completed/.test(s.textContent ?? '')),
    ).toBe(true)
    await createPig('Guitar', '5')
    expect(
      within(pigsSection()).getByRole('heading', { name: 'Guitar' }),
    ).toBeInTheDocument()
  })

  it('does nothing when the confirmation is cancelled', async () => {
    render(<App />)
    await fillPig()
    await userEvent.click(
      within(await screen.findByRole('dialog', { name: 'Your pig is full!' })).getByRole(
        'button',
        {
          name: 'Mark as completed',
        },
      ),
    )
    const confirm = await screen.findByRole('dialog', { name: 'Complete this pig?' })
    await userEvent.click(within(confirm).getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      within(pigsSection()).getByRole('heading', { name: 'Piano' }),
    ).toBeInTheDocument()
  })

  it('keeps a completed pig completed after a reload', async () => {
    const first = render(<App />)
    await fillPig()
    await userEvent.click(
      within(await screen.findByRole('dialog', { name: 'Your pig is full!' })).getByRole(
        'button',
        {
          name: 'Mark as completed',
        },
      ),
    )
    await userEvent.click(
      within(await screen.findByRole('dialog', { name: 'Complete this pig?' })).getByRole(
        'button',
        {
          name: 'Complete',
        },
      ),
    )
    first.unmount()
    render(<App />)
    expect(within(pigsSection()).getByText('0 / 2 slots')).toBeInTheDocument()
  })
})

describe('back to top', () => {
  function scrollTo(y: number) {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
  }

  const originalMatchMedia = window.matchMedia
  afterEach(() => {
    scrollTo(0)
    window.matchMedia = originalMatchMedia
  })

  it('is hidden near the top and appears after scrolling about one screen', () => {
    render(<BackToTop />)
    expect(screen.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument()
    scrollTo(300)
    expect(screen.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument()
    scrollTo(900)
    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument()
  })

  it('scrolls smoothly to the top and moves focus to the logo', async () => {
    const scroll = vi.fn()
    window.scrollTo = scroll as unknown as typeof window.scrollTo
    render(<App />)
    scrollTo(1200)
    await userEvent.click(screen.getByRole('button', { name: 'Back to top' }))
    expect(scroll).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    await waitFor(() => expect(document.getElementById('site-logo')).toHaveFocus())
  })

  it('jumps instantly or smoothly depending on the reduced motion setting', async () => {
    const scroll = vi.fn()
    window.scrollTo = scroll as unknown as typeof window.scrollTo
    window.matchMedia = ((query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      addEventListener() {},
      removeEventListener() {},
    })) as unknown as typeof window.matchMedia
    render(<BackToTop />)
    scrollTo(1200)
    await userEvent.click(screen.getByRole('button', { name: 'Back to top' }))
    expect(scroll).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })
})
