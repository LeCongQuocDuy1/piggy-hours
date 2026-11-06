import { PigIllustration } from '../pig/PigIllustration'
import { buttonStyles } from '../ui/buttonStyles'

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-10 px-6 pb-[72px] pt-10"
    >
      <div className="min-w-0 flex-[1_1_400px]">
        <span className="inline-block rounded-full bg-warning-bg px-3.5 py-1 text-sm font-bold leading-snug text-warning-text">
          No timers. Just progress.
        </span>
        <h1
          id="hero-title"
          className="mb-4 mt-4 font-heading text-[clamp(40px,6vw,64px)] font-medium leading-[1.1]"
        >
          Save your hours. Fill your pig.
        </h1>
        <p className="mb-7 max-w-[480px] text-xl text-text-muted">
          Every hour you study or work goes into a piggy bank. Set a goal, drop your time
          in, and watch your pig get rounder and happier until it&apos;s full.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <a href="#pigs" className={buttonStyles({ size: 'lg' })}>
            Create your first pig
          </a>
          <a href="#how" className="flex h-14 items-center px-2 font-bold">
            See how it works
          </a>
        </div>
      </div>
      <div className="flex min-w-0 flex-[1_1_340px] justify-center">
        <div className="relative flex aspect-square w-full max-w-[440px] items-center justify-center rounded-full bg-hero-disc">
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
    </section>
  )
}
