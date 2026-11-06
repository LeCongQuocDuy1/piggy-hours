import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('opens the mobile menu drawer, lists the sections and closes with Escape', async () => {
    render(<App />)
    const button = screen.getByRole('button', { name: 'Open menu' })
    await userEvent.click(button)
    const menu = screen.getByRole('dialog', { name: 'Menu' })
    expect(within(menu).getByRole('link', { name: 'FAQ' })).toHaveAttribute(
      'href',
      '#faq',
    )
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(button).toHaveFocus())
  })

  it('closes the drawer after choosing a section', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    await userEvent.click(
      within(screen.getByRole('dialog', { name: 'Menu' })).getByRole('link', {
        name: 'Your pigs',
      }),
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('lists five FAQ questions', () => {
    render(<App />)
    expect(screen.getAllByText(/\?$/).length).toBeGreaterThanOrEqual(5)
  })
})
