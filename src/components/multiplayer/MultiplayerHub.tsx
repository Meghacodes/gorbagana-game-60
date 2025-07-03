
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Play, Plus, ArrowLeft } from 'lucide-react';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import GameRoomLobby from './GameRoomLobby';

interface MultiplayerHubProps {
  walletAddress: string;
  onBack: () => void;
}

const MultiplayerHub = ({ walletAddress, onBack }: MultiplayerHubProps) => {
  const [roomCode, setRoomCode] = useState('');
  const [selectedGameType, setSelectedGameType] = useState<'snake' | 'fruit_luck' | 'crossword'>('snake');
  
  const {
    gameRooms,
    currentRoom,
    roomPlayers,
    loading,
    fetchGameRooms,
    createGameRoom,
    joinGameRoom,
    leaveGameRoom,
  } = useMultiplayer(walletAddress);

  useEffect(() => {
    fetchGameRooms();
  }, []);

  const handleCreateRoom = async () => {
    const room = await createGameRoom(selectedGameType);
    if (room) {
      console.log('Room created:', room);
    }
  };

  const handleJoinByCode = async () => {
    if (!roomCode.trim()) return;

    // Find room by code
    const room = gameRooms.find(r => r.room_code.toLowerCase() === roomCode.toLowerCase());
    if (room) {
      await joinGameRoom(room.id);
    }
  };

  if (currentRoom) {
    return (
      <GameRoomLobby
        room={currentRoom}
        players={roomPlayers}
        currentWallet={walletAddress}
        onLeave={leaveGameRoom}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            onClick={onBack}
            variant="ghost" 
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Games
          </Button>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Multiplayer Hub
          </h1>
        </div>

        {/* Create Room Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Create Room
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Game Type</label>
                <select
                  value={selectedGameType}
                  onChange={(e) => setSelectedGameType(e.target.value as any)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="snake">Snake Classic</option>
                  <option value="fruit_luck">Fruit Luck</option>
                  <option value="crossword">Crossword Challenge</option>
                </select>
              </div>
              
              <Button 
                onClick={handleCreateRoom}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Create Room (45 GORB)
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Join by Room Code</h2>
            
            <div className="space-y-4">
              <Input
                placeholder="Enter room code..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
              
              <Button 
                onClick={handleJoinByCode}
                disabled={!roomCode.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Join Room
              </Button>
            </div>
          </Card>
        </div>

        {/* Available Rooms */}
        <Card className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Available Rooms</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-300 mt-2">Loading rooms...</p>
            </div>
          ) : gameRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gameRooms.map((room) => (
                <Card key={room.id} className="p-4 bg-gray-700/50 border-gray-600 hover:border-blue-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                      {room.room_code}
                    </Badge>
                    <Badge variant="outline" className="text-gray-300">
                      {room.game_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">0/{room.max_players} players</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Entry: {room.entry_fee} GORB
                    </div>
                    <div className="text-sm text-green-400">
                      Prize Pool: {room.prize_pool} GORB
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => joinGameRoom(room.id)}
                    size="sm"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Join Room
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No rooms available. Create one to get started!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MultiplayerHub;
