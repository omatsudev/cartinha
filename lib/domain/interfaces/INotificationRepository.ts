import type { AppNotification, CreateNotificationInput } from '@/lib/domain/entities/AppNotification'
import type { NotificationType } from '@/lib/domain/enums/NotificationType'

export interface INotificationRepository {
  findUnreadByUser(userId: string): Promise<AppNotification[]>
  findAllByUser(userId: string, limit?: number): Promise<AppNotification[]>
  countUnreadByUser(userId: string): Promise<number>
  hasTypeToday(userId: string, type: NotificationType): Promise<boolean>
  create(input: CreateNotificationInput): Promise<AppNotification>
  markRead(id: string, userId: string): Promise<void>
  markAllRead(userId: string): Promise<void>
}
