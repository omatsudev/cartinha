import type { UserType } from '@/lib/domain/enums/UserType'
import type { CoupleObjective } from '@/lib/domain/enums/CoupleObjective'

export interface UserProfile {
  readonly id: string
  readonly name: string
  readonly userType: UserType
  readonly coupleObjective: CoupleObjective | null
  readonly notificationsEnabled: boolean
  readonly notificationHour: number
  readonly createdAt: string
  readonly updatedAt: string
}

export interface UpdateUserProfileInput {
  userId: string
  name?: string
  userType?: UserType
  coupleObjective?: CoupleObjective | null
  notificationsEnabled?: boolean
  notificationHour?: number
}
