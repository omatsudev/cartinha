export const CoupleObjective = {
  GET_PREGNANT: 'get_pregnant',
  AVOID_PREGNANCY: 'avoid_pregnancy',
} as const

export type CoupleObjective = (typeof CoupleObjective)[keyof typeof CoupleObjective]

export const COUPLE_OBJECTIVE_LABELS: Record<CoupleObjective, string> = {
  get_pregnant: 'Engravidar',
  avoid_pregnancy: 'Evitar gravidez',
}
