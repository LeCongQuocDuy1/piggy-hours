import { useCreatePig } from '../modals/CreatePigProvider'
import { buttonStyles } from '../ui/buttonStyles'
import { Reveal } from '../ui/Reveal'
import { Squiggle } from '../ui/Squiggle'
import { Wave } from '../ui/Wave'

const ITEMS = [
  {
    title: 'Any goal you like',
    text: 'Study, practice, build, train. If you can count it in hours, your pig can hold it.',
  },
  {
    title: 'Unlock more pigs',
    text: 'Finish a pig and earn the right to raise more at once. Steady effort gets rewarded.',
  },
  {
    title: 'Your data stays with you',
    text: 'No account needed. Everything is saved in your own browser, and you can back it up any time.',
  },
]

export function Benefits() {
  const { canCreate, open } = useCreatePig()
  return (
    <section aria-labelledby="why-title" className="relative mt-4 bg-band-lilac">
      <Wave className="text-band-lilac" />
      <div className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6 md:py-[72px]">
        <h2
          id="why-title"
          className="mb-10 text-center font-heading text-3xl font-medium leading-tight md:text-4xl"
        >
          Made to feel <Squiggle>good</Squiggle>
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
          {ITEMS.map((i, n) => (
            <Reveal
              key={i.title}
              delay={n * 100}
              className="rounded-lg bg-surface/70 px-5 py-4"
            >
              <h3 className="mb-2 mt-0 font-heading text-[22px] font-medium leading-snug">
                {i.title}
              </h3>
              <p className="m-0 text-text-muted">{i.text}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <a
            href="#pigs"
            onClick={(e) => {
              if (canCreate) {
                e.preventDefault()
                open()
              }
            }}
            className={buttonStyles({ size: 'lg', className: 'px-9' })}
          >
            Start your first pig
          </a>
        </div>
      </div>
    </section>
  )
}
