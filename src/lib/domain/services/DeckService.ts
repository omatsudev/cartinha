import { Card, CARD_VALUES, cardCode, parseCard } from '../entities/Card'
import { Suit, SUIT_SYMBOL } from '../enums/Suit'

const SUITS: Suit[] = ['ouros', 'copas', 'espadas', 'paus']

export function buildDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const value of CARD_VALUES) {
      deck.push(parseCard(cardCode(value, suit)))
    }
  }
  return deck
}

export function shuffleDeck(deck: Card[]): Card[] {
  const arr = [...deck]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Bisca: deal 3 cards each, turn up next card as trump
export function dealBisca(deck: Card[], playerCount: number): {
  hands: string[][]
  trumpCard: Card
  remaining: string[]
} {
  const d = shuffleDeck(deck)
  const hands: string[][] = Array.from({ length: playerCount }, () => [])
  let idx = 0

  for (let round = 0; round < 3; round++) {
    for (let p = 0; p < playerCount; p++) {
      hands[p].push(d[idx++].code)
    }
  }

  const trumpCard = d[idx++]
  const remaining = d.slice(idx).map(c => c.code)
  remaining.push(trumpCard.code) // trump card goes to bottom of remaining deck

  return { hands, trumpCard, remaining }
}

// Sueca: deal all 10 cards each (40 total for 4 players), last card dealt = trump
export function dealSueca(deck: Card[]): {
  hands: string[][]
  trumpCard: Card
} {
  const d = shuffleDeck(deck)
  const hands: string[][] = [[], [], [], []]
  let idx = 0

  // Deal 10 cards each
  for (let round = 0; round < 10; round++) {
    for (let p = 0; p < 4; p++) {
      hands[p].push(d[idx++].code)
    }
  }

  // Last card dealt to player 3 is the trump indicator
  const trumpCard = parseCard(hands[3][hands[3].length - 1])
  return { hands, trumpCard }
}
