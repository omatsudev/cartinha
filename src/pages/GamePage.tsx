import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { GameProvider, useGame } from '@/lib/context/GameContext'
import { GameBoard } from '@/components/game/GameBoard'
import { ShufflePhase } from '@/components/game/ShufflePhase'
import { ScoreBoard, teamLabel } from '@/components/game/ScoreBoard'
import { ChatPanel, ChatFloatingButton, ChatDrawer } from '@/components/chat/ChatPanel'
import { SupabaseGameRepository } from '@/lib/infrastructure/repositories/SupabaseGameRepository'
import { SupabaseRoomRepository } from '@/lib/infrastructure/repositories/SupabaseRoomRepository'
import { GAME_TYPE_LABEL } from '@/lib/domain/enums/GameType'
import { SUIT_SYMBOL, SUIT_LABEL } from '@/lib/domain/enums/Suit'
import { seatToTeam } from '@/lib/domain/services/GameRulesEngine'
import { startNextRoundUseCase, dealNewSubGameUseCase } from '@/lib/application/use-cases/RematchUseCase'
import { ShuffleIntensity } from '@/lib/domain/entities/GameState'
import { Trophy, Star, Eye } from 'lucide-react'
import { getUserId, getNickname } from '@/lib/auth/identity'

const WIN_GOAL = 4

function GameWinsBar({ wins, label, highlight }: { wins: number; label: string; highlight: boolean }) {
  return (
    <div className={`flex-1 text-center rounded-xl px-3 py-2 border ${highlight ? 'bg-green-800/60 border-green-500' : 'bg-black/20 border-white/10'}`}>
      <p className="text-xs text-green-300 mb-1">{label}</p>
      <div className="flex items-center justify-center gap-1">
        {Array.from({ length: WIN_GOAL }).map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < wins ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
        ))}
      </div>
      <p className="text-xs text-green-400 mt-1">{wins}/{WIN_GOAL}</p>
    </div>
  )
}

