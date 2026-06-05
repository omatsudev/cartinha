import { Suit } from '../enums/Suit'

export type GamePhase = 'playing' | 'game_over_round' | 'choosing_shuffle' | 'match_over'
export type ShuffleIntensity = 'low' | 'medium' | 'high'

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
  lastTrick: TrickCard[]
  lastTrickWinnerSeat: number | null
  scores: Record<string, number>
  gameWins: Record<string, number>
  dealerSeat: number
  phase: GamePhase
  useSessionDeck: boolean | null
  shuffleIntensity: ShuffleIntensity | null
  shuffleDeadline: string | null
  sessionCards: string[]
  subGameNumber: number
  tricksPlayed: number
  deckRemaining: number
  gameOver: boolean
  winnerTeam: number | null
  updatedAt: string
}
