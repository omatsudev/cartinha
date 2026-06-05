-- Match scoring, persistent session deck, and shuffle phase
ALTER TABLE card_game_state
  ADD COLUMN IF NOT EXISTS game_wins    JSONB       NOT NULL DEFAULT '{"0": 0, "1": 0}',
  ADD COLUMN IF NOT EXISTS dealer_seat  INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS phase        TEXT        NOT NULL DEFAULT 'playing',
  ADD COLUMN IF NOT EXISTS use_session_deck  BOOLEAN,
  ADD COLUMN IF NOT EXISTS shuffle_intensity TEXT,
  ADD COLUMN IF NOT EXISTS shuffle_deadline  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS session_cards     JSONB  NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS last_trick        JSONB  NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS sub_game_number   INTEGER NOT NULL DEFAULT 1;
