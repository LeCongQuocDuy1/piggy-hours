import { AlertCircle, CalendarClock, CheckCircle2, TrendingUp } from 'lucide-react'
import { deadlineGuidance, forecast, type Forecast } from '../../domain/guidance'
import { formatMinutesShort } from '../../domain/time'
import type { Deposit, Pig } from '../../domain/types'
import { formatDate, plural } from '../../lib/formatDate'
import { Badge } from '../ui/Badge'

const MINUTES_PER_DAY = 24 * 60

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="m-0 flex items-start gap-2 text-sm leading-snug text-text">
      <span aria-hidden="true" className="mt-0.5 flex-none text-primary">
        {icon}
      </span>
      <span className="min-w-0">{children}</span>
    </li>
  )
}

function ScheduleBadge({
  schedule,
}: {
  schedule: NonNullable<Extract<Forecast, { kind: 'estimate' }>['schedule']>
}) {
  if (schedule.state === 'on')
    return (
      <Badge variant="success">
        <CheckCircle2
          size={14}
          strokeWidth={3}
          aria-hidden="true"
          className="mr-1 inline -mt-0.5"
        />
        On schedule
      </Badge>
    )
  if (schedule.state === 'ahead')
    return (
      <Badge variant="success">
        <CheckCircle2
          size={14}
          strokeWidth={3}
          aria-hidden="true"
          className="mr-1 inline -mt-0.5"
        />
        {plural(schedule.days, 'day')} ahead of schedule
      </Badge>
    )
  return (
    <Badge variant="gold">
      <AlertCircle
        size={14}
        strokeWidth={3}
        aria-hidden="true"
        className="mr-1 inline -mt-0.5"
      />
      {plural(schedule.days, 'day')} behind schedule
    </Badge>
  )
}

/**
 * Deadline guidance (US-10) and completion forecast (US-11) for one active pig. Nothing is shown for full or
 * completed pigs. State is always in words and icons, never in color alone.
 */
export function PigGuidance({
  pig,
  deposits,
  today,
}: {
  pig: Pig
  deposits: Deposit[]
  today: string
}) {
  const guidance = deadlineGuidance(pig, deposits, today)
  const estimate = forecast(pig, deposits, today)
  if (!guidance && !estimate) return null

  return (
    <ul
      aria-label={`Guidance for ${pig.name}`}
      className="m-0 mt-3 flex list-none flex-col gap-1.5 p-0"
    >
      {guidance && (
        <Row icon={<CalendarClock size={16} strokeWidth={2.5} />}>
          {guidance.daysLeft < 0 ? (
            <>
              <strong>Overdue by {plural(-guidance.daysLeft, 'day')}</strong>
              {' · '}
              {formatMinutesShort(guidance.remainingMinutes)} still to go
            </>
          ) : (
            <>
              <strong>
                {guidance.daysLeft === 0
                  ? 'Due today'
                  : `${plural(guidance.daysLeft, 'day')} left`}
              </strong>
              {' · '}
              about {formatMinutesShort(guidance.perDayMinutes ?? 0)}{' '}
              {guidance.daysLeft === 0 ? 'today' : 'a day'} to finish on time
              {(guidance.perDayMinutes ?? 0) > MINUTES_PER_DAY && (
                <span className="block text-text-muted">
                  That is more than 24 hours a day. Consider a later deadline.
                </span>
              )}
            </>
          )}
        </Row>
      )}
      {estimate && (
        <Row icon={<TrendingUp size={16} strokeWidth={2.5} />}>
          {estimate.kind === 'not-enough-data' && (
            <span className="text-text-muted">Not enough data to estimate yet</span>
          )}
          {estimate.kind === 'far' && (
            <span className="text-text-muted">
              More than 10 years away at your current pace
            </span>
          )}
          {estimate.kind === 'estimate' && (
            <>
              At your recent pace: <strong>{formatDate(estimate.date)}</strong>
              {estimate.schedule && (
                <span className="mt-1 block">
                  <ScheduleBadge schedule={estimate.schedule} />
                </span>
              )}
            </>
          )}
        </Row>
      )}
    </ul>
  )
}
