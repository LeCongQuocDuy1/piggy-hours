# DECISIONS — Piggy Hours

Architecture/product Decision Records (ADRs). Each entry: context → decision → consequences.
Status values: **Accepted**, **Superseded**, **Proposed**.

---

## ADR-001 · Project name and language
- **Date:** 2026-11-04 · **Status:** Accepted
- **Context:** The author wants the project to look professional and international.
- **Decision:** The project is named **Piggy Hours** (repository: `piggy-hours`). Everything inside the project is written in English: UI copy, code, comments, commits, docs, README. Vietnamese is used only for discussions outside the repository.
- **Consequences:** The UI targets an international audience. User-facing strings are kept in one place so translations can be added later.

## ADR-002 · A pig must have a target
- **Date:** 2026-11-04 · **Status:** Accepted
- **Context:** Two pig types were considered: with a target (fills up) and without (user decides when it is done).
- **Decision:** Every pig has a required target of 1–10,000 whole hours. An open-ended pig type may be added after v1.0.
- **Consequences:** Percentages, "full pig" visuals, forecasts and daily-pace guidance all become possible. The data model must stay extensible so an open-ended type can be added without a rewrite.

## ADR-003 · Durations stored as whole minutes
- **Date:** 2026-11-04 · **Status:** Accepted
- **Context:** Users prefer entering "hours + minutes" over decimals. Decimal hours cause rounding errors.
- **Decision:** The input has two fields (hours, minutes). Internally every duration is a whole number of minutes. Display format is `1h 30m`.
- **Consequences:** Exact arithmetic with no floating-point issues. Needs small helper functions (parse, format) with unit tests.

## ADR-004 · A deposit cannot exceed the remaining time
- **Date:** 2026-11-04 · **Status:** Accepted
- **Context:** If a pig has 1 h left and the user studied 3 h, the app needs a rule.
- **Decision:** Block the deposit and show the remaining time, with a **"Fill the pig"** button that deposits exactly the remainder. The user can put the rest into another pig.
- **Alternatives rejected:** auto-splitting across pigs (more complex), allowing overflow (conflicts with the pig metaphor).
- **Consequences:** Simple and predictable rule; the same rule applies when editing deposits.

## ADR-005 · Pig lifecycle
- **Date:** 2026-11-04 · **Status:** Accepted
- **Decision:** `active` → `full` (automatic when the target is reached) → `completed` (user presses "Mark as completed"). A `full` pig still occupies a slot until it is completed. Status is derived from data, not stored.
- **Consequences:** The MVP must include the "complete" action, otherwise users would get stuck with all slots full. Completed pigs must be persisted.

## ADR-006 · Slot limit and achievement unlocks
- **Date:** 2026-11-04 · **Status:** Accepted
- **Decision:** MVP has a fixed limit of 2 slots. In v1.0, slots unlock as the user completes pigs (initial table in `REQUIREMENTS.md`, US-09). Completed pigs do not occupy slots. The completed-pigs count is stored separately.
- **Cap:** Maximum 5 slots for the demo (reached at 10 completed pigs). The unlock table is configuration, so it can be extended later.
- **Known risk:** With a 1-hour minimum target, users could farm unlocks with tiny pigs. Accepted for now; revisit in v1.0 design.

## ADR-007 · Local-first storage for the MVP
- **Date:** 2026-11-04 · **Status:** Accepted
- **Decision:** Data is stored in the browser (localStorage) behind a dedicated `storage` layer. No accounts or backend in the MVP/v1.0.
- **Consequences:** Anyone can use the app immediately. Data is per-browser and can be lost, so JSON export/import is a Must for v1.0. Replacing storage with an API later should not require UI changes.

## ADR-008 · Private repository
- **Date:** 2026-11-04 · **Status:** Superseded by ADR-010
- **Decision:** The GitHub repository is private.
- **Consequences:** Recruiters cannot view the code. Options for the CV (decide later): make it public after reviewing the Git history for sensitive data, share access on request, or link only to the live demo.

