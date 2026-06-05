import { cn } from '@/lib/utils/cn'
import { parseCard, CARD_LABEL } from '@/lib/domain/entities/Card'
import { SUIT_SYMBOL, SUIT_COLOR } from '@/lib/domain/enums/Suit'

interface CardProps {
  code: string
  onClick?: () => void
  selected?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  faceDown?: boolean
  className?: string
}

const sizes = {
  sm: { card: 'w-10 h-14 sm:w-12 sm:h-16 text-xs', value: 'text-xs', symbol: 'text-base' },
  md: { card: 'w-14 h-20 sm:w-16 sm:h-24 text-sm', value: 'text-sm', symbol: 'text-xl' },
  lg: { card: 'w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 text-base', value: 'text-base', symbol: 'text-2xl' },
}

export function CardComponent({ code, onClick, selected, disabled, size = 'md', faceDown, className }: CardProps) {
  const s = sizes[size]

  if (faceDown) {
    return (
      <div className={cn(
        s.card,
        'rounded-lg bg-gradient-to-br from-green-700 to-green-900 border-2 border-green-600',
        'card-shadow flex items-center justify-center select-none',
        className,
      )}>
        <span className="text-green-500 text-lg">🃏</span>
      </div>
    )
  }

  const card = parseCard(code)
  const colorClass = SUIT_COLOR[card.suit]
  const isRed = card.suit === 'ouros' || card.suit === 'copas'

  return (
    <button
      onClick={onClick}
      disabled={disabled || !onClick}
      className={cn(
        s.card,
        'relative rounded-lg bg-white border-2 card-shadow',
        'flex flex-col justify-between p-1 select-none',
        'transition-all duration-200',
        onClick && !disabled && 'cursor-pointer hover:-translate-y-2 hover:scale-105 active:scale-95',
        selected && '-translate-y-3 scale-105 border-yellow-400 ring-2 ring-yellow-300',
        !selected && 'border-gray-200',
        disabled && !selected && 'opacity-60 cursor-not-allowed',
        className,
      )}
    >
      <div className={cn('leading-none font-bold', colorClass, s.value)}>
        {CARD_LABEL[card.value]}
      </div>
      <div className={cn('text-center', colorClass, s.symbol)}>
        {SUIT_SYMBOL[card.suit]}
      </div>
      <div className={cn('leading-none font-bold rotate-180', colorClass, s.value)}>
        {CARD_LABEL[card.value]}
      </div>
    </button>
  )
}
