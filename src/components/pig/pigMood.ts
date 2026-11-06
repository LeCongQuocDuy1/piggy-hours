export type PigMood = 'sleepy' | 'curious' | 'happy' | 'excited' | 'overjoyed'

export const PIG_MOODS: PigMood[] = ['sleepy', 'curious', 'happy', 'excited', 'overjoyed']

/** Body scale per mood (docs/DESIGN.md section 16): the belly grows slightly as the pig fills. */
export const MOOD_SCALE: Record<PigMood, number> = {
  sleepy: 0.88,
  curious: 0.94,
  happy: 1,
  excited: 1.05,
  overjoyed: 1.1,
}

export const MOOD_LABEL: Record<PigMood, string> = {
  sleepy: 'Sleepy',
  curious: 'Curious',
  happy: 'Happy',
  excited: 'Excited',
  overjoyed: 'Overjoyed',
}
