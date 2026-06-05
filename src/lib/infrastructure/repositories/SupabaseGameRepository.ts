import { supabase } from '../supabase/client'
import { GameState, TrickCard, GamePhase, ShuffleIntensity } from '../../domain/entities/GameState'
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
    lastTrick: (row.last_trick as TrickCard[]) ?? [],
    lastTrickWinnerSeat: row.last_trick_winner_seat as number | null,
    scores: (row.scores as Record<string, number>) ?? { '0': 0, '1': 0 },
    gameWins: (row.game_wins as Record<string, number>) ?? { '0': 0, '1': 0 },
    dealerSeat: (row.dealer_seat as number) ?? 0,
    phase: (row.phase as GamePhase) ?? 'playing',
    useSessionDeck: row.use_session_deck as boolean | null,
    shuffleIntensity: row.shuffle_intensity as ShuffleIntensity | null,
    shuffleDeadline: row.shuffle_deadline as string | null,
    sessionCards: (row.session_cards as string[]) ?? [],
    subGameNumber: (row.sub_game_number as number) ?? 1,
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

  async initState(
    roomId: string,
    trumpSuit: Suit,
    trumpCardCode: string,
    deckRemaining: number,
    extra?: { gameWins?: Record<string, number>; dealerSeat?: number; subGameNumber?: number; sessionCards?: string[] },
  ): Promise<GameState> {
    const { data, error } = await supabase
      .from('card_game_state')
      .insert({
        room_id: roomId,
        trump_suit: trumpSuit,
        trump_card_code: trumpCardCode,
        current_seat: 0,
        current_trick: [],
        last_trick: [],
        scores: { '0': 0, '1': 0 },
        game_wins: extra?.gameWins ?? { '0': 0, '1': 0 },
        dealer_seat: extra?.dealerSeat ?? 0,
        phase: 'playing',
        session_cards: extra?.sessionCards ?? [],
        sub_game_number: extra?.subGameNumber ?? 1,
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
    lastTrick: TrickCard[],
    sessionCards: string[],
    tricksPlayed: number,
  ): Promise<void> {
    const { error } = await supabase
      .from('card_game_state')
      .update({
        current_trick: [],
        last_trick: lastTrick,
        last_trick_winner_seat: winnerSeat,
        scores,
        tricks_played: tricksPlayed + 1,
        current_seat: nextSeat,
        deck_remaining: deckRemaining,
        session_cards: sessionCards,
        updated_at: new Date().toISOString(),
      })
      .eq('room_id', roomId)
    if (error) throw new Error(error.message)
  }

  // Sub-game over — update game_wins, set phase
  async endSubGame(
    roomId: string,
    winnerTeam: number,
    gameWins: Record<string, number>,
    newDealerSeat: number,
    sessionCards: string[],
    lastTrick: TrickCard[],
    scores: Record<string, number>,
    tricksPlayed: number,
    phase: 'game_over_round' | 'match_over',
  ): Promise<void> {
    const { error } = await supabase
      .from('card_game_state')
      .update({
        game_over: true,
        winner_team: winnerTeam,
        game_wins: gameWins,
        dealer_seat: newDealerSeat,
        phase,
        session_cards: sessionCards,
        last_trick: lastTrick,
        scores,
        tricks_played: tricksPlayed + 1,
        current_trick: [],
        updated_at: new Date().toISOString(),
      })
      .eq('room_id', roomId)
    if (error) throw new Error(error.message)

    if (phase === 'match_over') {
      await supabase.from('card_rooms').update({ status: 'finished' }).eq('id', roomId)
    }
  }

  // Legacy endGame — kept for compatibility
  async endGame(roomId: string, winnerTeam: number): Promise<void> {
    await supabase
      .from('card_game_state')
      .update({ game_over: true, winner_team: winnerTeam, phase: 'match_over', updated_at: new Date().toISOString() })
      .eq('room_id', roomId)
    await supabase.from('card_rooms').update({ status: 'finished' }).eq('id', roomId)
  }

  // Host chooses deck type + triggers choosing_shuffle phase
  async setChoosingShufflePhase(
    roomId: string,
    useSessionDeck: boolean,
    dealerSeat: number,
  ): Promise<void> {
    const deadline = new Date(Date.now() + 10_000).toISOString()
    const { error } = await supabase
      .from('card_game_state')
      .update({
        phase: 'choosing_shuffle',
        use_session_deck: useSessionDeck,
        shuffle_deadline: deadline,
        updated_at: new Date().toISOString(),
      })
      .eq('room_id', roomId)
    if (error) throw new Error(error.message)
  }

  // Reset game state for a new sub-game (called after dealer picks intensity)
  async resetForNewSubGame(
    roomId: string,
    trumpSuit: Suit,
    trumpCardCode: string,
    deckRemaining: number,
    gameWins: Record<string, number>,
    dealerSeat: number,
    playerCount: number,
    subGameNumber: number,
    sessionCards: string[],
    shuffleIntensity: ShuffleIntensity,
  ): Promise<void> {
    const firstSeat = (dealerSeat + 1) % playerCount
    const { error } = await supabase
      .from('card_game_state')
      .update({
        trump_suit: trumpSuit,
        trump_card_code: trumpCardCode,
        current_seat: firstSeat,
        current_trick: [],
        last_trick: [],
        scores: { '0': 0, '1': 0 },
        game_wins: gameWins,
        dealer_seat: dealerSeat,
        phase: 'playing',
        use_session_deck: null,
        shuffle_intensity: shuffleIntensity,
        shuffle_deadline: null,
        session_cards: sessionCards,
        sub_game_number: subGameNumber,
        tricks_played: 0,
        deck_remaining: deckRemaining,
        game_over: false,
        winner_team: null,
        updated_at: new Date().toISOString(),
      })
      .eq('room_id', roomId)
    if (error) throw new Error(error.message)

    // Room stays 'playing' between sub-games
    await supabase.from('card_rooms').update({ status: 'playing' }).eq('id', roomId)
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
