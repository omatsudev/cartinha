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
  return (
    <div className={cn(
      'flex flex-col items-center gap-1',
      position === 'top' && 'flex-col',
      position === 'left' && 'flex-row',
      position === 'right' && 'flex-row-reverse',
    )}>
      <div className={cn('flex', position === 'top' ? 'flex-row -space-x-3' : 'flex-col -space-y-6')}>
        {Array.from({ length: Math.min(cardCount, 10) }).map((_, i) => (
          <CardComponent key={i} code="X_X" faceDown size="sm" className={position !== 'top' ? 'rotate-90' : ''} />
        ))}
      </div>
      <div className={cn('flex items-center gap-1.5', isCurrentTurn && 'text-yellow-300')}>
        {isCurrentTurn && <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />}
        <span className={cn('text-xs font-medium truncate max-w-[80px]', isCurrentTurn ? 'text-yellow-300' : 'text-green-400')}>
          {player.nickname}
        </span>
        <span className="text-green-500 text-xs">({cardCount})</span>
      </div>
    </div>
  )
}
