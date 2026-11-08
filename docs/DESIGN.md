# DESIGN — Piggy Hours

> Status: **Draft v0.3** · Phase 3 (Design) — **Parts 3A, 3B and 3C approved; Phase 3 complete**
> Last updated: 2026-11-06
> Depends on: `REQUIREMENTS.md` v0.3, `DECISIONS.md`

Phase 3 is reviewed in three parts, each needing approval before the next:

| Part | Content | Status |
|---|---|---|
| **3A** | UX principles, sitemap, user flows, screens, wireframes, microcopy | **Approved** (2026-11-05), decisions D1–D7 accepted as recommended; layout superseded by the one-page landing structure (section 22) |
| **3B** | Visual style: palette, typography, spacing, pig illustration, motion | **Approved** (2026-11-06), V1–V7 accepted as recommended |
| 3C | Technical design: architecture, folder structure, storage layer, state, testing approach | **Approved** (2026-11-06), see `ARCHITECTURE.md`, T1–T8 accepted as recommended |

> **Note on layout (2026-11-06):** the product is a **single landing page** with all actions in **modals** (overlay layer), not separate screens or bottom sheets. Sections 2–5 and 10 were written before this decision; where they say "sheet" or "Home", read **modal** and **"Your pigs" section**. The authoritative layout is section 22, and the visual reference is the design canvas (landing page v3 plus modals).

---

## 1. Design principles

1. **Mobile-first.** Design for a 360 px wide phone first; desktop is the phone layout with more room.
2. **One main action per screen.** The most important action is the most prominent button.
3. **Fast to log.** Dropping time into a pig should take as few taps as possible (target: ≤ 3 taps from the home screen).
4. **Forgiving.** Prevent mistakes with limits and clear messages instead of silent failures. Never lose the user's typed input on an error.
5. **Cute, but clear.** Personality lives in the visuals and copy; labels and numbers stay plain and readable.
6. **Celebrate progress.** Reaching "full" is the emotional high point; it gets a distinct, rewarding moment.
7. **Accessible by default.** Keyboard operable, readable contrast, meaningful labels, reduced-motion respected.

## 2. Sitemap and routes

| Route | Screen | Release |
|---|---|---|
| `/` | The one-page site: hero, how it works, *Your pigs*, pig moods, stats, FAQ. *Create pig*, *Add time*, *Pig full* and *Complete confirmation* open as modals over the page | **MVP** |

**The whole product is one page (`/`)**, decided 2026-11-05. Later features (pig detail and history, completed-pigs shelf, backup/restore, settings) also open as modals or as sections on this page, not as separate routes. Section anchors (`#how`, `#pigs`, `#stats`, `#faq`) are used for navigation.

## 3. User flows

### F1 · First visit
1. User opens the app → Home with **empty state** ("Your piggy bank is empty").
2. Taps **Create your first pig** → *Create pig* sheet.
3. Fills in name and target hours, optionally picks emoji/color/deadline → **Create pig**.
4. Sheet closes; Home shows the new pig at 0%.

### F2 · Create a pig
1. From Home, taps **New pig**.
2. *If slots are full:* the button is disabled; a hint explains "All pig slots are in use. Complete a pig to free a slot." Flow ends.
3. *Else:* *Create pig* sheet opens → user fills the form.
4. Validation runs when the user taps **Create pig** (and per field after it loses focus). Errors appear next to the field.
5. On success: sheet closes, the new pig appears, slot counter updates.

### F3 · Deposit time (main flow)
1. On a pig card, taps **Add time** → *Add time* sheet opens, focused on the hours field.
2. Enters hours and/or minutes (or taps a quick-pick: 30m / 1h / 2h). Date defaults to today; note is optional.
3. Taps **Drop into pig**.
4. *If time > remaining:* inline error "Only Xh Ym left in this pig" with a **Fill the pig** button. Tapping it fills the fields with exactly the remaining time; the user taps **Drop into pig** again. (Input is never cleared.)
5. *Else:* sheet closes, the card's progress updates immediately, and a short toast confirms "Added 1h 30m to *Japanese N3*".
6. *If the deposit made the pig full:* continue with F4.

