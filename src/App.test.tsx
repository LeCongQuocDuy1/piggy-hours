import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('shows the product name, tagline and main sections', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Save your hours. Fill your pig.' }),
    ).toBeInTheDocument()
    for (const name of [
      'How it works',
      'Your pigs',
      'Your pig changes as it fills',
      'Made to feel good',
      'Questions, answered quickly',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
  })

  it('has navigation links to the page sections', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Page sections' })
    expect(nav).toHaveTextContent('How it works')
    expect(nav.querySelector('a[href="#pigs"]')).not.toBeNull()
  })

  it('lists five FAQ questions', () => {
    render(<App />)
    expect(screen.getAllByText(/\?$/).length).toBeGreaterThanOrEqual(5)
  })
})
