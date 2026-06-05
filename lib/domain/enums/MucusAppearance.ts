export const MucusAppearance = {
  NONE: 'nenhum',
  OPAQUE: 'opaco',
  CLEAR: 'claro',
  ELASTIC: 'elastico',
  STRINGY: 'com_fios',
} as const

export type MucusAppearance = (typeof MucusAppearance)[keyof typeof MucusAppearance]

export const MUCUS_APPEARANCE_LABELS: Record<MucusAppearance, string> = {
  nenhum: 'Nenhum',
  opaco: 'Opaco (espesso, branco/amarelo)',
  claro: 'Claro / transparente',
  elastico: 'Elástico (como clara de ovo)',
  com_fios: 'Com fios',
}

export const MUCUS_APPEARANCE_OPTIONS: { value: MucusAppearance; label: string }[] = [
  { value: 'nenhum', label: 'Nenhum' },
  { value: 'opaco', label: 'Opaco (espesso)' },
  { value: 'claro', label: 'Claro / transparente' },
  { value: 'elastico', label: 'Elástico (como clara de ovo)' },
  { value: 'com_fios', label: 'Com fios' },
]
