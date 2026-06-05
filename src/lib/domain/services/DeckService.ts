import { Card, CARD_VALUES, cardCode, parseCard } from '../entities/Card'
import { Suit } from '../enums/Suit'
import { ShuffleIntensity } from '../entities/GameState'

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

// Shuffle a deck of card codes with a chosen intensity
// low = 2 cuts (almost original order), medium = 4 cuts, high = full Fisher-Yates
export function shuffleCodesWithIntensity(codes: string[], intensity: ShuffleIntensity): string[] {
  const arr = [...codes]

  if (intensity === 'high') {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  const cuts = intensity === 'medium' ? 4 : 2
  for (let c = 0; c < cuts; c++) {
    const cut = Math.floor(arr.length * (0.3 + Math.random() * 0.4))
    const bottom = arr.splice(0, cut)
    arr.push(...bottom)
    // Also do a few random swaps to simulate imperfect cuts
    const swaps = intensity === 'medium' ? 6 : 2
    for (let s = 0; s < swaps; s++) {
      const a = Math.floor(Math.random() * arr.length)
      const b = Math.floor(Math.random() * arr.length)
      ;[arr[a], arr[b]] = [arr[b], arr[a]]
    }
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
  remaining.push(trumpCard.code)

  return { hands, trumpCard, remaining }
}

// Bisca from pre-shuffled codes
export function dealBiscaFromShuffled(shuffled: string[], playerCount: number): {
  hands: string[][]
  trumpCard: Card
  remaining: string[]
} {
  const hands: string[][] = Array.from({ length: playerCount }, () => [])
  let idx = 0

  for (let round = 0; round < 3; round++) {
    for (let p = 0; p < playerCount; p++) {
      hands[p].push(shuffled[idx++])
    }
  }

  const trumpCard = parseCard(shuffled[idx++])
  const remaining = shuffled.slice(idx)
  remaining.push(trumpCard.code)

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

  for (let round = 0; round < 10; round++) {
    for (let p = 0; p < 4; p++) {
      hands[p].push(d[idx++].code)
    }
  }

  const trumpCard = parseCard(hands[3][hands[3].length - 1])
  return { hands, trumpCard }
}

// Sueca from pre-shuffled codes
export function dealSuecaFromShuffled(shuffled: string[]): {
  hands: string[][]
  trumpCard: Card
} {
  const hands: string[][] = [[], [], [], []]
  let idx = 0

  for (let round = 0; round < 10; round++) {
    for (let p = 0; p < 4; p++) {
      hands[p].push(shuffled[idx++])
    }
  }

  const trumpCard = parseCard(hands[3][hands[3].length - 1])
  return { hands, trumpCard }
}
