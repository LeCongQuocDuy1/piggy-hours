import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { Modal } from './Modal'
import { ProgressBar } from './ProgressBar'
import { ToastProvider, useToast } from './Toast'

describe('Button', () => {
  it('fires onClick and is a real button', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Add time</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Add time' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not fire when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        New pig
      </Button>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'New pig' }))
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe('Input', () => {
  it('links the label to the field', () => {
    render(<Input label="Pig name" />)
    expect(screen.getByLabelText('Pig name')).toBeInTheDocument()
  })

  it('links the error to the field and marks it invalid', () => {
    render(<Input label="Hours" error="Only 1h 0m left in this pig." />)
    const field = screen.getByLabelText('Hours')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAccessibleDescription('Only 1h 0m left in this pig.')
  })

  it('shows the hint when there is no error', () => {
    render(<Input label="Name" hint="Up to 40 characters" />)
    expect(screen.getByLabelText('Name')).toHaveAccessibleDescription(
      'Up to 40 characters',
    )
  })
})

describe('ProgressBar', () => {
  it('exposes value and text to assistive technology', () => {
    render(<ProgressBar label="Japanese N3" value={42} valueText="126h 30m of 300h" />)
    const bar = screen.getByRole('progressbar', { name: 'Japanese N3' })
    expect(bar).toHaveAttribute('aria-valuenow', '42')
    expect(bar).toHaveAttribute('aria-valuetext', '126h 30m of 300h')
  })

  it('clamps values to 0..100', () => {
    render(<ProgressBar label="Over" value={140} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })
})

function ModalDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Complete this pig?"
        description="It will move to your shelf."
      >
        <button>Complete</button>
      </Modal>
    </>
  )
}

describe('Modal', () => {
  it('opens with a title and description, closes with Escape and returns focus to the trigger', async () => {
    render(<ModalDemo />)
    const trigger = screen.getByRole('button', { name: 'Open' })
    await userEvent.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Complete this pig?' })
    expect(dialog).toHaveAccessibleDescription('It will move to your shelf.')
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('closes with the close button', async () => {
    render(<ModalDemo />)
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

function ToastDemo() {
  const toast = useToast()
  return <button onClick={() => toast.show('Saved!')}>Go</button>
}

describe('Toast', () => {
  it('announces messages in a polite live region', async () => {
    render(
      <ToastProvider>
        <ToastDemo />
      </ToastProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(screen.getByRole('status')).toHaveTextContent('Saved!')
  })
})
