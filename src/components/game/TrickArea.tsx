import { cn } from '@/lib/utils/cn'
import { CardComponent } from './CardComponent'
import { TrickCard } from '@/lib/domain/entities/GameState'
import { Player } from '@/lib/domain/entities/Player'
import { SUIT_SYMBOL, SUIT_LABEL } from '@/lib/domain/enums/Suit'
import { parseCard } from '@/lib/domain/entities/Card'
import { useEffect, useRef, useState } from 'react'

interface TrickAreaProps {
  trick: TrickCard[]
  lastTrick: TrickCard[]
  players: Player[]
  trumpCardCode: string | null
  deckRemaining: number
  tricksPlayed: number
  currentSeat: number
  myPlayerSeat: number | null
}

export function TrickArea({ trick, lastTrick, players, trumpCardCode, deckRemaining, tricksPlayed, currentSeat, myPlayerSeat }: TrickAreaProps) {
  const trump = trumpCardCode ? parseCard(trumpCardCode) : null
  // Hide trump card display after each player has played 3 cards
  const showTrumpCard = trump && tricksPlayed < 3

  // Show the last completed trick for 2 seconds before fading
  const [visibleTrick, setVisibleTrick] = useState<TrickCard[]>(trick)
  const [fading, setFading] = useState(false)
  const prevTrickRef = useRef<TrickCard[]>(trick)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (trick.length > 0) {
      // Ongoing trick — clear any lingering display
      if (timerRef.current) clearTimeout(timerRef.current)
      setFading(false)
      setVisibleTrick(trick)
      prevTrickRef.current = trick
    } else if (prevTrickRef.current.length > 0 && lastTrick.length > 0) {
      // Trick just completed — show it for 2 seconds
      if (timerRef.current) clearTimeout(timerRef.current)
      setVisibleTrick(lastTrick)
      setFading(false)
      timerRef.current = setTimeout(() => setFading(true), 1500)
      prevTrickRef.current = []
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [trick, lastTrick])

  return (
    <div className="flex flex-col items-center gap-3 w-full">

      {/* Trump card + deck info */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {showTrumpCard && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-green-400 text-xs">Trunfo</span>
            <CardComponent code={trumpCardCode!} size="sm" />
          </div>
        )}
        {deckRemaining > 0 && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-green-400 text-xs">Baralho</span>
            <div className="relative">
              <CardComponent code="X_X" faceDown size="sm" />
              <span className="absolute -bottom-1 -right-1 bg-green-700 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {deckRemaining}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Current / last trick */}
      <div className={cn(
        'flex items-center justify-center gap-2 sm:gap-3 min-h-[80px] sm:min-h-[90px] transition-opacity duration-500',
        fading && 'opacity-0',
      )}>
        {visibleTrick.length === 0 ? (
          <p className="text-green-400/50 text-sm italic">Mesa vazia</p>
        ) : (
          visibleTrick.map((t) => {
            const player = players.find(p => p.seat === t.seat)
            return (
              <div key={t.seat} className="flex flex-col items-center gap-1">
                <CardComponent code={t.cardCode} size="md" className="animate-flip-in" />
                <span className="text-xs text-green-300 truncate max-w-[60px] sm:max-w-[80px]">
                  {player?.nickname ?? `J${t.seat + 1}`}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* Turn indicator */}
      <div className="flex items-center gap-1.5 bg-black/20 rounded-lg px-3 py-1.5">
        <span className={cn('w-2 h-2 rounded-full', currentSeat === myPlayerSeat ? 'bg-green-400 animate-pulse' : 'bg-yellow-400')} />
        <span className="text-white font-medium text-xs sm:text-sm">
          {currentSeat === myPlayerSeat
            ? 'Sua vez'
            : `Vez de ${players.find(p => p.seat === currentSeat)?.nickname ?? `J${currentSeat + 1}`}`}
        </span>
      </div>
    </div>
  )
}
