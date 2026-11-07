# TESTING — Piggy Hours

> Status: **v0.1** · Created in milestone M2 · Applies to every milestone

How quality is checked, and how the author tests each milestone before it is merged.

## 1. Layers

| Layer | Who | What | When |
|---|---|---|---|
| **Unit tests** (Vitest) | Automated | Pure logic in `src/domain/`: time parsing and formatting, validation, status, progress, slots. Storage adapter: round trip, migrations, corrupted data, quota errors. Reducer rules | Every push (CI) |
| **Component and flow tests** (Testing Library) | Automated | User flows through the real UI: create a pig, validation messages, focus, persistence after reload, slot limits, storage failure banners, modal keyboard behavior | Every push (CI) |
| **Quality gates** | Automated | Prettier check, ESLint, TypeScript strict, production build | Every push (CI) |
| **Browser check** | Claude, before opening a PR | Production build opened in headless Chromium at 390 px and 1280 px: no console errors, no horizontal scroll, screenshots attached to the PR | Every milestone |
| **Acceptance test** | The author | Manual walkthrough on the Vercel preview link of the pull request, using the milestone checklist below | Every milestone |
| **Release test** | The author | Longer pass including a real phone, private window and Lighthouse | M4 (MVP) and M8 (v1.0) |

Run the automated layers locally:

```bash
npm run format:check && npm run lint && npm run typecheck && npm test && npm run build
```

## 2. How a milestone is accepted

1. The work is done on a branch and a pull request is opened. CI must be green.
2. The PR description lists what changed, screenshots, and the acceptance checklist for that milestone.
3. Vercel creates a preview link for the branch. The author tests it with the checklist (desktop and phone).
4. Findings go into PR comments. Small fixes are made in the same PR; bigger changes become new issues.
5. When the author says "ok", the PR is merged, a version tag is created and the next milestone starts.

## 3. Rules for every milestone

Use these on top of the milestone-specific list.

- **Keyboard:** operate everything with Tab, Shift+Tab, Enter, Space and Esc. The focus ring is always visible. Modals trap focus, close with Esc and give focus back to the button that opened them.
- **Small screens:** at 360 px wide there is no horizontal scroll, text is not cut off, and buttons are easy to tap.
- **Reload:** after any change, refresh the page. Data is still there.
- **Private window:** open the preview in a private/incognito window. The app still works, and shows a warning if storage is blocked.
- **Visual match:** compare with the approved design (`docs/DESIGN.md`, canvas). Note anything that looks different or feels off.

## 4. Milestone checklists

### M2: create and view pigs (US-01, US-03)

| # | Steps | Expected |
|---|---|---|
| 1 | Open the page for the first time, scroll to **Your pigs** | Empty state with a sleepy pig; counter shows `0 / 2 slots` |
| 2 | Press **Create your first pig** (in the section, in the hero and at the bottom of the page) | The *New pig* modal opens each time; the Name field has focus |
| 3 | Press **Create pig** with everything empty | Errors appear under Name and Target; nothing is created; focus moves to Name |
| 4 | Type `abc`, `1.5`, `0`, `-3` and `10001` as the target | An error for each; the typed text stays in the field |
| 5 | Pick a deadline in the past | "The deadline cannot be in the past." |
| 6 | Create `Japanese N3`, 300 hours, a book emoji, mint color | The modal closes, a toast appears, a mint pig card shows `0m / 300h` and `0%`; counter `1 / 2 slots` |
| 7 | Create a second pig with a deadline | A second card shows `Due <date>`; counter `2 / 2 slots` |
| 8 | Look at **New pig** | Disabled, with "All pig slots are in use. Complete a pig to free a slot."; the hero button just scrolls to Your pigs |
| 9 | Refresh the page; then close the tab and open it again | Both pigs are still there |
| 10 | Use only the keyboard to create a pig, then press Esc inside the modal | It can be completed by keyboard; Esc closes without creating |
| 11 | Name a pig with 50 characters, and one with emoji or `<b>bold</b>` | It shows safely (no formatting), long names wrap |
| 12 | Phone: repeat 2 to 9 on a real phone | Form fits the screen, the buttons stay visible at the bottom, the date picker is usable |
| 13 | Open the preview in a private window | Works; if storage is blocked a red warning appears |

Not in M2 (arrives later): adding time (M3), completing pigs (M3), statistics (M4).

### M3: add time, complete a pig, back to top (US-02, US-04)

Start with a clean state (private window, or clear site data) and create `Japanese N3` with a target of **3 hours**.

| # | Steps | Expected |
|---|---|---|
| 1 | Press **Add time** on the pig card | The *Add time to Japanese N3* modal opens; the Hours field has focus; the date is today; "Remaining in this pig" shows `3h 0m` |
| 2 | Press **Drop into pig** with nothing entered | A red message "Enter at least 1 minute."; focus goes to Hours; nothing is saved |
| 3 | Type `abc`, `-1`, `1.5` in hours, and `75` in minutes | An error for each (whole numbers only, no negatives, minutes 0 to 59); the typed text stays |
| 4 | Press the quick picks **30m**, **1h**, **2h** | Hours and minutes fields are filled with that time |
| 5 | Enter `1` hour and `30` minutes, **Drop into pig** | The modal closes, toast "Added 1h 30m to Japanese N3"; the card shows `1h 30m / 3h`, `50%`, and the pig looks happier |
| 6 | Open **Add time**, enter `5` hours, **Drop into pig** | "Only 1h 30m left in this pig." with a **Fill the pig** button; nothing is saved |
| 7 | Press **Fill the pig** | Fields change to `1` hour `30` minutes and the error disappears |
| 8 | Pick a date in the future | "Choose today or an earlier date." (the date picker should not allow it either) |
| 9 | Add `20` hours to another pig on the same day (use a bigger target) | A yellow note says that is more than 24 hours on that day; you can still save |
| 10 | Press **Drop into pig** to fill the first pig | The *Your pig is full!* dialog with a celebrating pig; the toast says what was added |
| 11 | Press **Later** | The dialog closes; the card shows a gold **Full** badge, `100%`, **Mark as completed**; there is no **Add time**; the counter still shows the slot as used |
| 12 | Press **Mark as completed**, then **Cancel** | Nothing changes |
| 13 | Press **Mark as completed**, then **Complete** | Toast "Japanese N3 completed. A slot is free."; the pig leaves the list; the counter drops by one |
| 14 | Create a new pig again | It works (the slot was freed) |
| 15 | Refresh the page | Deposits and the completed pig are remembered |
| 16 | Keyboard only: open Add time, fill it, submit, press Esc in the dialogs | Everything is reachable; Esc closes; focus returns to the button that opened the dialog |
| 17 | **Back to top:** scroll down about one screen on the landing page | A pink **Top** button appears bottom-right; it is not there near the top |
| 18 | Press **Top** | The page scrolls smoothly to the top; focus moves to the logo; the button disappears |
| 19 | Phone: repeat 1, 5, 6, 10 to 13 and 17 to 18 | Dialogs fit the screen with the buttons visible; the Top button is easy to hit with a thumb and does not cover important text |
| 20 | Turn on "reduce motion" in the system settings, press **Top** | The page jumps to the top without the smooth scroll |

Not in M3 (arrives later): history list and editing deposits (M5), confetti and sound (M6), statistics and heatmap (M4).

### M4: stats and heatmap, MVP release (US-13) *(to be filled in when M4 starts)*

## 5. Reporting a problem

Comment on the pull request or tell Claude. A useful report has: what you did, what you expected, what happened, device and browser, and a screenshot if possible.
