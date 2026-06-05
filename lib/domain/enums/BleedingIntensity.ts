export const BleedingIntensity = {
  NONE: 'nenhum',
  LIGHT: 'leve',
  MODERATE: 'moderado',
  HEAVY: 'intenso',
} as const

export type BleedingIntensity = (typeof BleedingIntensity)[keyof typeof BleedingIntensity]

export const BLEEDING_INTENSITY_LABELS: Record<BleedingIntensity, string> = {
  nenhum: 'Nenhum',
  leve: 'Leve',
  moderado: 'Moderado',
  intenso: 'Intenso',
}

export const BLEEDING_INTENSITY_OPTIONS: { value: BleedingIntensity; label: string }[] = [
  { value: 'nenhum', label: 'Nenhum' },
  { value: 'leve', label: 'Leve (mancha)' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'intenso', label: 'Intenso' },
]
