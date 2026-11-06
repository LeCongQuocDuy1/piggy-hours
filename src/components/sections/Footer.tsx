export function Footer() {
  return (
    <footer className="border-t-2 border-border bg-surface">
      <div className="mx-auto flex max-w-[1120px] flex-col items-center gap-2 px-4 py-7 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
        <span className="font-heading text-lg font-medium">Piggy Hours</span>
        <span className="text-sm text-text-muted">Save your hours. Fill your pig.</span>
        <a
          href="https://github.com/LeCongQuocDuy1/piggy-hours"
          className="text-sm font-bold"
        >
          Source on GitHub
        </a>
      </div>
    </footer>
  )
}
