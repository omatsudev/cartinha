import { cn } from '@/lib/utils/cn'
import { CardComponent } from './CardComponent'
import { TrickCard } from '@/lib/domain/entities/GameState'
import { Player } from '@/lib/domain/entities/Player'
import { SUIT_SYMBOL, SUIT_LABEL } from '@/lib/domain/enums/Suit'
import { parseCard } from '@/lib/domain/entities/Card'

interface TrickAreaProps {
  trick: TrickCard[]
  players: Player[]
  trumpCardCode: string | null
  deckRemaining: number
  currentSeat: number
  myPlayerSeat: number | null
}

export function TrickArea({ trick, players, trumpCardCode, deckRemaining, currentSeat, myPlayerSeat }: TrickAreaProps) {
  const trump = trumpCardCode ? parseCard(trumpCardCode) : null

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Current trick */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 min-h-[80px] sm:min-h-[100px]">
        {trick.length === 0 ? (
          <p className="text-green-400/60 text-sm italic">Mesa vazia</p>
        ) : (
          trick.map((t) => {
            const player = players.find(p => p.seat === t.seat)
            return (
              <div key={t.seat} className="flex flex-col items-center gap-1">
                <CardComponent code={t.cardCode} size="md" className="animate-flip-in" />
                <span className="text-xs text-green-300 truncate max-w-[60px] sm:max-w-[80px]">
                  {player?.nickname ?? `Jogador ${t.seat + 1}`}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* Info row: trump + deck + current turn */}
      <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm flex-wrap justify-center">
        {trump && (
          <div className="flex items-center gap-1.5 bg-black/20 rounded-lg px-3 py-1.5">
            <span className="text-green-300">Trunfo:</span>
            <span className={cn('font-bold', trump.suit === 'ouros' || trump.suit === 'copas' ? 'text-red-400' : 'text-white')}>
              {SUIT_SYMBOL[trump.suit]} {SUIT_LABEL[trump.suit]}
            </span>
          </div>
        )}
        {deckRemaining > 0 && (
          <div className="flex items-center gap-1.5 bg-black/20 rounded-lg px-3 py-1.5">
            <span className="text-green-300">Baralho:</span>
            <span className="font-bold text-white">{deckRemaining}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 bg-black/20 rounded-lg px-3 py-1.5">
          <span className={cn('w-2 h-2 rounded-full', currentSeat === myPlayerSeat ? 'bg-green-400' : 'bg-yellow-400')} />
          <span className="text-white font-medium">
            {currentSeat === myPlayerSeat
              ? 'Sua vez'
              : `Vez de ${players.find(p => p.seat === currentSeat)?.nickname ?? `Jogador ${currentSeat + 1}`}`}
          </span>
        </div>
      </div>
    </div>
  )
}
