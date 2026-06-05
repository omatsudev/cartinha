import type { UserProfile, UpdateUserProfileInput } from '@/lib/domain/entities/UserProfile'

export interface IUserProfileRepository {
  findById(userId: string): Promise<UserProfile | null>
  upsert(input: UpdateUserProfileInput): Promise<UserProfile>
}
