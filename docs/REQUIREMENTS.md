# REQUIREMENTS — Piggy Hours

> Status: **Draft v0.5** · Phase 2 (Requirements Analysis), updated after Phase 3
> Changes in v0.5 (2026-11-06): US-13 Statistics (with the GitHub-style heatmap) moved into the MVP (decision D8); new US-17 (3D visual upgrade, post-v1.0); traceability updated.
> Changes in v0.3: slot cap set to 5 for the demo (kept as configuration); repository is public.
> Changes in v0.4: US-04 now requires a confirmation dialog before completing a pig (design decision D4).
> Last updated: 2026-11-04
> Changes from v0.1: translated to English; "goal" renamed "pig"; time stored in minutes; pig lifecycle and slot system added; MVP scope updated.

## 1. How to read this document

- Each functional requirement is a **User Story (US)** with **Acceptance Criteria (AC)**.
- Priority uses **MoSCoW**: **Must** · **Should** · **Could** · **Won't** (this time).
- Releases:
  - **MVP**: first usable version, shipped early. Contains only items tagged `MVP`.
  - **v1.0**: the full feature set intended by the author.

## 2. Glossary

| Term | Meaning |
|---|---|
| Pig | A goal: a name plus a target number of hours |
| Deposit | One record of time spent, tied to a pig and a day |
| Progress | Total deposited time / target time |
| Remaining | Target time − total deposited time |
| Slot | A place for one pig that is `active` or `full`; users have a limited number of slots |
| Pig status | `active` (not yet full) → `full` (target reached) → `completed` (user confirmed) |

## 3. Functional Requirements

### 3.1 MVP

**US-01 · Create a pig** — Must · MVP
> As a user, I want to create a pig with a target number of hours so that I can start tracking a goal.

Acceptance criteria:
- Fields: name (required), target hours (required), emoji/color (with defaults), deadline (optional).
- Name: 1–50 characters, not only whitespace.
- Target hours: a whole number from 1 to 10,000.
- Deadline, if set, cannot be in the past.
- The user can have at most **2 pigs that are `active` or `full`** (the slot limit). When all slots are used, the create action is disabled with a clear message, e.g. "All pig slots are in use. Complete a pig to free a slot."
- After creation the pig appears on the home screen with 0% progress.

**US-02 · Deposit time into a pig** — Must · MVP
> As a user, I want to drop the time I spent today into a pig so that I can see my progress grow.

Acceptance criteria:
- The user picks an `active` pig, enters time as **`[ ] hours [ ] minutes`**, picks a date (default today), and may add a short note.
- Either field may be left empty (treated as 0), but the total must be greater than 0. Minutes accept 0–59.
- A single deposit **cannot exceed the pig's remaining time**. If it does, show an error such as "Only 1h 0m left in this pig" and offer a **"Fill the pig"** button that fills in exactly the remaining time.
- Multiple deposits on the same day are allowed.
- Future dates are not allowed; past dates are allowed.
- After saving, progress and the pig's visual update immediately, without a page reload.
- When a deposit makes the pig reach its target, the pig becomes `full`: the user sees a notification and the pig's appearance changes to clearly show it is full.
- Quick-pick buttons (e.g. 30m · 1h · 2h) are available.

**US-03 · View pigs and progress** — Must · MVP
> As a user, I want to see all my pigs and their progress so I know where I stand.

Acceptance criteria:
- The home screen lists the user's `active` and `full` pigs. Each shows name, emoji, deposited / target (e.g. `12h 30m / 50h`), and percentage.
- Full pigs are visually distinct from active pigs.
- With no pigs, an empty state invites the user to create the first one.
- Data persists after reload and after closing the browser.

**US-04 · Complete a pig** — Must · MVP
> As a user, when my pig is full, I want to mark it completed so I can move on to a new goal.

Acceptance criteria:
- A `full` pig shows a **"Mark as completed"** button; it is not available for `active` pigs.
- Before completing, a confirmation dialog explains that the pig will move to the shelf and free its slot (completing cannot be undone in the MVP).
- On completion, the pig gets a `completedAt` date, leaves the home list, and **frees its slot**.
- Completed pigs are **kept in the stored data** (a screen for viewing them arrives in v1.0, see US-08).
- A completed pig can no longer receive deposits.

**US-13 · Statistics** — Must · **MVP** (moved up from v1.0, decision D8, 2026-11-06)
> As a user, I want to see how much time I have saved and on which days, so I stay motivated.

