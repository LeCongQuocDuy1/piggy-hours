import { cn } from '../../lib/cn'

/**
 * A wavy top edge for a colored band. Place it inside a `relative` section and give it the band's color with a
 * `text-band-*` class; it overlaps the section above by a few pixels so there is no seam.
 */
export function Wave({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 48"
      preserveAspectRatio="none"
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-[calc(100%-1px)] h-5 w-full fill-current md:h-8',
        className,
      )}
    >
      <path d="M0 48V28C180 6 300 4 480 22S800 48 960 32 1280 4 1440 22V48Z" />
    </svg>
  )
}
