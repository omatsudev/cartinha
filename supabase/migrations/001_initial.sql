-- Short code generator for room codes
CREATE OR REPLACE FUNCTION card_generate_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Game rooms
CREATE TABLE card_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL DEFAULT card_generate_code(),
  game_type TEXT NOT NULL CHECK (game_type IN ('bisca', 'sueca')),
  max_players INTEGER NOT NULL CHECK (max_players IN (2, 4)),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players in a room
CREATE TABLE card_room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES card_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  seat INTEGER NOT NULL CHECK (seat BETWEEN 0 AND 3),
  team INTEGER CHECK (team IN (0, 1)),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id),
  UNIQUE(room_id, seat)
);

-- Shared game state (public within room)
CREATE TABLE card_game_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID UNIQUE NOT NULL REFERENCES card_rooms(id) ON DELETE CASCADE,
  trump_suit TEXT CHECK (trump_suit IN ('ouros', 'copas', 'espadas', 'paus')),
  trump_card_code TEXT,
  current_seat INTEGER NOT NULL DEFAULT 0,
  current_trick JSONB NOT NULL DEFAULT '[]',
  last_trick_winner_seat INTEGER,
  scores JSONB NOT NULL DEFAULT '{"0": 0, "1": 0}',
  tricks_played INTEGER NOT NULL DEFAULT 0,
  deck_remaining INTEGER NOT NULL DEFAULT 0,
  game_over BOOLEAN NOT NULL DEFAULT FALSE,
  winner_team INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Player hands (private per player; deck stored as user_id = room_id)
CREATE TABLE card_hands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES card_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  cards JSONB NOT NULL DEFAULT '[]',
  UNIQUE(room_id, user_id)
);

-- Move history
CREATE TABLE card_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES card_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  seat INTEGER NOT NULL,
  card_code TEXT NOT NULL,
  trick_number INTEGER NOT NULL,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE card_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE card_room_players;
ALTER PUBLICATION supabase_realtime ADD TABLE card_game_state;
ALTER PUBLICATION supabase_realtime ADD TABLE card_hands;

-- RLS
ALTER TABLE card_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_hands ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_moves ENABLE ROW LEVEL SECURITY;

-- card_rooms: any auth user can read; host can insert/update
CREATE POLICY "rooms_read" ON card_rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "rooms_insert" ON card_rooms FOR INSERT TO authenticated WITH CHECK (host_id = auth.uid());
CREATE POLICY "rooms_update" ON card_rooms FOR UPDATE TO authenticated USING (host_id = auth.uid());

-- card_room_players: any auth user can read; user manages own row
CREATE POLICY "players_read" ON card_room_players FOR SELECT TO authenticated USING (true);
CREATE POLICY "players_insert" ON card_room_players FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "players_update" ON card_room_players FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- card_game_state: players in room can read; any authenticated user can update (app enforces turn order)
CREATE POLICY "state_read" ON card_game_state FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM card_room_players WHERE room_id = card_game_state.room_id AND user_id = auth.uid())
);
CREATE POLICY "state_insert" ON card_game_state FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM card_rooms WHERE id = card_game_state.room_id AND host_id = auth.uid())
);
CREATE POLICY "state_update" ON card_game_state FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM card_room_players WHERE room_id = card_game_state.room_id AND user_id = auth.uid())
);

-- card_hands: player sees own hand + deck (user_id = room_id for deck)
CREATE POLICY "hands_own_read" ON card_hands FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR user_id = room_id
);
CREATE POLICY "hands_insert" ON card_hands FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM card_rooms WHERE id = card_hands.room_id AND host_id = auth.uid())
);
CREATE POLICY "hands_update" ON card_hands FOR UPDATE TO authenticated USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM card_room_players WHERE room_id = card_hands.room_id AND user_id = auth.uid())
);

-- card_moves: players in room can read; user inserts own moves
CREATE POLICY "moves_read" ON card_moves FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM card_room_players WHERE room_id = card_moves.room_id AND user_id = auth.uid())
);
CREATE POLICY "moves_insert" ON card_moves FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
