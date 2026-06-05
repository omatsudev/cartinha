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
  botIds: string[]
  getHand: (userId: string) => Promise<string[]>
  onHandChange: () => void
}

export function useBotPlayer({ room, players, gameState, botIds, getHand, onHandChange }: UseBotPlayerOptions) {
  // Keep refs updated so the effect always sees the latest values
  // without adding them to the dependency array and causing extra runs
  const roomRef = useRef(room)
  const playersRef = useRef(players)
  const botIdsRef = useRef(botIds)
  const getHandRef = useRef(getHand)
  const onHandChangeRef = useRef(onHandChange)

  useEffect(() => { roomRef.current = room }, [room])
  useEffect(() => { playersRef.current = players }, [players])
  useEffect(() => { botIdsRef.current = botIds }, [botIds])
  useEffect(() => { getHandRef.current = getHand }, [getHand])
  useEffect(() => { onHandChangeRef.current = onHandChange }, [onHandChange])

  const playingRef = useRef(false)

  useEffect(() => {
    const r = roomRef.current
    const gs = gameState
    const bots = botIdsRef.current
    const ps = playersRef.current

    if (!r || !gs || gs.gameOver || bots.length === 0) return

    const currentPlayer = ps.find(p => p.seat === gs.currentSeat)
    if (!currentPlayer) return
    if (!bots.includes(currentPlayer.userId)) return
    if (playingRef.current) return

    playingRef.current = true
    const delay = 600 + Math.random() * 600

    const timer = setTimeout(async () => {
      try {
        const hand = await getHandRef.current(currentPlayer.userId)
        if (!hand.length) return

        const cardCode = chooseBotCard(
          hand,
          gs.currentTrick,
          gs.trumpSuit!,
          r.gameType,
        )

        const playerIds = Array.from({ length: r.maxPlayers }, (_, i) =>
          playersRef.current.find(p => p.seat === i)?.userId ?? '',
        )

        await playCardUseCase({
          roomId: r.id,
          userId: currentPlayer.userId,
          seat: gs.currentSeat,
          cardCode,
          gameType: r.gameType,
          playerCount: r.maxPlayers as 2 | 4,
          playerIds,
        })

        onHandChangeRef.current()
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
