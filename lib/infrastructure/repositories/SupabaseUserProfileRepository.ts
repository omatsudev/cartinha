import type { SupabaseClient } from '@supabase/supabase-js'
import type { IUserProfileRepository } from '@/lib/domain/interfaces/IUserProfileRepository'
import type { UserProfile, UpdateUserProfileInput } from '@/lib/domain/entities/UserProfile'

function mapRow(row: Record<string, unknown>): UserProfile {
  return {
    id: row.id as string,
    name: (row.name as string) ?? '',
    userType: (row.user_type as UserProfile['userType']) ?? 'woman',
    coupleObjective: (row.couple_objective as UserProfile['coupleObjective']) ?? null,
    notificationsEnabled: Boolean(row.notifications_enabled),
    notificationHour: (row.notification_hour as number) ?? 8,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export class SupabaseUserProfileRepository implements IUserProfileRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(userId: string): Promise<UserProfile | null> {
    const { data } = await this.supabase
      .from('mob_user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    return data ? mapRow(data) : null
  }

  async upsert(input: UpdateUserProfileInput): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('mob_user_profiles')
      .upsert({
        id: input.userId,
        ...(input.name !== undefined && { name: input.name }),
        ...(input.userType !== undefined && { user_type: input.userType }),
        ...(input.coupleObjective !== undefined && { couple_objective: input.coupleObjective }),
        ...(input.notificationsEnabled !== undefined && { notifications_enabled: input.notificationsEnabled }),
        ...(input.notificationHour !== undefined && { notification_hour: input.notificationHour }),
      })
      .select('*')
      .single()
    if (error) throw error
    return mapRow(data)
  }
}
