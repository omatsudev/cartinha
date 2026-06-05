import { SupabaseGameRepository } from '../../infrastructure/repositories/SupabaseGameRepository'
import { SupabaseRoomRepository } from '../../infrastructure/repositories/SupabaseRoomRepository'
import { buildDeck, shuffleCodesWithIntensity, dealBisca, dealBiscaFromShuffled, dealSueca, dealSuecaFromShuffled } from '../../domain/services/DeckService'
import { GameType } from '../../domain/enums/GameType'
import { ShuffleIntensity } from '../../domain/entities/GameState'

// Host triggers: game_over_round → choosing_shuffle
export async function startNextRoundUseCase(
  roomId: string,
  useSessionDeck: boolean,
): Promise<void> {
  const gameRepo = new SupabaseGameRepository()
  const state = await gameRepo.getState(roomId)
  if (!state) throw new Error('Estado não encontrado')
  if (state.phase !== 'game_over_round') throw new Error('Fase inválida')

  await gameRepo.setChoosingShufflePhase(roomId, useSessionDeck, state.dealerSeat)
}

// Dealer triggers: choosing_shuffle → playing (new sub-game)
export async function dealNewSubGameUseCase(
  roomId: string,
  intensity: ShuffleIntensity,
  playerIds: string[],
): Promise<void> {
  const gameRepo = new SupabaseGameRepository()
  const roomRepo = new SupabaseRoomRepository()

  const state = await gameRepo.getState(roomId)
  if (!state) throw new Error('Estado não encontrado')

  const room = await roomRepo.findById(roomId)
  if (!room) throw new Error('Sala não encontrada')

  const gameType: GameType = room.gameType
  const playerCount = room.maxPlayers as 2 | 4
  const useSession = state.useSessionDeck ?? false
  const sessionCards = state.sessionCards

  let hands: string[][]
  let trumpSuit: import('../../domain/enums/Suit').Suit
  let trumpCardCode: string
  let deckRemaining = 0

  if (useSession && sessionCards.length === 40) {
    const shuffled = shuffleCodesWithIntensity(sessionCards, intensity)

    if (gameType === 'bisca') {
      const result = dealBiscaFromShuffled(shuffled, playerCount)
      hands = result.hands
      trumpSuit = result.trumpCard.suit
      trumpCardCode = result.trumpCard.code
      deckRemaining = result.remaining.length
      await gameRepo.setDeck(roomId, result.remaining)
    } else {
      const result = dealSuecaFromShuffled(shuffled)
      hands = result.hands
      trumpSuit = result.trumpCard.suit
      trumpCardCode = result.trumpCard.code
    }
  } else {
    // Fresh deck — full random shuffle
    const deck = buildDeck()
    if (gameType === 'bisca') {
      const result = dealBisca(deck, playerCount)
      hands = result.hands
      trumpSuit = result.trumpCard.suit
      trumpCardCode = result.trumpCard.code
      deckRemaining = result.remaining.length
      await gameRepo.setDeck(roomId, result.remaining)
    } else {
      const result = dealSueca(deck)
      hands = result.hands
      trumpSuit = result.trumpCard.suit
      trumpCardCode = result.trumpCard.code
    }
  }

  for (let i = 0; i < playerIds.length; i++) {
    await gameRepo.setHand(roomId, playerIds[i], hands[i])
  }

  await gameRepo.resetForNewSubGame(
    roomId,
    trumpSuit!,
    trumpCardCode!,
    deckRemaining,
    state.gameWins,
    state.dealerSeat,
    playerIds.length,
    state.subGameNumber + 1,
    [],
    intensity,
  )
}