function SubGameOverScreen() {
  const { room, players, gameState, myPlayer, userId, botIds } = useGame()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  if (!room || !gameState) return null

  const isHost = room.hostId === userId
  const isSoloMode = botIds.length > 0
  const canChoose = isHost || isSoloMode

  const playerCount = room.maxPlayers
  const dealer = players.find(p => p.seat === gameState.dealerSeat)

  async function handleNextRound(useSessionDeck: boolean) {
    setLoading(true)
    try {
      await startNextRoundUseCase(room!.id, useSessionDeck)
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  // Scoring explanation
  const winnerTeam = gameState.winnerTeam ?? 0
  const loserKey = playerCount === 4 ? String(winnerTeam === 0 ? 1 : 0) : String(winnerTeam === 0 ? 1 : 0)
  const loserScore = gameState.scores[loserKey] ?? 0
  const pointsEarned = loserScore === 0 ? 4 : loserScore < 30 ? 2 : 1

  return (
    <div className="min-h-screen felt-table flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-black/40 border border-green-700/50 rounded-3xl p-6 backdrop-blur">
          <div className="text-center mb-5">
            <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
            <h2 className="text-xl font-black text-white">Rodada {gameState.subGameNumber} encerrada</h2>
            {pointsEarned > 1 && (
              <p className="text-yellow-300 text-sm mt-1 font-semibold">
                {pointsEarned === 4 ? '🏆 Capote! +4 pontos de partida!' : `⭐ Menos de 30! +2 pontos de partida`}
              </p>
            )}
          </div>

          {/* Round scores */}
          <div className="mb-4">
            <p className="text-xs text-green-400 mb-2 text-center">Pontos desta rodada</p>
            <ScoreBoard players={players} gameState={gameState} playerCount={playerCount} myPlayerSeat={myPlayer?.seat ?? null} />
          </div>

          {/* Match wins */}
          <div className="mb-5">
            <p className="text-xs text-green-400 mb-2 text-center">Placar da partida (meta: {WIN_GOAL}★)</p>
            {playerCount === 4 ? (
              <div className="flex gap-2">
                <GameWinsBar
                  wins={gameState.gameWins['0'] ?? 0}
                  label={teamLabel(players, 0)}
                  highlight={players.find(p => p.seat === myPlayer?.seat)?.team === 0}
                />
                <GameWinsBar
                  wins={gameState.gameWins['1'] ?? 0}
                  label={teamLabel(players, 1)}
                  highlight={players.find(p => p.seat === myPlayer?.seat)?.team === 1}
                />
              </div>
            ) : (
              <div className="flex gap-2">
                {players.map(p => (
                  <GameWinsBar
                    key={p.id}
                    wins={gameState.gameWins[String(p.seat)] ?? 0}
                    label={p.nickname}
                    highlight={p.seat === myPlayer?.seat}
                  />
                ))}
              </div>
            )}
          </div>

          {canChoose ? (
            <div className="space-y-2">
              <p className="text-sm text-green-300 text-center mb-3">Próxima rodada — escolha o baralho:</p>
              <button
                onClick={() => handleNextRound(false)}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold rounded-xl py-3 transition"
              >
                🆕 Baralho novo
              </button>
              {gameState.sessionCards.length === 40 && (
                <button
                  onClick={() => handleNextRound(true)}
                  disabled={loading}
                  className="w-full bg-blue-700 hover:bg-blue-600 disabled:opacity-60 text-white font-bold rounded-xl py-3 transition"
                >
                  ♻️ Continuar com as mesmas cartas
                </button>
              )}
            </div>
          ) : (
            <p className="text-center text-green-400 text-sm animate-pulse">
              Aguardando {dealer?.nickname ?? 'anfitrião'} iniciar próxima rodada...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function ChoosingShuffleScreen() {
  const { room, players, gameState, userId, botIds } = useGame()
  const navigate = useNavigate()

  if (!room || !gameState) return null

  const isSoloMode = botIds.length > 0
  const dealer = players.find(p => p.seat === gameState.dealerSeat)
  const isDealer = dealer?.userId === userId || isSoloMode

  async function handleConfirm(intensity: ShuffleIntensity, _useSessionDeck: boolean) {
    const playerIds = Array.from({ length: room!.maxPlayers }, (_, i) =>
      players.find(p => p.seat === i)?.userId ?? '',
    )
    await dealNewSubGameUseCase(room!.id, intensity, playerIds)
  }

  return (
    <div className="min-h-screen felt-table flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm bg-black/40 border border-green-700/50 rounded-3xl p-6 backdrop-blur">
        <ShufflePhase
          dealerNickname={dealer?.nickname ?? 'Dealer'}
          isDealer={isDealer}
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  )
}

function MatchOverScreen() {
  const { room, players, gameState, myPlayer, userId } = useGame()
  const navigate = useNavigate()

  if (!room || !gameState) return null

  const playerCount = room.maxPlayers
  const winnerKey = Object.entries(gameState.gameWins).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '0'

  let winnerLabel = ''
  if (playerCount === 4) {
    winnerLabel = teamLabel(players, Number(winnerKey) as 0 | 1)
  } else {
    winnerLabel = players.find(p => p.seat === Number(winnerKey))?.nickname ?? 'Jogador'
  }

  return (
    <div className="min-h-screen felt-table flex flex-col items-center justify-center px-4 py-8">
      <div className="bg-black/40 border border-green-700/50 rounded-3xl p-8 text-center max-w-sm w-full backdrop-blur">
        <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-3xl font-black text-white mb-1">Partida encerrada!</h2>
        <p className="text-yellow-300 text-lg font-bold mb-6">🏆 {winnerLabel} venceu!</p>

        {playerCount === 4 ? (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[0, 1].map(team => (
              <div key={team} className={`rounded-xl p-3 border ${String(team) === winnerKey ? 'border-yellow-400 bg-yellow-900/20' : 'border-green-800 bg-black/20'}`}>
                <p className="text-xs text-green-400 font-semibold truncate">{teamLabel(players, team as 0 | 1)}</p>
                <div className="flex justify-center gap-0.5 my-1">
                  {Array.from({ length: WIN_GOAL }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < (gameState.gameWins[String(team)] ?? 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                  ))}
                </div>
                <div className="text-xs text-green-500 mt-1">
                  {players.filter(p => seatToTeam(p.seat) === team).map(p => p.nickname).join(', ')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 mb-6">
            {players.sort((a, b) => (gameState.gameWins[String(b.seat)] ?? 0) - (gameState.gameWins[String(a.seat)] ?? 0)).map((p, i) => (
              <div key={p.id} className={`flex items-center justify-between rounded-xl px-4 py-3 ${i === 0 ? 'bg-yellow-900/30 border border-yellow-600' : 'bg-black/20 border border-green-800'}`}>
                <span className="text-white font-medium">{i === 0 ? '🏆 ' : ''}{p.nickname}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: WIN_GOAL }).map((_, j) => (
                    <Star key={j} className={`w-3.5 h-3.5 ${j < (gameState.gameWins[String(p.seat)] ?? 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl py-3 transition"
        >
          Nova partida
        </button>
      </div>
    </div>
  )
}

function SpectatorView({ roomId }: { roomId: string }) {
  const roomRepo = new SupabaseRoomRepository()
  const userId = getUserId()
  const nickname = getNickname() ?? 'Espectador'
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    roomRepo.joinAsSpectator(roomId, userId, nickname).then(() => setJoined(true))
  }, [roomId])

  return (
    <div className="min-h-screen felt-table flex flex-col items-center justify-center px-4 gap-6">
      <div className="text-center">
        <Eye className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Modo espectador</h2>
        <p className="text-green-400 text-sm mt-1">Você está assistindo esta partida</p>
      </div>
      {joined && (
        <div className="w-full max-w-sm h-[60vh]">
          <ChatPanel roomId={roomId} isSpectator className="h-full" />
        </div>
      )}
    </div>
  )
}

function GameContent() {
  const { room, players, gameState, myPlayer, userId } = useGame()
  const [handSizes, setHandSizes] = useState<Record<number, number>>({})
  const [chatOpen, setChatOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const lastSeenRef = useRef(0)
  const gameRepo = new SupabaseGameRepository()

  async function loadHandSizes() {
    if (!room || !players.length) return
    const sizes: Record<number, number> = {}
    for (const p of players) {
      const hand = await gameRepo.getHand(room.id, p.userId)
      if (p.seat !== null) sizes[p.seat] = hand.length
    }
    setHandSizes(sizes)
  }

  useEffect(() => {
    loadHandSizes()
  }, [gameState?.updatedAt, room?.id, players.length])

  if (!room || !gameState) {
    return (
      <div className="min-h-screen felt-table flex items-center justify-center">
        <p className="text-green-400 animate-pulse">Carregando partida...</p>
      </div>
    )
  }

  // User is spectator if not in the players list as a player
  const isSpectator = !myPlayer || myPlayer.role === 'spectator'
  if (isSpectator) return <SpectatorView roomId={room.id} />

  const trump = gameState.trumpSuit

  if (gameState.phase === 'match_over') return <MatchOverScreen />
  if (gameState.phase === 'game_over_round') return <SubGameOverScreen />
  if (gameState.phase === 'choosing_shuffle') return <ChoosingShuffleScreen />

  return (
    <div className="h-screen overflow-hidden felt-table flex flex-col">
      <div className="shrink-0 flex items-center justify-between px-3 sm:px-4 py-1.5 bg-black/20 border-b border-green-800/50">
        <span className="text-sm font-bold text-white">{GAME_TYPE_LABEL[room.gameType]}</span>
        {trump && (
          <span className={`text-sm font-bold flex items-center gap-1 ${trump === 'ouros' || trump === 'copas' ? 'text-red-400' : 'text-gray-200'}`}>
            {SUIT_SYMBOL[trump]} {SUIT_LABEL[trump]}
          </span>
        )}
        <div className="flex items-center gap-2 text-xs text-green-400">
          <span>R{gameState.subGameNumber}</span>
          <span>·</span>
          <span>V{gameState.tricksPlayed}</span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Game area */}
        <div className="flex-1 overflow-hidden relative">
          <GameBoard playerHandSizes={handSizes} onRefreshHandSizes={loadHandSizes} />
          {/* Floating chat button on mobile */}
          <div className="absolute bottom-4 right-3 sm:hidden">
            <ChatFloatingButton unread={unread} onClick={() => { setChatOpen(true); setUnread(0) }} />
          </div>
        </div>

        {/* Sidebar chat on desktop */}
        <div className="hidden sm:flex w-72 border-l border-green-800/40">
          <ChatPanel roomId={room.id} isSpectator={false} className="flex-1 rounded-none border-none border-l-0" />
        </div>
      </div>

      {/* Mobile chat drawer */}
      {chatOpen && (
        <ChatDrawer roomId={room.id} isSpectator={false} onClose={() => setChatOpen(false)} />
      )}
    </div>
  )
}

export default function GamePage() {
  const { roomId } = useParams<{ roomId: string }>()
  if (!roomId) return null

  return (
    <GameProvider roomId={roomId}>
      <GameContent />
    </GameProvider>
  )
}
