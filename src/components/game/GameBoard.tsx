import { useGame } from '@/lib/context/GameContext'
import { parseCard } from '@/lib/domain/entities/Card'
import { playCardUseCase } from '@/lib/application/use-cases/PlayCardUseCase'
import { PlayerHand } from './PlayerHand'
import { TrickArea } from './TrickArea'
import { ScoreBoard } from './ScoreBoard'
import { OpponentHand } from './OpponentHand'
import { useBotPlayer } from '@/hooks/useBotPlayer'

interface GameBoardProps {
  playerHandSizes: Record<number, number>
}

export function GameBoard({ playerHandSizes }: GameBoardProps) {
  const { room, players, gameState, myHand, myPlayer, userId, botIds, refreshHand, getHand } = useGame()

  useBotPlayer({
    room,
    players,
    gameState,
    botIds,
    getHand,
    onHandChange: refreshHand,
  })

  if (!room || !gameState || !myPlayer || !userId) return null

  const playerCount = room.maxPlayers
  const isMyTurn = gameState.currentSeat === myPlayer.seat
  const ledSuit = gameState.currentTrick.length > 0
    ? parseCard(gameState.currentTrick[0].cardCode).suit
    : null

  const opponents = players.filter(p => p.userId !== userId)
  const getOpponentPosition = (opponentSeat: number): 'top' | 'left' | 'right' => {
    if (playerCount === 2) return 'top'
    const diff = (opponentSeat - myPlayer.seat + 4) % 4
    if (diff === 2) return 'top'
    if (diff === 1) return 'right'
    return 'left'
  }

  async function handlePlayCard(cardCode: string) {
    const playerIds = Array.from({ length: playerCount }, (_, i) =>
      players.find(p => p.seat === i)?.userId ?? '',
    )
    await playCardUseCase({
      roomId: room!.id,
      userId: userId!,
      seat: myPlayer!.seat,
      cardCode,
      gameType: room!.gameType,
      playerCount,
      playerIds,
    })
    await refreshHand()
  }

  return (
    <div className="flex flex-col h-full gap-2 sm:gap-3 px-2 py-2 sm:px-4 sm:py-4">
      <ScoreBoard players={players} gameState={gameState} playerCount={playerCount} myPlayerSeat={myPlayer.seat} />

      <div className="flex justify-center">
        {opponents.filter(p => getOpponentPosition(p.seat) === 'top').map(p => (
          <OpponentHand
            key={p.id}
            player={p}
            cardCount={playerHandSizes[p.seat] ?? 0}
            isCurrentTurn={gameState.currentSeat === p.seat}
            position="top"
          />
        ))}
      </div>

      <div className="flex flex-1 items-center gap-2 sm:gap-4">
        {opponents.filter(p => getOpponentPosition(p.seat) === 'left').map(p => (
          <OpponentHand
            key={p.id}
            player={p}
            cardCount={playerHandSizes[p.seat] ?? 0}
            isCurrentTurn={gameState.currentSeat === p.seat}
            position="left"
          />
        ))}

        <div className="flex-1 felt-table rounded-2xl border border-green-700/50 flex items-center justify-center p-3 sm:p-6 min-h-[120px] sm:min-h-[160px]">
          <TrickArea
            trick={gameState.currentTrick}
            players={players}
            trumpCardCode={gameState.trumpCardCode}
            deckRemaining={gameState.deckRemaining}
            currentSeat={gameState.currentSeat}
            myPlayerSeat={myPlayer.seat}
          />
        </div>

        {opponents.filter(p => getOpponentPosition(p.seat) === 'right').map(p => (
          <OpponentHand
            key={p.id}
            player={p}
            cardCount={playerHandSizes[p.seat] ?? 0}
            isCurrentTurn={gameState.currentSeat === p.seat}
            position="right"
          />
        ))}
      </div>

      <div className="pb-safe">
        <PlayerHand
          cards={myHand}
          isMyTurn={isMyTurn}
          onPlayCard={handlePlayCard}
          gameType={room.gameType}
          ledSuit={ledSuit}
        />
      </div>
    </div>
  )
}
