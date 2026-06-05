'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { CycleDayCell } from '@/components/cycle/CycleDayCell'
import { CYCLE_STATUS_DISPLAY } from '@/lib/domain/enums/CycleStatus'
import type { MonthlyCalendarData } from '@/lib/application/use-cases/GetMonthlyCalendarUseCase'

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface CycleCalendarProps {
  data: MonthlyCalendarData
  year: number
  month: number
}

export function CycleCalendar({ data, year, month }: CycleCalendarProps) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  function navigateMonth(direction: -1 | 1) {
    const date = new Date(year, month - 1 + direction, 1)
    const y = date.getFullYear()
    const m = date.getMonth() + 1
    router.push(`/calendario?year=${y}&month=${m}`)
  }

  const selectedRecord = selectedDate
    ? data.days.find((d) => d.date === selectedDate)?.record
    : null

  const monthLabel = format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale: ptBR })

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 rounded-xl hover:bg-gray-100 transition"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="text-base font-semibold text-gray-800 capitalize">{monthLabel}</h2>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 rounded-xl hover:bg-gray-100 transition"
          aria-label="Próximo mês"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((day) => (
          <div key={day} className="text-center text-[10px] font-medium text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before first day */}
        {Array.from({ length: data.firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {data.days.map((day) => (
          <CycleDayCell
            key={day.date}
            dayOfMonth={day.dayOfMonth}
            record={day.record}
            isToday={day.isToday}
            onClick={() => setSelectedDate(day.date === selectedDate ? null : day.date)}
          />
        ))}
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800 capitalize">
              {format(parseISO(selectedDate), "d 'de' MMMM", { locale: ptBR })}
            </p>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {selectedRecord ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold border',
                    CYCLE_STATUS_DISPLAY[selectedRecord.cycleStatus].bgColor,
                    CYCLE_STATUS_DISPLAY[selectedRecord.cycleStatus].textColor,
                    CYCLE_STATUS_DISPLAY[selectedRecord.cycleStatus].borderColor,
                  )}
                >
                  {CYCLE_STATUS_DISPLAY[selectedRecord.cycleStatus].symbol}{' '}
                  {CYCLE_STATUS_DISPLAY[selectedRecord.cycleStatus].label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Sensação: </span>
                  {selectedRecord.sensation}
                </div>
                <div>
                  <span className="font-medium">Muco: </span>
                  {selectedRecord.mucusAppearance}
                </div>
              </div>
              {selectedRecord.notes && (
                <p className="text-xs text-gray-500 italic">{selectedRecord.notes}</p>
              )}
              <p className="text-[10px] text-gray-400">{selectedRecord.ruleApplied}</p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Sem registro para este dia.</p>
              <a
                href={`/registrar?date=${selectedDate}`}
                className="text-xs text-rose-600 font-medium hover:underline"
              >
                Registrar
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
