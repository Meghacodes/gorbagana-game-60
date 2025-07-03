
# Gorbagana GameHub - API Documentation

Complete API documentation for the Gorbagana GameHub platform, including database schema, real-time subscriptions, and integration guides.

## 🏗️ Database Schema

### **Players Table**
```sql
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  username TEXT,
  total_games_played INTEGER DEFAULT 0,
  total_tokens_won INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Access Patterns:**
- `SELECT`: Public read access
- `INSERT/UPDATE`: Own records only (wallet_address match)

### **Game Rooms Table**
```sql
CREATE TABLE public.game_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT NOT NULL UNIQUE,
  game_type game_type NOT NULL, -- 'snake', 'fruit_luck', 'crossword'
  status room_status DEFAULT 'waiting', -- 'waiting', 'active', 'completed'
  max_players INTEGER DEFAULT 4,
  entry_fee INTEGER DEFAULT 45,
  prize_pool INTEGER DEFAULT 0,
  host_wallet_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  winner_wallet_address TEXT,
  game_state JSONB DEFAULT '{}'
);
```

**Access Patterns:**
- `SELECT`: Public read access
- `INSERT`: Host wallet address must match current user
- `UPDATE`: Host-only access

### **Room Players Table**
```sql
CREATE TABLE public.room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  score INTEGER DEFAULT 0,
  position INTEGER,
  UNIQUE(room_id, wallet_address)
);
```

## 🔄 Real-time Subscriptions

### **Game Room Updates**
```typescript
// Subscribe to all game room changes
const roomsChannel = supabase
  .channel('game-rooms-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'game_rooms'
  }, (payload) => {
    console.log('Room updated:', payload);
  })
  .subscribe();
```

### **Player Joins/Leaves**
```typescript
// Subscribe to players in specific room
const playersChannel = supabase
  .channel('room-players-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'room_players',
    filter: `room_id=eq.${roomId}`
  }, (payload) => {
    console.log('Player updated:', payload);
  })
  .subscribe();
```

## 🎮 Game Integration API

### **Creating a Game Room**
```typescript
interface CreateRoomRequest {
  gameType: 'snake' | 'fruit_luck' | 'crossword';
  maxPlayers?: number;
  entryFee?: number;
}

const createGameRoom = async (request: CreateRoomRequest) => {
  const { data, error } = await supabase
    .from('game_rooms')
    .insert({
      room_code: await generateRoomCode(),
      game_type: request.gameType,
      max_players: request.maxPlayers || 4,
      entry_fee: request.entryFee || 45,
      host_wallet_address: currentWalletAddress,
    })
    .select()
    .single();
    
  return { data, error };
};
```

### **Joining a Game Room**
```typescript
const joinGameRoom = async (roomId: string) => {
  const { error } = await supabase
    .from('room_players')
    .insert({
      room_id: roomId,
      wallet_address: currentWalletAddress,
    });
    
  return { error };
};
```

### **Starting a Game**
```typescript
const startGame = async (roomId: string) => {
  const { error } = await supabase
    .from('game_rooms')
    .update({
      status: 'active',
      started_at: new Date().toISOString(),
    })
    .eq('id', roomId);
    
  return { error };
};
```

## 🏆 Tournament System API

### **Tournament Schema**
```sql
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  game_type game_type NOT NULL,
  status tournament_status DEFAULT 'upcoming',
  entry_fee INTEGER DEFAULT 100,
  max_participants INTEGER DEFAULT 16,
  prize_pool INTEGER DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  winner_wallet_address TEXT
);
```

### **Creating Tournaments**
```typescript
interface CreateTournamentRequest {
  name: string;
  gameType: 'snake' | 'fruit_luck' | 'crossword';
  entryFee: number;
  maxParticipants: number;
  startTime: string; // ISO timestamp
}

const createTournament = async (request: CreateTournamentRequest) => {
  const { data, error } = await supabase
    .from('tournaments')
    .insert({
      name: request.name,
      game_type: request.gameType,
      entry_fee: request.entryFee,
      max_participants: request.maxParticipants,
      start_time: request.startTime,
      prize_pool: 0, // Will be calculated based on participants
    })
    .select()
    .single();
    
  return { data, error };
};
```

## 💰 Transaction Tracking API

### **Blockchain Transactions Schema**
```sql
CREATE TABLE public.blockchain_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  transaction_hash TEXT UNIQUE,
  transaction_type TEXT NOT NULL, -- 'entry_fee', 'reward', 'tournament_fee'
  amount INTEGER NOT NULL,
  game_room_id UUID REFERENCES game_rooms(id),
  tournament_id UUID REFERENCES tournaments(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);
```

### **Recording Transactions**
```typescript
interface TransactionRecord {
  walletAddress: string;
  transactionHash: string;
  transactionType: 'entry_fee' | 'reward' | 'tournament_fee' | 'tournament_prize';
  amount: number;
  gameRoomId?: string;
  tournamentId?: string;
}

