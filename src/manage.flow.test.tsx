import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

const pigs = () => screen.getByRole('region', { name: 'Your pigs' })

async function createPig(name: string, hours: string) {
  await userEvent.click(
    within(pigs()).getByRole('button', { name: /Create your first pig|New pig/ }),
  )
  const dialog = await screen.findByRole('dialog', { name: 'New pig' })
  await userEvent.type(within(dialog).getByLabelText('Name'), name)
  await userEvent.type(within(dialog).getByLabelText('Target'), hours)
  await userEvent.click(within(dialog).getByRole('button', { name: 'Create pig' }))
}

async function deposit(name: string, hours: string, minutes = '', note = '') {
  await userEvent.click(
    within(pigs()).getByRole('button', { name: `Add time to ${name}` }),
  )
  const dialog = await screen.findByRole('dialog', { name: `Add time to ${name}` })
  if (hours) await userEvent.type(within(dialog).getByLabelText('Hours'), hours)
  if (minutes) await userEvent.type(within(dialog).getByLabelText('Minutes'), minutes)
  if (note) await userEvent.type(within(dialog).getByLabelText('Note (optional)'), note)
  await userEvent.click(within(dialog).getByRole('button', { name: 'Drop into pig' }))
}

async function openDetails(name: string) {
  await userEvent.click(
    within(pigs()).getByRole('button', { name: `Details and history for ${name}` }),
  )
  return screen.findByRole('dialog', { name })
}

describe('pig details and history (US-06)', () => {
  it('lists deposits newest first with their notes', async () => {
    render(<App />)
    await createPig('Piano', '10')
    await deposit('Piano', '1', '', 'scales')
    await deposit('Piano', '', '45')
    const dialog = await openDetails('Piano')
    expect(
      within(dialog).getByText('1h 45m of 10h saved, 17.5%', { exact: false }),
    ).toBeInTheDocument()
    const items = within(dialog).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    // Same day: the one entered last comes first.
    expect(items[0]).toHaveTextContent('45m')
    expect(items[1]).toHaveTextContent('1h')
    expect(items[1]).toHaveTextContent('scales')
  })

  it('shows an empty state for a pig with no time', async () => {
    render(<App />)
    await createPig('Piano', '10')
    const dialog = await openDetails('Piano')
    expect(within(dialog).getByText(/No time yet/)).toBeInTheDocument()
  })

  it('edits a deposit, and refuses more than the room left', async () => {
    render(<App />)
    await createPig('Piano', '2')
    await deposit('Piano', '1')
    const dialog = await openDetails('Piano')
    await userEvent.click(within(dialog).getByRole('button', { name: /^Edit 1h on/ }))
    const edit = await screen.findByRole('dialog', { name: 'Edit time' })
    expect(within(edit).getByLabelText('Hours')).toHaveValue('1')
    expect(within(edit).getByLabelText('Minutes')).toHaveValue('0')

    await userEvent.clear(within(edit).getByLabelText('Hours'))
    await userEvent.type(within(edit).getByLabelText('Hours'), '3')
    await userEvent.click(within(edit).getByRole('button', { name: 'Save changes' }))
    expect(within(edit).getByRole('alert')).toHaveTextContent('Only 2h left in this pig.')

    await userEvent.clear(within(edit).getByLabelText('Hours'))
    await userEvent.type(within(edit).getByLabelText('Hours'), '1')
    await userEvent.clear(within(edit).getByLabelText('Minutes'))
    await userEvent.type(within(edit).getByLabelText('Minutes'), '30')
    await userEvent.click(within(edit).getByRole('button', { name: 'Save changes' }))
    expect(screen.queryByRole('dialog', { name: 'Edit time' })).not.toBeInTheDocument()
    // Back in the details, with the new value.
    const details = screen.getByRole('dialog', { name: 'Piano' })
    expect(within(details).getAllByRole('listitem')[0]).toHaveTextContent('1h 30m')
    await userEvent.keyboard('{Escape}')
    expect(within(pigs()).getByText('1h 30m / 2h')).toBeInTheDocument()
  })

  it('deletes a deposit after confirmation', async () => {
    render(<App />)
    await createPig('Piano', '10')
    await deposit('Piano', '2')
    const dialog = await openDetails('Piano')
    await userEvent.click(within(dialog).getByRole('button', { name: /^Delete 2h on/ }))
    const confirm = await screen.findByRole('dialog', { name: 'Delete this entry?' })
    await userEvent.click(within(confirm).getByRole('button', { name: 'Cancel' }))
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(1)

    await userEvent.click(within(dialog).getByRole('button', { name: /^Delete 2h on/ }))
    await userEvent.click(
      within(await screen.findByRole('dialog', { name: 'Delete this entry?' })).getByRole(
        'button',
        {
          name: 'Delete entry',
        },
      ),
    )
    expect(within(dialog).getByText(/No time yet/)).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(within(pigs()).getByText('0m / 10h')).toBeInTheDocument()
  })

  it('returns a full pig to active when time is deleted', async () => {
    render(<App />)
    await createPig('Piano', '1')
    await deposit('Piano', '1')
    await userEvent.click(await screen.findByRole('button', { name: 'Later' }))
    expect(within(pigs()).getByText('Full')).toBeInTheDocument()

    const dialog = await openDetails('Piano')
    await userEvent.click(within(dialog).getByRole('button', { name: /^Delete 1h on/ }))
    await userEvent.click(
      within(await screen.findByRole('dialog', { name: 'Delete this entry?' })).getByRole(
        'button',
        {
          name: 'Delete entry',
        },
      ),
    )
    await userEvent.keyboard('{Escape}')
    expect(within(pigs()).queryByText('Full')).not.toBeInTheDocument()
    expect(
      within(pigs()).getByRole('button', { name: 'Add time to Piano' }),
    ).toBeInTheDocument()
  })

  it('keeps the changes after a reload', async () => {
    const first = render(<App />)
    await createPig('Piano', '10')
    await deposit('Piano', '2')
    const dialog = await openDetails('Piano')
    await userEvent.click(within(dialog).getByRole('button', { name: /^Delete 2h on/ }))
    await userEvent.click(
      within(await screen.findByRole('dialog', { name: 'Delete this entry?' })).getByRole(
        'button',
        {
          name: 'Delete entry',
        },
      ),
    )
    first.unmount()
    render(<App />)
    expect(within(pigs()).getByText('0m / 10h')).toBeInTheDocument()
  })
})

