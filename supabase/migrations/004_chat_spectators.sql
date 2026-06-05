-- Chat messages
CREATE TABLE card_messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     UUID        NOT NULL REFERENCES card_rooms(id) ON DELETE CASCADE,
  user_id     TEXT        NOT NULL,
  nickname    TEXT        NOT NULL,
  message     TEXT        NOT NULL CHECK (char_length(message) BETWEEN 1 AND 300),
  is_spectator BOOLEAN    NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON card_messages(room_id, created_at);

ALTER PUBLICATION supabase_realtime ADD TABLE card_messages;

-- Spectator role on players table
ALTER TABLE card_room_players
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'player';

-- Allow null seat for spectators
ALTER TABLE card_room_players ALTER COLUMN seat DROP NOT NULL;
ALTER TABLE card_room_players DROP CONSTRAINT IF EXISTS card_room_players_seat_check;
ALTER TABLE card_room_players DROP CONSTRAINT IF EXISTS card_room_players_room_id_seat_key;

-- Re-add unique constraint only for non-null seats
CREATE UNIQUE INDEX IF NOT EXISTS card_room_players_seat_unique
  ON card_room_players(room_id, seat)
  WHERE seat IS NOT NULL;
