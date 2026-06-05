export const GameType = {
  BISCA: 'bisca',
  SUECA: 'sueca',
} as const
export type GameType = (typeof GameType)[keyof typeof GameType]

export const GAME_TYPE_LABEL: Record<GameType, string> = {
  bisca: 'Bisca',
  sueca: 'Sueca',
}
