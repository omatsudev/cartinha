-- Allow guest access (no Supabase auth required)
-- Remove FK constraints linking to auth.users so any UUID can be a player
ALTER TABLE card_rooms DROP CONSTRAINT IF EXISTS card_rooms_host_id_fkey;
ALTER TABLE card_room_players DROP CONSTRAINT IF EXISTS card_room_players_user_id_fkey;
ALTER TABLE card_moves DROP CONSTRAINT IF EXISTS card_moves_user_id_fkey;

-- Disable RLS on all game tables (casual game, no sensitive data)
ALTER TABLE card_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE card_room_players DISABLE ROW LEVEL SECURITY;
ALTER TABLE card_game_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE card_hands DISABLE ROW LEVEL SECURITY;
ALTER TABLE card_moves DISABLE ROW LEVEL SECURITY;
