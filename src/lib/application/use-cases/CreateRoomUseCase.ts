import { SupabaseRoomRepository } from '../../infrastructure/repositories/SupabaseRoomRepository'
import { SupabaseGameRepository } from '../../infrastructure/repositories/SupabaseGameRepository'
import { buildDeck, dealBisca, dealSueca } from '../../domain/services/DeckService'
import { Room } from '../../domain/entities/Room'
import { GameType } from '../../domain/enums/GameType'

interface Input {
  gameType: GameType
  maxPlayers: 2 | 4
  hostId: string
  nickname: string
}

export async function createRoomUseCase(input: Input): Promise<Room> {
  const roomRepo = new SupabaseRoomRepository()
  const gameRepo = new SupabaseGameRepository()

  const room = await roomRepo.create(input)
  return room
}

export async function startGameUseCase(
  roomId: string,
  gameType: GameType,
  playerIds: string[],  // ordered by seat
): Promise<void> {
  const gameRepo = new SupabaseGameRepository()
  const deck = buildDeck()

  if (gameType === 'sueca') {
    const { hands, trumpCard } = dealSueca(deck)
    await gameRepo.initState(roomId, trumpCard.suit, trumpCard.code, 0)
    for (let i = 0; i < playerIds.length; i++) {
      await gameRepo.setHand(roomId, playerIds[i], hands[i])
    }
  } else {
    const { hands, trumpCard, remaining } = dealBisca(deck, playerIds.length)
    await gameRepo.initState(roomId, trumpCard.suit, trumpCard.code, remaining.length)
    for (let i = 0; i < playerIds.length; i++) {
      await gameRepo.setHand(roomId, playerIds[i], hands[i])
    }
    await gameRepo.setDeck(roomId, remaining)
  }

  const roomRepo = new SupabaseRoomRepository()
  await roomRepo.updateStatus(roomId, 'playing')
}