describe('edit a pig (US-05)', () => {
  async function openEdit(name: string) {
    const dialog = await openDetails(name)
    await userEvent.click(within(dialog).getByRole('button', { name: 'Edit pig' }))
    return screen.findByRole('dialog', { name: 'Edit pig' })
  }

  it('changes the name and target, keeping saved time', async () => {
    render(<App />)
    await createPig('Piano', '10')
    await deposit('Piano', '2')
    const edit = await openEdit('Piano')
    expect(within(edit).getByLabelText('Name')).toHaveValue('Piano')
    expect(within(edit).getByLabelText('Target')).toHaveValue('10')
    await userEvent.clear(within(edit).getByLabelText('Name'))
    await userEvent.type(within(edit).getByLabelText('Name'), 'Guitar')
    await userEvent.clear(within(edit).getByLabelText('Target'))
    await userEvent.type(within(edit).getByLabelText('Target'), '20')
    await userEvent.click(within(edit).getByRole('button', { name: 'Save changes' }))

    expect(screen.queryByRole('dialog', { name: 'Edit pig' })).not.toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(within(pigs()).getByRole('heading', { name: 'Guitar' })).toBeInTheDocument()
    expect(within(pigs()).getByText('2h / 20h')).toBeInTheDocument()
  })

  it('refuses a target below the saved time', async () => {
    render(<App />)
    await createPig('Piano', '10')
    await deposit('Piano', '5')
    const edit = await openEdit('Piano')
    await userEvent.clear(within(edit).getByLabelText('Target'))
    await userEvent.type(within(edit).getByLabelText('Target'), '4')
    await userEvent.click(within(edit).getByRole('button', { name: 'Save changes' }))
    expect(within(edit).getByLabelText('Target')).toHaveAccessibleDescription(
      'You already saved 5h. The target cannot be lower.',
    )
    expect(within(edit).getByLabelText('Target')).toHaveFocus()
  })

  it('locks the target of a full pig but still allows a rename', async () => {
    render(<App />)
    await createPig('Piano', '1')
    await deposit('Piano', '1')
    await userEvent.click(await screen.findByRole('button', { name: 'Later' }))
    const edit = await openEdit('Piano')
    expect(within(edit).getByLabelText('Target')).toBeDisabled()
    await userEvent.type(within(edit).getByLabelText('Name'), ' 2')
    await userEvent.click(within(edit).getByRole('button', { name: 'Save changes' }))
    await userEvent.keyboard('{Escape}')
    expect(within(pigs()).getByRole('heading', { name: 'Piano 2' })).toBeInTheDocument()
  })

  it('cancel changes nothing', async () => {
    render(<App />)
    await createPig('Piano', '10')
    const edit = await openEdit('Piano')
    await userEvent.type(within(edit).getByLabelText('Name'), 'XYZ')
    await userEvent.click(within(edit).getByRole('button', { name: 'Cancel' }))
    await userEvent.keyboard('{Escape}')
    expect(within(pigs()).getByRole('heading', { name: 'Piano' })).toBeInTheDocument()
  })
})

describe('delete a pig (US-05)', () => {
  it('tells how many entries will be lost, then deletes the pig and frees the slot', async () => {
    render(<App />)
    await createPig('Piano', '10')
    await createPig('Guitar', '10')
    await deposit('Piano', '1')
    await deposit('Piano', '', '30')
    expect(within(pigs()).getByText('2 / 2 slots')).toBeInTheDocument()

    const dialog = await openDetails('Piano')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete pig' }))
    const confirm = await screen.findByRole('dialog', { name: 'Delete this pig?' })
    expect(confirm).toHaveTextContent('2 entries')
    expect(confirm).toHaveTextContent('1h 30m saved')
    await userEvent.click(within(confirm).getByRole('button', { name: 'Delete pig' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      within(pigs()).queryByRole('heading', { name: 'Piano' }),
    ).not.toBeInTheDocument()
    expect(within(pigs()).getByText('1 / 2 slots')).toBeInTheDocument()
    expect(within(pigs()).getByRole('heading', { name: 'Guitar' })).toBeInTheDocument()
  })

  it('cancel keeps the pig', async () => {
    render(<App />)
    await createPig('Piano', '10')
    const dialog = await openDetails('Piano')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete pig' }))
    const confirm = await screen.findByRole('dialog', { name: 'Delete this pig?' })
    fireEvent.click(within(confirm).getByRole('button', { name: 'Cancel' }))
    expect(
      screen.queryByRole('dialog', { name: 'Delete this pig?' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Piano' })).toBeInTheDocument()
  })
})
