import { cn } from '@/lib/utils/cn'
import { CardComponent } from './CardComponent'
import { TrickCard } from '@/lib/domain/entities/GameState'
import { Player } from '@/lib/domain/entities/Player'
import { Suit, SUIT_SYMBOL, SUIT_COLOR } from '@/lib/domain/enums/Suit'
import { parseCard } from '@/lib/domain/entities/Card'
import { useEffect, useRef, useState } from 'react'

interface TrickAreaProps {
  trick: TrickCard[]
  lastTrick: TrickCard[]
  players: Player[]
  trumpSuit: Suit | null
  trumpCardCode: string | null
  deckRemaining: number
  tricksPlayed: number
  currentSeat: number
  myPlayerSeat: number | null
}

export function TrickArea({ trick, lastTrick, players, trumpSuit, trumpCardCode, deckRemaining, tricksPlayed, currentSeat, myPlayerSeat }: TrickAreaProps) {
  const trump = trumpCardCode ? parseCard(trumpCardCode) : null
  // Show trump card when there are still cards in the deck (Bisca), hide after 3 tricks
  const showTrumpCard = trump && tricksPlayed < 3
  // In Sueca (no deck), show trump suit badge throughout the game
  const showTrumpBadge = trumpSuit && !showTrumpCard && deckRemaining === 0

  // Show the completed trick for 2 seconds; lock display so fast bots/players don't erase it
  const [displayTrick, setDisplayTrick] = useState<TrickCard[]>(trick)
  const [showingCompleted, setShowingCompleted] = useState(false)
  const [fading, setFading] = useState(false)
  const prevTrickRef = useRef<TrickCard[]>(trick)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (trick.length > 0) {
      // Always update prevTrick so next completion detection works, even while locked
      prevTrickRef.current = trick
      if (showingCompleted) return  // locked — don't overwrite the 4-card display
      if (timerRef.current) clearTimeout(timerRef.current)
      setFading(false)
      setDisplayTrick(trick)
    } else if (prevTrickRef.current.length > 0 && lastTrick.length > 0) {
      // Trick just completed — show all 4 cards, lock display for 2.2s
      if (timerRef.current) clearTimeout(timerRef.current)
      setDisplayTrick(lastTrick)
      setFading(false)
      setShowingCompleted(true)
      prevTrickRef.current = []
      timerRef.current = setTimeout(() => {
        setFading(true)
        setTimeout(() => { setShowingCompleted(false); setFading(false) }, 400)
      }, 1800)
    } else if (!showingCompleted) {
      setDisplayTrick([])
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [trick, lastTrick, showingCompleted])

  return (
    <div className="flex flex-col items-center gap-2 w-full">

      {/* Trump card + deck info */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {showTrumpCard && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-green-300 text-xs font-medium">Trunfo</span>
            <CardComponent code={trumpCardCode!} size="md" />
          </div>
        )}
        {showTrumpBadge && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-green-300 text-xs font-medium">Trunfo</span>
            <div className={cn(
              'flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border-2 bg-white shadow-md',
              trumpSuit === 'ouros' || trumpSuit === 'copas'
                ? 'border-red-400 text-red-600'
                : 'border-slate-700 text-slate-900',
            )}>
              <span className="text-2xl font-black leading-none">{SUIT_SYMBOL[trumpSuit!]}</span>
            </div>
          </div>
        )}
        {deckRemaining > 0 && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-green-300 text-xs font-medium">Baralho</span>
            <div className="relative">
              <CardComponent code="X_X" faceDown size="md" />
              <span className="absolute -bottom-1 -right-1 bg-green-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                {deckRemaining}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Current / last trick */}
      <div className={cn(
        'flex items-center justify-center gap-2 sm:gap-3 transition-opacity duration-400',
        fading && 'opacity-0',
      )}>
        {displayTrick.length === 0 ? (
          <p className="text-green-400/50 text-sm italic">Mesa vazia</p>
        ) : (
          displayTrick.map((t) => {
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
