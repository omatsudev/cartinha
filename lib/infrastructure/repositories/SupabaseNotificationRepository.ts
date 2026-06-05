import type { SupabaseClient } from '@supabase/supabase-js'
import type { INotificationRepository } from '@/lib/domain/interfaces/INotificationRepository'
import type { AppNotification, CreateNotificationInput } from '@/lib/domain/entities/AppNotification'
import type { NotificationType } from '@/lib/domain/enums/NotificationType'
import { format } from 'date-fns'

function mapRow(row: Record<string, unknown>): AppNotification {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as AppNotification['type'],
    title: row.title as string,
    message: row.message as string,
    readAt: (row.read_at as string) ?? null,
    createdAt: row.created_at as string,
  }
}

export class SupabaseNotificationRepository implements INotificationRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findUnreadByUser(userId: string): Promise<AppNotification[]> {
    const { data } = await this.supabase
      .from('mob_notifications')
      .select('*')
      .eq('user_id', userId)
      .is('read_at', null)
      .order('created_at', { ascending: false })
    return (data ?? []).map(mapRow)
  }

  async findAllByUser(userId: string, limit = 30): Promise<AppNotification[]> {
    const { data } = await this.supabase
      .from('mob_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return (data ?? []).map(mapRow)
  }

  async countUnreadByUser(userId: string): Promise<number> {
    const { count } = await this.supabase
      .from('mob_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null)
    return count ?? 0
  }

  async hasTypeToday(userId: string, type: NotificationType): Promise<boolean> {
    const today = format(new Date(), 'yyyy-MM-dd')
    const { count } = await this.supabase
      .from('mob_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', type)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)
    return (count ?? 0) > 0
  }

  async create(input: CreateNotificationInput): Promise<AppNotification> {
    const { data, error } = await this.supabase
      .from('mob_notifications')
      .insert({
        user_id: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
      })
      .select('*')
      .single()
    if (error) throw error
    return mapRow(data)
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.supabase
      .from('mob_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
  }

  async markAllRead(userId: string): Promise<void> {
    await this.supabase
      .from('mob_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null)
  }
}
