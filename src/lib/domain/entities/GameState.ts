import { Suit } from '../enums/Suit'

export interface TrickCard {
  seat: number
  cardCode: string
  userId: string
}

export interface GameState {
  id: string
  roomId: string
  trumpSuit: Suit | null
  trumpCardCode: string | null
  currentSeat: number
  currentTrick: TrickCard[]
  lastTrickWinnerSeat: number | null
  scores: Record<string, number>   // team/seat → points
  tricksPlayed: number
  deckRemaining: number
  gameOver: boolean
  winnerTeam: number | null
  updatedAt: string
}
