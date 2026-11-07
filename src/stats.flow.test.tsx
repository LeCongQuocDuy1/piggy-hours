import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { Heatmap } from './components/stats/Heatmap'
import { dailyTotals } from './domain/stats'
import { toLocalDate } from './domain/time'

const stats = () => screen.getByRole('region', { name: 'Your stats' })
const pigs = () => screen.getByRole('region', { name: 'Your pigs' })

function tile(label: string) {
  const term = within(stats()).getByText(label)
  return term.closest('div') as HTMLElement
}

async function createPig(name: string, hours: string) {
  await userEvent.click(
    within(pigs()).getByRole('button', { name: /Create your first pig|New pig/ }),
  )
  const dialog = await screen.findByRole('dialog', { name: 'New pig' })
  await userEvent.type(within(dialog).getByLabelText('Name'), name)
  await userEvent.type(within(dialog).getByLabelText('Target'), hours)
  await userEvent.click(within(dialog).getByRole('button', { name: 'Create pig' }))
}

async function deposit(name: string, hours: string, minutes = '') {
  await userEvent.click(
    within(pigs()).getByRole('button', { name: `Add time to ${name}` }),
  )
  const dialog = await screen.findByRole('dialog', { name: `Add time to ${name}` })
  if (hours) await userEvent.type(within(dialog).getByLabelText('Hours'), hours)
  if (minutes) await userEvent.type(within(dialog).getByLabelText('Minutes'), minutes)
  await userEvent.click(within(dialog).getByRole('button', { name: 'Drop into pig' }))
}

describe('Your stats (US-13)', () => {
  it('shows zeros, a hint and a text summary when there are no deposits', () => {
    render(<App />)
    expect(within(tile('This week')).getByText('0m')).toBeInTheDocument()
    expect(within(tile('Last 30 days')).getByText('0m')).toBeInTheDocument()
    expect(within(tile('Day streak')).getByText('0')).toBeInTheDocument()
    expect(within(tile('Active days')).getByText('0')).toBeInTheDocument()
    expect(within(stats()).getByText(/Nothing here yet/)).toBeInTheDocument()
    expect(
      within(stats()).getByText(/0 active days in the last 26 weeks/),
    ).toBeInTheDocument()
    expect(
      within(stats()).getAllByRole('gridcell', { name: /no time/ }).length,
    ).toBeGreaterThan(150)
  })

  it('updates the tiles and today’s square right after a deposit', async () => {
    render(<App />)
    await createPig('Piano', '10')
    await deposit('Piano', '1', '30')

    expect(within(tile('This week')).getByText('1h 30m')).toBeInTheDocument()
    expect(within(tile('Last 30 days')).getByText('1h 30m')).toBeInTheDocument()
    expect(within(tile('Day streak')).getByText('1')).toBeInTheDocument()
    expect(within(tile('Active days')).getByText('1')).toBeInTheDocument()
    expect(within(stats()).queryByText(/Nothing here yet/)).not.toBeInTheDocument()
    expect(
      within(stats()).getByText(/1 active day in the last 26 weeks/),
    ).toBeInTheDocument()

    const todayCell = within(stats()).getByRole('gridcell', { name: /: 1h 30m$/ })
    expect(todayCell).toHaveAttribute('data-level', '2')
  })

  it('adds deposits of different pigs into the same day', async () => {
    render(<App />)
    await createPig('Piano', '10')
    await createPig('Guitar', '10')
    await deposit('Piano', '1')
    await deposit('Guitar', '2')
    expect(within(tile('This week')).getByText('3h')).toBeInTheDocument()
    expect(within(tile('Active days')).getByText('1')).toBeInTheDocument()
    expect(within(stats()).getByRole('gridcell', { name: /: 3h$/ })).toHaveAttribute(
      'data-level',
      '4',
    )
  })
})

describe('Heatmap', () => {
  const today = toLocalDate(new Date())
  const totals = dailyTotals([
    { id: '1', pigId: 'a', date: today, minutes: 45, createdAt: '' },
  ])

  it('has 26 weeks and a single tab stop on today', () => {
    render(<Heatmap totals={totals} today={today} />)
    const cells = screen.getAllByRole('gridcell')
    expect(cells).toHaveLength(26 * 7)
    const stops = cells.filter((c) => c.getAttribute('tabindex') === '0')
    expect(stops).toHaveLength(1)
    expect(stops[0]).toHaveAccessibleName(/: 45m$/)
  })

  it('shows the date and total in a tooltip on hover and focus', async () => {
    render(<Heatmap totals={totals} today={today} />)
    const cell = screen.getByRole('gridcell', { name: /: 45m$/ })
    expect(
      screen.queryByText(/: 45m$/, { selector: '[aria-hidden="true"]' }),
    ).not.toBeInTheDocument()
    await userEvent.hover(cell)
    expect(
      screen.getByText(/: 45m$/, { selector: '[aria-hidden="true"]' }),
    ).toBeInTheDocument()
    await userEvent.unhover(cell)
    expect(
      screen.queryByText(/: 45m$/, { selector: '[aria-hidden="true"]' }),
    ).not.toBeInTheDocument()
    fireEvent.focus(cell)
    expect(
      screen.getByText(/: 45m$/, { selector: '[aria-hidden="true"]' }),
    ).toBeInTheDocument()
  })

  it('moves between days with the arrow keys', async () => {
    render(<Heatmap totals={totals} today={today} />)
    const cell = screen.getByRole('gridcell', { name: /: 45m$/ })
    cell.focus()
    await userEvent.keyboard('{ArrowLeft}')
    const stop = screen
      .getAllByRole('gridcell')
      .find((c) => c.getAttribute('tabindex') === '0')
    expect(stop).toHaveFocus()
    expect(stop).not.toBe(cell)
    expect(stop).toHaveAccessibleName(/: no time$/)
    await userEvent.keyboard('{ArrowRight}')
    expect(cell).toHaveFocus()
  })

  it('does not move past the first or last day', async () => {
    render(<Heatmap totals={totals} today={today} />)
    const cell = screen.getByRole('gridcell', { name: /: 45m$/ })
    cell.focus()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    expect(cell).toHaveFocus() // nothing to the right of today
    await userEvent.keyboard('{Home}')
    expect(
      screen.getAllByRole('gridcell').find((c) => c === document.activeElement),
    ).toBeDefined()
  })
})
