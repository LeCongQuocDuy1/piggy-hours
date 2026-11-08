# Changelog

All notable changes are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added (M6.5 polish)

- **Back-to-top button** is now a round pig face looking up with a small arrow badge (no text); the accessible name is still "Back to top"
- **Favicon** is the pig face instead of the default Vite icon

- **Clocks instead of coins:** the thing that drops into the pig, floats around the hero and sits on top of an overjoyed pig is now a small gold clock, because Piggy Hours saves time, not money

- **Livelier look:** soft color glows behind the page, pastel section bands (pink, gold, lilac, mint) with wavy edges, a gradient on "Fill your pig." and hand-drawn wavy underlines on key words
- **Hero:** the pig bobs, blinks and wiggles an ear; a clock drops into its slot every few seconds and the pig squishes on landing; a dashed halo breathes; clocks, stars and hearts drift in the background
- **Scroll reveal:** headings, steps, mood cards, stat tiles and benefits fade and rise into place, one after another
- **Count-up** on the four stat tiles the first time they come into view
- **Micro-interactions:** pig cards and mood cards lift on hover; a soft shine runs across progress bars
- **Reduced motion and no observer:** everything is simply shown, still and complete; screen readers get final numbers at once
- 8 more automated tests (Reveal, CountUp) for a total of 275

## [0.6.0]

### Added

- **Pig animation and celebration** (US-12, DESIGN section 17): adding time drops a clock into the pig's slot and the pig squishes slightly (about 450 ms); when a pig becomes full, the _Pig full_ dialog bounces it and fires confetti for about 1.5 s; sparkles on an overjoyed pig twinkle
- **Reduced motion:** with the system setting "reduce motion", bounces and drops become a fade of 100 ms or less, the clock is not shown, confetti is not loaded at all, and the sparkles stay still (a static sparkle instead)
- `canvas-confetti` is loaded only when a pig becomes full (a separate 4 kB gzipped chunk), so the main bundle is unchanged
- `usePrefersReducedMotion`, `usePulseOnIncrease`, `fireConfetti`; 11 more automated tests (267 in total)
- No sound (DESIGN section 17)

### Fixed

- Toast timers are cleared when the toast area is removed, which could raise a rare "window is not defined" error at the end of a test run

### Changed

- Motion uses CSS keyframes instead of Framer Motion (see ADR-016)

## [0.5.0]

### Added

- **Your data** section (US-07): **Export backup** downloads all pigs, entries and achievements as a dated JSON file; **Import backup** reads a file, validates it with the same checks and migrations as stored data, and shows a clear message for files that are not JSON, not a Piggy Hours backup, made by a newer version, or damaged
- Import asks how to bring the backup in: **Merge** (default; what you already have wins, pigs that do not fit the free slots and entries that would overfill a pig are skipped and counted) or **Replace everything** (with a warning)
- A reminder that data lives only in this browser
- **Your shelf** (US-08): completed pigs with target and completion date, newest first, a read-only history, and the total completed count; deleting a completed pig keeps the count
- **Slot unlock message** (US-09): completing a pig that unlocks a slot says so, and the shelf shows how many more pigs unlock the next one
- Domain `parseBackup`, `mergeData`, `replaceData`, `nextUnlock`; 44 more automated tests (256 in total)

### Changed

- "Your data" is also in the mobile menu

### Added in M5a

- **Pig details** dialog (US-06), opened from the **...** button on a pig card: progress, and the deposit history newest first with date, time and note
- **Edit and delete deposits**; changing or removing time on a full pig makes it active again; completed pigs stay read-only
- **Edit pig** (US-05): name, emoji, color, deadline and, for an active pig, the target (never below the saved time); a full pig keeps its target
- **Delete pig** with a confirmation that states how many entries and how much time will be lost; the completed-pigs count is never reduced
- Domain `validatePigEdit`, reducer actions `updatePig`, `deletePig`, `updateDeposit`, `deleteDeposit`; 40 more automated tests (212 in total)

### Changed

- The create-pig form is now a shared `PigForm`, also used by Edit pig

## [0.4.0] MVP

### Added

- **Your stats** section (US-13) with four tiles: this week (Monday to today), last 30 days, day streak and active days, all computed from deposits and updated right after each deposit
- **Saving-days heatmap**: one square per day for the last 26 weeks, four shades by time saved that day, month and weekday labels, "Less / More" legend, tooltip with the date and total on hover, focus or tap
- Keyboard and screen reader support for the heatmap: one tab stop, arrow keys move between days, every square has a text label, plus a text summary; the grid always fits its card with no sideways scrollbar; phones show the last 16 weeks with larger squares, wide screens show 26
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
