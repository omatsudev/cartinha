export interface Player {
  id: string
  roomId: string
  userId: string
  nickname: string
  seat: number
  team: 0 | 1 | null
  joinedAt: string
}
