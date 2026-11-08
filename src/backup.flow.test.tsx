import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const pigs = () => screen.getByRole('region', { name: 'Your pigs' })
const dataSection = () => screen.getByRole('region', { name: 'Your data' })

async function createPig(name: string, hours: string) {
  await userEvent.click(
    within(pigs()).getByRole('button', { name: /Create your first pig|New pig/ }),
  )
  const dialog = await screen.findByRole('dialog', { name: 'New pig' })
  await userEvent.type(within(dialog).getByLabelText('Name'), name)
  await userEvent.type(within(dialog).getByLabelText('Target'), hours)
  await userEvent.click(within(dialog).getByRole('button', { name: 'Create pig' }))
}

async function deposit(name: string, hours: string) {
  await userEvent.click(
    within(pigs()).getByRole('button', { name: `Add time to ${name}` }),
  )
  const dialog = await screen.findByRole('dialog', { name: `Add time to ${name}` })
  await userEvent.type(within(dialog).getByLabelText('Hours'), hours)
  await userEvent.click(within(dialog).getByRole('button', { name: 'Drop into pig' }))
}

async function complete(name: string, hours: string) {
  await deposit(name, hours)
  const full = await screen.findByRole('dialog', { name: 'Your pig is full!' })
  await userEvent.click(within(full).getByRole('button', { name: 'Mark as completed' }))
  const confirm = await screen.findByRole('dialog', { name: 'Complete this pig?' })
  await userEvent.click(within(confirm).getByRole('button', { name: 'Complete' }))
}

const backupJson = (over: Record<string, unknown> = {}) =>
  JSON.stringify({
    app: 'piggy-hours',
    exportedAt: '2026-10-01T00:00:00.000Z',
    version: 1,
    pigs: [
      {
        id: 'imp-1',
        name: 'Imported pig',
        targetMinutes: 600,
        emoji: '🎸',
        color: 'mint',
        createdAt: '2026-09-01T00:00:00.000Z',
      },
    ],
    deposits: [
      {
        id: 'imp-d1',
        pigId: 'imp-1',
        date: '2026-09-02',
        minutes: 90,
        createdAt: '2026-09-02T00:00:00.000Z',
      },
    ],
    achievements: { completedPigsCount: 0 },
    ...over,
  })

const upload = (content: string, name = 'backup.json') =>
  userEvent.upload(
    within(dataSection()).getByLabelText('Backup file'),
    new File([content], name, { type: 'application/json' }),
  )

describe('export backup (US-07)', () => {
  let blobs: Blob[] = []
  let downloaded: string[] = []
  beforeEach(() => {
    blobs = []
    downloaded = []
    URL.createObjectURL = vi.fn((b: Blob) => {
      blobs.push(b)
      return 'blob:test'
    })
    URL.revokeObjectURL = vi.fn()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloaded.push(this.download)
    })
  })
  afterEach(() => vi.restoreAllMocks())

  it('downloads all data as a dated JSON file and says so', async () => {
    render(<App />)
    await createPig('Piano', '10')
    await deposit('Piano', '2')
    await userEvent.click(
      within(dataSection()).getByRole('button', { name: 'Export backup' }),
    )

    expect(downloaded).toHaveLength(1)
    expect(downloaded[0]).toMatch(/^piggy-hours-backup-\d{4}-\d{2}-\d{2}\.json$/)
    const text = await new Promise<string>((resolve) => {
      const r = new FileReader()
      r.onload = () => resolve(String(r.result))
      r.readAsText(blobs[0])
    })
    const file = JSON.parse(text)
    expect(file).toMatchObject({ app: 'piggy-hours', version: 1 })
    expect(file.pigs).toHaveLength(1)
    expect(file.deposits).toHaveLength(1)
    expect(file.exportedAt).toBeTruthy()
    expect(
      screen
        .getAllByRole('status')
        .some((s) => /Backup saved as piggy-hours-backup-/.test(s.textContent ?? '')),
    ).toBe(true)
  })

  it('reminds the user that data lives in the browser', () => {
    render(<App />)
    expect(
      within(dataSection()).getByText(/live only in this browser/),
    ).toBeInTheDocument()
  })
})

