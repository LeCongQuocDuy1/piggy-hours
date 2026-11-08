import { MOOD_LABEL, MOOD_SCALE, type PigMood } from './pigMood'
import { PIG_COLORS, type PigColorName } from './pigColors'

const round = (n: number) => Math.round(n * 10) / 10

type Props = {
  mood?: PigMood
  color?: PigColorName
  /** Accessible description. Omit (or pass `decorative`) when nearby text already says it. */
  label?: string
  decorative?: boolean
  className?: string
}

/** Original SVG pig, drawn in code so it stays crisp and themeable. Sparkles on an overjoyed pig twinkle (motion is switched off for reduced motion in index.css). */
export function PigIllustration({
  mood = 'happy',
  color = 'pink',
  label,
  decorative = false,
  className,
}: Props) {
  const c = PIG_COLORS[color]
  const s = MOOD_SCALE[mood]
  const rx = 40 * s
  const ry = 28 * s
  const earBase = round(35 - 28 * (s - 1))
  const legY = round(78 + 28 * (s - 1))
  const tailX = round(62 - 40 * s)
  const ink = '#3D2B35'
  const blush = mood === 'excited' || mood === 'overjoyed'
  const blushX = mood === 'excited' ? 33 : 32
  const aria = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img' as const, 'aria-label': label ?? `${MOOD_LABEL[mood]} pig` }

  return (
    <svg viewBox="0 0 120 100" className={className} {...aria}>
      {/* tail */}
      <path
        d={`M${tailX} 54q-11-3-8-12q3-5 8-1`}
        fill="none"
        stroke={c.outline}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* legs */}
      <rect
        x="38"
        y={legY}
        width="13"
        height="16"
        rx="5"
        fill={c.ear}
        stroke={c.outline}
        strokeWidth="2"
      />
      <rect
        x="69"
        y={legY}
        width="13"
        height="16"
        rx="5"
        fill={c.ear}
        stroke={c.outline}
        strokeWidth="2"
      />
      {/* ears */}
      <polygon
        points={`40,${earBase} 46,${round(earBase - 19)} 58,${round(earBase - 3)}`}
        fill={c.ear}
        stroke={c.outline}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <polygon
        points={`62,${round(earBase - 3)} 74,${round(earBase - 19)} 80,${earBase}`}
        fill={c.ear}
        stroke={c.outline}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* body */}
      <ellipse
        cx="60"
        cy="56"
        rx={round(rx)}
        ry={round(ry)}
        fill={c.soft}
        stroke={c.outline}
        strokeWidth="2.5"
      />
      {/* coin slot */}
      <rect x="50" y={earBase} width="20" height="4" rx="2" fill={c.nostril} />
      {/* snout */}
      <ellipse
        cx="60"
        cy="64"
        rx="13"
        ry="9.5"
        fill={c.snout}
        stroke={c.outline}
        strokeWidth="2"
      />
      <ellipse cx="55" cy="64" rx="2" ry="3" fill={c.nostril} />
      <ellipse cx="65" cy="64" rx="2" ry="3" fill={c.nostril} />

      {mood === 'sleepy' && (
        <path
          d="M39 52q5 4 10 0M71 52q5 4 10 0"
          fill="none"
          stroke={ink}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
      {(mood === 'curious' || mood === 'happy') && (
        <>
          <circle cx="44" cy="52" r="3.5" fill={ink} />
          <circle cx="76" cy="52" r="3.5" fill={ink} />
        </>
      )}
      {mood === 'excited' && (
        <>
          <circle cx="44" cy="52" r="4.8" fill={ink} />
          <circle cx="76" cy="52" r="4.8" fill={ink} />
          <circle cx="45.8" cy="50.2" r="1.6" fill="#fff" />
          <circle cx="77.8" cy="50.2" r="1.6" fill="#fff" />
        </>
      )}
      {mood === 'overjoyed' && (
        <path
          d="M39 54q5-7 10 0M71 54q5-7 10 0"
          fill="none"
          stroke={ink}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}

      {blush && (
        <>
          <ellipse cx={blushX} cy="62" rx="6" ry="4" fill="#FF8FAF" opacity="0.55" />
          <ellipse
            cx={120 - blushX}
            cy="62"
            rx="6"
            ry="4"
            fill="#FF8FAF"
            opacity="0.55"
          />
        </>
      )}

      {mood === 'happy' && (
        <path
          d="M53 78q7 5 14 0"
          fill="none"
          stroke={ink}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
      {mood === 'excited' && (
        <path
          d="M52 77q8 7 16 0"
          fill="none"
          stroke={ink}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
      {mood === 'overjoyed' && (
        <>
          <path
            d="M52 77q8 8 16 0"
            fill="none"
            stroke={ink}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="60" cy="9" r="6" fill="#F5B833" stroke="#C98B0B" strokeWidth="2" />
          <path
            className="pig-sparkle"
            d="M20 20v12M14 26h12M100 18v10M95 23h10"
            stroke="#F5B833"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
    </svg>
  )
}
