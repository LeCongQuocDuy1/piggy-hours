# PROJECT BRIEF — Piggy Hours

> Status: **Draft v0.3** · Phase 1 (Initiation & Discovery)
> Changes in v0.3: repository is now public; slot cap set to 5 for the demo; domain decision deferred.
> Last updated: 2026-11-04
> Changes from v0.1: translated to English; project named; decisions from the Phase 2 review applied.

## 1. Summary

Piggy Hours is a web app that lets people **drop the hours they have studied or worked into a piggy bank** and watch their progress accumulate toward a goal they set themselves. Each goal is a pig with a target number of hours; the more time goes in, the fuller the pig gets. When it is full, the goal is done.

What makes it different: **no timers**. The user simply records how much time they spent after the fact, in a friendly, cute interface that makes progress feel rewarding.

## 2. Problem

- People working toward long-term goals (learning a language, studying, practicing, building a side project) often **cannot see their accumulated progress**, which erodes motivation.
- Time-tracking apps focus on timers and work reports; they lack the feeling of **saving up small amounts toward a concrete target**.
- Habit trackers focus on streaks rather than **the total time invested toward a specific target**.

## 3. Users

- **Audience:** anyone with a goal that can be measured in hours: languages, programming, exams, fitness, music, writing, side projects, reading.
- **Primary persona:** a self-driven learner who wants to see how many hours they have invested and how far they are from the finish line.
- **First user:** the author (dogfooding), then anyone with the link.

## 4. Goals

**Product goals**
1. Let users create any goal with a target number of hours and deposit time toward it every day.
2. A polished, cute, motivating interface that people want to come back to.
3. Let users see roughly how long it will take them to finish a goal (forecast based on their real pace).
4. Reward consistent users by unlocking more pig slots as they complete pigs.

**Author's personal goals**
1. Deliver a complete project following a standard software development process.
2. Deploy it on a custom domain on the internet.
3. Add it to the author's CV as a well-documented, well-engineered project.

## 5. Scope

**In scope**
- Create a pig: name, target hours, emoji/color, optional deadline.
- Deposit time (hours + minutes) into a pig on a given day; see progress.
- Pig lifecycle: active → full → completed.
- Slot limit: 2 active pigs in the MVP; more slots unlocked by completing pigs in v1.0, up to 5 slots for the demo (the limit may grow in future versions).
- Responsive, mobile-first, cute English-language UI.
- Local-first data storage in the user's browser (no account needed).
- Deployment on a custom domain.

**Out of scope (for now)**
- Timers / stopwatch features.
- Pigs without a target ("open-ended" pigs): planned for a later version; the data model must leave room for them.
- Accounts, backend, multi-device sync (revisit after v1.0).
- Social features, leaderboards.
- Native mobile apps (PWA may come later).
- Multi-language UI (English only; strings kept separable for later).

## 6. Success Criteria

| # | Criterion | How to verify |
|---|---|---|
| 1 | All Must and Should requirements in `REQUIREMENTS.md` are delivered | Every user story meets its acceptance criteria |
| 2 | The UI is polished and consistent | A style guide exists; outside testers give positive feedback |
| 3 | The app runs on its own domain over HTTPS | Open the URL on phone and desktop |
| 4 | Engineering quality | CI is green, core logic is tested, Lighthouse ≥ 90 (Performance, Accessibility) |
| 5 | Documentation is complete | `docs/` is filled in; README (English) has screenshots/GIF |
| 6 | Ready for the CV | Project description + live demo link + public repository link |
| 7 | (Optional) Real usage | Author uses it for ≥ 14 consecutive days; ≥ 3 other people try it |

## 7. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Scope creep; project abandoned midway | High | Small milestones, each deployed and viewable; Must items first |
| Over-reliance on AI-generated code without understanding it | Medium | Read and understand every diff; tests for core logic; record decisions |
| Data loss with browser storage | Medium | JSON export/import; clear warnings in the UI |
| Date/time-zone bugs in progress calculations | Medium | Normalize dates to local time; tests for edge cases |
| Heavy animation lags on weak devices | Low | Test on mid-range phones; respect reduced-motion setting |
| Slot-unlock system can be "farmed" with tiny pigs | Low | Accepted for now (minimum target is 1 hour); revisit in v1.0 design |
| Similarity to existing apps | Low | Accepted; the main value is learning and craftsmanship |
| Public repository exposes secrets or messy history | Medium | `.gitignore` and `.env` rules from the first commit; never commit secrets; clean Conventional Commits; review before the first push |

## 8. Assumptions and Constraints

- Solo developer working in spare time; schedule is flexible.
- Low budget: free tiers (GitHub, Vercel); the only planned cost is the domain name.
- Stack matches the author's skills: React, TypeScript, Node.js.
- **Everything in the project is in English:** UI copy, code, comments, commits, documentation, README. Vietnamese is used only in discussions with the assistant.
- The repository is **public** (visible to recruiters and anyone else), so commit history and documentation must stay clean and free of secrets or personal data.

## 9. Open Questions

- [ ] Custom domain: deferred to the deployment phase (candidates: `piggyhours.com`, then `.app`; check availability at that time)
- [x] Maximum number of slots: capped at 5 for the demo; may grow later
- [x] Repository visibility: public