### F4 · Pig becomes full
1. The deposit that reaches the target triggers the **Pig full** dialog: celebration, "Your pig is full!", the pig's name and total saved.
2. Buttons: **Mark as completed** (primary) and **Later** (secondary).
3. **Later:** dialog closes; the card stays on Home in the *full* state (distinct look, badge, **Mark as completed** button instead of **Add time**).
4. **Mark as completed:** continue with F5.

### F5 · Complete a pig
1. User taps **Mark as completed** (from the dialog or the card).
2. A confirmation dialog: "Complete this pig? It will move to your shelf and free up a slot." → **Complete** / **Cancel**.
3. On **Complete:** the pig gets `completedAt`, leaves Home, the slot frees up, a toast confirms "Nice work! *Japanese N3* is complete 🎉". If a slot is now free, **New pig** becomes enabled again.

### F6 · Slots are full
1. Both slots hold `active` or `full` pigs → **New pig** is disabled.
2. A text hint under the button explains why and what to do (complete a pig).
3. (v1.0) The hint also shows progress toward the next unlock: "Complete 2 pigs to unlock a 3rd slot (0/2)".

## 4. Screen inventory (MVP)

| ID | Screen / component | Type | Purpose |
|---|---|---|---|
| S1 | Home — empty | Page state | Invite the first pig |
| S2 | Home — with pigs | Page | See all pigs and progress; entry point to all actions |
| S3 | Create pig | Sheet | Create a pig (US-01) |
| S4 | Add time | Sheet | Deposit time (US-02) |
| S5 | Pig full | Dialog | Celebrate and offer completion (US-02, US-04) |
| S6 | Complete confirmation | Dialog | Confirm completing a pig (US-04) |
| S7 | Storage error | Banner | Tell the user when saving fails (e.g. storage full/disabled) |

*Sheet* in this table now means a **modal**: a centered dialog on desktop and a near-full-width dialog on phones, over a dimmed overlay (see the canvas).

## 5. Wireframes

Low-fidelity, 360 px wide phone. They show structure and content, not final styling (that is Part 3B). Pig illustrations are represented by 🐷.

### S1 · Home — empty state
```
┌────────────────────────────────────┐
│ 🐷 Piggy Hours                     │
├────────────────────────────────────┤
│                                    │
│                                    │
│              ( 🐷 )                │
│        big, sleepy pig             │
│        illustration                │
│                                    │
│    Your piggy bank is empty        │
│  Set a goal in hours and start     │
│   dropping time into your pig.     │
│                                    │
│    [  Create your first pig  ]     │
│                                    │
│                                    │
└────────────────────────────────────┘
```

### S2 · Home — with pigs (one active, one full)
```
┌────────────────────────────────────┐
│ 🐷 Piggy Hours                     │
├────────────────────────────────────┤
│ Your pigs                  2 / 2   │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 🐷  Japanese N3                │ │
│ │                                │ │
│ │ ████████░░░░░░░░░░░░░    42%   │ │
│ │ 126h 30m / 300h                │ │
│ │ Deadline: Mar 31 (v1.0)        │ │
│ │                                │ │
│ │ [        + Add time        ]   │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ 🐷  React course   ★ FULL      │ │
│ │                                │ │
│ │ ████████████████████    100%   │ │
│ │ 40h 0m / 40h                   │ │
│ │                                │ │
│ │ [   Mark as completed    ]     │ │
│ └────────────────────────────────┘ │
│                                    │
│  [        + New pig         ]      │
│  (disabled) All pig slots are in   │
│  use. Complete a pig to free one.  │
└────────────────────────────────────┘
```
Notes:
- The header counter shows used / available slots.
- The pig card shows a progress bar and a static pig in the MVP; the growing/animated pig arrives in v1.0 (US-12).
- A **full** pig swaps the primary button from **Add time** to **Mark as completed** and gets a badge and a distinct look.
- The deadline line only appears for pigs that have a deadline (US-10). Below the numbers, a pig card shows up to two guidance lines (M7): days left with the time needed per day (only with a deadline), and "At your recent pace" with the estimated finish date, plus an ahead, on or behind schedule badge when there is a deadline. With fewer than 3 saving days it reads "Not enough data to estimate yet". Full and completed pigs show neither.

