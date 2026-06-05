import { cn } from '@/lib/utils/cn'
import { CycleStatus, CYCLE_STATUS_DISPLAY } from '@/lib/domain/enums/CycleStatus'

const LEGEND_ITEMS: CycleStatus[] = [
  CycleStatus.MENSTRUATION,
  CycleStatus.DRY_BIP,
  CycleStatus.MUCUS_BIP,
  CycleStatus.PATTERN_CHANGE,
  CycleStatus.FERTILE,
  CycleStatus.PEAK,
  CycleStatus.POST_PEAK_1,
  CycleStatus.INFERTILE_POST_PEAK,
]

export function FertilityLegend() {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500">Legenda</p>
      <div className="grid grid-cols-2 gap-2">
        {LEGEND_ITEMS.map((status) => {
          const info = CYCLE_STATUS_DISPLAY[status]
          return (
            <div key={status} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-6 h-6 rounded-md border flex items-center justify-center text-[9px] font-bold flex-shrink-0',
                  info.bgColor,
                  info.textColor,
                  info.borderColor,
                )}
              >
                {info.symbol}
              </div>
              <span className="text-xs text-gray-600 leading-tight">{info.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
