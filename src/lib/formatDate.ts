const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

/** `2027-03-31` shown as "Mar 31, 2027". The date is built from its parts so it never shifts with the time zone. */
export function formatDate(value: string): string {
  const [y, m, d] = value.split('-').map(Number)
  return dateFormat.format(new Date(y, m - 1, d))
}

/** "1 day", "5 days". */
export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}
