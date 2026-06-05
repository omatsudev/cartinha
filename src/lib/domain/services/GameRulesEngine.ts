import { parseCard } from '../entities/Card'
import { TrickCard } from '../entities/GameState'
import { GameType } from '../enums/GameType'
import { Suit } from '../enums/Suit'

export interface TrickResult {
  winnerSeat: number
  pointsWon: number
}

/**
 * Determines the winner of a completed trick.
 * Bisca: no follow-suit required. Trump beats non-trump. Among same suit, highest rank wins.
 * Sueca: must follow suit (enforced in UI). Same winning logic.
 */
export function evaluateTrick(
  trick: TrickCard[],
  trumpSuit: Suit,
  _gameType: GameType,
): TrickResult {
  const cards = trick.map(t => ({ ...t, card: parseCard(t.cardCode) }))

  const ledSuit = cards[0].card.suit
  let winner = cards[0]

  for (let i = 1; i < cards.length; i++) {
    const challenger = cards[i]
    const wCard = winner.card
    const cCard = challenger.card

    const wTrump = wCard.suit === trumpSuit
    const cTrump = cCard.suit === trumpSuit

    if (cTrump && !wTrump) {
      winner = challenger
    } else if (cTrump && wTrump) {
      if (cCard.rank > wCard.rank) winner = challenger
    } else if (!cTrump && !wTrump) {
      if (cCard.suit === ledSuit && (wCard.suit !== ledSuit || cCard.rank > wCard.rank)) {
        winner = challenger
      }
    }
  }

  const pointsWon = cards.reduce((sum, { card }) => sum + card.points, 0)
  return { winnerSeat: winner.seat, pointsWon }
}

/**
 * Sueca: checks if player must follow suit.
 * Returns true if the card play is legal.
 */
export function isLegalSuecaPlay(
  card: string,
  hand: string[],
  ledSuit: Suit | null,
): boolean {
  if (!ledSuit) return true  // leading the trick

  const parsedCard = parseCard(card)
  const hasSuit = hand.some(c => parseCard(c).suit === ledSuit)

  if (!hasSuit) return true  // can play anything if no cards of led suit
  return parsedCard.suit === ledSuit
}

/**
 * Returns the team for a seat in a 4-player game (0,2 = team 0; 1,3 = team 1)
 */
export function seatToTeam(seat: number): 0 | 1 {
  return (seat % 2) as 0 | 1
}

export function isGameOver(gameType: GameType, deckRemaining: number, handSizes: number[]): boolean {
  if (gameType === 'sueca') return handSizes.every(s => s === 0)
  return deckRemaining === 0 && handSizes.every(s => s === 0)
}

export function determineWinner(scores: Record<string, number>): number {
  const team0 = scores['0'] ?? 0
  const team1 = scores['1'] ?? 0
  return team0 > team1 ? 0 : 1
}