describe('import backup (US-07)', () => {
  it.each([
    ['text that is not JSON', 'hello', /could not be read/],
    ['JSON that is not a backup', '{"a":1}', /does not look like a Piggy Hours backup/],
    [
      'a backup from a newer version',
      backupJson({ version: 9 }),
      /newer version of Piggy Hours \(data version 9\)/,
    ],
    [
      'a damaged backup',
      backupJson({ pigs: [{ id: 'x' }] }),
      /damaged or contains unexpected data/,
    ],
  ])('shows a clear error for %s and changes nothing', async (_n, content, message) => {
    render(<App />)
    await createPig('Piano', '10')
    await upload(content)
    expect(await within(dataSection()).findByRole('alert')).toHaveTextContent(message)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(within(pigs()).getByRole('heading', { name: 'Piano' })).toBeInTheDocument()
  })

  it('merges by default and keeps the current data', async () => {
    render(<App />)
    await createPig('Piano', '10')
    await upload(backupJson())
    const dialog = await screen.findByRole('dialog', { name: 'Import backup' })
    expect(dialog).toHaveTextContent('1 pig, 1 entry')
    expect(
      within(dialog).getByRole('radio', { name: /Merge with my data/ }),
    ).toBeChecked()
    await userEvent.click(within(dialog).getByRole('button', { name: 'Merge backup' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(within(pigs()).getByRole('heading', { name: 'Piano' })).toBeInTheDocument()
    expect(
      within(pigs()).getByRole('heading', { name: 'Imported pig' }),
    ).toBeInTheDocument()
    expect(within(pigs()).getByText('1h 30m / 10h')).toBeInTheDocument()
    expect(
      screen
        .getAllByRole('status')
        .some((s) => /Added 1 pig and 1 entry/.test(s.textContent ?? '')),
    ).toBe(true)
  })

  it('skips pigs that do not fit in the free slots when merging', async () => {
    render(<App />)
    await createPig('One', '10')
    await createPig('Two', '10')
    await upload(backupJson())
    const dialog = await screen.findByRole('dialog', { name: 'Import backup' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Merge backup' }))
    expect(
      within(pigs()).queryByRole('heading', { name: 'Imported pig' }),
    ).not.toBeInTheDocument()
    expect(
      screen
        .getAllByRole('status')
        .some((s) => /2 did not fit and were skipped/.test(s.textContent ?? '')),
    ).toBe(true)
  })

  it('replaces everything when asked, with a warning', async () => {
    render(<App />)
    await createPig('Piano', '10')
    await upload(backupJson())
    const dialog = await screen.findByRole('dialog', { name: 'Import backup' })
    await userEvent.click(
      within(dialog).getByRole('radio', { name: /Replace everything/ }),
    )
    expect(within(dialog).getByRole('note')).toHaveTextContent('cannot be undone')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Replace all' }))

    expect(
      within(pigs()).queryByRole('heading', { name: 'Piano' }),
    ).not.toBeInTheDocument()
    expect(
      within(pigs()).getByRole('heading', { name: 'Imported pig' }),
    ).toBeInTheDocument()
  })

  it('cancel leaves the data alone, and the import survives a reload', async () => {
    const first = render(<App />)
    await createPig('Piano', '10')
    await upload(backupJson())
    await userEvent.click(
      within(await screen.findByRole('dialog', { name: 'Import backup' })).getByRole(
        'button',
        { name: 'Cancel' },
      ),
    )
    expect(
      within(pigs()).queryByRole('heading', { name: 'Imported pig' }),
    ).not.toBeInTheDocument()

    await upload(backupJson())
    await userEvent.click(
      within(await screen.findByRole('dialog', { name: 'Import backup' })).getByRole(
        'button',
        { name: 'Merge backup' },
      ),
    )
    first.unmount()
    render(<App />)
    expect(
      within(pigs()).getByRole('heading', { name: 'Imported pig' }),
    ).toBeInTheDocument()
  })
})

describe('completed pigs shelf and slot unlock (US-08, US-09)', () => {
  it('has no shelf until a pig is completed, then lists it', async () => {
    render(<App />)
    expect(screen.queryByRole('region', { name: 'Your shelf' })).not.toBeInTheDocument()
    await createPig('Piano', '1')
    await complete('Piano', '1')
    const shelf = await screen.findByRole('region', { name: 'Your shelf' })
    expect(within(shelf).getByText(/1 pig completed/)).toBeInTheDocument()
    expect(
      within(shelf).getByText(/Complete 1 more pig to unlock slot 3/),
    ).toBeInTheDocument()
    expect(within(shelf).getByRole('heading', { name: /Piano/ })).toBeInTheDocument()
    expect(within(shelf).getByText(/1h · done/)).toBeInTheDocument()
  })

  it('announces a new slot when the second pig is completed', async () => {
    render(<App />)
    await createPig('One', '1')
    await complete('One', '1')
    expect(
      screen
        .getAllByRole('status')
        .some((s) => /One completed\. A slot is free\./.test(s.textContent ?? '')),
    ).toBe(true)
    await createPig('Two', '1')
    await complete('Two', '1')
    await waitFor(() =>
      expect(
        screen
          .getAllByRole('status')
          .some((s) =>
            /New slot unlocked: you now have 3 pig slots!/.test(s.textContent ?? ''),
          ),
      ).toBe(true),
    )
    expect(within(pigs()).getByText('0 / 3 slots')).toBeInTheDocument()
  })

  it('shows a read-only history of a completed pig, and deleting it keeps the count', async () => {
    render(<App />)
    await createPig('Piano', '1')
    await complete('Piano', '1')
    const shelf = await screen.findByRole('region', { name: 'Your shelf' })
    await userEvent.click(within(shelf).getByRole('button', { name: 'History of Piano' }))
    const dialog = await screen.findByRole('dialog', { name: 'Piano' })
    expect(within(dialog).getByText('Completed')).toBeInTheDocument()
    expect(
      within(dialog).queryByRole('button', { name: 'Edit pig' }),
    ).not.toBeInTheDocument()
    expect(
      within(dialog).queryByRole('button', { name: /^Edit 1h/ }),
    ).not.toBeInTheDocument()
    expect(
      within(dialog).queryByRole('button', { name: /^Delete 1h/ }),
    ).not.toBeInTheDocument()

    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete pig' }))
    const confirm = await screen.findByRole('dialog', { name: 'Delete this pig?' })
    await userEvent.click(within(confirm).getByRole('button', { name: 'Delete pig' }))

    const after = await screen.findByRole('region', { name: 'Your shelf' })
    expect(within(after).getByText(/1 pig completed/)).toBeInTheDocument()
    expect(
      within(after).queryByRole('heading', { name: /Piano/ }),
    ).not.toBeInTheDocument()
  })
})
