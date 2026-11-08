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

### M4: stats and heatmap, MVP release (US-13)

Start with a clean state. A real device or a narrow browser window works for the phone steps.

| # | Steps | Expected |
|---|---|---|
| 1 | Open the page for the first time and scroll to **Your stats** (also reachable from the phone menu) | Four tiles with `0m`, `0m`, `0`, `0`; a grid of pale squares; the hint "Nothing here yet..." |
| 2 | Create a pig and add `1` hour `30` minutes for today | Right away: this week `1h 30m`, last 30 days `1h 30m`, streak `1`, active days `1`; today's square (last column) turns a medium pink |
| 3 | Add `2` more hours to a second pig the same day | Still one active day; this week `3h 30m`; today's square is the darkest pink |
| 4 | Hover over today's square, then over an empty one | A dark tooltip such as "Sat, Nov 7, 2026: 3h 30m" and "...: no time" |
| 5 | Add time with the date set to **yesterday**, then the day before | Streak grows to `3`; two more squares are shaded; active days `3` |
| 6 | Add time for a date 5 days ago | Streak stays `3` (a gap breaks it); active days `4` |
| 7 | Add time for a date 10 weeks ago | A square far to the left is shaded; "Last 30 days" does not change; "Active days" goes up |
| 8 | Shade levels: add 30m, 1h 30m, 2h 30m and 3h on four different days | Four different shades, lightest to darkest (under 1h, 1-2h, 2-3h, 3h or more) |
| 9 | Keyboard: press Tab until the heatmap has focus, then use the arrow keys, Home and End | One Tab stop for the whole grid; the focus ring moves between days and the tooltip follows; arrows stop at the edges; Tab leaves the grid |
| 10 | Screen reader (optional): focus a square | It reads the date and the total, for example "Fri, Oct 30, 2026: 1h 30m" |
| 11 | Refresh the page | Tiles and heatmap show the same numbers |
| 12 | Phone (360 to 390 px wide): scroll to Your stats | Tiles in a 2 by 2 grid; the heatmap shows the last 16 weeks, fits the card with **no scrollbar**, and the squares are easy to see; no horizontal scroll of the whole page; tapping a square shows its tooltip, which stays inside the card even at the edges |
| 13 | Desktop (1280 px): look at the layout | Four tiles in one row; the heatmap shows 26 weeks, centered, with larger squares; make the window narrower than 640 px and it switches to 16 weeks |
| 14 | Turn on "reduce motion" in the system settings | Nothing animates in the section; everything still works |
| 15 | Use the page for a week of real data, or open it at midnight | After midnight the new day shows as the last square on the next load (the page does not need to be open at the time) |

Not in M4 (arrives later): deposit history and editing (M5), backup and restore (M5), forecast and deadline guidance (M7).

## 5. Reporting a problem

Comment on the pull request or tell Claude. A useful report has: what you did, what you expected, what happened, device and browser, and a screenshot if possible.

### M5a: edit and delete pigs, deposit history (US-05, US-06)

Start with a pig `Japanese N3` (target 50 hours) that has a few entries on different days (use the date field in Add time), one with a note.

