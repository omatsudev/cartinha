import { Room } from '../entities/Room'
import { GameType } from '../enums/GameType'

export interface CreateRoomInput {
  gameType: GameType
  maxPlayers: 2 | 4
  hostId: string
  nickname: string
}

export interface IRoomRepository {
  create(input: CreateRoomInput): Promise<Room>
  findByCode(code: string): Promise<Room | null>
  findById(id: string): Promise<Room | null>
  updateStatus(id: string, status: string): Promise<void>
}
