export const MucusQuantity = {
  NONE: 'nenhum',
  LITTLE: 'pouco',
  MODERATE: 'moderado',
  MUCH: 'muito',
} as const

export type MucusQuantity = (typeof MucusQuantity)[keyof typeof MucusQuantity]

export const MUCUS_QUANTITY_LABELS: Record<MucusQuantity, string> = {
  nenhum: 'Nenhum',
  pouco: 'Pouco',
  moderado: 'Moderado',
  muito: 'Muito',
}

export const MUCUS_QUANTITY_OPTIONS: { value: MucusQuantity; label: string }[] = [
  { value: 'nenhum', label: 'Nenhum' },
  { value: 'pouco', label: 'Pouco' },
  { value: 'moderado', label: 'Moderado' },
  { value: 'muito', label: 'Muito' },
]
