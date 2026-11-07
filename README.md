# Piggy Hours

**Save your hours. Fill your pig.**

Piggy Hours is a small web app where you drop the time you spend studying or working into piggy banks ("pigs") and watch them fill up toward a goal you set. No timers, no accounts: you add the hours and minutes after a session, and your data stays in your browser.

> **Status:** early development. Milestone M3 (add time, complete a pig, back-to-top button) is in review. See the [roadmap](docs/ROADMAP.md).

**Live preview:** https://piggy-hours.vercel.app

![Piggy Hours landing page](docs/screenshots/landing-desktop.png)

## Features (planned)

- Create pigs with a target in hours; add time in hours and minutes
- Pig expressions change as it fills (sleepy to overjoyed); celebrate when it is full
- Stats and a GitHub-style heatmap of your saving days
- Everything on one page, with actions in modals
- Local-first: no sign-up, data saved in your browser, with backup and restore

## Tech stack

React, TypeScript, Vite, Tailwind CSS, Radix UI (dialogs), Lucide icons, self-hosted Fredoka and Nunito fonts, Vitest and Testing Library, ESLint and Prettier, GitHub Actions, Vercel.

The component library is browsable at `/#design-system` (run `npm run dev`, or open the live preview).

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # start the dev server
```

| Script               | What it does                        |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Start the dev server                |
| `npm run build`      | Type-check and build for production |
| `npm run preview`    | Preview the production build        |
| `npm run lint`       | Run ESLint                          |
| `npm run typecheck`  | Run the TypeScript compiler         |
| `npm test`           | Run tests once                      |
| `npm run test:watch` | Run tests in watch mode             |
| `npm run format`     | Format all files with Prettier      |

## Testing

Unit, component and flow tests run with Vitest and Testing Library on every push. How milestones are accepted is described in [docs/TESTING.md](docs/TESTING.md).

```bash
npm test
```

## Documentation

The project follows a lightweight software development process. All documents are in [`docs/`](docs/):

- [Project brief](docs/PROJECT_BRIEF.md)
- [Requirements](docs/REQUIREMENTS.md)
- [Decisions (ADRs)](docs/DECISIONS.md)
- [Design](docs/DESIGN.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Testing](docs/TESTING.md)

## Contributing and workflow

Work is tracked with GitHub Issues and milestones. Branches are short-lived and merged by pull request after CI passes. Commits follow [Conventional Commits](https://www.conventionalcommits.org/).

## License

[MIT](LICENSE)
