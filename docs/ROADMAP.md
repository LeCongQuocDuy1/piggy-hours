# ROADMAP — Piggy Hours

> Status: **Approved** (2026-11-06) · Phase 4 (Planning)
> Last updated: 2026-11-06
> Depends on: `REQUIREMENTS.md` v0.5, `DESIGN.md` v0.3, `ARCHITECTURE.md`, `DECISIONS.md`

This plan turns the approved design into small, shippable milestones. Each milestone ends with a deployed, visible result.

## 1. How the work is organized

- **Method:** scaled-down Agile (Kanban). One GitHub Project board: *Backlog → Ready → In progress → In review → Done*.
- **Work units:** GitHub **milestones** (M0–M9) contain **issues**. Each issue is small (about 0.5 to 2 days) and has acceptance criteria copied from `REQUIREMENTS.md`.
- **Branching:** `main` is always deployable. Work happens on short branches (`feat/…`, `fix/…`, `docs/…`) merged by pull request after CI passes, even when working alone.
- **Commits:** Conventional Commits. **Releases:** SemVer tags at the end of milestones (`v0.1.0` after M0 … `v0.4.0` MVP, `v1.0.0` after M8).
- **Pace:** the author works at their own speed; sizes below are relative (S ≈ half a day, M ≈ 1 day, L ≈ 2 days), not deadlines.
- **Approval rule (ADR-009):** after each milestone, a short demo and the author's "ok" before the next one starts.

### Definition of Done (every issue)

1. Meets its acceptance criteria.
2. Lint, typecheck and tests pass in CI; new logic has unit tests.
3. Works with keyboard and at 360 px width; contrast respected (DESIGN §9).
4. No `console` errors; no secrets committed.
5. Docs updated if behavior or decisions changed (`docs/`, README, CHANGELOG).
6. Merged to `main` and visible on the deployed site.

## 2. Milestones

| M | Name | Goal (what the author can see) | Requirements | Release |
|---|---|---|---|---|
| **M0** | Foundation | Repo, tooling, CI, and a deployed "Piggy Hours" placeholder page | NFR, ADR-010 | v0.1.0 |
| **M1** | Design system | Tokens, fonts, base components, and the pig illustration (5 expressions) shown on a preview page; static landing sections built (header, hero, how it works, moods, benefits, FAQ, footer) | DESIGN §12–22 | v0.2.0 |
| **M2** | Pigs: create and view | Create a pig in a modal; "Your pigs" section lists pigs; data survives reload; empty state | US-01, US-03 | v0.3.0 |
| **M3** | Deposit and complete | Add time (with the "too much" error and **Fill the pig**), pig-full modal, completion confirmation, slot counter | US-02, US-04 | v0.3.x |
| **M4** | Stats and heatmap — **MVP release** | Real "Your stats" tiles and GitHub-style heatmap; the whole one-page site works end to end | US-13 | **v0.4.0 (MVP)** |
| **M5** | Manage and keep data | Edit/delete pig, deposit history, backup/restore JSON, completed-pigs shelf, slot unlocks | US-05–US-09 | v0.5.0 |
| **M6** | Delight | Pig reacts to progress, coin-drop effect, confetti when full, motion with reduced-motion support | US-12 | v0.6.0 |
| **M7** | Guidance | Deadline guidance and completion forecast | US-10, US-11 | v0.7.0 |
| **M8** | Polish and v1.0 | Accessibility audit, performance pass, README with screenshots, CHANGELOG, custom domain if ready | NFR, docs | **v1.0.0** |
| **M9** | 3D visual upgrade | New look with 3D effects (own design pass first) | US-17 | v2.0.0 (post-v1.0) |

*(US-05 edit and delete, US-06 history, US-07 backup and restore, US-08 shelf, US-09 slot unlocks; the issue split is confirmed when M5 starts.)*

Could items (dark mode US-14, PWA US-15, share image US-16) are in the backlog, unscheduled.

## 3. Issue breakdown for the first milestones

Detailed issues for M5 onward are written when the previous milestone is almost done, so the plan stays honest.

### M0 · Foundation
| # | Issue | Size |
|---|---|---|
| 0.1 | Create public GitHub repo; README skeleton, `.gitignore`, MIT LICENSE, `docs/` with the five design documents | S |
| 0.2 | Scaffold Vite + React + TypeScript (strict); folder structure from `ARCHITECTURE.md` §4 | S |
| 0.3 | ESLint, Prettier, scripts (`dev`, `build`, `lint`, `typecheck`, `test`), Vitest + Testing Library setup | M |
| 0.4 | GitHub Actions CI (lint, typecheck, test, build) and branch protection on `main` | S |
| 0.5 | Connect Vercel; production and preview deploys; placeholder page live | S |
| 0.6 | Issue templates, labels, milestones M0–M9, Kanban project board | S |

