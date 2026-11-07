import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { BACKUP_PREFIX, STORAGE_KEY } from './storage/localStorage'

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

afterEach(() => vi.restoreAllMocks())

describe('create and view pigs (US-01, US-03)', () => {
  it('starts with an empty state and an empty slot counter', () => {
    render(<App />)
    expect(
      within(pigsSection()).getByText('Your piggy bank is empty'),
    ).toBeInTheDocument()
    expect(within(pigsSection()).getByText('0 / 2 slots')).toBeInTheDocument()
  })

  it('creates a pig and shows it with 0% progress', async () => {
    render(<App />)
    await createPig('Japanese N3', '300')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const section = pigsSection()
    expect(
      within(section).getByRole('heading', { name: 'Japanese N3' }),
    ).toBeInTheDocument()
    const bar = within(section).getByRole('progressbar', { name: 'Japanese N3' })
    expect(bar).toHaveAttribute('aria-valuenow', '0')
    expect(bar).toHaveAttribute('aria-valuetext', '0m of 300h')
    expect(within(section).getByText('0m / 300h')).toBeInTheDocument()
    expect(within(section).getByText('1 / 2 slots')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Japanese N3 is ready')
  })

  it('keeps the data after a reload', async () => {
    const first = render(<App />)
    await createPig('Piano', '40')
    first.unmount()

    render(<App />)
    expect(
      within(pigsSection()).getByRole('heading', { name: 'Piano' }),
    ).toBeInTheDocument()
    expect(within(pigsSection()).getByText('1 / 2 slots')).toBeInTheDocument()
  })

  it('shows errors for each invalid field, keeps what was typed and focuses the first problem', async () => {
    render(<App />)
    await userEvent.click(
      within(pigsSection()).getByRole('button', { name: 'Create your first pig' }),
    )
    const dialog = await screen.findByRole('dialog', { name: 'New pig' })
    await userEvent.type(within(dialog).getByLabelText('Target'), 'abc')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Create pig' }))

    expect(within(dialog).getByLabelText('Name')).toHaveAccessibleDescription(
      'Give your pig a name.',
    )
    expect(within(dialog).getByLabelText('Name')).toHaveFocus()
    expect(within(dialog).getByLabelText('Target')).toHaveAccessibleDescription(
      'Use whole hours, like 50.',
    )
    expect(within(dialog).getByLabelText('Target')).toHaveValue('abc')
    expect(screen.getByRole('dialog', { name: 'New pig' })).toBeInTheDocument()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('rejects a deadline in the past', async () => {
    render(<App />)
    await userEvent.click(
      within(pigsSection()).getByRole('button', { name: 'Create your first pig' }),
    )
    const dialog = await screen.findByRole('dialog', { name: 'New pig' })
    await userEvent.type(within(dialog).getByLabelText('Name'), 'Old')
    await userEvent.type(within(dialog).getByLabelText('Target'), '5')
    await userEvent.type(
      within(dialog).getByLabelText('Deadline (optional)'),
      '2020-01-01',
    )
    await userEvent.click(within(dialog).getByRole('button', { name: 'Create pig' }))
    expect(
      within(dialog).getByLabelText('Deadline (optional)'),
    ).toHaveAccessibleDescription('The deadline cannot be in the past.')
  })

  it('applies the chosen emoji, color and a future deadline', async () => {
    render(<App />)
    await userEvent.click(
      within(pigsSection()).getByRole('button', { name: 'Create your first pig' }),
    )
    const dialog = await screen.findByRole('dialog', { name: 'New pig' })
    await userEvent.type(within(dialog).getByLabelText('Name'), 'Guitar')
    await userEvent.type(within(dialog).getByLabelText('Target'), '20')
    await userEvent.click(within(dialog).getByRole('radio', { name: '🎹' }))
    await userEvent.click(within(dialog).getByRole('radio', { name: 'Mint' }))
    await userEvent.type(
      within(dialog).getByLabelText('Deadline (optional)'),
      '2099-12-31',
    )
    await userEvent.click(within(dialog).getByRole('button', { name: 'Create pig' }))

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored.pigs[0]).toMatchObject({
      name: 'Guitar',
      emoji: '🎹',
      color: 'mint',
      deadline: '2099-12-31',
      targetMinutes: 1200,
    })
    expect(within(pigsSection()).getByText('Due Dec 31, 2099')).toBeInTheDocument()
  })

  it('closes with Escape without creating anything', async () => {
    render(<App />)
    await userEvent.click(
      within(pigsSection()).getByRole('button', { name: 'Create your first pig' }),
    )
    await screen.findByRole('dialog', { name: 'New pig' })
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      within(pigsSection()).getByText('Your piggy bank is empty'),
    ).toBeInTheDocument()
  })

  it('opens the form from the hero button while a slot is free', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('link', { name: 'Create your first pig' }))
    expect(await screen.findByRole('dialog', { name: 'New pig' })).toBeInTheDocument()
  })

  it('disables New pig when both slots are in use and no longer opens the form from the hero', async () => {
    render(<App />)
    await createPig('One', '5')
    await createPig('Two', '6')

    const section = pigsSection()
    expect(within(section).getByText('2 / 2 slots')).toBeInTheDocument()
    expect(within(section).getByRole('button', { name: 'New pig' })).toBeDisabled()
    expect(
      within(section).getByText(
        'All pig slots are in use. Complete a pig to free a slot.',
      ),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('link', { name: 'Create your first pig' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('storage problems', () => {
  it('warns when saved data is corrupted, keeps a backup and does not overwrite it', async () => {
    localStorage.setItem(STORAGE_KEY, '{oops')
    render(<App />)
    expect(screen.getByRole('alert')).toHaveTextContent("couldn't read your saved data")
    const backups = Object.keys(localStorage).filter((k) => k.startsWith(BACKUP_PREFIX))
    expect(backups).toHaveLength(1)
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{oops')
  })

  it('never overwrites data from a newer version', async () => {
    const text = JSON.stringify({ version: 99, pigs: [] })
    localStorage.setItem(STORAGE_KEY, text)
    render(<App />)
    expect(screen.getByRole('alert')).toHaveTextContent('newer version')
    await createPig('Test', '5')
    expect(localStorage.getItem(STORAGE_KEY)).toBe(text)
  })

  it('keeps working in memory and shows a banner when saving fails', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    render(<App />)
    await createPig('Memory pig', '5')
    expect(
      within(pigsSection()).getByRole('heading', { name: 'Memory pig' }),
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('blocking storage'),
    )
  })

  it('can dismiss the banner', async () => {
    localStorage.setItem(STORAGE_KEY, '{oops')
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
