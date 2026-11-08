import { Squiggle } from '../ui/Squiggle'
import { HeroDecor } from './HeroDecor'
import { Pig3D } from '../pig3d/Pig3D'
import { useCreatePig } from '../modals/CreatePigProvider'
import { buttonStyles } from '../ui/buttonStyles'

export function Hero() {
  const { canCreate, open } = useCreatePig()
  return (
    <section
      aria-labelledby="hero-title"
      className="relative mx-auto flex max-w-[1120px] flex-col items-center gap-8 px-4 pb-14 pt-6 text-center sm:px-6 md:flex-row md:gap-10 md:pb-[72px] md:pt-10 md:text-left"
    >
      <HeroDecor />
      {/* The pig comes first on phones so the first screen already feels alive. */}
      <div className="order-first flex w-full min-w-0 justify-center md:order-last md:flex-[1_1_340px]">
        <div className="relative flex aspect-square w-[min(74vw,320px)] items-center justify-center rounded-full bg-hero-disc md:w-full md:max-w-[440px]">
          <span
            aria-hidden="true"
            className="hero-halo absolute -inset-3 rounded-full border-[3px] border-dashed border-coin/60"
          />
          <Pig3D
            mood="happy"
            label="A happy pink piggy bank"
            className="hero-pig w-[84%]"
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-col items-center md:flex-[1_1_400px] md:items-start">
        <span className="inline-block rounded-full bg-warning-bg px-3.5 py-1 text-sm font-bold leading-snug text-warning-text">
          No timers. Just progress.
        </span>
        <h1
          id="hero-title"
          className="mb-5 mt-4 font-heading text-[clamp(36px,10.5vw,64px)] font-medium leading-[1.1]"
        >
          <span className="block">Save your hours.</span>{' '}
          <span className="text-gradient block">
            <Squiggle>Fill your pig.</Squiggle>
          </span>
        </h1>
        <p className="mb-7 max-w-[480px] text-lg text-text-muted md:text-xl">
          Every hour you study or work goes into a piggy bank. Set a goal, drop your time
          in, and watch your pig get rounder and happier until it&apos;s full.
        </p>
        <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row sm:gap-4">
          <a
            href="#pigs"
            onClick={(e) => {
              // With a free slot the button opens the form; otherwise it scrolls to the pigs.
              if (canCreate) {
                e.preventDefault()
                open()
              }
            }}
            className={buttonStyles({ size: 'lg', className: 'w-full sm:w-auto' })}
          >
            Create your first pig
          </a>
          <a href="#how" className="flex h-12 items-center px-2 font-bold">
            See how it works
          </a>
        </div>
      </div>
    </section>
  )
}
