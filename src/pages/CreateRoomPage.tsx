import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserId, getNickname } from '@/lib/auth/identity'
import { createRoomUseCase } from '@/lib/application/use-cases/CreateRoomUseCase'
import { GameType, GAME_TYPE_LABEL } from '@/lib/domain/enums/GameType'
import { Users, LogIn, Bot } from 'lucide-react'

export default function CreateRoomPage() {
  const navigate = useNavigate()
  const [gameType, setGameType] = useState<GameType>('bisca')
  const [maxPlayers, setMaxPlayers] = useState<2 | 4>(2)
  const [soloMode, setSoloMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')

  const effectiveMax = gameType === 'sueca' ? 4 : maxPlayers

  async function handleCreate() {
    setLoading(true)
    setError('')
    try {
      const userId = getUserId()
      const nickname = getNickname() ?? 'Jogador'
      const room = await createRoomUseCase({
        gameType,
        maxPlayers: effectiveMax,
        hostId: userId,
        nickname,
      })
      navigate(`/sala/${room.code}`, { state: { soloMode, botCount: soloMode ? effectiveMax - 1 : 0 } })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function handleJoin() {
    if (!joinCode.trim()) return
    navigate(`/sala/${joinCode.trim().toUpperCase()}`)
  }

  return (
    <div className="min-h-screen felt-table flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🃏</div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Nova partida</h1>
          <p className="text-green-400 text-sm mt-1">Olá, {getNickname()}!</p>
        </div>

        <div className="space-y-4">
          {/* Create room */}
          <div className="bg-black/30 border border-green-700/50 rounded-2xl p-5 sm:p-6 backdrop-blur">
            <h2 className="font-bold text-white text-lg mb-5">Criar sala</h2>

            {/* Game type */}
            <div className="mb-5">
              <p className="text-sm text-green-300 mb-2 font-medium">Tipo de jogo</p>
              <div className="grid grid-cols-2 gap-2">
                {(['bisca', 'sueca'] as GameType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => { setGameType(t); if (t === 'sueca') setMaxPlayers(4) }}
                    className={`rounded-xl py-3 px-4 font-semibold text-sm transition-all border ${
                      gameType === t
                        ? 'bg-green-600 border-green-500 text-white'
                        : 'bg-black/30 border-green-800 text-green-400 hover:border-green-600'
                    }`}
                  >
                    {GAME_TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
              {gameType === 'sueca' && (
                <p className="text-xs text-green-500 mt-2">Sueca é sempre 4 jogadores em duplas</p>
              )}
            </div>

            {/* Player count (only for Bisca) */}
            {gameType === 'bisca' && (
              <div className="mb-5">
                <p className="text-sm text-green-300 mb-2 font-medium">Número de jogadores</p>
                <div className="grid grid-cols-2 gap-2">
                  {([2, 4] as const).map(n => (
                    <button
                      key={n}
                      onClick={() => setMaxPlayers(n)}
                      className={`rounded-xl py-3 px-4 font-semibold text-sm transition-all border flex items-center justify-center gap-2 ${
                        maxPlayers === n
                          ? 'bg-green-600 border-green-500 text-white'
                          : 'bg-black/30 border-green-800 text-green-400 hover:border-green-600'
                      }`}
                    >
                      <Users className="w-4 h-4" /> {n} jogadores
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Solo mode toggle */}
            <div className="mb-5">
              <button
                onClick={() => setSoloMode(!soloMode)}
                className={`w-full flex items-center gap-3 rounded-xl py-3 px-4 font-medium text-sm transition-all border ${
                  soloMode
                    ? 'bg-blue-900/50 border-blue-500/70 text-blue-200'
                    : 'bg-black/30 border-green-800 text-green-400 hover:border-green-600'
                }`}
              >
                <Bot className={`w-5 h-5 ${soloMode ? 'text-blue-400' : 'text-green-600'}`} />
                <div className="text-left">
                  <div className="font-semibold">Jogar com computador</div>
                  <div className={`text-xs mt-0.5 ${soloMode ? 'text-blue-300' : 'text-green-600'}`}>
                    {soloMode
                      ? `Você + ${effectiveMax - 1} bot${effectiveMax - 1 > 1 ? 's' : ''} — começa imediatamente`
                      : 'Os outros assentos serão preenchidos por bots'}
                  </div>
                </div>
                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  soloMode ? 'bg-blue-500 border-blue-400' : 'border-green-700'
                }`}>
                  {soloMode && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            </div>

            {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold rounded-xl py-3.5 transition text-base"
            >
              {loading ? 'Criando sala...' : soloMode ? 'Jogar sozinho' : 'Criar sala e convidar amigos'}
            </button>
          </div>

          {/* Join existing room */}
          <div className="bg-black/30 border border-green-700/50 rounded-2xl p-5 sm:p-6 backdrop-blur">
            <h2 className="font-bold text-white text-lg mb-4">Entrar em sala existente</h2>
            <div className="flex gap-2">
              <input
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="Código (ex: ABC123)"
                maxLength={6}
                className="flex-1 bg-black/30 border border-green-700/50 rounded-xl px-4 py-3 text-white placeholder-green-700 outline-none focus:border-green-400 transition font-mono text-lg tracking-widest uppercase"
              />
              <button
                onClick={handleJoin}
                disabled={!joinCode.trim()}
                className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl px-4 py-3 transition"
              >
                <LogIn className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
