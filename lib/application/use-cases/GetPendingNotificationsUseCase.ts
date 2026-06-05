import type { INotificationRepository } from '@/lib/domain/interfaces/INotificationRepository'
import type { AppNotification } from '@/lib/domain/entities/AppNotification'

export async function getPendingNotifications(
  userId: string,
  notifRepo: INotificationRepository,
): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
  const notifications = await notifRepo.findAllByUser(userId, 30)
  const unreadCount = await notifRepo.countUnreadByUser(userId)
  return { notifications, unreadCount }
}