### S3 · Create pig (sheet)
```
┌────────────────────────────────────┐
│ New pig                        [✕] │
│                                    │
│ Name                               │
│ [ e.g. Learn Japanese N3         ] │
│ 0 / 50                             │
│                                    │
│ Target (hours)                     │
│ [ 300                            ] │
│ A whole number from 1 to 10,000    │
│                                    │
│ Pick an emoji                      │
│ ( 🐷 )( 📚 )( 💻 )( 🎸 )( 🏃 )( ✍ ) │
│                                    │
│ Pick a color                       │
│ (●)(●)(●)(●)(●)(●)                 │
│                                    │
│ ▢ Set a deadline (optional)        │
│   [ Mar 31, 2027  📅 ]             │
│                                    │
│ [         Create pig         ]     │
└────────────────────────────────────┘
```
Validation messages (inline, under the field): "Give your pig a name", "Name is too long (max 50)", "Enter a whole number of hours between 1 and 10,000", "Deadline can't be in the past".

### S4 · Add time (sheet)
```
┌────────────────────────────────────┐
│ Add time to Japanese N3        [✕] │
│                                    │
│ How long did you spend?            │
│ [  1  ] hours   [ 30 ] minutes     │
│ Quick: (30m) (1h) (2h)             │
│                                    │
│ Date                               │
│ [ Today, Nov 4              ▾ ]    │
│                                    │
│ Note (optional)                    │
│ [ Chapter 5 vocabulary         ]   │
│                                    │
│ Remaining in this pig: 173h 30m    │
│                                    │
│ [        Drop into pig        ]    │
└────────────────────────────────────┘
```

**S4 error state — time exceeds what's left:**
```
│ [  3  ] hours   [  0 ] minutes     │
│ ⚠ Only 1h 0m left in this pig.     │
│   [ Fill the pig ]                 │
│                                    │
│ [        Drop into pig        ]    │
```
Other messages: "Enter at least 1 minute", "Minutes must be between 0 and 59", "Choose today or an earlier date".

### S5 · Pig full (dialog)
```
┌────────────────────────────────────┐
│          🎉  ✨  🎉                │
│            ( 🐷 )                  │
│       Your pig is full!            │
│                                    │
│   You saved 40h for                │
│   "React course"                   │
│                                    │
│   [     Mark as completed     ]    │
│   [          Later            ]    │
└────────────────────────────────────┘
```

### S6 · Complete confirmation (dialog)
```
┌────────────────────────────────────┐
│ Complete this pig?                 │
│                                    │
│ "React course" will move to your   │
│ shelf and free up a slot.          │
│                                    │
│ [  Cancel  ]      [  Complete  ]   │
└────────────────────────────────────┘
```

### Desktop layout (≥ 768 px)
```
┌──────────────────────────────────────────────────────────┐
│ 🐷 Piggy Hours                                           │
├──────────────────────────────────────────────────────────┤
│              (content centered, max width ~ 960 px)      │
│  Your pigs                                      2 / 5    │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │ pig card         │  │ pig card         │              │
│  └──────────────────┘  └──────────────────┘              │
│  ┌──────────────────┐                                    │
│  │ pig card         │      [ + New pig ]                 │
│  └──────────────────┘                                    │
└──────────────────────────────────────────────────────────┘
```
Cards sit in a 2-column grid from 768 px; sheets become centered modals.

## 6. Component inventory (preliminary, for Milestone M1)

| Component | Used in | Notes |
|---|---|---|
| `Button` (primary / secondary / ghost, disabled, loading) | everywhere | One primary button per view |
| `Card` | pig card | Rounded, soft shadow |
| `Sheet` / `Modal` | S3, S4, S5, S6 | Bottom sheet on mobile, modal on desktop; focus trap; Esc closes |
| `TextField`, `NumberField` | S3 | Label, hint, error, character counter |
| `DurationInput` (hours + minutes) | S4 | Two numeric fields, shared validation, returns whole minutes |
| `QuickPick` chips | S4 | 30m / 1h / 2h |
| `EmojiPicker`, `ColorSwatches` | S3 | Small fixed sets |
| `DateField` | S3, S4 | Native date input first; custom later if needed |
| `ProgressBar` | pig card | Shows percentage and fill |
| `PigAvatar` | pig card, S1, S5 | Static SVG in MVP; animated in v1.0 |
| `Badge` | full pig | "FULL" |
| `Toast` | feedback | Polite live region, auto-dismiss |
| `EmptyState` | S1 | Illustration, text, call-to-action |
| `Banner` | S7 | Persistent error/warning |

