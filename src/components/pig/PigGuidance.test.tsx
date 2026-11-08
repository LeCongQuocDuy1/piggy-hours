import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Deposit, Pig } from '../../domain/types'
import { PigGuidance } from './PigGuidance'

const TODAY = '2026-11-10'

function pig(over: Partial<Pig> = {}): Pig {
  return {
    id: 'p1',
    name: 'Piano',
    targetMinutes: 6000,
    emoji: '🐷',
    color: 'pink',
    createdAt: '2026-10-01T00:00:00.000Z',
    ...over,
  }
}

let n = 0
const dep = (date: string, minutes: number): Deposit => ({
  id: `d${++n}`,
  pigId: 'p1',
  date,
  minutes,
  createdAt: '2026-11-01T00:00:00.000Z',
})

const PACE = [dep('2026-11-08', 60), dep('2026-11-09', 60), dep('2026-11-10', 60)]

function renderGuidance(p: Pig, deposits: Deposit[] = []) {
  return render(<PigGuidance pig={p} deposits={deposits} today={TODAY} />)
}

describe('PigGuidance', () => {
  it('shows only the forecast hint for a pig without a deadline and without history', () => {
    renderGuidance(pig())
    const list = screen.getByRole('list', { name: 'Guidance for Piano' })
    expect(within(list).getByText('Not enough data to estimate yet')).toBeInTheDocument()
    expect(within(list).queryByText(/left|Due today|Overdue/)).not.toBeInTheDocument()
  })

  it('shows days left and the time needed per day for a pig with a deadline (US-10)', () => {
    renderGuidance(pig({ deadline: '2026-11-19' }))
    expect(screen.getByText('9 days left')).toBeInTheDocument()
    expect(screen.getByText(/about 10h a day to finish on time/)).toBeInTheDocument()
  })

  it('uses singular and "today" wording', () => {
    const { unmount } = renderGuidance(pig({ deadline: '2026-11-11' }))
    expect(screen.getByText('1 day left')).toBeInTheDocument()
    unmount()
    renderGuidance(pig({ deadline: TODAY }))
    expect(screen.getByText('Due today')).toBeInTheDocument()
    expect(screen.getByText(/about 100h today to finish on time/)).toBeInTheDocument()
  })

  it('says overdue with what is still missing, and no daily plan', () => {
    renderGuidance(pig({ deadline: '2026-11-07' }))
    expect(screen.getByText('Overdue by 3 days')).toBeInTheDocument()
    expect(screen.getByText(/100h still to go/)).toBeInTheDocument()
    expect(screen.queryByText(/a day to finish/)).not.toBeInTheDocument()
  })

  it('warns when the plan needs more than 24 hours a day', () => {
    renderGuidance(pig({ targetMinutes: 60_000, deadline: TODAY }))
    expect(screen.getByText(/more than 24 hours a day/)).toBeInTheDocument()
  })

  it('shows the estimated finish date from the recent pace (US-11)', () => {
    renderGuidance(pig(), PACE)
    expect(screen.getByText(/At your recent pace/)).toHaveTextContent('Feb 15, 2027')
    expect(screen.queryByText(/schedule/)).not.toBeInTheDocument()
  })

  it('says ahead of, on, or behind schedule when there is a deadline', () => {
    const { unmount } = renderGuidance(pig({ deadline: '2027-02-20' }), PACE)
    expect(screen.getByText('5 days ahead of schedule')).toBeInTheDocument()
    unmount()
    const second = renderGuidance(pig({ deadline: '2027-02-15' }), PACE)
    expect(screen.getByText('On schedule')).toBeInTheDocument()
    second.unmount()
    renderGuidance(pig({ deadline: '2027-02-14' }), PACE)
    expect(screen.getByText('1 day behind schedule')).toBeInTheDocument()
  })

  it('says it is far away for a very slow pace', () => {
    const slow = [dep('2026-11-08', 1), dep('2026-11-09', 1), dep('2026-11-10', 1)]
    renderGuidance(pig({ targetMinutes: 600_000 }), slow)
    expect(screen.getByText(/More than 10 years away/)).toBeInTheDocument()
  })

  it('renders nothing for a full pig', () => {
    const { container } = renderGuidance(pig({ deadline: '2026-11-19' }), [
      dep('2026-11-09', 6000),
    ])
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for a completed pig', () => {
    const { container } = renderGuidance(
      pig({ deadline: '2026-11-19', completedAt: '2026-11-09T10:00:00.000Z' }),
      [dep('2026-11-09', 6000)],
    )
    expect(container).toBeEmptyDOMElement()
  })
})
