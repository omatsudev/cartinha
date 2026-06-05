import { supabase } from '../supabase/client'
import { GameState, TrickCard } from '../../domain/entities/GameState'
import { IGameRepository } from '../../domain/interfaces/IGameRepository'
import { Suit } from '../../domain/enums/Suit'

function toGameState(row: Record<string, unknown>): GameState {
  return {
    id: row.id as string,
    roomId: row.room_id as string,
    trumpSuit: row.trump_suit as Suit | null,
    trumpCardCode: row.trump_card_code as string | null,
    currentSeat: row.current_seat as number,
    currentTrick: (row.current_trick as TrickCard[]) ?? [],
    lastTrickWinnerSeat: row.last_trick_winner_seat as number | null,
    scores: row.scores as Record<string, number>,
    tricksPlayed: row.tricks_played as number,
    deckRemaining: row.deck_remaining as number,
    gameOver: row.game_over as boolean,
    winnerTeam: row.winner_team as number | null,
    updatedAt: row.updated_at as string,
  }
}

export class SupabaseGameRepository implements IGameRepository {
  async getState(roomId: string): Promise<GameState | null> {
    const { data, error } = await supabase
      .from('card_game_state')
      .select()
      .eq('room_id', roomId)
      .single()

    if (error) return null
    return toGameState(data)
  }

  async initState(roomId: string, trumpSuit: Suit, trumpCardCode: string, deckRemaining: number): Promise<GameState> {
    const { data, error } = await supabase
      .from('card_game_state')
      .insert({
        room_id: roomId,
        trump_suit: trumpSuit,
        trump_card_code: trumpCardCode,
        current_seat: 0,
        current_trick: [],
        scores: { '0': 0, '1': 0 },
        tricks_played: 0,
        deck_remaining: deckRemaining,
        game_over: false,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return toGameState(data)
  }

  async updateTrick(roomId: string, trick: TrickCard[], currentSeat: number): Promise<void> {
    const { error } = await supabase
      .from('card_game_state')
      .update({ current_trick: trick, current_seat: currentSeat, updated_at: new Date().toISOString() })
      .eq('room_id', roomId)

    if (error) throw new Error(error.message)
  }

  async completeTrick(
    roomId: string,
    winnerSeat: number,
    scores: Record<string, number>,
    nextSeat: number,
    deckRemaining: number,
  ): Promise<void> {
    const { data: state } = await supabase
      .from('card_game_state')
      .select('tricks_played')
      .eq('room_id', roomId)
      .single()

    const { error } = await supabase
      .from('card_game_state')
      .update({
        current_trick: [],
        last_trick_winner_seat: winnerSeat,
        scores,
        tricks_played: ((state?.tricks_played as number) ?? 0) + 1,
        current_seat: nextSeat,
        deck_remaining: deckRemaining,
        updated_at: new Date().toISOString(),
      })
      .eq('room_id', roomId)

    if (error) throw new Error(error.message)
  }

  async endGame(roomId: string, winnerTeam: number): Promise<void> {
    await supabase
      .from('card_game_state')
      .update({ game_over: true, winner_team: winnerTeam, updated_at: new Date().toISOString() })
      .eq('room_id', roomId)

    await supabase.from('card_rooms').update({ status: 'finished' }).eq('id', roomId)
  }

  async getHand(roomId: string, userId: string): Promise<string[]> {
    const { data } = await supabase
      .from('card_hands')
      .select('cards')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .single()

    return (data?.cards as string[]) ?? []
  }

  async setHand(roomId: string, userId: string, cards: string[]): Promise<void> {
    const { error } = await supabase
      .from('card_hands')
      .upsert({ room_id: roomId, user_id: userId, cards }, { onConflict: 'room_id,user_id' })

    if (error) throw new Error(error.message)
  }

  // Deck stored as a special row with user_id = room_id for server-side deck management
  async getDeck(roomId: string): Promise<string[]> {
    const { data } = await supabase
      .from('card_hands')
      .select('cards')
      .eq('room_id', roomId)
      .eq('user_id', roomId)
      .single()

    return (data?.cards as string[]) ?? []
  }

  async setDeck(roomId: string, cards: string[]): Promise<void> {
    await supabase
      .from('card_hands')
      .upsert({ room_id: roomId, user_id: roomId, cards }, { onConflict: 'room_id,user_id' })
  }
}
