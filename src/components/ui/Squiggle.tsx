import type { ReactNode } from 'react'

/** Underlines a word with a hand-drawn wavy line (decorative; the text stays plain). */
export function Squiggle({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        className="absolute inset-x-0 -bottom-1.5 h-2 w-full text-coin"
      >
        <path
          d="M2 6C12 1 18 1 26 5S40 9 50 5 66 1 76 5 90 9 98 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}
