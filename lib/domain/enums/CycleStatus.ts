export const CycleStatus = {
  MENSTRUATION: 'menstruacao',
  SPOTTING: 'mancha',
  DRY_BIP: 'pbi_seco',
  MUCUS_BIP: 'pbi_muco',
  PATTERN_CHANGE: 'mudanca',
  FERTILE: 'fertil',
  PEAK: 'apice',
  POST_PEAK_1: 'pos_apice_1',
  POST_PEAK_2: 'pos_apice_2',
  POST_PEAK_3: 'pos_apice_3',
  INFERTILE_POST_PEAK: 'infertil_pos_apice',
} as const

export type CycleStatus = (typeof CycleStatus)[keyof typeof CycleStatus]

export type FertilityLevel = 'infertil' | 'possivel' | 'fertil' | 'menstruacao'

export interface CycleStatusDisplayInfo {
  label: string
  description: string
  bgColor: string
  textColor: string
  borderColor: string
  fertilityLevel: FertilityLevel
  symbol: string
}

export const CYCLE_STATUS_DISPLAY: Record<CycleStatus, CycleStatusDisplayInfo> = {
  menstruacao: {
    label: 'Menstruação',
    description: 'Sangramento menstrual',
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    borderColor: 'border-red-600',
    fertilityLevel: 'menstruacao',
    symbol: '●',
  },
  mancha: {
    label: 'Mancha',
    description: 'Sangramento leve / spotting',
    bgColor: 'bg-red-300',
    textColor: 'text-white',
    borderColor: 'border-red-400',
    fertilityLevel: 'possivel',
    symbol: '⁚',
  },
  pbi_seco: {
    label: 'PBI Seco',
    description: 'Padrão Básico de Infertilidade — seca',
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    borderColor: 'border-green-600',
    fertilityLevel: 'infertil',
    symbol: '|',
  },
  pbi_muco: {
    label: 'PBI Muco',
    description: 'Padrão Básico de Infertilidade — muco sem mudança',
    bgColor: 'bg-yellow-400',
    textColor: 'text-gray-900',
    borderColor: 'border-yellow-500',
    fertilityLevel: 'infertil',
    symbol: '=',
  },
  mudanca: {
    label: 'Mudança de Padrão',
    description: 'Ponto de mudança — possivelmente fértil',
    bgColor: 'bg-white',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-400',
    fertilityLevel: 'possivel',
    symbol: '○',
  },
  fertil: {
    label: 'Fértil',
    description: 'Período fértil — muco presente',
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-800',
    borderColor: 'border-rose-400',
    fertilityLevel: 'fertil',
    symbol: '○',
  },
  apice: {
    label: 'Ápice',
    description: 'Pico de fertilidade — último dia escorregadio',
    bgColor: 'bg-white',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-600',
    fertilityLevel: 'fertil',
    symbol: '✕',
  },
  pos_apice_1: {
    label: '1° pós-Ápice',
    description: '1° dia após o Ápice',
    bgColor: 'bg-green-200',
    textColor: 'text-green-900',
    borderColor: 'border-green-400',
    fertilityLevel: 'possivel',
    symbol: '1',
  },
  pos_apice_2: {
    label: '2° pós-Ápice',
    description: '2° dia após o Ápice',
    bgColor: 'bg-green-200',
    textColor: 'text-green-900',
    borderColor: 'border-green-400',
    fertilityLevel: 'possivel',
    symbol: '2',
  },
  pos_apice_3: {
    label: '3° pós-Ápice',
    description: '3° dia após o Ápice',
    bgColor: 'bg-green-200',
    textColor: 'text-green-900',
    borderColor: 'border-green-400',
    fertilityLevel: 'possivel',
    symbol: '3',
  },
  infertil_pos_apice: {
    label: 'Fase Lútea',
    description: '4°+ dia após o Ápice — infértil',
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    borderColor: 'border-green-600',
    fertilityLevel: 'infertil',
    symbol: '|',
  },
}

export const FERTILITY_LEVEL_INFO: Record<FertilityLevel, { label: string; bgColor: string; textColor: string }> = {
  infertil: { label: 'Infértil', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  possivel: { label: 'Possivelmente fértil', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  fertil: { label: 'Fértil', bgColor: 'bg-rose-100', textColor: 'text-rose-800' },
  menstruacao: { label: 'Menstruação', bgColor: 'bg-red-100', textColor: 'text-red-800' },
}
