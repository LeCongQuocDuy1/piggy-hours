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
      <div className="mx-auto max-w-[1120px] px-4 py-14 sm:px-6 md:py-[72px]">
        <h2
          id="how-title"
          className="mb-2 text-center font-heading text-3xl font-medium leading-tight md:text-4xl"
        >
          How it works
        </h2>
        <p className="mx-auto mb-8 max-w-[520px] text-center text-text-muted md:mb-10">
          Three small steps. No account, no setup.
        </p>
        <ol className="grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-3 md:gap-5">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="flex items-start gap-4 rounded-lg border-2 border-border bg-bg p-5 md:block md:p-6"
            >
              <div
                aria-hidden="true"
                className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary font-heading text-xl font-medium text-on-primary"
              >
                {i + 1}
              </div>
              <div>
                <h3 className="mb-1 mt-0 font-heading text-xl font-medium leading-snug md:mb-2 md:mt-4 md:text-[22px]">
                  {s.title}
                </h3>
                <p className="m-0 text-text-muted">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
