import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../supabase'
import { Room } from '../domain/entities/Room'
import { Player } from '../domain/entities/Player'
import { GameState } from '../domain/entities/GameState'
import { SupabaseRoomRepository } from '../infrastructure/repositories/SupabaseRoomRepository'
import { SupabaseGameRepository } from '../infrastructure/repositories/SupabaseGameRepository'

interface GameContextValue {
  room: Room | null
  players: Player[]
  gameState: GameState | null
  myHand: string[]
  myPlayer: Player | null
  userId: string | null
  loading: boolean
  refreshHand: () => Promise<void>
}

const GameContext = createContext<GameContextValue>({
  room: null, players: [], gameState: null, myHand: [], myPlayer: null,
  userId: null, loading: true, refreshHand: async () => {},
})

export function GameProvider({ roomId, children }: { roomId: string; children: ReactNode }) {
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [myHand, setMyHand] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const roomRepo = new SupabaseRoomRepository()
  const gameRepo = new SupabaseGameRepository()

  async function load(uid: string) {
    const [r, ps, gs, hand] = await Promise.all([
      roomRepo.findById(roomId),
      roomRepo.getPlayers(roomId),
      gameRepo.getState(roomId),
      gameRepo.getHand(roomId, uid),
    ])
    setRoom(r)
    setPlayers(ps)
    setGameState(gs)
    setMyHand(hand)
    setLoading(false)
  }

  async function refreshHand() {
    if (!userId) return
    const hand = await gameRepo.getHand(roomId, userId)
    setMyHand(hand)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id ?? null
      setUserId(uid)
      if (uid) load(uid)
    })
  }, [roomId])

  useEffect(() => {
    if (!userId) return

    // Realtime: room players
    const playersSub = supabase
      .channel(`room-players-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'card_room_players', filter: `room_id=eq.${roomId}` },
        () => roomRepo.getPlayers(roomId).then(setPlayers))
      .subscribe()

    // Realtime: game state
    const stateSub = supabase
      .channel(`game-state-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'card_game_state', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>
          if (row) setGameState({
            id: row.id as string,
            roomId: row.room_id as string,
            trumpSuit: row.trump_suit as GameState['trumpSuit'],
            trumpCardCode: row.trump_card_code as string | null,
            currentSeat: row.current_seat as number,
            currentTrick: (row.current_trick as GameState['currentTrick']) ?? [],
            lastTrickWinnerSeat: row.last_trick_winner_seat as number | null,
            scores: row.scores as Record<string, number>,
            tricksPlayed: row.tricks_played as number,
            deckRemaining: row.deck_remaining as number,
            gameOver: row.game_over as boolean,
            winnerTeam: row.winner_team as number | null,
            updatedAt: row.updated_at as string,
          })
        })
      .subscribe()

    // Realtime: room status
    const roomSub = supabase
      .channel(`room-status-${roomId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'card_rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>
          if (row) setRoom(prev => prev ? { ...prev, status: row.status as Room['status'] } : prev)
        })
      .subscribe()

    // Refresh hand when game state changes (after trick completion)
    const handSub = supabase
      .channel(`hand-${roomId}-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'card_hands', filter: `room_id=eq.${roomId}` },
        () => refreshHand())
      .subscribe()

    return () => {
      supabase.removeChannel(playersSub)
      supabase.removeChannel(stateSub)
      supabase.removeChannel(roomSub)
      supabase.removeChannel(handSub)
    }
  }, [roomId, userId])

  const myPlayer = players.find(p => p.userId === userId) ?? null

  return (
    <GameContext.Provider value={{ room, players, gameState, myHand, myPlayer, userId, loading, refreshHand }}>
      {children}
    </GameContext.Provider>
  )
}

export const useGame = () => useContext(GameContext)
