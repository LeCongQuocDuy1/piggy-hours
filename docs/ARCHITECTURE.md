# ARCHITECTURE — Piggy Hours

> Status: **Approved** (2026-11-06) · Phase 3 (Design), **Part 3C: technical design**
> Last updated: 2026-11-06
> Depends on: `REQUIREMENTS.md`, `DECISIONS.md`, `DESIGN.md` (Parts 3A and 3B approved)

Goal of this part: decide **how the app is built** before writing code, so Milestone M0 (scaffold) can start without open questions. Everything here is sized for a solo developer and a client-only app.

## 1. Constraints that shape the design

| Constraint | Source | Consequence |
|---|---|---|
| No accounts, no server in the MVP | ADR-007 | Pure client-side app; static hosting |
| Data stays in the browser, may move to an API later | ADR-007 | Storage hidden behind an interface |
| Durations are whole minutes | ADR-003 | No floating-point time math |
| One page, all actions in modals | DESIGN §2, §22 | No router in the MVP |
| Public repo, CV showcase | ADR-010 | Clean structure, tests, CI, readable README |
| Junior dev, solo | Brief | Few moving parts, mainstream tools, pure and testable logic |

## 2. Tech stack

| Area | Choice | Why |
|---|---|---|
| Language | **TypeScript** (strict) | Catches data-shape bugs; already known |
| UI | **React 18+** | Already known |
| Build | **Vite** | Fast dev server, simple static build |
| Styling | **Tailwind CSS**, design tokens in `tailwind.config` (colors, fonts, radius from DESIGN §13–15) | Matches the token-based visual spec |
| Modals | **Radix UI Dialog** (unstyled) | Focus trap, Esc, focus restore, ARIA roles done correctly (DESIGN §9) without hand-rolling |
| Icons | **Lucide** (`lucide-react`) | DESIGN §18 |
| Animation | **Framer Motion**, **canvas-confetti** | DESIGN §17; both lazy-loaded where possible |
| Fonts | **Fredoka** and **Nunito**, self-hosted via `@fontsource` | DESIGN §14, no third-party font requests |
| Tests | **Vitest** + **React Testing Library** | Same config as Vite |
| Lint/format | **ESLint** + **Prettier** | Consistency |
| CI | **GitHub Actions** | Lint, typecheck, test, build on every push |
| Hosting | **Vercel** (static) | Free, preview deploys per branch, custom domain later |

No state library, no router, no backend, no UI kit in the MVP.

## 3. Architecture overview

Three layers, dependencies point downward only.

```
UI (components)        React components, hooks. No business rules here.
   │
State (store)          useReducer + Context. Actions in, new AppData out. Calls storage to persist.
   │
Domain (pure logic)    Plain TypeScript functions: validation, time math, status, slots, stats.
   │
Storage (adapter)      Interface + localStorage implementation. Knows nothing about React.
```

Rules:
1. **Domain is pure**: no React, no `localStorage`, no `Date.now()` inside (time and ids are passed in). This makes it trivial to unit test.
2. **UI never touches storage directly**; it dispatches actions.
3. **Storage never contains business rules**; it only loads and saves a validated `AppData` blob.

## 4. Folder structure

```
piggy-hours/
├─ src/
│  ├─ domain/            pure logic + types (no React)
│  │  ├─ types.ts        Pig, Deposit, AppData
│  │  ├─ time.ts         parse/format minutes ("1h 30m"), local date helpers
│  │  ├─ pigs.ts         status(), progress(), remaining(), mood()
│  │  ├─ validation.ts   validatePigInput(), validateDeposit()
│  │  ├─ slots.ts        slot limit from completed count, canCreatePig()
│  │  ├─ stats.ts        dailyTotals(), streak(), weekTotal(), last30Days() (MVP)
│  │  └─ *.test.ts
│  ├─ storage/
│  │  ├─ storage.ts      Storage interface
│  │  ├─ localStorage.ts implementation, versioning, migrations
│  │  ├─ migrations.ts
│  │  └─ *.test.ts
│  ├─ state/
│  │  ├─ reducer.ts      actions: createPig, addDeposit, completePig, ...
│  │  ├─ AppProvider.tsx context, loads data, persists after each action
│  │  └─ *.test.ts
│  ├─ components/
│  │  ├─ ui/             Button, Input, Modal, ProgressBar, Toast, Badge
│  │  ├─ pig/            PigIllustration, PigCard, PigList
│  │  ├─ modals/         CreatePigModal, AddTimeModal, PigFullModal, CompleteModal
│  │  └─ sections/       Hero, HowItWorks, YourPigs, Moods, Stats, Benefits, Faq, Footer
│  ├─ styles/            tailwind entry, fonts
│  ├─ App.tsx, main.tsx
│  └─ test/              setup, test helpers
├─ public/               favicon, og image
├─ docs/                 PROJECT_BRIEF, REQUIREMENTS, DECISIONS, DESIGN, ARCHITECTURE
├─ .github/workflows/ci.yml
├─ README.md, LICENSE, CHANGELOG.md
└─ vite / tailwind / tsconfig / eslint / prettier configs
```

