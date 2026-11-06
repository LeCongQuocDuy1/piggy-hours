import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PIG_COLOR_LIST } from './pig/pigColors'
import { PigIllustration } from './pig/PigIllustration'
import { MOOD_LABEL, type PigMood } from './pig/pigMood'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Modal } from './ui/Modal'
import { ProgressBar } from './ui/ProgressBar'
import { useToast } from './ui/Toast'

const MOODS = Object.keys(MOOD_LABEL) as PigMood[]

/** Living style guide, reachable at /#design-system. Handy for reviewing components in isolation. */
export function DesignPreview() {
  const [open, setOpen] = useState(false)
  const toast = useToast()

  return (
    <main className="mx-auto max-w-[960px] px-6 py-12">
      <a href="#top" className="font-bold">
        ← Back to the site
      </a>
      <h1 className="mb-2 mt-4 font-heading text-[40px] font-medium leading-tight">
        Design system
      </h1>
      <p className="mb-10 text-text-muted">
        Components and tokens from docs/DESIGN.md, shown in isolation.
      </p>

      <Block title="Pig colors">
        <div className="flex flex-wrap gap-6">
          {PIG_COLOR_LIST.map((c) => (
            <figure key={c.name} className="m-0 text-center">
              <PigIllustration mood="happy" color={c.name} decorative className="w-28" />
              <figcaption className="text-sm font-bold">{c.label}</figcaption>
            </figure>
          ))}
        </div>
      </Block>

      <Block title="Pig moods">
        <div className="flex flex-wrap gap-6">
          {MOODS.map((m) => (
            <figure key={m} className="m-0 text-center">
              <PigIllustration mood={m} decorative className="w-28" />
              <figcaption className="text-sm font-bold">{MOOD_LABEL[m]}</figcaption>
            </figure>
          ))}
        </div>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <Button>
            <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
            Add time
          </Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="ghost">Later</Button>
          <Button disabled>Disabled</Button>
          <Button size="lg">Create your first pig</Button>
        </div>
      </Block>

      <Block title="Badges">
        <div className="flex flex-wrap gap-3">
          <Badge>2 / 2 slots</Badge>
          <Badge variant="gold">Full</Badge>
          <Badge variant="danger">Error</Badge>
        </div>
      </Block>

      <Block title="Inputs">
        <div className="grid max-w-md gap-4">
          <Input label="Pig name" placeholder="Japanese N3" hint="Up to 40 characters" />
          <Input
            label="Hours"
            suffix="hours"
            defaultValue="3"
            error="Only 1h 0m left in this pig."
          />
        </div>
      </Block>

      <Block title="Progress">
        <div className="grid max-w-md gap-4">
          <ProgressBar label="Japanese N3" value={42} valueText="126h 30m of 300h" />
          <ProgressBar label="Piano" value={70} color="lavender" />
          <ProgressBar label="React course" value={100} full />
        </div>
      </Block>

      <Block title="Modal and toast">
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setOpen(true)}>Open modal</Button>
          <Button
            variant="secondary"
            onClick={() => toast.show('Added 1h 30m to Japanese N3')}
          >
            Show toast
          </Button>
        </div>
        <Modal
          open={open}
          onOpenChange={setOpen}
          title="Complete this pig?"
          description="This is a demo of the shared modal."
          width={440}
        >
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => setOpen(false)}>
              Complete
            </Button>
          </div>
        </Modal>
      </Block>
    </main>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 font-heading text-2xl font-medium">{title}</h2>
      <div className="rounded-lg border-2 border-border bg-surface p-6">{children}</div>
    </section>
  )
}
