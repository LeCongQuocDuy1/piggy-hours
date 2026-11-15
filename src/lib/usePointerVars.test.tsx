import { fireEvent, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { usePointerVars } from './usePointerVars'

function Box() {
  const ref = useRef<HTMLDivElement>(null)
  usePointerVars(ref, { px: '--lx', py: '--ly' })
  return <div ref={ref} data-testid="box" />
}

describe('usePointerVars', () => {
  it('writes the mouse position as CSS variables and resets on leave', () => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 1
    })
    render(<Box />)
    const box = screen.getByTestId('box')
    box.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 200, height: 100 }) as DOMRect
    fireEvent.pointerMove(box, { clientX: 150, clientY: 25, pointerType: 'mouse' })
    expect(box.style.getPropertyValue('--px')).toBe('0.5')
    expect(box.style.getPropertyValue('--py')).toBe('-0.5')
    expect(box.style.getPropertyValue('--lx')).toBe('75%')
    fireEvent.pointerLeave(box)
    expect(box.style.getPropertyValue('--px')).toBe('0')
    vi.unstubAllGlobals()
  })

  it('ignores touch pointers', () => {
    render(<Box />)
    const box = screen.getByTestId('box')
    fireEvent.pointerMove(box, { clientX: 10, clientY: 10, pointerType: 'touch' })
    expect(box.style.getPropertyValue('--px')).toBe('')
  })
})
