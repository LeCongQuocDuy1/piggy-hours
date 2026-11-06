import { PigIllustration } from '../pig/PigIllustration'
import { buttonStyles } from '../ui/buttonStyles'

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto flex max-w-[1120px] flex-col items-center gap-8 px-4 pb-14 pt-6 text-center sm:px-6 md:flex-row md:gap-10 md:pb-[72px] md:pt-10 md:text-left"
    >
      {/* The pig comes first on phones so the first screen already feels alive. */}
      <div className="order-first flex w-full min-w-0 justify-center md:order-last md:flex-[1_1_340px]">
        <div className="relative flex aspect-square w-[min(74vw,320px)] items-center justify-center rounded-full bg-hero-disc md:w-full md:max-w-[440px]">
          <PigIllustration
            mood="happy"
            label="A happy pink piggy bank"
            className="w-[84%]"
          />
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="absolute left-1/2 top-[8%] w-[9%] -translate-x-1/2"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="#F5B833"
              stroke="#C98B0B"
              strokeWidth="2"
            />
            <path d="M12 8v8" stroke="#C98B0B" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="flex min-w-0 flex-col items-center md:flex-[1_1_400px] md:items-start">
        <span className="inline-block rounded-full bg-warning-bg px-3.5 py-1 text-sm font-bold leading-snug text-warning-text">
          No timers. Just progress.
        </span>
        <h1
          id="hero-title"
          className="mb-4 mt-4 font-heading text-[clamp(36px,10.5vw,64px)] font-medium leading-[1.1]"
        >
          <span className="block">Save your hours.</span>{' '}
          <span className="block text-primary">Fill your pig.</span>
        </h1>
        <p className="mb-7 max-w-[480px] text-lg text-text-muted md:text-xl">
          Every hour you study or work goes into a piggy bank. Set a goal, drop your time
          in, and watch your pig get rounder and happier until it&apos;s full.
        </p>
        <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row sm:gap-4">
          <a
            href="#pigs"
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
