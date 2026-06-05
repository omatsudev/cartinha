import { cn } from '@/lib/utils/cn'
import { CardComponent } from './CardComponent'
import { Player } from '@/lib/domain/entities/Player'

interface OpponentHandProps {
  player: Player
  cardCount: number
  isCurrentTurn: boolean
  position: 'top' | 'left' | 'right'
}

export function OpponentHand({ player, cardCount, isCurrentTurn, position }: OpponentHandProps) {
  const label = (
    <div className={cn('flex items-center gap-1', isCurrentTurn && 'text-yellow-300')}>
      {isCurrentTurn && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse shrink-0" />}
      <span className={cn('text-[11px] font-medium truncate max-w-[72px]', isCurrentTurn ? 'text-yellow-300' : 'text-green-400')}>
        {player.nickname}
      </span>
      <span className="text-green-600 text-[10px]">({cardCount})</span>
    </div>
  )

  if (position === 'top') {
    return (
      <div className="flex flex-col items-center gap-1">
        {label}
        <div className="flex flex-row -space-x-3">
          {Array.from({ length: Math.min(cardCount, 10) }).map((_, i) => (
            <CardComponent key={i} code="X_X" faceDown size="sm" />
          ))}
        </div>
      </div>
    )
  }

  // Left / Right: compact diagonal fan, max 5 visible cards + count badge
  const visibleCount = Math.min(cardCount, 5)
  const CARD_W = 44
  const CARD_H = 62
  const OFFSET = 4

  return (
    <div className={cn('flex items-center gap-1.5', position === 'right' && 'flex-row-reverse')}>
      <div className="relative shrink-0" style={{ width: CARD_W + (visibleCount - 1) * OFFSET, height: CARD_H + (visibleCount - 1) * OFFSET }}>
        {Array.from({ length: visibleCount }).map((_, i) => (
          <div key={i} className="absolute" style={{ top: i * OFFSET, left: i * OFFSET, zIndex: i }}>
            <CardComponent code="X_X" faceDown size="sm" />
          </div>
        ))}
        {cardCount > 0 && (
          <span className={cn(
            'absolute -bottom-1.5 -right-1.5 min-w-[18px] h-[18px] text-[10px] font-bold rounded-full flex items-center justify-center px-1 z-10 border',
            isCurrentTurn
              ? 'bg-yellow-500 text-black border-yellow-300'
              : 'bg-green-700 text-white border-green-500',
          )}>
            {cardCount}
          </span>
        )}
      </div>
      <div className={cn('flex flex-col items-center', position === 'right' && 'items-center')}>
        {label}
      </div>
    </div>
  )
}
