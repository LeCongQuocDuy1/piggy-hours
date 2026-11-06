/** The six pig colors from docs/DESIGN.md section 13. `soft` tints the body, `strong` fills progress bars. */
export type PigColorName = 'pink' | 'peach' | 'butter' | 'mint' | 'sky' | 'lavender'

export type PigColor = {
  name: PigColorName
  label: string
  soft: string
  ear: string
  outline: string
  snout: string
  nostril: string
  strong: string
}

export const PIG_COLORS: Record<PigColorName, PigColor> = {
  pink: {
    name: 'pink',
    label: 'Pink',
    soft: '#FFC2D6',
    ear: '#F7A8C2',
    outline: '#E58FAE',
    snout: '#FF9DBB',
    nostril: '#B33A63',
    strong: '#DD4F85',
  },
  peach: {
    name: 'peach',
    label: 'Peach',
    soft: '#FFD3B8',
    ear: '#F5BC9C',
    outline: '#E0A07A',
    snout: '#FFB899',
    nostril: '#B35A2E',
    strong: '#CF6320',
  },
  butter: {
    name: 'butter',
    label: 'Butter',
    soft: '#FFE9A8',
    ear: '#F5D77E',
    outline: '#D9B84A',
    snout: '#F7D470',
    nostril: '#8A6A00',
    strong: '#A87700',
  },
  mint: {
    name: 'mint',
    label: 'Mint',
    soft: '#BFEAD9',
    ear: '#A3DCC5',
    outline: '#7FC4A7',
    snout: '#9AD9BF',
    nostril: '#2E7D5F',
    strong: '#2A8F6B',
  },
  sky: {
    name: 'sky',
    label: 'Sky',
    soft: '#C9E4FF',
    ear: '#AFD3F7',
    outline: '#86B8E8',
    snout: '#A3CBF3',
    nostril: '#2F6AA8',
    strong: '#2F7FCF',
  },
  lavender: {
    name: 'lavender',
    label: 'Lavender',
    soft: '#E0D4FF',
    ear: '#CDBDF5',
    outline: '#A992E3',
    snout: '#C2B0F0',
    nostril: '#5E48A8',
    strong: '#7A60CC',
  },
}

export const PIG_COLOR_LIST: PigColor[] = Object.values(PIG_COLORS)
