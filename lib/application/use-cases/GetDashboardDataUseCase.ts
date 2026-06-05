import { subDays, format } from 'date-fns'
import type { IDailyRecordRepository } from '@/lib/domain/interfaces/IDailyRecordRepository'
import { interpretCycle } from '@/lib/domain/services/BillingsRulesEngine'
import { buildCurrentStatusSummary } from '@/lib/domain/services/CycleStatusPresenter'
import type { InterpretedRecord } from '@/lib/domain/entities/DailyRecord'
import type { CurrentStatusSummary } from '@/lib/domain/services/CycleStatusPresenter'

export interface DashboardData {
  statusSummary: CurrentStatusSummary
  todayRecord: InterpretedRecord | null
  recentDays: InterpretedRecord[]
  today: string
}

export async function getDashboardData(
  userId: string,
  repository: IDailyRecordRepository,
): Promise<DashboardData> {
  const today = format(new Date(), 'yyyy-MM-dd')
  const sixtyDaysAgo = format(subDays(new Date(), 60), 'yyyy-MM-dd')

  const records = await repository.findAllByUser(userId, sixtyDaysAgo, today)
  const interpreted = interpretCycle(records)

  const statusSummary = buildCurrentStatusSummary(records)

  const todayRecord = interpreted.find((r) => r.date === today) ?? null

  const sevenDaysAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd')
  const recentDays = interpreted.filter((r) => r.date >= sevenDaysAgo)

  return { statusSummary, todayRecord, recentDays, today }
}