These are built and shown on a `/playground` page in M1 before any feature uses them.

## 7. Microcopy (English)

| Where | Text |
|---|---|
| App tagline | "Save your hours. Fill your pig." |
| Empty state title | "Your piggy bank is empty" |
| Empty state body | "Set a goal in hours and start dropping time into your pig." |
| Empty state button | "Create your first pig" |
| Slots hint | "All pig slots are in use. Complete a pig to free one." |
| Deposit button | "Drop into pig" |
| Deposit success toast | "Added 1h 30m to *Japanese N3*" |
| Over-remaining error | "Only 1h 0m left in this pig." + button "Fill the pig" |
| Full dialog title | "Your pig is full!" |
| Complete confirmation | "Complete this pig? It will move to your shelf and free up a slot." |
| Complete success toast | "Nice work! *Japanese N3* is complete 🎉" |
| Storage failure banner | "We couldn't save your data. Your browser storage may be full or disabled." |

Tone: friendly, short, encouraging; no jargon; no blame in error messages.

## 8. States to design for each screen

- **Empty** — no pigs yet.
- **Normal** — pigs with various progress (0%, partial, 99%).
- **Full** — pig at 100%, awaiting completion.
- **Disabled** — New pig when slots are full; Add time on completed pigs (not shown).
- **Error** — validation errors, storage failure.
- **Loading** — storage is local and synchronous, so no loading spinners are expected in the MVP (kept in mind for a future API).

## 9. Accessibility notes (design level)

- Sheets and dialogs trap focus, restore focus to the trigger on close, and close with Esc.
- Every input has a visible label (placeholder text is never the only label); errors are linked to their field and announced to screen readers.
- Progress is exposed as a real progress element with text ("42%, 126h 30m of 300h"), not only as color or width.
- Toasts use a polite live region; dialogs use proper dialog roles and titles.
- Emoji and color pickers are operable by keyboard and have text labels.
- Status is never conveyed by color alone (the FULL badge has text).
- Tap targets are at least 44 × 44 px.

## 10. Design decisions (approved 2026-11-05)

| # | Question | Recommended default |
|---|---|---|
| D1 | Where does the user start a deposit? | **A button on each pig card** (shown in the wireframes), rather than one global "+" button, because the pig is chosen implicitly |
| D2 | Create / Add time as separate pages or as sheets? | **Sheets** (bottom sheet on mobile, modal on desktop): faster, no navigation, keeps the MVP on a single page |
| D3 | What happens when a pig becomes full? | **Celebration dialog** with *Mark as completed* / *Later*; the card stays in the *full* state until completed |
| D4 | Confirm before completing a pig? | **Yes**: completing is irreversible in the MVP |
| D5 | Home layout | **One column on mobile, 2-column grid from 768 px**; max content width ~ 960 px |
| D6 | Where is slot usage shown? | **In the "Your pigs" header** (`2 / 2`) plus a hint under the disabled *New pig* button |
| D7 | Greeting or user name? | **None** (no accounts) |

## 11. Next parts

- **3B — Visual style:** approved (sections 12–20).
- **3C — Technical design:** see `ARCHITECTURE.md`.

---

# Part 3B — Visual style

> Status: **Approved** (2026-11-06). A visual preview (palette, five pig expressions, two pig cards) accompanied the first draft in the conversation.

## 12. Visual direction

**Mood:** cozy, cute, rewarding. Think "sticker on a warm paper background": cream page, soft pink pig, rounded shapes, gentle shadows, a little gold when something is achieved.

**Rules of thumb**
- Pink is the brand color and the main action color; gold is reserved for *achievement* (full pigs, completed goals).
- Lots of whitespace and rounded corners; nothing sharp.
- Text is always dark ink on light surfaces for readability; pastel colors are for fills, never for text.
- Personality comes from the pig and the copy, not from decoration.

## 13. Color tokens

