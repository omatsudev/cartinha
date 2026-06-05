import { GameState, TrickCard } from '../entities/GameState'
import { Suit } from '../enums/Suit'

export interface IGameRepository {
  getState(roomId: string): Promise<GameState | null>
  initState(roomId: string, trumpSuit: Suit, trumpCardCode: string, deckSize: number): Promise<GameState>
  updateTrick(roomId: string, trick: TrickCard[], currentSeat: number): Promise<void>
  completeTrick(roomId: string, winnerSeat: number, scores: Record<string, number>, nextSeat: number, deckRemaining: number): Promise<void>
  endGame(roomId: string, winnerTeam: number): Promise<void>
  getHand(roomId: string, userId: string): Promise<string[]>
  setHand(roomId: string, userId: string, cards: string[]): Promise<void>
}
