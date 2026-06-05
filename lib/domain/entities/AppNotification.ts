import type { NotificationType } from '@/lib/domain/enums/NotificationType'

export interface AppNotification {
  readonly id: string
  readonly userId: string
  readonly type: NotificationType
  readonly title: string
  readonly message: string
  readonly readAt: string | null
  readonly createdAt: string
}

export interface CreateNotificationInput {
  userId: string
  type: NotificationType
  title: string
  message: string
}
