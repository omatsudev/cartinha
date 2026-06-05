import { supabase } from '../supabase/client'
import { Room } from '../../domain/entities/Room'
import { Player } from '../../domain/entities/Player'
import { IRoomRepository, CreateRoomInput } from '../../domain/interfaces/IRoomRepository'
import { RoomStatus } from '../../domain/enums/RoomStatus'

function toRoom(row: Record<string, unknown>): Room {
  return {
    id: row.id as string,
    code: row.code as string,
    gameType: row.game_type as Room['gameType'],
    maxPlayers: row.max_players as 2 | 4,
    status: row.status as Room['status'],
    hostId: row.host_id as string,
    createdAt: row.created_at as string,
  }
}

function toPlayer(row: Record<string, unknown>): Player {
  return {
    id: row.id as string,
    roomId: row.room_id as string,
    userId: row.user_id as string,
    nickname: row.nickname as string,
    seat: row.seat as number,
    team: row.team as 0 | 1 | null,
    joinedAt: row.joined_at as string,
  }
}

export class SupabaseRoomRepository implements IRoomRepository {
  async create(input: CreateRoomInput): Promise<Room> {
    const { data: room, error: roomErr } = await supabase
      .from('card_rooms')
      .insert({ game_type: input.gameType, max_players: input.maxPlayers, host_id: input.hostId })
      .select()
      .single()

    if (roomErr) throw new Error(roomErr.message)

    // Seat 0 for host
    const team = input.maxPlayers === 4 ? 0 : null
    const { error: playerErr } = await supabase
      .from('card_room_players')
      .insert({ room_id: room.id, user_id: input.hostId, nickname: input.nickname, seat: 0, team })

    if (playerErr) throw new Error(playerErr.message)

    return toRoom(room)
  }

  async findByCode(code: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('card_rooms')
      .select()
      .eq('code', code.toUpperCase())
      .single()

    if (error) return null
    return toRoom(data)
  }

  async findById(id: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('card_rooms')
      .select()
      .eq('id', id)
      .single()

    if (error) return null
    return toRoom(data)
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('card_rooms')
      .update({ status })
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

  async getPlayers(roomId: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from('card_room_players')
      .select()
      .eq('room_id', roomId)
      .order('seat')

    if (error) return []
    return data.map(toPlayer)
  }

  async joinRoom(roomId: string, userId: string, nickname: string): Promise<Player> {
    // Find next available seat
    const players = await this.getPlayers(roomId)
    const takenSeats = players.map(p => p.seat)
    const room = await this.findById(roomId)
    if (!room) throw new Error('Sala não encontrada')
    if (players.length >= room.maxPlayers) throw new Error('Sala cheia')

    const seat = [0, 1, 2, 3].find(s => !takenSeats.includes(s))!
    const team = room.maxPlayers === 4 ? (seat % 2 as 0 | 1) : null

    const { data, error } = await supabase
      .from('card_room_players')
      .upsert({ room_id: roomId, user_id: userId, nickname, seat, team }, { onConflict: 'room_id,user_id' })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toPlayer(data)
  }
}
