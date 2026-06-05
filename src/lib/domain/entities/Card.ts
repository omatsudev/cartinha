import { Suit } from '../enums/Suit'

export const CARD_VALUES = ['A', '2', '3', '4', '5', '6', '7', 'J', 'Q', 'K'] as const
export type CardValue = (typeof CARD_VALUES)[number]

export const CARD_LABEL: Record<CardValue, string> = {
  A: 'Ás', '2': '2', '3': '3', '4': '4', '5': '5',
  '6': '6', '7': '7', J: 'Valete', Q: 'Dama', K: 'Rei',
}

export const CARD_POINTS: Record<CardValue, number> = {
  A: 11, '7': 10, K: 4, J: 3, Q: 2,
  '2': 0, '3': 0, '4': 0, '5': 0, '6': 0,
}

// Hierarchy for trick-winning (higher = beats lower)
export const CARD_RANK: Record<CardValue, number> = {
  A: 10, '7': 9, K: 8, J: 7, Q: 6, '6': 5, '5': 4, '4': 3, '3': 2, '2': 1,
}

export interface Card {
  code: string   // e.g. "A_ouros"
  value: CardValue
  suit: Suit
  points: number
  rank: number
}

export function parseCard(code: string): Card {
  const [value, suit] = code.split('_') as [CardValue, Suit]
  return {
    code,
    value,
    suit,
    points: CARD_POINTS[value],
    rank: CARD_RANK[value],
  }
}

export function cardCode(value: CardValue, suit: Suit): string {
  return `${value}_${suit}`
}
