import type { SupabaseClient } from '@supabase/supabase-js'
import type { IDailyRecordRepository } from '@/lib/domain/interfaces/IDailyRecordRepository'
import type { DailyRecord, CreateDailyRecordInput } from '@/lib/domain/entities/DailyRecord'

type DbRow = {
  id: string
  user_id: string
  date: string
  sensation: string
  mucus_appearance: string
  mucus_quantity: string
  bleeding_intensity: string
  notes: string
  created_at: string
  updated_at: string
}

function toEntity(row: DbRow): DailyRecord {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    sensation: row.sensation as DailyRecord['sensation'],
    mucusAppearance: row.mucus_appearance as DailyRecord['mucusAppearance'],
    mucusQuantity: row.mucus_quantity as DailyRecord['mucusQuantity'],
    bleedingIntensity: row.bleeding_intensity as DailyRecord['bleedingIntensity'],
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class SupabaseDailyRecordRepository implements IDailyRecordRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findAllByUser(userId: string, fromDate?: string, toDate?: string): Promise<DailyRecord[]> {
    let query = this.supabase
      .from('mob_daily_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })

    if (fromDate) query = query.gte('date', fromDate)
    if (toDate) query = query.lte('date', toDate)

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch records: ${error.message}`)

    return (data as DbRow[]).map(toEntity)
  }

  async findByDate(userId: string, date: string): Promise<DailyRecord | null> {
    const { data, error } = await this.supabase
      .from('mob_daily_records')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle()

    if (error) throw new Error(`Failed to fetch record: ${error.message}`)
    return data ? toEntity(data as DbRow) : null
  }

  async upsert(input: CreateDailyRecordInput): Promise<DailyRecord> {
    const { data, error } = await this.supabase
      .from('mob_daily_records')
      .upsert(
        {
          user_id: input.userId,
          date: input.date,
          sensation: input.sensation,
          mucus_appearance: input.mucusAppearance,
          mucus_quantity: input.mucusQuantity,
          bleeding_intensity: input.bleedingIntensity,
          notes: input.notes,
        },
        { onConflict: 'user_id,date' },
      )
      .select()
      .single()

    if (error) throw new Error(`Failed to save record: ${error.message}`)
    return toEntity(data as DbRow)
  }

  async deleteById(id: string): Promise<void> {
    const { error } = await this.supabase.from('mob_daily_records').delete().eq('id', id)
    if (error) throw new Error(`Failed to delete record: ${error.message}`)
  }
}
