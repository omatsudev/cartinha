import type { IDailyRecordRepository } from '@/lib/domain/interfaces/IDailyRecordRepository'
import { interpretCycle } from '@/lib/domain/services/BillingsRulesEngine'
import type { InterpretedRecord } from '@/lib/domain/entities/DailyRecord'

export interface RecordHistoryData {
  records: InterpretedRecord[]
  total: number
}

export async function getRecordHistory(
  userId: string,
  repository: IDailyRecordRepository,
): Promise<RecordHistoryData> {
  const records = await repository.findAllByUser(userId)
  const interpreted = interpretCycle(records)
  const sorted = [...interpreted].sort((a, b) => b.date.localeCompare(a.date))

  return { records: sorted, total: sorted.length }
}
