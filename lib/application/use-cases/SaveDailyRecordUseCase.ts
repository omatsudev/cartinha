import type { IDailyRecordRepository } from '@/lib/domain/interfaces/IDailyRecordRepository'
import type { DailyRecord, CreateDailyRecordInput } from '@/lib/domain/entities/DailyRecord'

export async function saveDailyRecord(
  input: CreateDailyRecordInput,
  repository: IDailyRecordRepository,
): Promise<DailyRecord> {
  return repository.upsert(input)
}
