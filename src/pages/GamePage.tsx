import { useParams, useNavigate } from 'react-router-dom'
import { GameProvider, useGame } from '@/lib/context/GameContext'
import { GameBoard } from '@/components/game/GameBoard'
import { SupabaseGameRepository } from '@/lib/infrastructure/repositories/SupabaseGameRepository'
import { GAME_TYPE_LABEL } from '@/lib/domain/enums/GameType'
import { SUIT_SYMBOL, SUIT_LABEL } from '@/lib/domain/enums/Suit'
import { seatToTeam } from '@/lib/domain/services/GameRulesEngine'
import { Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'

function GameContent() {
  const { room, players, gameState, myPlayer, userId } = useGame()
  const navigate = useNavigate()
  const [handSizes, setHandSizes] = useState<Record<number, number>>({})
  const gameRepo = new SupabaseGameRepository()

  useEffect(() => {
    if (!room || !players.length || !userId) return

    async function loadHandSizes() {
      if (!room) return
      const sizes: Record<number, number> = {}
      for (const p of players) {
        const hand = await gameRepo.getHand(room.id, p.userId)
        sizes[p.seat] = hand.length
      }
      setHandSizes(sizes)
    }

    loadHandSizes()
  }, [gameState?.updatedAt, room?.id, players.length])

  if (!room || !gameState) {
    return (
      <div className="min-h-screen felt-table flex items-center justify-center">
        <p className="text-green-400 animate-pulse">Carregando partida...</p>
      </div>
    )
  }

  const trump = gameState.trumpSuit

  return (
    <div className="min-h-screen felt-table flex flex-col">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-black/20 border-b border-green-800/50">
        <span className="text-sm font-bold text-white">
          {GAME_TYPE_LABEL[room.gameType]}
        </span>
        {trump && (
          <span className={`text-sm font-bold flex items-center gap-1 ${
            trump === 'ouros' || trump === 'copas' ? 'text-red-400' : 'text-gray-200'
          }`}>
            Trunfo: {SUIT_SYMBOL[trump]} {SUIT_LABEL[trump]}
          </span>
        )}
        <span className="text-xs text-green-400">Vazas: {gameState.tricksPlayed}</span>
      </div>

      {!gameState.gameOver ? (
        <div className="flex-1 overflow-hidden">
          <GameBoard playerHandSizes={handSizes} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-black/40 border border-green-700/50 rounded-3xl p-8 text-center max-w-sm w-full backdrop-blur">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white mb-2">Fim de jogo!</h2>

            {room.maxPlayers === 4 ? (
              <div>
                <p className="text-green-300 mb-4">
                  {gameState.winnerTeam === 0 ? `🎉 Equipe 1 venceu!` : `🎉 Equipe 2 venceu!`}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[0, 1].map(team => (
                    <div key={team} className={`rounded-xl p-3 border ${
                      gameState.winnerTeam === team ? 'border-yellow-400 bg-yellow-900/20' : 'border-green-800 bg-black/20'
                    }`}>
                      <p className="text-xs text-green-400">Equipe {team + 1}</p>
                      <p className="text-2xl font-black text-white">{gameState.scores[String(team)] ?? 0}</p>
                      <div className="text-xs text-green-500 mt-1">
                        {players.filter(p => seatToTeam(p.seat) === team).map(p => p.nickname).join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2 mb-6">
                {players
                  .sort((a, b) => (gameState.scores[String(b.seat)] ?? 0) - (gameState.scores[String(a.seat)] ?? 0))
                  .map((p, i) => (
                    <div key={p.id} className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                      i === 0 ? 'bg-yellow-900/30 border border-yellow-600' : 'bg-black/20 border border-green-800'
                    }`}>
                      <span className="text-white font-medium">{i === 0 ? '🏆 ' : ''}{p.nickname}</span>
                      <span className="text-xl font-black text-white">{gameState.scores[String(p.seat)] ?? 0}</span>
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