## 5. Data model (TypeScript)

```ts
type Pig = {
  id: string;
  name: string;               // 1–40 chars
  targetMinutes: number;      // whole, 60 .. 600_000 (1–10,000 h)
  emoji: string;
  color: string;              // token key, not a free hex
  deadline?: string;          // 'YYYY-MM-DD' (local date)
  createdAt: string;          // ISO 8601 UTC
  completedAt?: string;       // ISO 8601 UTC
};

type Deposit = {
  id: string;
  pigId: string;
  date: string;               // 'YYYY-MM-DD', the day the time was spent (local)
  minutes: number;            // whole, >= 1
  note?: string;
  createdAt: string;          // ISO 8601 UTC
};

type AppData = {
  version: number;            // schema version, starts at 1
  pigs: Pig[];
  deposits: Deposit[];
  achievements: { completedPigsCount: number };
};
```

Derived, never stored: `savedMinutes` (sum of the pig's deposits), `remainingMinutes`, `progress %`, `status` (`active` → `full` → `completed`), `mood` (from progress band, DESIGN §16), `slotLimit`.

Dates: the day a deposit belongs to is stored as a **local calendar date string**, so the heatmap and streaks do not shift with time zones. Timestamps (`createdAt`, `completedAt`) are UTC ISO strings.

## 6. Storage layer

```ts
interface Storage {
  load(): Result<AppData, StorageError>;
  save(data: AppData): Result<void, StorageError>;
}
```

- One key, `piggy-hours:v1`, holding the whole `AppData` as JSON (the data is small; one blob keeps saves atomic).
- **Versioned schema** with `migrations.ts` (`version N → N+1`). Unknown or corrupted data is not overwritten silently: the raw string is copied to `piggy-hours:backup-<timestamp>` and the app starts empty with a banner (DESIGN S7).
- Failures (storage disabled, quota exceeded) return an error; the state layer shows the **storage error banner** and keeps working in memory.
- Loaded data is validated with a small hand-written type guard (no schema library in the MVP).
- A future API implementation only has to satisfy the same interface (this is the ADR-007 promise).

## 7. State management

- `useReducer` with typed actions, exposed through one context (`AppProvider`) and a `useApp()` hook.
- Actions: `createPig`, `addDeposit`, `completePig` (v1.0: `editPig`, `deletePig`, `importData`).
- Each action calls the domain validators first; invalid actions return an error to the caller and do **not** change state.
- After every state change, `AppProvider` saves through the Storage interface (effect).
- Ids come from `crypto.randomUUID()`, and "now" from a clock passed into the provider, so tests are deterministic.
- UI-only state (which modal is open, toasts) lives in components or a small UI context, **not** in `AppData`.

## 8. Key business rules in code (all in `domain/`)

| Rule | Where | Notes |
|---|---|---|
| Deposit ≤ remaining (BR) | `validateDeposit` | Returns `{ error: 'TOO_MUCH', remaining }` so the UI can offer **Fill the pig** |
| Fill the pig | `remaining(pig)` | Button sets the inputs to the exact remainder |
| Status lifecycle | `status(pig, deposits)` | `completedAt` → completed; saved ≥ target → full; else active |
| Slots | `slotLimit(completedCount)` | 0→2, 2→3, 5→4, 10→5, max 5; `canCreatePig` counts active and full pigs |
| Target range | `validatePigInput` | 1–10,000 whole hours, converted to minutes |
| Hours + minutes input | `parseDuration(hours, minutes)` | Empty field counts as 0; no decimals; minutes 0–59; total ≥ 1 |
| Heatmap data (MVP) | `dailyTotals(deposits, range)` | Sums minutes per local date; level thresholds (under 1h, 1–2h, 2–3h, 3h+) in one place |

## 9. UI composition and accessibility

- `App` renders the sections in order (DESIGN §22). The pig list and modals are the only stateful parts.
- `Modal` wraps Radix Dialog with the shared overlay and card styles; each specific modal is a thin form component.
- Forms use controlled inputs; errors are shown next to the field and linked with `aria-describedby`; typed input is never cleared on error (DESIGN §1.4).
- `ProgressBar` renders a real `role="progressbar"` with text.
- `prefers-reduced-motion` disables confetti and pig animations (DESIGN §17).
- The heatmap is a presentational component fed by `dailyTotals`; it renders a text summary for screen readers (DESIGN §22.1).

## 10. Testing strategy

| Level | Tool | What | Target |
|---|---|---|---|
| Unit | Vitest | `domain/` (every rule above, edge cases from REQUIREMENTS), `storage/` (round trip, migration, corrupted data, quota error), `reducer` | **Most of the effort; aim for ~100% of `domain/`** |
| Component | Testing Library | Create pig, add time (including the too-much error and Fill the pig), pig full, complete | Main flows F1–F6 |
| Manual | Checklist in `docs/` | Keyboard-only run, mobile width, reduced motion | Before each release |
| End-to-end | Playwright | Deferred; consider after v1.0 | Not in MVP |

A change is "done" only when the related tests pass in CI.

## 11. Tooling, CI and deployment

- **Scripts:** `dev`, `build`, `preview`, `lint`, `typecheck`, `test`, `format`.
- **CI** (`.github/workflows/ci.yml`) on push and pull request: install, lint, typecheck, test, build.
- **Branching:** trunk-based with short-lived feature branches and pull requests into `main`, even solo (keeps history readable for the CV). **Conventional Commits**, **SemVer** tags per milestone.
- **Deployment:** Vercel connected to the repo; `main` deploys to production, every branch gets a preview URL. Custom domain added later (ADR: deferred).
- **Performance budget:** initial JS under ~150 KB gzipped; Lighthouse performance and accessibility ≥ 90 (REQUIREMENTS NFRs).
- **Privacy:** no analytics and no third-party requests in the MVP.

## 12. Technical decisions (approved 2026-11-06, all as recommended)

| # | Question | Recommended default |
|---|---|---|
| T1 | State management | **`useReducer` + Context**, no library (the app is small) |
| T2 | Modals | **Radix UI Dialog** for correct focus and ARIA behavior, styled with Tailwind |
| T3 | Styling | **Tailwind CSS** with the DESIGN tokens |
| T4 | Where do dates live | **Local `YYYY-MM-DD` strings** for deposit and deadline dates; UTC ISO for timestamps |
| T5 | Storage shape | **One JSON blob** under a versioned key, with migrations and a backup copy on corruption |
| T6 | Router | **None in the MVP** (single page, anchors); reconsider only if a feature needs real routes |
| T7 | Tests | **Vitest + Testing Library**; Playwright deferred until after v1.0 |
| T8 | Branching and commits | **Trunk-based, PRs even solo, Conventional Commits, SemVer** |

## 13. Future: 3D visual upgrade (after v1.0)

The author plans a more striking look with 3D effects after v1.0 (US-17, ADR-013). The MVP architecture supports this without rework:

- `PigIllustration` is the single place that draws the pig; a 3D version can replace it behind the same props (`progress`, `mood`, `color`, `size`).
- Visual values come from tokens, and animation is isolated in components, so a new look does not touch the domain, state or storage layers.
- Likely tools to evaluate then: three.js with react-three-fiber (or CSS 3D transforms for light effects). They are lazy-loaded so the MVP bundle stays under budget, with a 2D fallback for reduced motion and low-end devices.
- No 3D dependency is added before milestone M9.

## 14. Next phase

Phase 4 — Planning: `ROADMAP.md`, milestones M0 to M7 as GitHub milestones, issues per user story with acceptance criteria, LICENSE confirmation (MIT proposed), and the Definition of Done.
