import type { SupabaseClient } from '@supabase/supabase-js'
import type { ICoupleRepository } from '@/lib/domain/interfaces/ICoupleRepository'
import type { CoupleLink } from '@/lib/domain/entities/CoupleLink'

function mapRow(row: Record<string, unknown>): CoupleLink {
  return {
    id: row.id as string,
    womanId: row.woman_id as string,
    manId: row.man_id as string,
    createdAt: row.created_at as string,
  }
}

export class SupabaseCoupleRepository implements ICoupleRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findByUserId(userId: string): Promise<CoupleLink | null> {
    const { data } = await this.supabase
      .from('mob_couple_links')
      .select('*')
      .or(`woman_id.eq.${userId},man_id.eq.${userId}`)
      .maybeSingle()
    return data ? mapRow(data) : null
  }

  async findPartnerProfile(userId: string): Promise<{ id: string; name: string } | null> {
    const link = await this.findByUserId(userId)
    if (!link) return null
    const partnerId = link.womanId === userId ? link.manId : link.womanId
    const { data } = await this.supabase
      .from('mob_user_profiles')
      .select('id, name')
      .eq('id', partnerId)
      .maybeSingle()
    return data ? { id: data.id as string, name: (data.name as string) ?? '' } : null
  }

  async link(womanId: string, manId: string): Promise<CoupleLink> {
    const { data, error } = await this.supabase
      .from('mob_couple_links')
      .insert({ woman_id: womanId, man_id: manId })
      .select('*')
      .single()
    if (error) throw error
    return mapRow(data)
  }

  async unlink(userId: string): Promise<void> {
    await this.supabase
      .from('mob_couple_links')
      .delete()
      .or(`woman_id.eq.${userId},man_id.eq.${userId}`)
  }
}
