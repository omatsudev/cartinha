import { cn } from '@/lib/utils/cn'
import type { CycleStatus } from '@/lib/domain/enums/CycleStatus'
import { CYCLE_STATUS_DISPLAY } from '@/lib/domain/enums/CycleStatus'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-rose-100 text-rose-800',
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}

interface CycleStatusBadgeProps {
  status: CycleStatus
  className?: string
}

function CycleStatusBadge({ status, className }: CycleStatusBadgeProps) {
  const info = CYCLE_STATUS_DISPLAY[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold border',
        info.bgColor,
        info.textColor,
        info.borderColor,
        className,
      )}
    >
      <span>{info.symbol}</span>
      {info.label}
    </span>
  )
}

export { Badge, CycleStatusBadge }
