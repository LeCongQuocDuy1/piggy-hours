import { useMemo } from 'react'
import {
  activeDays,
  dailyTotals,
  heatmapWeeks,
  last30Days,
  streak,
  weekTotal,
} from '../../domain/stats'
import { formatMinutesShort, toLocalDate } from '../../domain/time'
import { useApp } from '../../state/AppProvider'
import { Heatmap } from '../stats/Heatmap'

function Tile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border-2 border-border bg-surface px-4 py-4 text-center sm:px-5">
      <dt className="text-sm font-bold text-text-muted">{label}</dt>
      <dd className="m-0">
        <span className="mt-1 block font-heading text-3xl font-medium leading-tight tabular-nums">
          {value}
        </span>
        <span className="mt-0.5 block text-sm text-text-muted">{hint}</span>
      </dd>
    </div>
  )
}

/** "Your stats": four tiles and the saving-days heatmap, all computed from deposits (US-13). */
export function Stats() {
  const { data } = useApp()
  const today = toLocalDate(new Date())
  const totals = useMemo(() => dailyTotals(data.deposits), [data.deposits])

  const week = weekTotal(totals, today)
  const month = last30Days(totals, today)
  const days = streak(totals, today)
  const active = activeDays(totals)
  const inRange = heatmapWeeks(totals, today)
    .flat()
    .filter((cell) => cell && cell.minutes > 0).length
  const empty = data.deposits.length === 0

  return (
    <section id="stats" aria-labelledby="stats-title" className="scroll-mt-20">
      <div className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6 md:py-[72px]">
        <h2
          id="stats-title"
          className="mb-2 text-center font-heading text-3xl font-medium leading-tight md:text-4xl"
        >
          Your stats
        </h2>
        <p className="mx-auto mb-10 max-w-[520px] text-center text-text-muted">
          See how steadily you are saving. Every square is one day.
        </p>

        <dl className="m-0 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <Tile
            label="This week"
            value={formatMinutesShort(week)}
            hint="Monday to today"
          />
          <Tile
            label="Last 30 days"
            value={formatMinutesShort(month)}
            hint="including today"
          />
          <Tile
            label="Day streak"
            value={String(days)}
            hint={days === 1 ? 'day in a row' : 'days in a row'}
          />
          <Tile
            label="Active days"
            value={String(active)}
            hint={active === 1 ? 'day with time saved' : 'days with time saved'}
          />
        </dl>

        <div className="mt-4 rounded-lg border-2 border-border bg-surface p-4 sm:p-6 md:mt-5">
          <h3 className="m-0 font-heading text-xl font-medium">Saving days</h3>
          <p className="sr-only">
            {inRange === 1
              ? '1 active day in the last 26 weeks.'
              : `${inRange} active days in the last 26 weeks.`}{' '}
            Current streak: {days === 1 ? '1 day' : `${days} days`}.
          </p>
          <p className="m-0 mt-1 text-sm text-text-muted" aria-hidden="true">
            Last 26 weeks
          </p>
          <Heatmap totals={totals} today={today} />
          {empty && (
            <p className="m-0 mt-3 text-center text-text-muted">
              Nothing here yet. Drop time into a pig and today’s square lights up.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
