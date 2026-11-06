const STEPS = [
  {
    title: 'Set a goal',
    text: 'Name your pig and pick a target in hours. Learning a language, a course, a side project: any goal works.',
  },
  {
    title: 'Drop in your time',
    text: 'After a session, add the hours and minutes you spent. No stopwatch to start, nothing to remember while you work.',
  },
  {
    title: 'Fill your pig',
    text: "Your pig grows rounder and happier as it fills. When it's full, mark it complete and start your next goal.",
  },
]

export function HowItWorks() {
  return (
    <section
      id="how"
      aria-labelledby="how-title"
      className="border-y-2 border-border bg-surface"
    >
      <div className="mx-auto max-w-[1120px] px-6 py-[72px]">
        <h2
          id="how-title"
          className="mb-2 text-center font-heading text-4xl font-medium leading-tight"
        >
          How it works
        </h2>
        <p className="mx-auto mb-10 max-w-[520px] text-center text-text-muted">
          Three small steps. No account, no setup.
        </p>
        <ol className="grid list-none grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5 p-0">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-lg border-2 border-border bg-bg p-6">
              <div
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-heading text-xl font-medium text-on-primary"
              >
                {i + 1}
              </div>
              <h3 className="mb-2 mt-4 font-heading text-[22px] font-medium leading-snug">
                {s.title}
              </h3>
              <p className="m-0 text-text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
