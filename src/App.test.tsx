import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('shows the product name and tagline', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Piggy Hours' })).toBeInTheDocument()
    expect(screen.getByText('Save your hours. Fill your pig.')).toBeInTheDocument()
  })
})
