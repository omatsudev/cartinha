import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { CardComponent } from './CardComponent'
import { Button } from '../ui/button'

interface PlayerHandProps {
  cards: string[]
  isMyTurn: boolean
  onPlayCard: (code: string) => Promise<void>
  gameType: 'bisca' | 'sueca'
  ledSuit: string | null
}

export function PlayerHand({ cards, isMyTurn, onPlayCard, gameType, ledSuit }: PlayerHandProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)

  async function handlePlay() {
    if (!selected || !isMyTurn) return
    setPlaying(true)
    try {
      await onPlayCard(selected)
      setSelected(null)
    } catch (err) {
      alert((err as Error).message)
    } finally {
      setPlaying(false)
    }
  }

  function isCardDisabled(code: string): boolean {
    if (!isMyTurn) return true
    if (gameType !== 'sueca' || !ledSuit) return false
    // Sueca: must follow suit if possible
    const hasSuit = cards.some(c => c.split('_')[1] === ledSuit)
    if (!hasSuit) return false
    return code.split('_')[1] !== ledSuit
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Cards fan */}
      <div className={cn(
        'flex items-end justify-center',
        cards.length <= 4 ? 'gap-1.5 sm:gap-2' : '-space-x-3 sm:-space-x-2',
      )}>
        {cards.map((code) => (
          <CardComponent
            key={code}
            code={code}
            size="lg"
            selected={selected === code}
            disabled={isCardDisabled(code)}
            onClick={isMyTurn ? () => setSelected(selected === code ? null : code) : undefined}
          />
        ))}
      </div>

      {/* Play button */}
      {isMyTurn && selected && (
        <Button
          onClick={handlePlay}
          disabled={playing}
          size="lg"
          className="animate-slide-up min-w-[140px]"
        >
          {playing ? 'Jogando...' : 'Jogar carta'}
        </Button>
      )}

      {!isMyTurn && (
        <p className="text-green-300 text-sm font-medium animate-pulse">Aguardando sua vez...</p>
      )}
    </div>
  )
}