| # | Steps | Expected |
|---|---|---|
| 1 | Press the **...** button at the top right of the pig card | A *Japanese N3* dialog: saved time and percent, **Edit pig** and **Delete pig** buttons, a **History** list |
| 2 | Look at the history | Newest day first; each row has the time, the full date and the note (if any); an empty pig shows "No time yet" |
| 3 | Press the pencil on an entry | *Edit time* opens filled with that entry's hours, minutes, date and note |
| 4 | Enter more time than the pig has room for, **Save changes** | "Only ... left in this pig." and nothing is saved; **Fill the pig** sets the exact maximum |
| 5 | Change the time and date, **Save changes** | Back in the history with the new values, toast "Deposit updated"; the card's total and the stats update |
| 6 | Press the trash on an entry, then **Cancel** | Nothing changes |
| 7 | Press the trash again, **Delete entry** | The entry disappears; toast "Deposit deleted"; the total goes down |
| 8 | Fill a pig completely (choose **Later**), open its details and delete one entry | The *Full* badge is gone and **Add time** is back |
| 9 | Press **Edit pig**; change the name, emoji, color and deadline; **Save changes** | The card shows the new look and name; saved time is unchanged |
| 10 | Edit the target to a number below what you saved | "You already saved ... The target cannot be lower." and focus on the field |
| 11 | Edit a full pig | The target field is disabled ("A full pig keeps its target"); the other fields can be changed |
| 12 | Clear the deadline and save | The "Due ..." line disappears from the card |
| 13 | Press **Delete pig** | A confirmation says how many entries and how much time will be deleted; **Cancel** keeps everything |
| 14 | Confirm with **Delete pig** | The pig is gone; toast "... deleted"; the slot counter goes down; the stats heatmap no longer counts its entries |
| 15 | Complete two pigs (so a third slot is unlocked), then delete one of the active pigs | The slot limit stays at 3 (deleting never locks slots again) |
| 16 | Refresh the page | Everything you changed is still there |
| 17 | Keyboard: open details, Tab through, press Esc in each dialog | Everything is reachable; Esc closes only the top dialog; focus returns to the button that opened it |
| 18 | Phone: repeat 1, 3, 9, 13 | Dialogs fit the screen, buttons are at least 44 px, nothing is cut off |

Not in M5a (arrives with M5b): backup and restore, the completed-pigs shelf, the slot-unlock message.

### M5b: backup and restore, shelf, slot unlock (US-07, US-08, US-09)

Start with a few pigs and entries (two active pigs and one completed is a good start).

| # | Steps | Expected |
|---|---|---|
| 1 | Scroll to **Your data** (also in the phone menu) | The reminder that data lives only in this browser, and **Export backup** and **Import backup** buttons |
| 2 | Press **Export backup** | A file `piggy-hours-backup-YYYY-MM-DD.json` downloads; toast "Backup saved as ..."; open it: it holds your pigs, entries and `completedPigsCount` |
| 3 | Choose a file that is not a backup (a photo, or a text file renamed to .json) | A red message under the buttons; nothing changes |
| 4 | Edit your backup file: change `"version": 1` to `9` and import it | "This backup was made by a newer version..." and nothing changes |
| 5 | Edit the file: delete a closing bracket, or change a pig's `id` in a deposit to an unknown value | "This backup is damaged or contains unexpected data" and nothing changes |
| 6 | Delete a pig in the app, then import your backup and keep **Merge with my data** | The dialog shows file vs app counts; after **Merge backup** the deleted pig and its entries are back and a toast says what was added; nothing was duplicated |
| 7 | Import the same file again with Merge | "Added 0 pigs and 0 entries"; nothing is duplicated |
| 8 | With every slot used, import a backup that has a pig you do not have | That pig is skipped and the toast says so |
| 9 | Change something in the app (rename a pig), import the older backup with Merge | Your current name stays |
| 10 | Import with **Replace everything** | A warning appears; **Replace all** swaps your data for the backup |
| 11 | Press **Cancel** in the import dialog | Nothing changes |
| 12 | Refresh the page after an import | The data is still there |
| 13 | Complete a pig | **Your shelf** appears with the pig, its target, the completion date and the count; a hint says how many more pigs unlock the next slot |
| 14 | Complete a second pig | Toast "New slot unlocked: you now have 3 pig slots!" and the counter shows 3 |
| 15 | Press the history button on a shelf pig | A read-only history (no edit buttons for entries or the pig); **Delete pig** still works |
| 16 | Delete a completed pig | It leaves the shelf; the total completed count and your slots do not go down |
| 17 | Phone: repeat 2, 6, 10 and 13 | Everything fits; the import dialog buttons are readable; no sideways scroll |
| 18 | Keyboard: Tab to **Import backup**, press Enter, pick a file; use the radio options with the arrow keys | Everything is reachable; focus returns to the button after the dialog closes |

