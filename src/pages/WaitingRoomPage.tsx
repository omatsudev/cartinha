import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { SupabaseRoomRepository } from '@/lib/infrastructure/repositories/SupabaseRoomRepository'
import { startGameUseCase } from '@/lib/application/use-cases/CreateRoomUseCase'
import { Room } from '@/lib/domain/entities/Room'
import { Player } from '@/lib/domain/entities/Player'
import { ShareButton } from '@/components/lobby/ShareButton'
import { GAME_TYPE_LABEL } from '@/lib/domain/enums/GameType'
import { Users, Crown, Clock } from 'lucide-react'

export default function WaitingRoomPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  const roomRepo = new SupabaseRoomRepository()
  const roomUrl = `${window.location.origin}/sala/${code}`

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/login'); return }

      const uid = session.user.id
      setUserId(uid)

      const r = await roomRepo.findByCode(code!)
      if (!r) { navigate('/criar'); return }

      if (r.status === 'playing') { navigate(`/jogo/${r.id}`); return }

      setRoom(r)

      // Auto-join if not already in room
      const ps = await roomRepo.getPlayers(r.id)
      const alreadyIn = ps.find(p => p.userId === uid)
      if (!alreadyIn) {
        const nickname = session.user.user_metadata?.nickname ?? session.user.email?.split('@')[0] ?? 'Jogador'
        try {
          await roomRepo.joinRoom(r.id, uid, nickname)
        } catch (e) {
          setError((e as Error).message)
        }
      }

      const fresh = await roomRepo.getPlayers(r.id)
      setPlayers(fresh)
      setLoading(false)
    }
    init()
  }, [code])

  useEffect(() => {
    if (!room) return

    const sub = supabase
      .channel(`waiting-${room.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'card_room_players', filter: `room_id=eq.${room.id}` },
        () => roomRepo.getPlayers(room.id).then(setPlayers))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'card_rooms', filter: `id=eq.${room.id}` },
        (payload) => {
          const r = payload.new as Record<string, unknown>
          if (r.status === 'playing') navigate(`/jogo/${room.id}`)
        })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [room])

  async function handleStart() {
    if (!room) return
    setStarting(true)
    try {
      const playerIds = [...players].sort((a, b) => a.seat - b.seat).map(p => p.userId)
      await startGameUseCase(room.id, room.gameType, playerIds)
      navigate(`/jogo/${room.id}`)
    } catch (e) {
      setError((e as Error).message)
      setStarting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen felt-table flex items-center justify-center">
        <p className="text-green-400 animate-pulse">Carregando sala...</p>
      </div>
    )
  }

  if (!room) return null

  const isHost = room.hostId === userId
  const canStart = players.length === room.maxPlayers
  const spotsLeft = room.maxPlayers - players.length

  return (
    <div className="min-h-screen felt-table flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Room info */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🃏</div>
          <h1 className="text-xl sm:text-2xl font-black text-white">{GAME_TYPE_LABEL[room.gameType]}</h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="font-mono text-3xl sm:text-4xl font-black text-green-400 tracking-[0.2em]">{room.code}</span>
          </div>
          <p className="text-green-500 text-sm mt-1">Código da sala</p>
        </div>

        {/* Players list */}
        <div className="bg-black/30 border border-green-700/50 rounded-2xl p-5 mb-4 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-green-400" />
              Jogadores
            </h2>
            <span className="text-sm text-green-400">{players.length}/{room.maxPlayers}</span>
          </div>

          <div className="space-y-2">
            {Array.from({ length: room.maxPlayers }).map((_, seat) => {
              const player = players.find(p => p.seat === seat)
              return (
                <div key={seat} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                  player ? 'bg-green-900/50 border border-green-700/50' : 'bg-black/20 border border-dashed border-green-800'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    player ? 'bg-green-600 text-white' : 'bg-green-900 text-green-600'
                  }`}>
                    {player ? player.nickname[0].toUpperCase() : seat + 1}
                  </div>
                  {player ? (
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-white font-medium">{player.nickname}</span>
                      {player.userId === userId && <span className="text-xs text-green-400">(você)</span>}
                      {player.userId === room.hostId && <Crown className="w-3 h-3 text-yellow-400" />}
                      {room.maxPlayers === 4 && (
                        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                          player.team === 0 ? 'bg-blue-900/50 text-blue-300' : 'bg-purple-900/50 text-purple-300'
                        }`}>Eq. {(player.team ?? 0) + 1}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-green-700 italic text-sm flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Aguardando jogador...
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Share */}
        {spotsLeft > 0 && (
          <div className="bg-black/30 border border-green-700/50 rounded-2xl p-5 mb-4 backdrop-blur">
            <p className="text-sm text-green-300 mb-3 font-medium">
              Faltam {spotsLeft} jogador{spotsLeft > 1 ? 'es' : ''} — convide pelo WhatsApp:
            </p>
            <ShareButton code={room.code} roomUrl={roomUrl} />
          </div>
        )}

        {/* Start button */}
        {isHost && (
          <button
            onClick={handleStart}
            disabled={!canStart || starting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl py-4 text-lg transition"
          >
            {starting ? 'Iniciando...' : canStart ? 'Iniciar partida!' : `Aguardando ${spotsLeft} jogador${spotsLeft > 1 ? 'es' : ''}...`}
          </button>
        )}
        {!isHost && (
          <p className="text-center text-green-500 text-sm py-2 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin" />
            Aguardando o anfitrião iniciar...
          </p>
        )}

        {error && <p className="text-center text-red-400 text-sm mt-3">{error}</p>}
      </div>
    </div>
  )
}
