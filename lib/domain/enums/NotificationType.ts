export const NotificationType = {
  PMS: 'pms',
  FERTILE_PERIOD: 'fertile_period',
  PEAK_FERTILITY: 'peak_fertility',
  RETURN_INFERTILE: 'return_infertile',
  DAILY_REMINDER: 'daily_reminder',
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

export const NOTIFICATION_TYPE_TITLES: Record<NotificationType, string> = {
  pms: 'Fase pré-menstrual',
  fertile_period: 'Período fértil',
  peak_fertility: 'Pico de fertilidade',
  return_infertile: 'Fase infértil',
  daily_reminder: 'Lembrete de registro',
}