After M5b is accepted: tag `v0.5.0` (GitHub Releases) and close #40.

Not in M5b (arrives later): animations and confetti (M6), deadline guidance and forecast (M7).

### M6: pig animation and celebration (US-12)

Use a fresh browser profile or clear site data. Create a pig with a small target (for example 2 hours).

| # | Steps | Expected |
|---|---|---|
| 1 | Add 30 minutes to the pig | After the dialog closes, a gold coin drops into the pig's back slot and the pig squishes slightly; it takes under half a second |
| 2 | Add time again | The effect plays again every time |
| 3 | Refresh the page, or scroll around | No animation on load; the pig simply shows its mood |
| 4 | Edit an entry to a smaller time, or delete an entry | No coin and no squish |
| 5 | Add enough time to fill the pig | The *Pig full* dialog opens, the pig bounces and confetti flies for about a second and a half, then stops |
| 6 | Close the dialog with **Later** | The card shows the **Full** badge; no animation repeats |
| 7 | Look at the overjoyed pig in the dialog and on the full card | The gold sparkles gently twinkle |
| 8 | Open the browser's Network tab, reload, and add time that does not fill the pig | No `confetti` file is requested; it appears only when a pig becomes full |
| 9 | Turn on the system setting "reduce motion" (Windows: Settings, Accessibility, Visual effects, turn off *Animation effects*), reload and add time | No coin and no squish, only a very short fade |
| 10 | With reduce motion on, fill a pig | The dialog opens with no bounce and no confetti; the sparkles are static; nothing requests `confetti` |
| 11 | Phone width (390 px): repeat 1 and 5 | The coin stays inside the card; confetti covers the screen but does not block the buttons; no sideways scroll |
| 12 | Keyboard: add time and fill a pig using only the keyboard | Focus handling is unchanged; animations never take focus |

After M6 is accepted: tag `v0.6.0` (GitHub Releases) and close #46.

### M6.5: polish (look and feel)

Open the preview on a phone-sized window and on a desktop window. Add two pigs with some time so the page has content.

| # | Steps | Expected |
|---|---|---|
| 1 | Open the top of the page | Soft pink, gold and mint glows in the background; "Fill your pig." has a warm gradient and a wavy underline |
| 2 | Watch the hero pig for about ten seconds | It bobs gently, blinks, wiggles an ear now and then; a coin drops into its slot about every 4.5 s and the pig squishes as it lands; a dashed halo breathes |
| 3 | Look around the hero | Small coins, stars and hearts drift; none sits on top of the text (only two show on phones) |
| 4 | Scroll down slowly | Headings, step cards, mood cards, stat tiles and benefits fade and rise into place, one after another; nothing stays blank |
| 5 | Jump with the menu to **Your stats** | The four tiles count up from 0 to their values; no flash of wrong numbers afterwards |
| 6 | Check the section edges | Wavy edges between sections; pink, gold, lilac and mint bands; no thin gaps or lines |
| 7 | Hover a pig card, a mood card, a step card | They lift slightly; mood cards tilt a little |
| 8 | Look at a progress bar | A soft shine passes over the fill every few seconds |
| 9 | Phone width (390 px and 320 px) | No sideways scroll; text stays readable over the glows |
| 10 | Turn on "reduce motion" in your system and reload | Everything is visible straight away and still: no drifting bits, no bobbing, no blinking, no reveal, no count-up, no shine |
| 11 | Keyboard: Tab through the page | Focus rings are still clear on the colored bands; nothing animated takes focus |
| 12 | Add time and fill a pig (M6 effects) | Coin drop, squish and confetti still work |

Not in M6.5 (later): pig personality, accessories, achievements, dark mode, share image, 3D pig.

