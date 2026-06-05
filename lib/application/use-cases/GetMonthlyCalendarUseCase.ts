import { startOfMonth, endOfMonth, format, eachDayOfInterval } from 'date-fns'
import type { IDailyRecordRepository } from '@/lib/domain/interfaces/IDailyRecordRepository'
import { interpretCycle } from '@/lib/domain/services/BillingsRulesEngine'
import type { InterpretedRecord } from '@/lib/domain/entities/DailyRecord'

export interface CalendarDay {
  date: string
  dayOfMonth: number
  record: InterpretedRecord | null
  isToday: boolean
}

export interface MonthlyCalendarData {
  year: number
  month: number
  days: CalendarDay[]
  firstDayOfWeek: number
}

export async function getMonthlyCalendar(
  userId: string,
  year: number,
  month: number,
  repository: IDailyRecordRepository,
): Promise<MonthlyCalendarData> {
  const firstDay = startOfMonth(new Date(year, month - 1))
  const lastDay = endOfMonth(firstDay)
  const today = format(new Date(), 'yyyy-MM-dd')

  const from = format(firstDay, 'yyyy-MM-dd')
  const to = format(lastDay, 'yyyy-MM-dd')

  // Fetch 2 extra months to correctly classify days at the start of the displayed month
  const extendedFrom = format(new Date(year, month - 3, 1), 'yyyy-MM-dd')
  const records = await repository.findAllByUser(userId, extendedFrom, to)
  const interpreted = interpretCycle(records)
  const interpretedByDate = new Map(interpreted.map((r) => [r.date, r]))

  const days: CalendarDay[] = eachDayOfInterval({ start: firstDay, end: lastDay }).map((date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return {
      date: dateStr,
      dayOfMonth: date.getDate(),
      record: interpretedByDate.get(dateStr) ?? null,
      isToday: dateStr === today,
    }
  })

  return {
    year,
    month,
    days,
    firstDayOfWeek: firstDay.getDay(),
  }
}
