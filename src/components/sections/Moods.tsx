import { PigSprite } from '../pig3d/PigSprite'
import { MOOD_LABEL, type PigMood } from '../pig/pigMood'
import { Reveal } from '../ui/Reveal'
import { Squiggle } from '../ui/Squiggle'
import { Wave } from '../ui/Wave'
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
      className="relative mt-4 bg-band-gold"
    >
      <Wave className="text-band-gold" />
      <div className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6 md:py-[72px]">
        <Reveal>
          <h2
            id="moods-title"
            className="mb-2 text-center font-heading text-3xl font-medium leading-tight md:text-4xl"
          >
            Your pig changes as it <Squiggle>fills</Squiggle>
          </h2>
          <p className="mx-auto mb-10 max-w-[520px] text-center text-text-muted">
            From sleepy to overjoyed. Every hour you drop in makes it a little happier.
          </p>
        </Reveal>
        <ul className="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
          {MOODS.map(({ mood, range }, i) => (
            <Reveal
              as="li"
              key={mood}
              delay={i * 90}
              className={cn(
                'rounded-lg border-2 bg-surface px-2 py-4 text-center shadow-card transition-transform duration-200 ease-[var(--ease-spring)] motion-safe:hover:-translate-y-1.5 motion-safe:hover:-rotate-1',
                mood === 'overjoyed' && 'col-span-2 sm:col-span-1',
                mood === 'overjoyed' ? 'border-coin' : 'border-border',
              )}
            >
              <PigSprite
                mood={mood}
                decorative
                frame="wide"
                className="mx-auto aspect-[6/5] w-[160px] max-w-full md:w-[176px]"
              />
              <div className="mt-2 font-heading text-lg font-medium">
                {MOOD_LABEL[mood]}
              </div>
              <div className="text-sm text-text-muted">{range}</div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