Semantic names are used in code so a dark theme can be added later by overriding values only.

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#FFF8F0` | Page background (cream) |
| `--color-surface` | `#FFFFFF` | Cards, sheets, dialogs |
| `--color-border` | `#F3D6E0` | Card and field borders |
| `--color-text` | `#3D2B35` | Primary text (ink) |
| `--color-text-muted` | `#7A6670` | Secondary text, hints |
| `--color-primary` | `#C93A6F` | Primary buttons, links, focus ring |
| `--color-primary-hover` | `#B02F5E` | Primary button hover/pressed |
| `--color-on-primary` | `#FFFFFF` | Text/icons on primary |
| `--color-coin` | `#F5B833` | Gold for full pigs, the time clock, sparkles (the token keeps its old name) |
| `--color-coin-strong` | `#C98B0B` | Gold outlines |
| `--color-warning-bg` / `--color-warning-text` | `#FFE9A8` / `#6B4700` | "Full" badge, warnings |
| `--color-danger` / `--color-danger-bg` | `#B3261E` / `#FFE5E1` | Errors, destructive actions |
| `--color-track` | `#FFE3EC` | Progress bar track |

**Pig colors** (the six swatches users can pick in the *Create pig* sheet). Each has a soft tone (pig body) and a strong tone (progress bar fill):

| Name | Soft | Strong (tuned in M1) |
|---|---|---|
| Pink | `#FFC2D6` | `#DD4F85` |
| Peach | `#FFD3B8` | `#CF6320` |
| Butter | `#FFE9A8` | `#A87700` |
| Mint | `#BFEAD9` | `#2A8F6B` |
| Sky | `#C9E4FF` | `#2F7FCF` |
| Lavender | `#E0D4FF` | `#7A60CC` |

**Contrast:** ink on cream is about 12:1, muted text on cream about 5:1, white on primary about 4.9:1 (all expected to pass WCAG AA for normal text). **Verified in Milestone M1 (2026-11-06)** with the WCAG formula: ink on cream 12.5:1, muted on cream 5.0:1, white on primary 4.9:1, primary links on cream 4.6:1, warning text 6.9:1, danger text 6.5:1 (all pass AA). The strong pig tones were darkened so every progress fill reaches at least 3:1 against the track (3.2 to 4.0). The gold fill of a full pig has a darker gold edge. The numeric label next to every bar means meaning never depends on color alone.

## 14. Typography

| Role | Font | Notes |
|---|---|---|
| Headings, buttons, numbers | **Fredoka** (weight 500) | Rounded, friendly, free (OFL license) |
| Body, labels, forms | **Nunito** (400 and 700) | Rounded and very readable at small sizes (OFL) |

- Self-host the fonts (e.g. `@fontsource/fredoka`, `@fontsource/nunito`) instead of loading them from a third-party CDN: better performance and privacy, no external requests.
- Use **tabular numbers** (`font-variant-numeric: tabular-nums`) for durations and percentages so values don't jiggle as they change.

| Step | Size | Line height | Use |
|---|---|---|---|
| caption | 12 px | 1.4 | Hints, badges |
| small | 14 px | 1.5 | Meta text, labels |
| body | 16 px | 1.5 | Default text, inputs (16 px avoids iOS zoom-on-focus) |
| h3 | 20 px | 1.3 | Pig names, sheet titles |
| h2 | 24 px | 1.25 | Section headings |
| h1 | 32 px | 1.2 | Page title, empty-state title |
| display | 40 px | 1.1 | Celebration dialog |

## 15. Shape, spacing and elevation

| Token | Value |
|---|---|
| Radius | `sm 12px` · `md 16px` · `lg 24px` (cards) · `xl 32px` (sheets) · `pill 999px` (buttons, bars, badges) |
| Spacing scale (4 px base) | 4 · 8 · 12 · 16 · 24 · 32 · 48 |
| Border | 2 px solid `--color-border` ("soft sticker" edge) |
| Card shadow | `0 6px 18px rgba(201, 58, 111, 0.10)` |
| Sheet shadow | `0 -8px 32px rgba(61, 43, 53, 0.16)` |
| Focus ring | 2 px offset ring in `--color-primary` on every interactive element; never removed |
| Minimum tap target | 44 × 44 px; primary buttons ~48 px tall |

## 16. Pig illustration

- The pig is an **original SVG character** built as a React component, parametrized by `expression`, `scale` and `color`. Drawn in code, so it stays crisp, themeable and animatable.
- Only one illustration style: flat shapes, rounded forms, a soft outline slightly darker than the body, a slot on the back where time drops in.
- **Expression and size follow progress** (5 states). The belly grows slightly with progress, which delivers the "pig getting fuller" feeling even before any animation exists.

