import { parseCard } from '../entities/Card'
import { TrickCard } from '../entities/GameState'
import { GameType } from '../enums/GameType'
import { Suit } from '../enums/Suit'

/**
 * Chooses a card for the bot to play.
 *
 * Strategy:
 * - Leading: play the lowest-value non-trump card (save trump and high cards)
 * - Following (Bisca): if a trump wins and trick has points → play lowest trump;
 *   else if can win with same suit → play lowest winning card; else dump lowest card
 * - Following (Sueca): must follow suit; within suit apply same win/dump logic
 */
export function chooseBotCard(
  hand: string[],
  trick: TrickCard[],
  trumpSuit: Suit,
  gameType: GameType,
): string {
  if (hand.length === 0) throw new Error('Bot has no cards')

  const parsed = hand.map(parseCard)

  // Leading the trick
  if (trick.length === 0) {
    const nonTrump = parsed.filter(c => c.suit !== trumpSuit)
    const pool = nonTrump.length > 0 ? nonTrump : parsed
    return lowest(pool).code
  }

  const ledSuit = parseCard(trick[0].cardCode).suit
  const trickPoints = trick.reduce((s, t) => s + parseCard(t.cardCode).points, 0)
  const currentWinnerCard = parseCard(trickWinner(trick, trumpSuit).cardCode)

  if (gameType === 'sueca') {
    const sameSuit = parsed.filter(c => c.suit === ledSuit)
    if (sameSuit.length > 0) {
      const winning = sameSuit.filter(c => beats(c, currentWinnerCard, trumpSuit, ledSuit))
      if (winning.length > 0 && (trickPoints > 0 || winning.some(c => c.points > 0))) {
        return lowest(winning).code
      }
      return lowest(sameSuit).code
    }
    // No led suit — play lowest non-trump if possible
    const nonTrump = parsed.filter(c => c.suit !== trumpSuit)
    if (nonTrump.length > 0) return lowest(nonTrump).code
    // Forced to play trump
    const winning = parsed.filter(c => beats(c, currentWinnerCard, trumpSuit, ledSuit))
    return winning.length > 0 && trickPoints > 0 ? lowest(winning).code : lowest(parsed).code
  }

  // Bisca — no follow-suit required
  const trumps = parsed.filter(c => c.suit === trumpSuit)
  const sameSuit = parsed.filter(c => c.suit === ledSuit)
  const otherNonWin = parsed.filter(c => c.suit !== trumpSuit && c.suit !== ledSuit)

  if (currentWinnerCard.suit !== trumpSuit) {
    // Can beat with same suit
    const sameSuitWin = sameSuit.filter(c => beats(c, currentWinnerCard, trumpSuit, ledSuit))
    if (sameSuitWin.length > 0 && trickPoints > 0) return lowest(sameSuitWin).code
    // Or beat with trump
    if (trumps.length > 0 && trickPoints > 0) return lowest(trumps).code
  } else {
    // Must beat trump to win
    const trumpWin = trumps.filter(c => c.rank > currentWinnerCard.rank)
    if (trumpWin.length > 0 && trickPoints > 0) return lowest(trumpWin).code
  }

  // Can't win or not worth winning — dump lowest card
  const dump = otherNonWin.length > 0 ? otherNonWin : (sameSuit.length > 0 ? sameSuit : parsed)
  return lowest(dump).code
}

function lowest(cards: ReturnType<typeof parseCard>[]): ReturnType<typeof parseCard> {
  return cards.reduce((min, c) => c.rank < min.rank ? c : min)
}

function beats(card: ReturnType<typeof parseCard>, current: ReturnType<typeof parseCard>, trumpSuit: Suit, ledSuit: Suit): boolean {
  if (card.suit === trumpSuit && current.suit !== trumpSuit) return true
  if (card.suit === trumpSuit && current.suit === trumpSuit) return card.rank > current.rank
  if (card.suit === ledSuit && current.suit !== trumpSuit) return card.rank > current.rank
  return false
}

function trickWinner(trick: TrickCard[], trumpSuit: Suit): TrickCard {
  const ledSuit = parseCard(trick[0].cardCode).suit
  return trick.reduce((winner, t) => {
    const w = parseCard(winner.cardCode)
    const c = parseCard(t.cardCode)
    if (beats(c, w, trumpSuit, ledSuit)) return t
    return winner
  })
}
