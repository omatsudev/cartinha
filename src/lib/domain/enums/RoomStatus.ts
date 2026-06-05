export const RoomStatus = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished',
} as const
export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus]
