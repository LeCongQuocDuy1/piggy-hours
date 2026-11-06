import { ChevronDown } from 'lucide-react'

const QUESTIONS = [
  {
    q: 'Do I need an account?',
    a: 'No. Piggy Hours works right away, and your pigs are saved in your own browser.',
  },
  {
    q: 'Will I lose my data?',
    a: 'Your data stays in this browser. Clearing your browser data removes it, so export a backup from time to time.',
  },
  { q: 'Is there a timer?', a: "No. You add the time after you've studied or worked." },
  {
    q: 'What if I did more than my pig has room for?',
    a: 'Use "Fill the pig" to add exactly what\'s left, then put the rest into another pig.',
  },
  {
    q: 'How do I get more pigs?',
    a: 'You start with two pig slots. Complete pigs to unlock more.',
  },
]

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="mx-auto max-w-[760px] px-6 py-[72px]"
    >
      <h2
        id="faq-title"
        className="mb-6 text-center font-heading text-4xl font-medium leading-tight"
      >
        Questions, answered quickly
      </h2>
      <div className="flex flex-col gap-3">
        {QUESTIONS.map((item, i) => (
          <details
            key={item.q}
            open={i === 0}
            className="group rounded-[20px] border-2 border-border bg-surface px-5"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 font-heading text-lg font-medium [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronDown
                size={20}
                strokeWidth={2.5}
                aria-hidden="true"
                className="flex-none text-text-muted transition-transform group-open:rotate-180"
              />
            </summary>
            <p className="mb-4 mt-0 text-text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
