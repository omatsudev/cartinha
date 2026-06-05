import { GameType } from '../enums/GameType'
import { RoomStatus } from '../enums/RoomStatus'

export interface Room {
  id: string
  code: string
  gameType: GameType
  maxPlayers: 2 | 4
  status: RoomStatus
  hostId: string
  createdAt: string
}