Acceptance criteria:
- A *Your stats* section on the page shows four tiles: **this week**, **last 30 days**, **day streak**, **active days**.
- A **heatmap** (GitHub-style grid) shows one square per day for the last 26 weeks; days with deposits are shaded in 4 steps by total time that day; days without deposits use the lightest shade.
- Hovering or focusing a square shows the date and total time.
- Numbers and heatmap are computed from real deposits and update immediately after a deposit.
- With no deposits, the section shows an empty state (lightest squares, zeros) with a short hint instead of sample data.
- Accessible: text summary for screen readers; scrolls horizontally on narrow screens.

### 3.2 v1.0 — Must

**US-05 · Edit and delete a pig** — Must
- Name, emoji, color and deadline can be edited at any time before completion.
- Target hours can be edited on `active` pigs, but **cannot be set lower than the time already deposited**.
- Deleting a pig requires confirmation that states how many deposits will be lost.
- Deleting a pig that was completed **does not reduce** the user's completed-pigs count.

**US-06 · Deposit history** — Must
- The pig detail page lists deposits, newest first.
- A deposit can be edited or deleted; edits obey the "cannot exceed remaining time" rule.
- Deleting or reducing a deposit on a `full` pig returns it to `active`.
- Completed pigs are read-only.

**US-07 · Backup and restore** — Must
- Export all data as a JSON file.
- Import from a JSON file with validation; clear errors for corrupted or incompatible files.
- On import, the user chooses to overwrite or merge.
- The app reminds users that data lives in their browser and can be lost if browser data is cleared.

**US-08 · Completed pigs shelf** — Must
- A screen lists completed pigs (name, emoji, target, completion date) and the total completed count.

**US-09 · Unlock more slots by completing pigs** — Must
- The number of slots grows with the number of completed pigs (initial table below, to be tuned):

| Completed pigs | Slots |
|---|---|
| 0 | 2 |
| 2 | 3 |
| 5 | 4 |
| 10 | 5 |

- The maximum is **5 slots** for now (demo scope). The unlock table is kept as configuration data so it can be extended later without changing the logic.
- Completed pigs do not occupy slots.
- The completed count is stored separately so deleting a completed pig does not lock slots again.
- The minimum target for a pig is 1 hour, and every completed pig counts toward unlocking (no extra threshold for now).
- The user is told when a new slot unlocks.

### 3.3 v1.0 — Should

**US-10 · Deadline guidance** — Should
- Pigs with a deadline show days left and the **time needed per day** to finish in time. Pigs without a deadline show neither.

**US-11 · Completion forecast** — Should
- Forecast = remaining time ÷ average daily pace over the last 14 days.
- Fewer than 3 days of data: show "Not enough data to estimate yet".
- Show the estimated finish date and, if a deadline exists, whether it is ahead of, on, or behind schedule.

**US-12 · Pig animation and celebration** — Should
- The pig grows or changes expression with progress; coin-drop effect on deposit; confetti when full.
- Respects the system "reduce motion" setting.

### 3.4 Could

- **US-14** Dark mode.
- **US-15** PWA: install to home screen, works offline.
- **US-16** Shareable image of a completed pig.

**US-17 · 3D visual upgrade** — Could · after v1.0
> As the author, once the product works well, I want a more striking and playful look using 3D effects, so the site is memorable and shows off my front-end skills.

Notes:
- Out of scope for the MVP and v1.0 (they keep the simple, clear 2D look from `DESIGN.md`).
- Candidate ideas: a 3D pig that reacts to progress, 3D coin drop, parallax or tilt effects on the landing page. Exact scope is decided in its own design pass.
- Must not break accessibility or performance targets: 2D fallback for reduced motion and low-end devices, lazy-loaded so the initial load stays fast.

### 3.5 Won't (this time)

- Timers / stopwatch.
- Open-ended pigs (no target). Planned for later; the data model must not block them.
- Accounts, backend, multi-device sync.
- Social features, leaderboards.
- Native apps.
- Multi-language UI.

## 4. Business Rules

