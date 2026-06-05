export const UserType = {
  WOMAN: 'woman',
  MAN: 'man',
} as const

export type UserType = (typeof UserType)[keyof typeof UserType]

export const USER_TYPE_LABELS: Record<UserType, string> = {
  woman: 'Mulher',
  man: 'Parceiro (homem)',
}