## ADR-009 · Development process
- **Date:** 2026-11-04 · **Status:** Accepted
- **Decision:** Follow a scaled-down SDLC (initiation → requirements → design → planning → implementation → testing → deployment → maintenance). **Each phase needs the author's explicit approval before the next begins.** Implementation proceeds in small milestones, each deployed so progress is always visible. Work is tracked in GitHub Issues/Projects (Kanban), with weekly iterations.

---

## ADR-010 · Public repository
- **Date:** 2026-11-04 · **Status:** Accepted (supersedes ADR-008)
- **Context:** The project is meant to appear on the author's CV; recruiters can only evaluate code they can see.
- **Decision:** The GitHub repository is public from the beginning.
- **Consequences:**
  - The Git history is public: use clean Conventional Commits and small commits.
  - Never commit secrets or personal data. `.gitignore` and `.env` rules exist from the first commit; check before the first push.
  - README and `docs/` are public-facing: English, professional, no private notes.
  - A LICENSE file is required (MIT proposed; to be confirmed in the design/planning phase).
  - GitHub Actions and branch protection are available at no cost for public repositories.
  - Others may copy the code. Accepted.

---

## ADR-011 · One-page site with modals
- **Date:** 2026-11-05 · **Status:** Accepted
- **Context:** The author wants a landing-page style site: everything on one page, and quick actions that do not navigate away.
- **Decision:** The product is a single page (`/`). Creating a pig, adding time, the "pig is full" message and the completion confirmation are modals over a dimmed overlay. The "app area" is the *Your pigs* section of the page.
- **Consequences:** No router in the MVP; navigation uses section anchors. Later features (history, shelf, backup) also open as modals or sections. The earlier multi-screen wireframes in `DESIGN.md` are superseded by section 22.

## ADR-012 · Landing page v3 and GitHub-style stats heatmap
- **Date:** 2026-11-06 · **Status:** Accepted
- **Context:** Three landing versions were designed; the author preferred the first one and asked for stats and FAQ, with the activity chart shown as a GitHub-style grid of squares instead of bars.
- **Decision:** Version v3 (v1 plus Your stats and FAQ) is the design baseline. Activity is shown as a heatmap, one square per day, shaded by total time. All earlier versions are kept on the design canvas so they can be restored.
- **Consequences:** Stats need only daily totals derived from deposits (no new stored data). The visual style (Part 3B) is approved as proposed. The author chose to ship the stats section and heatmap **in the MVP** (D8, 2026-11-06), so US-13 moved from v1.0 to the MVP.

## ADR-013 · Simple MVP look, 3D visual upgrade later
- **Date:** 2026-11-06 · **Status:** Accepted
- **Context:** The author wants the first versions to be simple and easy to read, and a more striking, interactive look with 3D effects once the product is solid (also to showcase front-end skills on the CV).
- **Decision:** MVP and v1.0 use the approved 2D style. A 3D visual upgrade is planned after v1.0 (US-17, milestone M9), with its own design pass.
- **Consequences:** The pig illustration stays an isolated component so it can be replaced; heavy 3D libraries are added only in M9, lazy-loaded, with a 2D fallback for reduced motion and low-end devices; no 3D dependency is added to the MVP bundle.

## ADR-014 · Technical design (Part 3C)
- **Date:** 2026-11-06 · **Status:** Accepted
- **Decision:** Approved as written in `ARCHITECTURE.md` (T1–T8): React + TypeScript + Vite + Tailwind; `useReducer` + Context; Radix UI Dialog for modals; one versioned JSON blob in localStorage behind a Storage interface; local `YYYY-MM-DD` dates for deposits; no router; Vitest + Testing Library; trunk-based with PRs, Conventional Commits and SemVer.

