import { format, parseISO, eachDayOfInterval, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils/cn'
import { CYCLE_STATUS_DISPLAY } from '@/lib/domain/enums/CycleStatus'
import type { InterpretedRecord } from '@/lib/domain/entities/DailyRecord'

interface WeekStripProps {
  recentDays: InterpretedRecord[]
  today: string
}

export function WeekStrip({ recentDays, today }: WeekStripProps) {
  const sevenDaysAgo = format(subDays(parseISO(today), 6), 'yyyy-MM-dd')
  const interval = eachDayOfInterval({
    start: parseISO(sevenDaysAgo),
    end: parseISO(today),
  })

  const recordByDate = new Map(recentDays.map((r) => [r.date, r]))

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500">Últimos 7 dias</p>
      <div className="flex gap-1.5 justify-between">
        {interval.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const record = recordByDate.get(dateStr)
          const isToday = dateStr === today
          const displayInfo = record ? CYCLE_STATUS_DISPLAY[record.cycleStatus] : null

          return (
            <div key={dateStr} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[10px] text-gray-400">
                {format(day, 'EEE', { locale: ptBR })}
              </span>
              <div
                className={cn(
                  'w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold border',
                  isToday && 'ring-2 ring-rose-400 ring-offset-1',
                  displayInfo
                    ? cn(displayInfo.bgColor, displayInfo.textColor, displayInfo.borderColor)
                    : 'bg-gray-100 border-gray-200 text-gray-400',
                )}
                title={displayInfo?.label}
              >
                {displayInfo ? displayInfo.symbol : '?'}
              </div>
              <span className="text-[10px] text-gray-500">{format(day, 'd')}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
