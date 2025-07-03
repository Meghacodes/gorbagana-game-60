
-- Create enum for game types
CREATE TYPE public.game_type AS ENUM ('snake', 'fruit_luck', 'crossword');

-- Create enum for game room status
CREATE TYPE public.room_status AS ENUM ('waiting', 'active', 'completed');

-- Create enum for tournament status
CREATE TYPE public.tournament_status AS ENUM ('upcoming', 'active', 'completed');

-- Create players table for game statistics
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  username TEXT,
  total_games_played INTEGER DEFAULT 0,
  total_tokens_won INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game_rooms table for multiplayer sessions
CREATE TABLE public.game_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  game_type game_type NOT NULL,
  status room_status DEFAULT 'waiting',
  max_players INTEGER DEFAULT 4,
  entry_fee INTEGER DEFAULT 45,
  prize_pool INTEGER DEFAULT 0,
  host_wallet_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  winner_wallet_address TEXT,
  game_state JSONB DEFAULT '{}'::jsonb
);

-- Create room_players table for tracking players in rooms
CREATE TABLE public.room_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  score INTEGER DEFAULT 0,
  position INTEGER,
  UNIQUE(room_id, wallet_address)
);

-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  game_type game_type NOT NULL,
  status tournament_status DEFAULT 'upcoming',
  entry_fee INTEGER DEFAULT 100,
  max_participants INTEGER DEFAULT 16,
  prize_pool INTEGER DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  winner_wallet_address TEXT
);

-- Create tournament_participants table
CREATE TABLE public.tournament_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  final_score INTEGER DEFAULT 0,
  final_position INTEGER,
  UNIQUE(tournament_id, wallet_address)
);

-- Create blockchain_transactions table for tracking token transactions
CREATE TABLE public.blockchain_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  transaction_hash TEXT UNIQUE,
  transaction_type TEXT NOT NULL, -- 'entry_fee', 'reward', 'tournament_fee', 'tournament_prize'
  amount INTEGER NOT NULL,
  game_room_id UUID REFERENCES public.game_rooms(id),
  tournament_id UUID REFERENCES public.tournaments(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for players (public read, own record write)
CREATE POLICY "Players are publicly readable" ON public.players FOR SELECT USING (true);
CREATE POLICY "Users can update their own player record" ON public.players FOR UPDATE USING (wallet_address = current_setting('app.current_wallet', true));
CREATE POLICY "Users can insert their own player record" ON public.players FOR INSERT WITH CHECK (wallet_address = current_setting('app.current_wallet', true));

-- RLS Policies for game_rooms (public read, host can manage)
CREATE POLICY "Game rooms are publicly readable" ON public.game_rooms FOR SELECT USING (true);
CREATE POLICY "Room hosts can update their rooms" ON public.game_rooms FOR UPDATE USING (host_wallet_address = current_setting('app.current_wallet', true));
CREATE POLICY "Users can create game rooms" ON public.game_rooms FOR INSERT WITH CHECK (host_wallet_address = current_setting('app.current_wallet', true));

-- RLS Policies for room_players (public read, own records write)
CREATE POLICY "Room players are publicly readable" ON public.room_players FOR SELECT USING (true);
CREATE POLICY "Users can join rooms" ON public.room_players FOR INSERT WITH CHECK (wallet_address = current_setting('app.current_wallet', true));
CREATE POLICY "Users can update their room participation" ON public.room_players FOR UPDATE USING (wallet_address = current_setting('app.current_wallet', true));

-- RLS Policies for tournaments (public read, admin create)
CREATE POLICY "Tournaments are publicly readable" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Anyone can create tournaments" ON public.tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Tournament creators can update" ON public.tournaments FOR UPDATE USING (true);

-- RLS Policies for tournament_participants (public read, own records write)
CREATE POLICY "Tournament participants are publicly readable" ON public.tournament_participants FOR SELECT USING (true);
CREATE POLICY "Users can join tournaments" ON public.tournament_participants FOR INSERT WITH CHECK (wallet_address = current_setting('app.current_wallet', true));
CREATE POLICY "Users can update their tournament participation" ON public.tournament_participants FOR UPDATE USING (wallet_address = current_setting('app.current_wallet', true));

-- RLS Policies for blockchain_transactions (own records only)
CREATE POLICY "Users can view their own transactions" ON public.blockchain_transactions FOR SELECT USING (wallet_address = current_setting('app.current_wallet', true));
CREATE POLICY "Users can create their own transactions" ON public.blockchain_transactions FOR INSERT WITH CHECK (wallet_address = current_setting('app.current_wallet', true));
CREATE POLICY "Users can update their own transactions" ON public.blockchain_transactions FOR UPDATE USING (wallet_address = current_setting('app.current_wallet', true));

-- Enable realtime for multiplayer functionality
ALTER TABLE public.game_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.room_players REPLICA IDENTITY FULL;
ALTER TABLE public.tournaments REPLICA IDENTITY FULL;
ALTER TABLE public.tournament_participants REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_participants;

-- Function to generate unique room codes
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS TEXT AS $$
BEGIN
  RETURN upper(substr(md5(random()::text), 1, 6));
END;
$$ LANGUAGE plpgsql;

-- Function to update room prize pool when players join
CREATE OR REPLACE FUNCTION public.update_room_prize_pool()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.game_rooms 
    SET prize_pool = prize_pool + entry_fee
    WHERE id = NEW.room_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update prize pool
CREATE TRIGGER update_room_prize_pool_trigger
  AFTER INSERT ON public.room_players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_room_prize_pool();