## ADR-015 · How M5 manages and keeps data
- **Date:** 2026-11-08 · **Status:** Accepted
- **Context:** M5 adds editing, history, backup and the completed shelf (US-05 to US-09), which is a lot for one pull request.
- **Decision:** (1) M5 ships as two pull requests: **M5a** edit and delete pigs and the deposit history, **M5b** backup and restore, the completed shelf and the slot-unlock message; `v0.5.0` is tagged after M5b. (2) Details, history, edit and delete open in dialogs from the pig card, stacked over a *Pig details* dialog (consistent with ADR-011). (3) Backup and restore live in a new **Your data** section before the FAQ, with the browser-storage reminder. (4) Import offers **Replace everything** or **Merge**; on a merge, data already in the app wins when the same id appears in both. (5) A pig's target can only change while it is active and never below the saved time; a deadline that is already in the past is accepted if unchanged; completed pigs are read-only. (6) Deleting a pig deletes its deposits and never lowers the completed count (BR-08).
- **Consequences:** Status stays derived, so deleting or reducing time on a full pig returns it to active with no extra code. The deposit editor reuses the add-time form. Two smaller PRs are easier to review and test.

## ADR-016 · Motion with CSS keyframes and on-demand confetti
- **Date:** 2026-11-08 · **Status:** Accepted
- **Context:** DESIGN section 17 suggested Framer Motion and `canvas-confetti` for US-12. The needed motion is small: one squish, one clock drop, one bounce, one twinkle.
- **Decision:** (1) The pig motion uses plain CSS keyframes in `index.css`, so no animation library is added. Framer Motion stays an option for M9 (3D upgrade). (2) `canvas-confetti` is imported dynamically only when a pig becomes full. (3) One rule for reduced motion in CSS (fade of 100 ms or less, no clock, no twinkle) and one check in code (`prefersReducedMotion`) that stops the confetti library from loading. (4) A deposit is detected by the saved time going up (`usePulseOnIncrease`), so adding, editing up or importing through the same screen all behave the same, and the first render never animates. (5) No sound in v1.0.
- **Consequences:** No extra weight in the main bundle; confetti is a separate 4 kB gzipped chunk fetched on first celebration. Animations are easy to restyle in one CSS block. Complex sequences would need a library later.

## ADR-017 · M6.5 polish before more features
- **Date:** 2026-11-08 · **Status:** Accepted
- **Context:** After the MVP the page felt plain. The 3D upgrade (M9) is far away, and the project is also a CV showcase.
- **Decision:** (1) A small "M6.5 Polish" pull request adds cheap, safe visual life now: background glows, pastel bands with wavy edges, a livelier hero, scroll reveal, count-up and hover effects. (2) No new dependency; everything is CSS plus three small components (`Reveal`, `CountUp`, `Wave`). (3) Reveal and count-up never hide or change content when there is no `IntersectionObserver` (tests, old browsers) or when the system prefers reduced motion. (4) Deferred to later milestones: pig personality and speech bubbles, accessories, achievements, dark mode, share image, 3D pig.
- **Consequences:** The visual change touches only presentation, so domain and state tests stay untouched. M6.5 is stacked on M6 (#47) because both edit the same pig and CSS files.

## ADR-018 · How deadline guidance and the forecast are calculated
- **Date:** 2026-11-08 · **Status:** Accepted
- **Context:** US-10 and US-11 say what to show but leave the arithmetic open: whether today counts, how to average a young pig, what "3 days of data" means.
- **Decision:** (1) **Time per day** = remaining minutes divided by (days left + 1), rounded up, because today and the deadline day are both saving days; a deadline today means all of it today; after the deadline there is no per-day plan, only "Overdue by N days". (2) **Pace** is per pig (deposits of other pigs never count) and averaged over the last 14 days, but only from the pig's first deposit inside that window, so a new pig is not diluted by days before it existed. Days without a deposit inside the window count as zero. (3) **Enough data** means deposits on at least 3 different days in the window. (4) **Estimate** = today + ceil(remaining / pace), never earlier than tomorrow, and "far away" beyond 3,650 days. (5) **Schedule:** estimate before the deadline is ahead, the same day is on schedule, later is behind (also when the deadline has passed). (6) Full and completed pigs show nothing. (7) All of it is pure functions of pig, deposits and today's date, in `domain/guidance.ts`, so it is easy to test.
- **Consequences:** The numbers are an estimate, not a promise, and the card says "At your recent pace". A burst of saving in one week lifts the forecast quickly; a long break lowers it just as fast. A different window length is a one-line constant (`PACE_WINDOW_DAYS`).
