import { parseCard } from '../entities/Card'
import { TrickCard } from '../entities/GameState'
import { GameType } from '../enums/GameType'
import { Suit } from '../enums/Suit'

export interface TrickResult {
  winnerSeat: number
  pointsWon: number
}

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

export function isLegalSuecaPlay(
  card: string,
  hand: string[],
  ledSuit: Suit | null,
): boolean {
  if (!ledSuit) return true
  const parsedCard = parseCard(card)
  const hasSuit = hand.some(c => parseCard(c).suit === ledSuit)
  if (!hasSuit) return true
  return parsedCard.suit === ledSuit
}

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

// Returns how many game-win points the winner earns for this sub-game
// 1 = normal win (loser had ≥30 pts)
// 2 = loser had <30 pts
// 4 = capote (loser had 0 pts — winner takes entire match)
export function calculateGamePoints(
  scores: Record<string, number>,
  playerCount: 2 | 4,
  winnerTeam: number,
): number {
  const loserKey = winnerTeam === 0 ? '1' : '0'
  const loserScore = scores[loserKey] ?? 0

  if (loserScore === 0) return 4
  if (loserScore < 30) return 2
  return 1
}
