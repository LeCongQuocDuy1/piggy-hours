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

### M3: deposit and complete (US-02, US-04) *(to be filled in when M3 starts)*

### M4: stats and heatmap, MVP release (US-13) *(to be filled in when M4 starts)*

## 5. Reporting a problem

Comment on the pull request or tell Claude. A useful report has: what you did, what you expected, what happened, device and browser, and a screenshot if possible.
