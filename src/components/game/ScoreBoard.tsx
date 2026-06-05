import { Player } from '@/lib/domain/entities/Player'
import { GameState } from '@/lib/domain/entities/GameState'
import { cn } from '@/lib/utils/cn'

function capitalize(name: string) {
  return name.replace(/\b\w/g, c => c.toUpperCase())
}

export function teamLabel(players: Player[], team: 0 | 1): string {
  return players
    .filter(p => p.team === team && p.role === 'player')
    .map(p => capitalize(p.nickname))
    .join('/')
}

interface ScoreBoardProps {
  players: Player[]
  gameState: GameState
  playerCount: 2 | 4
  myPlayerSeat: number | null
}

export function ScoreBoard({ players, gameState, playerCount, myPlayerSeat }: ScoreBoardProps) {
  const isTeamGame = playerCount === 4
  const { scores } = gameState
  const activePlayers = players.filter(p => p.role === 'player' && p.seat !== null)

  if (isTeamGame) {
    const team0Players = activePlayers.filter(p => p.team === 0)
    const team1Players = activePlayers.filter(p => p.team === 1)
    const team0Score = scores['0'] ?? 0
    const team1Score = scores['1'] ?? 0
    const myTeam = players.find(p => p.seat === myPlayerSeat)?.team

    return (
      <div className="flex gap-2 sm:gap-4">
        {[{ team: 0, ps: team0Players, score: team0Score }, { team: 1, ps: team1Players, score: team1Score }].map(({ team, ps, score }) => (
          <div key={team} className={cn(
            'flex-1 rounded-xl p-2 sm:p-3 text-center border',
            myTeam === team ? 'bg-green-800/60 border-green-500' : 'bg-black/20 border-white/10',
          )}>
            <p className="text-xs text-green-300 mb-1 font-semibold truncate">{teamLabel(activePlayers, team as 0 | 1)}</p>
            <p className="text-lg sm:text-2xl font-black text-white">{score}</p>
            <p className="text-[10px] text-green-500 mt-0.5">{ps.find(p => p.seat === myPlayerSeat) ? '(você)' : ''}</p>
          </div>
        ))}
      </div>
    )
  }

  // 2-player
  return (
    <div className="flex gap-2">
      {activePlayers.map(p => (
        <div key={p.id} className={cn(
          'flex-1 rounded-xl p-2 sm:p-3 text-center border',
          p.seat === myPlayerSeat ? 'bg-green-800/60 border-green-500' : 'bg-black/20 border-white/10',
        )}>
          <p className="text-xs text-green-300 truncate">{p.nickname}{p.seat === myPlayerSeat ? ' (você)' : ''}</p>
          <p className="text-lg sm:text-2xl font-black text-white">{scores[String(p.seat)] ?? 0}</p>
        </div>
      ))}
    </div>
  )
}
