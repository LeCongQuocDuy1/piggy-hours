import { PigIllustration } from '../pig/PigIllustration'

/** Placeholder for the app area. Creating and filling pigs arrives in milestones M2 and M3. */
export function YourPigs() {
  return (
    <section
      id="pigs"
      aria-labelledby="pigs-title"
      className="mx-auto max-w-[1120px] px-6 py-[72px]"
    >
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="pigs-title"
            className="mb-1 font-heading text-4xl font-medium leading-tight"
          >
            Your pigs
          </h2>
          <p className="m-0 text-text-muted">
            This is where you save your hours. Two pig slots to start.
          </p>
        </div>
        <span className="rounded-full bg-track px-3.5 py-1.5 text-sm font-bold tabular-nums">
          0 / 2 slots
        </span>
      </div>
      <div className="flex flex-col items-center rounded-lg border-2 border-border bg-surface px-6 py-12 text-center shadow-card">
        <PigIllustration
          mood="sleepy"
          label="A sleepy pig waiting for its first hours"
          className="w-48"
        />
        <h3 className="mb-2 mt-4 font-heading text-[28px] font-medium leading-tight">
          Your piggy bank is empty
        </h3>
        <p className="m-0 max-w-md text-text-muted">
          Creating pigs and dropping in time is coming in the next milestones. This page
          is being built in the open, so check back soon.
        </p>
      </div>
    </section>
  )
}
