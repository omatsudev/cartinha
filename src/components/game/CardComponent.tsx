import { cn } from '@/lib/utils/cn'
import { parseCard, CARD_LABEL, CardValue } from '@/lib/domain/entities/Card'
import { SUIT_SYMBOL, SUIT_COLOR } from '@/lib/domain/enums/Suit'
import { Suit } from '@/lib/domain/enums/Suit'

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
  sm: { card: 'w-10 h-14 sm:w-12 sm:h-16 text-xs', label: 'text-[9px]', suit: 'text-sm', fig: 'h-6' },
  md: { card: 'w-14 h-20 sm:w-16 sm:h-24 text-sm', label: 'text-[10px]', suit: 'text-lg', fig: 'h-9' },
  lg: { card: 'w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 text-base', label: 'text-xs', suit: 'text-2xl', fig: 'h-12 sm:h-14' },
}

const COURT_VALUES: CardValue[] = ['K', 'Q', 'J']

function CourtFigure({ value, suit, className }: { value: CardValue; suit: Suit; className?: string }) {
  const isRed = suit === 'ouros' || suit === 'copas'
  const color = isRed ? '#dc2626' : '#1e293b'
  const suitSym = SUIT_SYMBOL[suit]

  if (value === 'K') {
    return (
      <svg viewBox="0 0 44 56" className={className} fill={color}>
        {/* Crown */}
        <polygon points="4,44 4,28 14,38 22,14 30,38 40,28 40,44" />
        {/* Crown base */}
        <rect x="4" y="44" width="36" height="6" rx="2" />
        {/* Gems */}
        <circle cx="13" cy="47" r="2.5" fill="white" opacity="0.7"/>
        <circle cx="22" cy="47" r="2.5" fill="white" opacity="0.7"/>
        <circle cx="31" cy="47" r="2.5" fill="white" opacity="0.7"/>
        {/* Suit symbol */}
        <text x="22" y="13" textAnchor="middle" fontSize="10" fill={color} fontFamily="serif">{suitSym}</text>
      </svg>
    )
  }

  if (value === 'Q') {
    return (
      <svg viewBox="0 0 44 56" className={className} fill={color}>
        {/* Tiara */}
        <path d="M8,24 Q11,10 22,14 Q33,10 36,24 L34,28 L10,28 Z" />
        {/* Face oval */}
        <ellipse cx="22" cy="40" rx="11" ry="13" fill="none" stroke={color} strokeWidth="2"/>
        {/* Neck */}
        <line x1="18" y1="53" x2="26" y2="53" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
        {/* Tiara gem */}
        <circle cx="22" cy="14" r="3" fill="white" opacity="0.7"/>
      </svg>
    )
  }

  // J = Valete — sword
  return (
    <svg viewBox="0 0 44 56" className={className}>
      {/* Blade */}
      <polygon points="20,4 24,4 24.5,38 19.5,38" fill={color}/>
      {/* Tip */}
      <polygon points="20,4 22,0 24,4" fill={color}/>
      {/* Crossguard */}
      <rect x="6" y="26" width="32" height="5" rx="2.5" fill={color}/>
      {/* Grip */}
      <rect x="19.5" y="38" width="5" height="13" rx="2" fill={color}/>
      {/* Pommel */}
      <ellipse cx="22" cy="52" rx="6.5" ry="4" fill={color}/>
    </svg>
  )
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
  const isCourt = COURT_VALUES.includes(card.value)

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
      {/* Top-left corner */}
      <div className={cn('flex flex-col items-center leading-none', colorClass)}>
        <span className={cn('font-black', s.label)}>{CARD_LABEL[card.value]}</span>
        <span className={cn('leading-none', size === 'sm' ? 'text-[10px]' : 'text-sm')}>{SUIT_SYMBOL[card.suit]}</span>
      </div>

      {/* Center */}
      <div className="flex-1 flex items-center justify-center">
        {isCourt ? (
          <CourtFigure value={card.value} suit={card.suit} className={cn('w-auto', s.fig)} />
        ) : (
          <span className={cn('font-bold', colorClass, s.suit)}>{SUIT_SYMBOL[card.suit]}</span>
        )}
      </div>

      {/* Bottom-right corner (rotated) */}
      <div className={cn('flex flex-col items-center leading-none rotate-180', colorClass)}>
        <span className={cn('font-black', s.label)}>{CARD_LABEL[card.value]}</span>
        <span className={cn('leading-none', size === 'sm' ? 'text-[10px]' : 'text-sm')}>{SUIT_SYMBOL[card.suit]}</span>
      </div>
    </button>
  )
}