| Progress | Expression | Body scale | Extras |
|---|---|---|---|
| 0–24% | Sleepy (eyes closed) | 0.88 | — |
| 25–49% | Curious (round eyes) | 0.94 | — |
| 50–74% | Happy (eyes + smile) | 1.00 | — |
| 75–99% | Excited (sparkly eyes, blush, bigger smile) | 1.05 | Blush cheeks |
| 100% | Overjoyed (happy-closed eyes, blush, big smile) | 1.10 | Gold clock on top, sparkles |

- **User color** tints the pig's body (soft tone); the outline uses a darker shade of the same hue.
- **Emoji role:** the chosen emoji appears as a small **sticker next to the pig's name** (e.g. a book for studying), not as the avatar. The pig is always the avatar.
- **Where it appears:** empty state (large sleepy pig), pig cards (small), *Pig full* dialog (large, overjoyed), app header (tiny logo).
- **Originality and license:** the character is created for this project and must not imitate existing mascots or characters. The SVG source lives in the repository under the project license. If any AI assistance is used for drawing, it must be edited into an original result and its origin noted in the docs.
- **MVP scope:** expression and body scale switch with progress as a static SVG. Motion arrived in M6 (US-12): squish and a clock dropping in on deposit, bounce and confetti when full, twinkling sparkles on an overjoyed pig.

## 17. Motion

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 120 ms | Hover, press |
| `--dur-base` | 200 ms | Toasts, dialogs fade |
| `--dur-slow` | 320 ms | Sheets sliding up |
| `--ease-out` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Default |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful "pop" |

| Moment | Motion | Release |
|---|---|---|
| Button press | Scale to 0.97 | MVP |
| Sheet / dialog open | Slide up + fade, 320 ms | MVP |
| Progress bar update | Fill animates ~600 ms | MVP |
| Deposit confirmed | A clock drops into the slot, pig squishes slightly (~450 ms) | v1.0 |
| Pig becomes full | Pig bounce + confetti (~1.5 s, loaded on demand) | v1.0 |

- **Reduced motion:** when the system prefers reduced motion, replace slides/bounces with short fades (≤ 100 ms) and skip confetti, showing a static sparkle instead.
- **Sound:** none in the MVP. If added later, it is **off by default** with a settings toggle.
- Suggested tools (decided in 3C): Framer Motion for UI motion, `canvas-confetti` for celebration.

## 18. Icons and imagery

- UI icons: **Lucide** (open source, consistent line style). Used sparingly: plus, close, calendar, check.
- Emoji stickers use the device's native emoji (their look varies by OS; accepted).
- No stock photos. All imagery is the pig illustration and simple shapes.

## 19. Dark mode

Not part of the MVP or v1.0 Must items (it is a "Could", US-14). Semantic color tokens (section 13) are used everywhere so a dark palette can be added later without touching components.

## 20. Visual decisions (approved 2026-11-06)

| # | Question | Recommended default |
|---|---|---|
| V1 | Overall direction | **Cream background + bubblegum-pink primary + gold for achievements** (as previewed) |
| V2 | Fonts | **Fredoka** for headings/buttons/numbers, **Nunito** for body; both self-hosted |
| V3 | Card style | **"Soft sticker"**: 2 px soft border, 24 px radius, soft pink shadow (vs. completely flat) |
| V4 | Pig | **Original SVG pig with 5 expressions** tied to progress bands, belly grows slightly, tinted by the user's chosen color; **emoji becomes a small sticker next to the name**; static in the MVP, animated in v1.0 |
| V5 | Primary button | **Pill-shaped, `#C93A6F` with white text, Fredoka 500** |
| V6 | Motion and sound | **Moderate, playful motion; respects reduced motion; no sound in the MVP** |
| V7 | Dark mode | **Later** (Could), but use semantic tokens now |

## 21. Next part

**3C — Technical design:** see `ARCHITECTURE.md`.

---

# Part 3A addendum — One-page landing structure (approved 2026-11-06)

## 22. Landing page structure (version v3)

Single page, top to bottom. Visual reference: canvas board *Landing page v3*.

