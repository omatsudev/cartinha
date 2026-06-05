export interface Player {
  id: string
  roomId: string
  userId: string
  nickname: string
  seat: number | null
  team: 0 | 1 | null
  role: 'player' | 'spectator'
  joinedAt: string
}
