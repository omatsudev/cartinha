import { CycleStatus } from '@/lib/domain/enums/CycleStatus'
import { NotificationType, NOTIFICATION_TYPE_TITLES } from '@/lib/domain/enums/NotificationType'
import { UserType } from '@/lib/domain/enums/UserType'
import { CoupleObjective } from '@/lib/domain/enums/CoupleObjective'
import type { InterpretedRecord } from '@/lib/domain/entities/DailyRecord'
import type { UserProfile } from '@/lib/domain/entities/UserProfile'
import type { CreateNotificationInput } from '@/lib/domain/entities/AppNotification'

const FERTILE_STATUSES = new Set<CycleStatus>([
  CycleStatus.PATTERN_CHANGE,
  CycleStatus.FERTILE,
  CycleStatus.PEAK,
])

const POST_PEAK_STATUSES = new Set<CycleStatus>([
  CycleStatus.POST_PEAK_1,
  CycleStatus.POST_PEAK_2,
  CycleStatus.POST_PEAK_3,
])

const INFERTILE_STATUSES = new Set<CycleStatus>([
  CycleStatus.DRY_BIP,
  CycleStatus.MUCUS_BIP,
  CycleStatus.INFERTILE_POST_PEAK,
])

export interface NotificationTriggerContext {
  userProfile: UserProfile
  todayRecord: InterpretedRecord | null
  recentRecords: InterpretedRecord[]
  hasRecordToday: boolean
  partnerRecord?: InterpretedRecord | null
}

function buildNotification(
  userId: string,
  type: NotificationType,
  message: string,
): CreateNotificationInput {
  return { userId, type, title: NOTIFICATION_TYPE_TITLES[type], message }
}

function detectPmsPhase(records: InterpretedRecord[], currentStatus: CycleStatus): boolean {
  if (currentStatus !== CycleStatus.INFERTILE_POST_PEAK) return false
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date))
  let consecutive = 0
  for (const r of sorted) {
    if (r.cycleStatus === CycleStatus.INFERTILE_POST_PEAK) consecutive++
    else break
  }
  return consecutive >= 7
}

function detectReturnToInfertility(records: InterpretedRecord[], currentStatus: CycleStatus): boolean {
  if (!INFERTILE_STATUSES.has(currentStatus) && !POST_PEAK_STATUSES.has(currentStatus)) return false
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date))
  if (sorted.length < 2) return false
  const yesterday = sorted[1]
  return FERTILE_STATUSES.has(yesterday.cycleStatus)
}

function fertilePeriodMessages(
  userType: UserType,
  objective: CoupleObjective | null,
  isPeak: boolean,
): string {
  const wantsBaby = objective === CoupleObjective.GET_PREGNANT
  if (userType === UserType.WOMAN) {
    if (isPeak) {
      return wantsBaby
        ? 'Este é o seu pico de fertilidade — o melhor momento para tentar engravidar.'
        : 'Você está no pico da fertilidade. Evite relações sexuais para prevenir gravidez.'
    }
    return wantsBaby
      ? 'Você está em período fértil. Este é o momento ideal para tentar engravidar.'
      : 'Você está em período fértil. Evite relações sexuais se quiser evitar gravidez.'
  }
  // MAN
  if (isPeak) {
    return wantsBaby
      ? 'Sua parceira está no pico de fertilidade. Este é o melhor momento para tentar engravidar.'
      : 'Sua parceira está no pico da fertilidade. Evitem relações sexuais neste período.'
  }
  return wantsBaby
    ? 'Sua parceira está em período fértil. Este é um bom momento para tentar engravidar.'
    : 'Sua parceira está em período fértil. É importante evitar relações se quiserem evitar gravidez.'
}

export function generateNotificationsForToday(
  ctx: NotificationTriggerContext,
): CreateNotificationInput[] {
  const { userProfile, todayRecord, recentRecords, hasRecordToday, partnerRecord } = ctx
  const notifications: CreateNotificationInput[] = []

  if (!userProfile.notificationsEnabled) return notifications

  const isWoman = userProfile.userType === UserType.WOMAN
  const relevantRecord = isWoman ? todayRecord : (partnerRecord ?? null)

  // Lembrete diário — apenas para mulher
  if (isWoman && !hasRecordToday) {
    notifications.push(buildNotification(
      userProfile.id,
      NotificationType.DAILY_REMINDER,
      'Não esqueça de registrar as observações do dia. Isso ajuda a entender melhor o seu ciclo.',
    ))
  }

  if (!relevantRecord) return notifications

  const status = relevantRecord.cycleStatus
  const objective = userProfile.coupleObjective

  // TPM — fase pré-menstrual
  if (detectPmsPhase(isWoman ? recentRecords : [relevantRecord, ...recentRecords], status)) {
    const message = isWoman
      ? 'Seu corpo pode estar mais sensível hoje. Cuide-se, descanse e respeite seu ritmo.'
      : 'Sua parceira pode estar em dias mais tensos que o normal. Seja mais paciente, compreensivo e ofereça apoio.'
    notifications.push(buildNotification(userProfile.id, NotificationType.PMS, message))
  }

  // Pico de fertilidade
  if (status === CycleStatus.PEAK) {
    notifications.push(buildNotification(
      userProfile.id,
      NotificationType.PEAK_FERTILITY,
      fertilePeriodMessages(userProfile.userType, objective, true),
    ))
    return notifications
  }

  // Período fértil
  if (status === CycleStatus.FERTILE || status === CycleStatus.PATTERN_CHANGE) {
    notifications.push(buildNotification(
      userProfile.id,
      NotificationType.FERTILE_PERIOD,
      fertilePeriodMessages(userProfile.userType, objective, false),
    ))
    return notifications
  }

  // Retorno à infertilidade
  if (detectReturnToInfertility(isWoman ? recentRecords : [relevantRecord, ...recentRecords], status)) {
    const message = isWoman
      ? 'Você entrou em uma fase naturalmente infértil. Seu ciclo está seguindo seu caminho.'
      : 'Sua parceira entrou em uma fase naturalmente infértil.'
    notifications.push(buildNotification(userProfile.id, NotificationType.RETURN_INFERTILE, message))
  }

  return notifications
}
