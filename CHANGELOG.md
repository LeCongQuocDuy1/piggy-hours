# Changelog

All notable changes are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.0]

### Added

- Design tokens (colors, radii, shadows, motion) in Tailwind, from `docs/DESIGN.md`
- Self-hosted Fredoka and Nunito fonts
- Base components: Button, Input, Badge, ProgressBar, Toast, and a Modal built on Radix Dialog (focus trap, Escape, focus returns to the opener)
- Original SVG pig with five moods and six colors
- Static landing sections: header, hero, how it works, your pigs (empty state), moods, benefits, FAQ, footer
- Design system preview page at `/#design-system`
- Mobile menu: hamburger button that opens a side drawer with the section links (focus trap, Escape, focus returns to the button)
- Component tests (24 tests in total)

### Changed

- Mobile-first layout: the hero shows the pig first, a two-line headline, full-width buttons; How it works becomes compact horizontal cards; the five moods use a 2-column grid; sections have tighter padding on phones
- Strong pig colors darkened so every progress fill has at least 3:1 contrast against its track; contrast of all text pairs verified (see `docs/DESIGN.md` section 13)

## [0.1.0]

### Added

- Project scaffold: Vite, React, TypeScript (strict), ESLint, Prettier, Vitest and Testing Library
- Folder structure from the architecture document
- GitHub Actions CI (format check, lint, typecheck, test, build)
- Design, requirements, architecture and roadmap documents in `docs/`
- Placeholder page
