import type { DailyRecord, CreateDailyRecordInput } from '@/lib/domain/entities/DailyRecord'

export interface IDailyRecordRepository {
  findAllByUser(userId: string, fromDate?: string, toDate?: string): Promise<DailyRecord[]>
  findByDate(userId: string, date: string): Promise<DailyRecord | null>
  upsert(input: CreateDailyRecordInput): Promise<DailyRecord>
  deleteById(id: string): Promise<void>
}
