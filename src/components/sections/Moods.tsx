import { PigIllustration } from '../pig/PigIllustration'
import { MOOD_LABEL, type PigMood } from '../pig/pigMood'
import { cn } from '../../lib/cn'

const MOODS: { mood: PigMood; range: string }[] = [
  { mood: 'sleepy', range: '0–24%' },
  { mood: 'curious', range: '25–49%' },
  { mood: 'happy', range: '50–74%' },
  { mood: 'excited', range: '75–99%' },
  { mood: 'overjoyed', range: '100%' },
]

export function Moods() {
  return (
    <section
      id="moods"
      aria-labelledby="moods-title"
      className="border-y-2 border-border bg-surface"
    >
      <div className="mx-auto max-w-[1120px] px-6 py-[72px]">
        <h2
          id="moods-title"
          className="mb-2 text-center font-heading text-4xl font-medium leading-tight"
        >
          Your pig changes as it fills
        </h2>
        <p className="mx-auto mb-10 max-w-[520px] text-center text-text-muted">
          From sleepy to overjoyed. Every hour you drop in makes it a little happier.
        </p>
        <ul className="grid list-none grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4 p-0">
          {MOODS.map(({ mood, range }) => (
            <li
              key={mood}
              className={cn(
                'rounded-lg border-2 bg-bg px-2 py-4 text-center',
                mood === 'overjoyed' ? 'border-coin' : 'border-border',
              )}
            >
              <PigIllustration
                mood={mood}
                decorative
                className="mx-auto w-[120px] max-w-full"
              />
              <div className="mt-2 font-heading text-lg font-medium">
                {MOOD_LABEL[mood]}
              </div>
              <div className="text-sm text-text-muted">{range}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
