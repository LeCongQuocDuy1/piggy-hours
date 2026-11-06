import { render, screen } from '@testing-library/react'
import { PigIllustration } from './PigIllustration'
import { PIG_MOODS } from './pigMood'

describe('PigIllustration', () => {
  it.each(PIG_MOODS)('renders the %s pig with an accessible name', (mood) => {
    render(<PigIllustration mood={mood} />)
    expect(
      screen.getByRole('img', { name: new RegExp(`${mood} pig`, 'i') }),
    ).toBeInTheDocument()
  })

  it('uses a custom label', () => {
    render(<PigIllustration label="Japanese N3 pig, 42% full" />)
    expect(
      screen.getByRole('img', { name: 'Japanese N3 pig, 42% full' }),
    ).toBeInTheDocument()
  })

  it('can be decorative', () => {
    const { container } = render(<PigIllustration decorative />)
    expect(screen.queryByRole('img')).toBeNull()
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('only the overjoyed pig has the gold coin', () => {
    const { container, rerender } = render(<PigIllustration mood="happy" />)
    expect(container.querySelector('circle[fill="#F5B833"]')).toBeNull()
    rerender(<PigIllustration mood="overjoyed" />)
    expect(container.querySelector('circle[fill="#F5B833"]')).not.toBeNull()
  })

  it('tints the body with the chosen color', () => {
    const { container } = render(<PigIllustration color="mint" />)
    expect(container.querySelector('ellipse[fill="#BFEAD9"]')).not.toBeNull()
  })
})
