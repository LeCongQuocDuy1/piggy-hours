import { describe, expect, it } from 'vitest'
import html from '../index.html?raw'
import robots from '../public/robots.txt?raw'

const publicFiles = Object.keys(import.meta.glob('../public/*', { query: '?url' }))

describe('page metadata (M8)', () => {
  it.each([
    'name="description"',
    'name="theme-color"',
    'property="og:title"',
    'property="og:description"',
    'property="og:image"',
    'name="twitter:card"',
    'rel="canonical"',
    'rel="apple-touch-icon"',
  ])('has %s', (needle) => {
    expect(html).toContain(needle)
  })

  it('declares the language and a phone viewport', () => {
    expect(html).toMatch(/<html[^>]*lang="en"/)
    expect(html).toContain('name="viewport"')
  })

  it('ships the files the metadata points to', () => {
    for (const file of [
      'favicon.svg',
      'og-image.png',
      'apple-touch-icon.png',
      'robots.txt',
    ]) {
      expect(publicFiles, file).toContain(`../public/${file}`)
    }
  })

  it('lets search engines in', () => {
    expect(robots).toMatch(/Allow: \//)
  })
})
