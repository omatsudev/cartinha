export const Sensation = {
  MENSTRUATION: 'menstruacao',
  SPOTTING: 'mancha',
  DRY: 'seca',
  HUMID: 'umida',
  WET: 'molhada',
  SLIPPERY: 'escorregadia',
} as const

export type Sensation = (typeof Sensation)[keyof typeof Sensation]

export const SENSATION_LABELS: Record<Sensation, string> = {
  menstruacao: 'Menstruação',
  mancha: 'Mancha',
  seca: 'Seca',
  umida: 'Úmida',
  molhada: 'Molhada',
  escorregadia: 'Escorregadia',
}

export const SENSATION_OPTIONS: { value: Sensation; label: string; description: string }[] = [
  { value: 'menstruacao', label: 'Menstruação', description: 'Fluxo menstrual presente' },
  { value: 'mancha', label: 'Mancha', description: 'Sangramento leve ou spotting' },
  { value: 'seca', label: 'Seca', description: 'Nada se sente, nada se vê' },
  { value: 'umida', label: 'Úmida', description: 'Sensação de umidade' },
  { value: 'molhada', label: 'Molhada', description: 'Sensação de molhado' },
  { value: 'escorregadia', label: 'Escorregadia', description: 'Sensação lubrificada, macia, escorregadia' },
]
