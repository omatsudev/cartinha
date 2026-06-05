import { SupabaseGameRepository } from '../../infrastructure/repositories/SupabaseGameRepository'
import { SupabaseRoomRepository } from '../../infrastructure/repositories/SupabaseRoomRepository'
import { evaluateTrick, seatToTeam, isGameOver, determineWinner, isLegalSuecaPlay } from '../../domain/services/GameRulesEngine'
import { parseCard } from '../../domain/entities/Card'
import { GameType } from '../../domain/enums/GameType'
import { GameState } from '../../domain/entities/GameState'

interface Input {
  roomId: string
  userId: string
  seat: number
  cardCode: string
  gameType: GameType
  playerCount: 2 | 4
  playerIds: string[]  // indexed by seat
}

export async function playCardUseCase(input: Input): Promise<void> {
  const { roomId, userId, seat, cardCode, gameType, playerCount, playerIds } = input
  const gameRepo = new SupabaseGameRepository()
  const roomRepo = new SupabaseRoomRepository()

  const state = await gameRepo.getState(roomId)
  if (!state) throw new Error('Estado do jogo não encontrado')
  if (state.currentSeat !== seat) throw new Error('Não é sua vez')
  if (state.gameOver) throw new Error('Jogo encerrado')

  // Validate hand
  const hand = await gameRepo.getHand(roomId, userId)
  if (!hand.includes(cardCode)) throw new Error('Carta não está na sua mão')

  // Sueca: enforce follow suit
  if (gameType === 'sueca' && state.currentTrick.length > 0) {
    const ledSuit = parseCard(state.currentTrick[0].cardCode).suit
    if (!isLegalSuecaPlay(cardCode, hand, ledSuit)) {
      throw new Error('Você deve jogar a naipe pedida')
    }
  }

  // Remove card from hand
  const newHand = hand.filter(c => c !== cardCode)
  await gameRepo.setHand(roomId, userId, newHand)

  // Add to trick
  const newTrick = [...state.currentTrick, { seat, cardCode, userId }]
  const nextSeat = (seat + 1) % playerCount

  if (newTrick.length < playerCount) {
    // Trick not complete yet
    await gameRepo.updateTrick(roomId, newTrick, nextSeat)
    return
  }

  // Trick complete — evaluate
  const { winnerSeat, pointsWon } = evaluateTrick(newTrick, state.trumpSuit!, gameType)

  // Update scores
  const newScores = { ...state.scores }
  if (playerCount === 2) {
    // 2-player bisca: score by seat
    newScores[String(winnerSeat)] = (newScores[String(winnerSeat)] ?? 0) + pointsWon
  } else {
    // 4-player: score by team
    const team = seatToTeam(winnerSeat)
    newScores[String(team)] = (newScores[String(team)] ?? 0) + pointsWon
  }

  // Bisca: draw cards from deck if available
  let deckRemaining = state.deckRemaining
  if (gameType === 'bisca' && deckRemaining > 0) {
    const deck = await gameRepo.getDeck(roomId)
    // Winner draws first, then others in order
    const drawOrder = Array.from({ length: playerCount }, (_, i) => (winnerSeat + i) % playerCount)
    const newDeck = [...deck]

    for (const drawSeat of drawOrder) {
      if (newDeck.length === 0) break
      const drawnCard = newDeck.shift()!
      const drawUserId = playerIds[drawSeat]
      const drawHand = await gameRepo.getHand(roomId, drawUserId)
      await gameRepo.setHand(roomId, drawUserId, [...drawHand, drawnCard])
    }

    await gameRepo.setDeck(roomId, newDeck)
    deckRemaining = newDeck.length
  }

  // Check if game is over
  const handSizes = await Promise.all(playerIds.map(id => gameRepo.getHand(roomId, id).then(h => h.length)))
  const over = isGameOver(gameType, deckRemaining, handSizes)

  if (over) {
    const winner = determineWinner(newScores)
    await gameRepo.completeTrick(roomId, winnerSeat, newScores, winnerSeat, deckRemaining)
    await gameRepo.endGame(roomId, winner)
  } else {
    await gameRepo.completeTrick(roomId, winnerSeat, newScores, winnerSeat, deckRemaining)
  }
}