| ID | Rule |
|---|---|
| BR-01 | A pig's total deposited time is **always computed from its deposits**, never stored as a separate number. |
| BR-02 | All durations are stored as **whole minutes**. Display format: `1h 30m`. |
| BR-03 | Remaining = target minutes − total deposited minutes. A deposit must be ≤ remaining. |
| BR-04 | Status is derived: `completed` if `completedAt` exists; otherwise `full` if total = target; otherwise `active`. |
| BR-05 | Percentage = total ÷ target × 100, rounded down to one decimal place; it never exceeds 100%. |
| BR-06 | Only `active` and `full` pigs occupy slots. Available slots are determined by the completed-pigs count (BR-08). |
| BR-07 | "Day" always means the user's **local time zone**, stored as `YYYY-MM-DD`. |
| BR-08 | The completed-pigs count is stored separately from the pig list. |
| BR-09 | Non-blocking warning when a user's deposits for one day (across all pigs) exceed 24 hours. |
| BR-10 | Streak: consecutive days with at least one deposit in any pig. If today has no deposit yet, yesterday's streak stays alive until the day ends. |

## 5. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | First load < 2 s on 4G; Lighthouse Performance ≥ 90; animations ~60 fps on a mid-range phone |
| Compatibility | Latest two versions of Chrome, Edge, Firefox, Safari; mobile-first, screens from 360 px wide |
| Accessibility | Fully keyboard-operable; WCAG AA color contrast; labeled buttons and icons; Lighthouse Accessibility ≥ 90; honors `prefers-reduced-motion` |
| Security & Privacy | No personal data collected or sent anywhere; safe handling of user input (no HTML injection); HTTPS; no secrets in Git |
| Data durability | JSON backup/restore; a `version` field for data migrations; graceful handling when local storage is corrupted, full, or disabled |
| Maintainability | TypeScript strict; ESLint + Prettier; tests for core logic; feature-based folder structure; docs in `docs/` |
| Extensibility | A separate `storage` layer so local storage can later be replaced by an API without UI changes; pig model can later support an open-ended type |
| UI | Cute style, pastel palette, rounded font, shared design system |
| Language | English UI; user-facing strings kept in one place for future translation |
| Repository | Public GitHub repository; all repo content in English; no secrets or personal data ever committed (including history); LICENSE file included |

## 6. Data Model (sketch)

```ts
type Pig = {
  id: string;
  name: string;
  targetMinutes: number;   // target hours × 60
  emoji: string;
  color: string;
  deadline?: string;       // YYYY-MM-DD, optional
  createdAt: string;
  completedAt?: string;    // set when the user marks it completed
};

type Deposit = {
  id: string;
  pigId: string;
  date: string;            // YYYY-MM-DD, local time zone
  minutes: number;         // whole minutes, > 0
  note?: string;
  createdAt: string;
};

type AppData = {
  version: number;         // for migrations and import/export
  pigs: Pig[];
  deposits: Deposit[];
  achievements: {
    completedPigsCount: number;  // stored separately (BR-08)
  };
};
```

Status (`active` / `full` / `completed`) is derived, not stored (BR-04).

## 7. Edge Cases to Handle

- Entering 0 or 0 h 0 m, negative numbers, text, minutes ≥ 60, empty fields.
- Deposit larger than the remaining time (US-02 "Fill the pig").
- Selecting a future date; the day changing at midnight while the page is open.
- Trying to create a third pig when two slots are in use.
- Completing a pig, then deleting it (completed count must stay).
- Lowering a pig's target below the time already deposited.
- Deleting a deposit from a `full` pig (returns to `active`).
- Local storage cleared, full, disabled (private mode), or containing malformed data.
- Two browser tabs open at once.
- Very long pig names, emoji, or special characters (must render safely).

## 8. Open Questions

- [x] Maximum number of slots: resolved, capped at 5 for the demo; may grow in the future.
- [ ] Should a minimum target (above 1 hour) be required for a pig to count toward unlocks? Current decision: no.

## 9. Traceability (requirements → milestones, tentative)

| Requirement | Milestone |
|---|---|
| Foundation, design system | M0, M1 |
| US-01, US-03 | M2 |
| US-02, US-04 | M3 |
| US-13 (stats, heatmap), FAQ section | M4 (**MVP release**) |
| US-05, US-06, US-07, US-08, US-09 | M5 |
| US-12 | M6 |
| US-10, US-11 | M7 |
| NFR polish, domain, documentation | M8 (**v1.0 release**) |
| US-17 (3D visual upgrade) | M9 (post-v1.0) |

> This table is tentative and will be finalized in Phase 4 (Planning / ROADMAP).
