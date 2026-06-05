export const Suit = {
  OUROS: 'ouros',
  COPAS: 'copas',
  ESPADAS: 'espadas',
  PAUS: 'paus',
} as const
export type Suit = (typeof Suit)[keyof typeof Suit]

export const SUIT_SYMBOL: Record<Suit, string> = {
  ouros: '♦',
  copas: '♥',
  espadas: '♠',
  paus: '♣',
}
export const SUIT_LABEL: Record<Suit, string> = {
  ouros: 'Ouros',
  copas: 'Copas',
  espadas: 'Espadas',
  paus: 'Paus',
}
export const SUIT_COLOR: Record<Suit, string> = {
  ouros: 'text-red-600',
  copas: 'text-red-600',
  espadas: 'text-stone-900',
  paus: 'text-stone-900',
}
