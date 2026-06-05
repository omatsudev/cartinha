import { SupabaseGameRepository } from '../../infrastructure/repositories/SupabaseGameRepository'
import { evaluateTrick, seatToTeam, isGameOver, determineWinner, isLegalSuecaPlay, calculateGamePoints } from '../../domain/services/GameRulesEngine'
import { parseCard } from '../../domain/entities/Card'
import { GameType } from '../../domain/enums/GameType'

interface Input {
  roomId: string
  userId: string
  seat: number
  cardCode: string
  gameType: GameType
  playerCount: 2 | 4
  playerIds: string[]
}

export async function playCardUseCase(input: Input): Promise<void> {
  const { roomId, userId, seat, cardCode, gameType, playerCount, playerIds } = input
  const gameRepo = new SupabaseGameRepository()

  const state = await gameRepo.getState(roomId)
  if (!state) throw new Error('Estado do jogo não encontrado')
  if (state.phase !== 'playing') throw new Error('Jogo não está em andamento')
  if (state.currentSeat !== seat) throw new Error('Não é sua vez')
  if (state.gameOver) throw new Error('Jogo encerrado')

  const hand = await gameRepo.getHand(roomId, userId)
  if (!hand.includes(cardCode)) throw new Error('Carta não está na sua mão')

  if (gameType === 'sueca' && state.currentTrick.length > 0) {
    const ledSuit = parseCard(state.currentTrick[0].cardCode).suit
    if (!isLegalSuecaPlay(cardCode, hand, ledSuit)) {
      throw new Error('Você deve jogar a naipe pedida')
    }
  }

  const newHand = hand.filter(c => c !== cardCode)
  await gameRepo.setHand(roomId, userId, newHand)

  const newTrick = [...state.currentTrick, { seat, cardCode, userId }]
  const nextSeat = (seat + 1) % playerCount

  if (newTrick.length < playerCount) {
    await gameRepo.updateTrick(roomId, newTrick, nextSeat)
    return
  }

  // Trick complete — evaluate
  const { winnerSeat, pointsWon } = evaluateTrick(newTrick, state.trumpSuit!, gameType)

  const newScores = { ...state.scores }
  if (playerCount === 2) {
    newScores[String(winnerSeat)] = (newScores[String(winnerSeat)] ?? 0) + pointsWon
  } else {
    const team = seatToTeam(winnerSeat)
    newScores[String(team)] = (newScores[String(team)] ?? 0) + pointsWon
  }

  // Accumulate session cards (trick cards in seat order)
  const trickCodes = [...newTrick].sort((a, b) => a.seat - b.seat).map(t => t.cardCode)
  const newSessionCards = [...state.sessionCards, ...trickCodes]

  let deckRemaining = state.deckRemaining
  if (gameType === 'bisca' && deckRemaining > 0) {
    const deck = await gameRepo.getDeck(roomId)
    const drawOrder = Array.from({ length: playerCount }, (_, i) => (winnerSeat + i) % playerCount)
    const newDeck = [...deck]

    for (const drawSeat of drawOrder) {
      if (newDeck.length === 0) break
      const drawn = newDeck.shift()!
      const drawUserId = playerIds[drawSeat]
      const drawHand = await gameRepo.getHand(roomId, drawUserId)
      await gameRepo.setHand(roomId, drawUserId, [...drawHand, drawn])
    }

    await gameRepo.setDeck(roomId, newDeck)
    deckRemaining = newDeck.length
  }

  const handSizes = await Promise.all(playerIds.map(id => gameRepo.getHand(roomId, id).then(h => h.length)))
  const over = isGameOver(gameType, deckRemaining, handSizes)

  if (!over) {
    await gameRepo.completeTrick(
      roomId, winnerSeat, newScores, winnerSeat, deckRemaining,
      newTrick, newSessionCards, state.tricksPlayed,
    )
    return
  }

  // Sub-game over — calculate match points
  const winnerTeam = determineWinner(newScores)
  const gamePoints = calculateGamePoints(newScores, playerCount, winnerTeam)

  const newGameWins = { ...state.gameWins }
  const isTie = winnerTeam === -1
  if (!isTie) {
    const winnerKey = String(playerCount === 4 ? winnerTeam : winnerSeat)
    newGameWins[winnerKey] = (newGameWins[winnerKey] ?? 0) + gamePoints
  }

  const newDealerSeat = (state.dealerSeat + 1) % playerCount
  // Match is over only if someone reaches 4 wins (ties don't end the match)
  const matchOver = !isTie && Object.values(newGameWins).some(v => v >= 4)

  await gameRepo.endSubGame(
    roomId,
    winnerTeam,
    newGameWins,
    newDealerSeat,
    newSessionCards,
    newTrick,
    newScores,
    state.tricksPlayed,
    matchOver ? 'match_over' : 'game_over_round',
  )
}
