import { useEffect, useRef } from 'react'
import { GameState } from '@/lib/domain/entities/GameState'
import { Room } from '@/lib/domain/entities/Room'
import { Player } from '@/lib/domain/entities/Player'
import { chooseBotCard } from '@/lib/domain/services/BotService'
import { playCardUseCase } from '@/lib/application/use-cases/PlayCardUseCase'

interface UseBotPlayerOptions {
  room: Room | null
  players: Player[]
  gameState: GameState | null
  botIds: string[]           // UUIDs of bot players (stable per game)
  getHand: (userId: string) => Promise<string[]>
  onHandChange: () => void
}

export function useBotPlayer({ room, players, gameState, botIds, getHand, onHandChange }: UseBotPlayerOptions) {
  const playingRef = useRef(false)

  useEffect(() => {
    if (!room || !gameState || gameState.gameOver || botIds.length === 0) return

    const currentSeat = gameState.currentSeat
    const currentPlayer = players.find(p => p.seat === currentSeat)
    if (!currentPlayer) return

    const isBot = botIds.includes(currentPlayer.userId)
    if (!isBot) return
    if (playingRef.current) return

    playingRef.current = true

    const delay = 600 + Math.random() * 600

    const timer = setTimeout(async () => {
      try {
        const hand = await getHand(currentPlayer.userId)
        if (!hand.length) return

        const cardCode = chooseBotCard(
          hand,
          gameState.currentTrick,
          gameState.trumpSuit!,
          room.gameType,
        )

        const playerIds = Array.from({ length: room.maxPlayers }, (_, i) =>
          players.find(p => p.seat === i)?.userId ?? '',
        )

        await playCardUseCase({
          roomId: room.id,
          userId: currentPlayer.userId,
          seat: currentSeat,
          cardCode,
          gameType: room.gameType,
          playerCount: room.maxPlayers as 2 | 4,
          playerIds,
        })

        onHandChange()
      } catch {
        // ignore transient errors; next state update will retry
      } finally {
        playingRef.current = false
      }
    }, delay)

    return () => {
      clearTimeout(timer)
      playingRef.current = false
    }
  }, [gameState?.currentSeat, gameState?.gameOver, gameState?.updatedAt])
}
