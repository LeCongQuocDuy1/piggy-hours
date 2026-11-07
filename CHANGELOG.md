# Changelog

All notable changes are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.4.0] MVP

### Added

- **Your stats** section (US-13) with four tiles: this week (Monday to today), last 30 days, day streak and active days, all computed from deposits and updated right after each deposit
- **Saving-days heatmap**: one square per day for the last 26 weeks, four shades by time saved that day, month and weekday labels, "Less / More" legend, tooltip with the date and total on hover, focus or tap
- Keyboard and screen reader support for the heatmap: one tab stop, arrow keys move between days, every square has a text label, plus a text summary; on narrow screens it scrolls sideways and starts at the latest week
- Empty state with zeros and a short hint when there are no deposits yet
- Stats domain functions (`dailyTotals`, `weekTotal`, `last30Days`, `streak`, `activeDays`, `heatLevel`, `heatmapWeeks`) with 27 unit tests; 34 more tests in total for the section and heatmap
- "Your stats" link in the mobile menu

## [0.3.1]

### Added

- Add time (US-02): a dialog with hours, minutes, quick picks (30m, 1h, 2h), date (today or earlier) and an optional note; the remaining time is shown; going over it shows a clear message with a **Fill the pig** shortcut; a non-blocking warning appears above 24 hours in one day
- A celebration dialog when a pig becomes full, and **Mark as completed** with a confirmation (US-04); completing frees a slot and counts toward unlocking more slots
- **Back to top** button on the landing page: appears after about one screen of scrolling, smooth scroll (instant with reduced motion), keyboard accessible
- Domain functions `validateDeposit`, reducer actions `addDeposit` and `completePig`, and 136 automated tests in total

### Changed

- Toast messages sit higher so they do not cover the Top button

## [0.3.0]

### Added

- Create pigs (US-01): New pig modal with name, target in whole hours, emoji, color and optional deadline; validation with clear messages; the form keeps typed values and focuses the first problem
- Your pigs section (US-03): pig cards with mood, color, progress bar and `saved / target`; slot counter; empty state; New pig is disabled with a hint when all slots are used
- Data is saved in the browser (one versioned JSON blob behind a `Storage` interface) and survives reloads; corrupted data is backed up and never overwritten silently; data from a newer app version is left untouched; a banner explains storage problems
- Domain logic with tests: time parsing and formatting, validation, status, progress, mood, slot limits
- Pages are updated across browser tabs
- `docs/TESTING.md`: test layers, milestone acceptance process and the M2 checklist
- 104 automated tests in total

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
