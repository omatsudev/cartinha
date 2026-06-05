import { generateNotificationsForToday } from '@/lib/domain/services/NotificationRulesEngine'
import { interpretCycle } from '@/lib/domain/services/BillingsRulesEngine'
import type { IDailyRecordRepository } from '@/lib/domain/interfaces/IDailyRecordRepository'
import type { IUserProfileRepository } from '@/lib/domain/interfaces/IUserProfileRepository'
import type { ICoupleRepository } from '@/lib/domain/interfaces/ICoupleRepository'
import type { INotificationRepository } from '@/lib/domain/interfaces/INotificationRepository'
import { format, subDays } from 'date-fns'

export async function generateNotifications(
  userId: string,
  recordRepo: IDailyRecordRepository,
  profileRepo: IUserProfileRepository,
  coupleRepo: ICoupleRepository,
  notifRepo: INotificationRepository,
): Promise<number> {
  const profile = await profileRepo.findById(userId)
  if (!profile?.notificationsEnabled) return 0

  const today = format(new Date(), 'yyyy-MM-dd')
  const since = format(subDays(new Date(), 45), 'yyyy-MM-dd')
  const rawRecords = await recordRepo.findAllByUser(userId, since)
  const records = interpretCycle(rawRecords)
  const recentRecords = records.slice(-14)
  const todayRecord = records.find(r => r.date === today) ?? null
  const hasRecordToday = todayRecord !== null

  let partnerRecord = null
  if (profile.userType === 'man') {
    const coupleLink = await coupleRepo.findByUserId(userId)
    if (coupleLink) {
      const partnerRaw = await recordRepo.findAllByUser(coupleLink.womanId, since)
      const partnerInterpreted = interpretCycle(partnerRaw)
      partnerRecord = partnerInterpreted.find(r => r.date === today)
        ?? (partnerInterpreted.length > 0 ? partnerInterpreted[partnerInterpreted.length - 1] : null)
    }
  }

  const toCreate = generateNotificationsForToday({
    userProfile: profile,
    todayRecord,
    recentRecords,
    hasRecordToday,
    partnerRecord,
  })

  let created = 0
  for (const input of toCreate) {
    const alreadySent = await notifRepo.hasTypeToday(userId, input.type)
    if (!alreadySent) {
      await notifRepo.create(input)
      created++
    }
  }

  return created
}
