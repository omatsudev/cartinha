import { useGame } from '@/lib/context/GameContext'
import { parseCard } from '@/lib/domain/entities/Card'
import { playCardUseCase } from '@/lib/application/use-cases/PlayCardUseCase'
import { PlayerHand } from './PlayerHand'
import { TrickArea } from './TrickArea'
import { ScoreBoard } from './ScoreBoard'
import { OpponentHand } from './OpponentHand'
import { useBotPlayer } from '@/hooks/useBotPlayer'
import { useEffect, useState } from 'react'
import { SupabaseGameRepository } from '@/lib/infrastructure/repositories/SupabaseGameRepository'

interface GameBoardProps {
  playerHandSizes: Record<number, number>
  onRefreshHandSizes: () => void
}

export function GameBoard({ playerHandSizes, onRefreshHandSizes }: GameBoardProps) {
  const { room, players, gameState, myHand, myPlayer, userId, botIds, refreshHand, getHand } = useGame()
  const gameRepo = new SupabaseGameRepository()

  useBotPlayer({
    room,
    players,
    gameState,
    botIds,
    getHand,
    onHandChange: () => { refreshHand(); onRefreshHandSizes() },
  })

  if (!room || !gameState || !myPlayer || !userId) return null

  const playerCount = room.maxPlayers
  const isMyTurn = gameState.currentSeat === myPlayer.seat && gameState.phase === 'playing'
  const ledSuit = gameState.currentTrick.length > 0
    ? parseCard(gameState.currentTrick[0].cardCode).suit
    : null

  const opponents = players.filter(p => p.userId !== userId && p.role === 'player' && p.seat !== null)
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
    onRefreshHandSizes()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2">
      <div className="shrink-0">
        <ScoreBoard players={players} gameState={gameState} playerCount={playerCount} myPlayerSeat={myPlayer.seat} />
      </div>

      <div className="flex justify-center shrink-0">
        {opponents.filter(p => getOpponentPosition(p.seat) === 'top').map(p => (
          <OpponentHand
            key={p.id}
            player={p}
            cardCount={playerHandSizes[p.seat] ?? 0}
            isCurrentTurn={gameState.currentSeat === p.seat && gameState.phase === 'playing'}
            position="top"
          />
        ))}
      </div>

      <div className="flex flex-1 min-h-0 items-stretch gap-1 sm:gap-2">
        <div className="flex items-center shrink-0">
          {opponents.filter(p => getOpponentPosition(p.seat) === 'left').map(p => (
            <OpponentHand
              key={p.id}
              player={p}
              cardCount={playerHandSizes[p.seat] ?? 0}
              isCurrentTurn={gameState.currentSeat === p.seat && gameState.phase === 'playing'}
              position="left"
            />
          ))}
        </div>

        <div className="flex-1 felt-table rounded-2xl border border-green-700/50 flex items-center justify-center p-2 sm:p-3 overflow-hidden">
          <TrickArea
            trick={gameState.currentTrick}
            lastTrick={gameState.lastTrick}
            players={players}
            trumpSuit={gameState.trumpSuit}
            trumpCardCode={gameState.trumpCardCode}
            deckRemaining={gameState.deckRemaining}
            tricksPlayed={gameState.tricksPlayed}
            currentSeat={gameState.currentSeat}
            myPlayerSeat={myPlayer.seat}
          />
        </div>

        <div className="flex items-center shrink-0">
          {opponents.filter(p => getOpponentPosition(p.seat) === 'right').map(p => (
            <OpponentHand
              key={p.id}
              player={p}
              cardCount={playerHandSizes[p.seat] ?? 0}
              isCurrentTurn={gameState.currentSeat === p.seat && gameState.phase === 'playing'}
              position="right"
            />
          ))}
        </div>
      </div>

      <div className="shrink-0 pb-safe">
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
