import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PigSprite } from './PigSprite'

describe('PigSprite', () => {
  it('shows the 2D pig with its label where 3D is not available (jsdom has no WebGL)', () => {
    render(<PigSprite mood="happy" label="Study pig, 60% full" className="h-10 w-12" />)
    expect(screen.getByRole('img', { name: 'Study pig, 60% full' })).toBeInTheDocument()
    expect(document.querySelector('canvas')).toBeNull()
    expect(document.querySelector('[data-pig-sprite]')).toHaveAttribute(
      'data-pig-sprite',
      '2d',
    )
  })

  it('shows custom fallback content instead of the default pig', () => {
    render(
      <PigSprite mood="sleepy" label="ignored">
        <span>custom pig</span>
      </PigSprite>,
    )
    expect(screen.getByText('custom pig')).toBeInTheDocument()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('hides a decorative pig from screen readers', () => {
    render(<PigSprite mood="curious" decorative />)
    expect(screen.queryByRole('img')).toBeNull()
  })
})