### M1 · Design system
| # | Issue | Size |
|---|---|---|
| 1.1 | Tailwind setup with tokens (colors, radius, shadows, spacing) from `DESIGN.md` §13–15 | M |
| 1.2 | Self-hosted Fredoka and Nunito (`@fontsource`) | S |
| 1.3 | Base components: Button, Input, Badge, ProgressBar, Toast (with tests) | L |
| 1.4 | Modal component on Radix Dialog (overlay, card, focus trap, Esc, focus return) | M |
| 1.5 | `PigIllustration` SVG with 5 moods, body scale and color tint | L |
| 1.6 | Static sections: Header, Hero, How it works, Moods, Benefits, FAQ, Footer (responsive, anchors) | L |

### M2 · Pigs: create and view
| # | Issue | Size |
|---|---|---|
| 2.1 | Domain: types, `parseDuration`, `formatMinutes`, `validatePigInput` (with tests) | M |
| 2.2 | Domain: `status`, `progress`, `remaining`, `mood`, `slotLimit`, `canCreatePig` (with tests) | M |
| 2.3 | Storage: interface, localStorage implementation, versioning, corrupted-data backup (with tests) | L |
| 2.4 | State: reducer, `AppProvider`, persistence, storage-error banner | M |
| 2.5 | Create pig modal (US-01) incl. validation messages | M |
| 2.6 | "Your pigs" section: cards, slot counter, empty state, disabled New pig with hint (US-03) | L |

### M3 · Deposit and complete
| # | Issue | Size |
|---|---|---|
| 3.1 | Domain: `validateDeposit` incl. TOO_MUCH with remaining (with tests) | S |
| 3.2 | Add time modal: hours/minutes inputs, quick picks, date, note, error state, **Fill the pig** (US-02) | L |
| 3.3 | Pig full modal and full state on the card | M |
| 3.4 | Complete confirmation modal, `completePig` action, slot freed, toast (US-04) | M |
| 3.5 | Component tests for flows F1–F6 | M |

### M4 · Stats and heatmap (MVP release)
| # | Issue | Size |
|---|---|---|
| 4.1 | Domain: `dailyTotals`, `streak`, `weekTotal`, `last30Days`, level thresholds (with tests) | M |
| 4.2 | Stat tiles with empty state | S |
| 4.3 | Heatmap component: 26 weeks, month and weekday labels, legend, tooltip, screen-reader summary, horizontal scroll | L |
| 4.4 | Manual QA checklist (keyboard, 360 px, reduced motion), fix findings | M |
| 4.5 | Tag `v0.4.0`, update README and CHANGELOG, demo to the author | S |

## 4. Risks and how the plan handles them

| Risk | Plan |
|---|---|
| Scope creep (stats, 3D, features) | Scope fixed per milestone; new ideas go to the backlog and are scheduled only after the milestone ends |
| Solo and junior: stuck on tooling | M0 is deliberately small and boring; one tool at a time; ask early |
| Data loss from localStorage | Backup/restore in M5; corrupted-data backup copy from M2 |
| Public repo with a messy history | Conventional Commits, small PRs from day one |
| Heatmap or SVG pig takes longer than planned | They have their own issues (1.5, 4.3); the rest of the app does not depend on them |
| 3D hurts performance or accessibility | Separate milestone, lazy-loaded, 2D fallback (ADR-013) |

## 5. Decisions (approved 2026-11-06, all as recommended)

| # | Question | Recommended default |
|---|---|---|
| P1 | License | **MIT** (simple, common for portfolio projects) |
| P2 | Repository name | **`piggy-hours`** |
| P3 | Milestone order | As in section 2: MVP release at **M4**, v1.0 at **M8**, 3D at **M9** |
| P4 | Tracking | **GitHub Issues + one Project board**, milestones M0–M9; I prepare the issue texts as Markdown for you to paste or import, since creating them needs your GitHub account |
| P5 | Custom domain | **Decide during M8**; until then the free Vercel URL |

## 6. Next phase

Phase 5 — Implementation, starting with **M0 Foundation**. Before it starts, I will give you a step-by-step checklist for creating the repo and connecting Vercel on your machine (Windows).