| # | Section | Anchor | Content | Release |
|---|---|---|---|---|
| 1 | Header | — | Logo, nav (How it works, Your pigs, Meet the pig), **Start saving** button | MVP |
| 2 | Hero | — | Badge "No timers. Just progress.", H1 "Save your hours. Fill your pig.", one short paragraph, **Create your first pig** + "See how it works", large happy pig | MVP |
| 3 | How it works | `#how` | Three cards: Set a goal, Drop in your time, Fill your pig | MVP |
| 4 | Your pigs | `#pigs` | **The app area.** Pig cards with progress and **Add time** / **Mark as completed**, slot counter (`2 / 2 slots`), **New pig** button (disabled with hint when slots are full), empty state when there are no pigs | MVP |
| 5 | Pig moods | `#moods` | Five expression cards: Sleepy, Curious, Happy, Excited, Overjoyed | MVP |
| 6 | Your stats | `#stats` | Four stat tiles (this week, last 30 days, day streak, active days) and the **saving-days heatmap** (22.1) | **MVP** (D8) |
| 7 | Made to feel good | — | Three short benefits and a closing **Start your first pig** button | MVP |
| 8 | FAQ | `#faq` | Five collapsible questions (account, data loss, timer, extra time, more pigs) | MVP |
| 9 | Footer | — | Name and tagline | MVP |

The intro stays short on purpose: visitors mostly want to try the feature, so the *Your pigs* section is reachable from the first screen (hero button and nav).

### 22.1 Saving-days heatmap (GitHub-style)

- A grid of squares: **columns are weeks, rows are days (Mon to Sun)**, covering the last 26 weeks; the current week ends at today (future days are left empty).
- **One square per day.** A day with no deposits is the lightest pink; days with deposits are shaded in 4 steps by total time that day: under 1h, 1–2h, 2–3h, 3h or more.
- Month labels above the columns, "Mon / Wed / Fri" labels on the left, a "Less → More" legend below.
- Hovering (or focusing) a square shows a tooltip: date and total time, or "no time".
- Accessibility: the grid has a text summary (number of active days and current streak) for screen readers; shade is never the only cue, the tooltip gives exact values. On phones (under 640 px) the grid shows the last 16 weeks, with squares that fill the card width and no scrollbar (changed 2026-11-07 after review; the first version scrolled sideways).
- Data: total minutes per day, derived from deposits (no extra stored data).

### 22.2 Modals

*Create pig*, *Add time* (normal and "too much" error states), *Pig is full*, *Complete this pig?*. All share: dimmed overlay (`rgba(61,43,53,0.5)`), centered white card with 28 px radius, focus trap, Esc to close, focus returns to the trigger. Visual reference: the modal boards on the canvas.

### 22.3 Decision (approved 2026-11-06)

| # | Question | Decision |
|---|---|---|
| D8 | Does the **Your stats** section (and its heatmap) ship in the MVP or in v1.0? | **MVP** (author's choice; the recommendation was v1.0). With no deposits yet, the section shows an empty state (zeros, lightest squares, short hint) instead of sample data. |

### 22.4 Future visual direction (post-v1.0)

The MVP and v1.0 keep the simple, clear 2D style of Part 3B. After v1.0 the author wants a more striking, playful look using **3D effects** (see US-17). Design guardrails so this stays possible: the pig is one self-contained component (`PigIllustration`) that can later be swapped for a 3D version; colors, radii and motion come from tokens; and the page layout does not depend on the pig's pixel size.

## 23. Design version history

Every design is kept so any earlier version can be restored. Files live on the design canvas.

| Version | Canvas board | What it is | Status |
|---|---|---|---|
| v1 | `Landing.dc.html` | First landing page: large hero, How it works, Your pigs, moods, Made to feel good. No stats or FAQ | Archived (restorable) |
| v2 | `Landing-v2.dc.html` | Compact version, pigs first, bar chart | Archived (not preferred) |
| **v3** | `Landing-v3.dc.html` | v1 plus Your stats (heatmap) and FAQ | **Approved** (2026-11-06) |
| Modals | `Modal*.dc.html` | New pig, Add time, Add time error, Pig is full, Complete this pig? | Current |
| Phone | `Main`, `HomePigs`, `CreatePig` | Earlier phone screens from the multi-screen layout | Archived |

Rule: before any major redesign, the current design is copied to a versioned file first.
