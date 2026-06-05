import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { CYCLE_STATUS_DISPLAY, FERTILITY_LEVEL_INFO } from '@/lib/domain/enums/CycleStatus'
import type { CurrentStatusSummary } from '@/lib/domain/services/CycleStatusPresenter'

interface CycleStatusCardProps {
  summary: CurrentStatusSummary
  showRegisterPrompt?: boolean
}

export function CycleStatusCard({ summary, showRegisterPrompt }: CycleStatusCardProps) {
  const { status, title, message, recommendation, cycleDay } = summary

  if (!status) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 p-6 space-y-4">
        <div className="text-center space-y-2">
          <div className="text-5xl">🌸</div>
          <p className="font-semibold text-gray-800">{message}</p>
          <p className="text-sm text-gray-500">{recommendation}</p>
        </div>
        <Link
          href="/registrar"
          className="block w-full text-center bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl py-3 text-sm transition"
        >
          Fazer primeiro registro
        </Link>
      </div>
    )
  }

  const displayInfo = CYCLE_STATUS_DISPLAY[status]
  const fertilityInfo = FERTILITY_LEVEL_INFO[displayInfo.fertilityLevel]

  return (
    <div
      className={cn(
        'rounded-2xl p-6 space-y-4 border-2',
        displayInfo.bgColor,
        displayInfo.borderColor,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {cycleDay && (
            <p className={cn('text-xs font-medium opacity-70', displayInfo.textColor)}>
              Dia {cycleDay} do ciclo
            </p>
          )}
          <h2 className={cn('text-xl font-bold', displayInfo.textColor)}>{title}</h2>
        </div>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
            fertilityInfo.bgColor,
            fertilityInfo.textColor,
          )}
        >
          {fertilityInfo.label}
        </span>
      </div>

      <p className={cn('text-sm leading-relaxed', displayInfo.textColor)}>{message}</p>

      <div className={cn('rounded-xl p-4 text-sm leading-relaxed border', displayInfo.borderColor,
        displayInfo.bgColor === 'bg-white' ? 'bg-rose-50' : 'bg-white/20'
      )}>
        <p className={cn('font-medium mb-1', displayInfo.textColor)}>Orientação:</p>
        <p className={cn('opacity-90', displayInfo.textColor)}>{recommendation}</p>
      </div>

      {showRegisterPrompt && (
        <Link
          href="/registrar"
          className={cn(
            'block text-center font-semibold rounded-xl py-3 text-sm transition border',
            'bg-white/80 hover:bg-white',
            displayInfo.textColor,
            displayInfo.borderColor,
          )}
        >
          + Registrar hoje
        </Link>
      )}
    </div>
  )
}