const recordTransaction = async (transaction: TransactionRecord) => {
  const { data, error } = await supabase
    .from('blockchain_transactions')
    .insert({
      wallet_address: transaction.walletAddress,
      transaction_hash: transaction.transactionHash,
      transaction_type: transaction.transactionType,
      amount: transaction.amount,
      game_room_id: transaction.gameRoomId,
      tournament_id: transaction.tournamentId,
      status: 'pending',
    })
    .select()
    .single();
    
  return { data, error };
};
```

## 🔍 Query Examples

### **Get Player Statistics**
```typescript
const getPlayerStats = async (walletAddress: string) => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();
    
  return { data, error };
};
```

### **Get Available Game Rooms**
```typescript
const getAvailableRooms = async () => {
  const { data, error } = await supabase
    .from('game_rooms')
    .select(`
      *,
      room_players (
        id,
        wallet_address,
        joined_at
      )
    `)
    .eq('status', 'waiting')
    .order('created_at', { ascending: false });
    
  return { data, error };
};
```

### **Get Leaderboard**
```typescript
const getLeaderboard = async (limit = 50) => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('total_tokens_won', { ascending: false })
    .limit(limit);
    
  return { data, error };
};
```

### **Get Tournament Participants**
```typescript
const getTournamentParticipants = async (tournamentId: string) => {
  const { data, error } = await supabase
    .from('tournament_participants')
    .select(`
      *,
      tournaments (
        name,
        game_type,
        prize_pool
      )
    `)
    .eq('tournament_id', tournamentId)
    .order('final_score', { ascending: false });
    
  return { data, error };
};
```

## 🔐 Row Level Security (RLS) Policies

### **Game Rooms Policies**
```sql
-- Public read access
CREATE POLICY "Game rooms are publicly readable" 
ON public.game_rooms FOR SELECT USING (true);

-- Host can update their rooms
CREATE POLICY "Room hosts can update their rooms" 
ON public.game_rooms FOR UPDATE 
USING (host_wallet_address = current_setting('app.current_wallet', true));

-- Users can create rooms
CREATE POLICY "Users can create game rooms" 
ON public.game_rooms FOR INSERT 
WITH CHECK (host_wallet_address = current_setting('app.current_wallet', true));
```

### **Room Players Policies**
```sql
-- Public read access
CREATE POLICY "Room players are publicly readable" 
ON public.room_players FOR SELECT USING (true);

-- Users can join rooms
CREATE POLICY "Users can join rooms" 
ON public.room_players FOR INSERT 
WITH CHECK (wallet_address = current_setting('app.current_wallet', true));
```

## 🌐 WebSocket Events

### **Game Room Events**
```typescript
interface GameRoomEvent {
  type: 'player_joined' | 'player_left' | 'game_started' | 'game_ended';
  roomId: string;
  data: {
    playerId?: string;
    walletAddress?: string;
    timestamp: string;
    gameState?: any;
  };
}
```

### **Tournament Events**
```typescript
interface TournamentEvent {
  type: 'tournament_started' | 'round_completed' | 'tournament_ended';
  tournamentId: string;
  data: {
    currentRound?: number;
    participants?: string[];
    winners?: string[];
    timestamp: string;
  };
}
```

## 🔧 Utility Functions

### **Room Code Generation**
```sql
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS TEXT AS $$
BEGIN
  RETURN upper(substr(md5(random()::text), 1, 6));
END;
$$ LANGUAGE plpgsql;
```

### **Prize Pool Updates**
```sql
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
```

## 🐛 Error Handling

### **Common Error Codes**
```typescript
enum ErrorCodes {
  ROOM_FULL = 'ROOM_FULL',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',  
  GAME_ALREADY_STARTED = 'GAME_ALREADY_STARTED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  ALREADY_IN_ROOM = 'ALREADY_IN_ROOM'
}
```

### **Error Response Format**
```typescript
interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}
```

## 📊 Analytics Endpoints

### **Game Statistics**
```typescript
// Get game play statistics
const getGameStats = async (gameType?: string, timeRange?: string) => {
  let query = supabase
    .from('game_rooms')
    .select('*')
    .eq('status', 'completed');
    
  if (gameType) {
    query = query.eq('game_type', gameType);
  }
  
  if (timeRange) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));
    query = query.gte('completed_at', startDate.toISOString());
  }
  
  return await query;
};
```

### **Revenue Analytics**
```typescript
const getRevenueStats = async () => {
  const { data, error } = await supabase
    .from('blockchain_transactions')
    .select('transaction_type, amount, created_at')
    .eq('status', 'confirmed');
    
  // Process data for revenue calculations
  return { data, error };
};
```

## 🔄 Integration Examples

### **React Hook for Multiplayer**
```typescript
const useMultiplayer = (walletAddress: string) => {
  const [gameRooms, setGameRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  
  useEffect(() => {
    // Subscribe to room changes
    const subscription = supabase
      .channel('multiplayer')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_rooms'
      }, handleRoomChange)
      .subscribe();
      
    return () => supabase.removeChannel(subscription);
  }, []);
  
  return {
    gameRooms,
    currentRoom,
    createRoom,
    joinRoom,
    leaveRoom
  };
};
```

## 📞 Support

For API questions and integration support:
- **GitHub Issues**: Technical questions
- **Discord**: Community support  
- **Email**: api@gorbagana-gamehub.com

---

**🔧 Complete API documentation for seamless integration with the Gorbagana GameHub platform.**
