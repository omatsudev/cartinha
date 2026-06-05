import { useEffect, useState } from 'react'
import { ShuffleIntensity } from '@/lib/domain/entities/GameState'
import { cn } from '@/lib/utils/cn'

interface ShufflePhaseProps {
  dealerNickname: string
  isDealer: boolean
  onConfirm: (intensity: ShuffleIntensity, useSessionDeck: boolean) => void
}

const INTENSITY_LABELS: Record<ShuffleIntensity, { label: string; desc: string }> = {
  low:    { label: 'Pouco',  desc: '2 cortes' },
  medium: { label: 'Médio',  desc: '4 cortes' },
  high:   { label: 'Muito',  desc: 'Embaralhado completo' },
}

export function ShufflePhase({ dealerNickname, isDealer, onConfirm }: ShufflePhaseProps) {
  const [intensity, setIntensity] = useState<ShuffleIntensity>('medium')
  const [useSession, setUseSession] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (!isDealer) return
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval)
          handleDeal('medium', false)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isDealer])

  function handleDeal(int: ShuffleIntensity, session: boolean) {
    setAnimating(true)
    setTimeout(() => onConfirm(int, session), 1800)
  }

  if (animating) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12">
        <div className="relative w-32 h-20">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                         w-12 h-16 rounded-lg bg-gradient-to-br from-green-700 to-green-900
                         border-2 border-green-600 card-shadow"
              style={{
                animation: `shuffle-fan 0.3s ease-in-out ${i * 0.06}s infinite alternate`,
                transform: `translateX(${(i - 3) * 14}px) rotate(${(i - 3) * 6}deg) translateY(-50%)`,
              }}
            />
          ))}
        </div>
        <p className="text-green-300 text-lg font-bold animate-pulse">Embaralhando...</p>
      </div>
    )
  }

  if (!isDealer) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="text-4xl animate-bounce">🃏</div>
        <p className="text-white font-bold text-lg">{dealerNickname} está embaralhando...</p>
        <p className="text-green-400 text-sm">Aguarde</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-5 py-6 px-2">
      <div className="text-center">
        <div className="text-4xl mb-2">🃏</div>
        <p className="text-white font-bold text-lg">É sua vez de embaralhar!</p>
        <p className="text-green-400 text-sm">({countdown}s para auto-embaralhar)</p>
      </div>

      {/* Deck choice */}
      <div className="w-full max-w-xs">
        <p className="text-green-300 text-sm font-medium mb-2">Baralho</p>
        <div className="grid grid-cols-2 gap-2">
          {([false, true] as const).map(session => (
            <button
              key={String(session)}
              onClick={() => setUseSession(session)}
              className={cn(
                'rounded-xl py-3 px-3 text-sm font-semibold border transition-all',
                useSession === session
                  ? 'bg-green-600 border-green-500 text-white'
                  : 'bg-black/30 border-green-800 text-green-400 hover:border-green-600',
              )}
            >
              {session ? '♻️ Continuar' : '🆕 Novo'}
            </button>
          ))}
        </div>
        {useSession && (
          <p className="text-xs text-green-500 mt-1 text-center">Cartas da partida anterior</p>
        )}
      </div>

      {/* Shuffle intensity */}
      <div className="w-full max-w-xs">
        <p className="text-green-300 text-sm font-medium mb-2">Quanto embaralhar?</p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(INTENSITY_LABELS) as [ShuffleIntensity, { label: string; desc: string }][]).map(([key, { label, desc }]) => (
            <button
              key={key}
              onClick={() => setIntensity(key)}
              className={cn(
                'rounded-xl py-3 px-2 text-center border transition-all',
                intensity === key
                  ? 'bg-green-600 border-green-500 text-white'
                  : 'bg-black/30 border-green-800 text-green-400 hover:border-green-600',
              )}
            >
              <div className="font-bold text-sm">{label}</div>
              <div className="text-xs opacity-70 mt-0.5">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => handleDeal(intensity, useSession)}
        className="w-full max-w-xs bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl py-4 text-base transition"
      >
        Embaralhar e distribuir
      </button>
    </div>
  )
}
