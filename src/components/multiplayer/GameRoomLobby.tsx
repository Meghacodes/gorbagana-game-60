
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, Play, Copy, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type GameRoom = Database['public']['Tables']['game_rooms']['Row'];
type RoomPlayer = Database['public']['Tables']['room_players']['Row'];

interface GameRoomLobbyProps {
  room: GameRoom;
  players: RoomPlayer[];
  currentWallet: string;
  onLeave: () => void;
}

const GameRoomLobby = ({ room, players, currentWallet, onLeave }: GameRoomLobbyProps) => {
  const [isStarting, setIsStarting] = useState(false);
  const isHost = room.host_wallet_address === currentWallet;
  const canStart = players.length >= 2 && players.length <= room.max_players!;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.room_code);
    toast.success('Room code copied to clipboard!');
  };

  const handleStartGame = async () => {
    setIsStarting(true);
    // Here you would implement the actual game start logic
    // For now, we'll just show a message
    toast.success('Game starting soon!');
    setIsStarting(false);
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            onClick={onLeave}
            variant="ghost" 
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Leave Room
          </Button>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Game Room
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Room Info */}
          <Card className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Room Details</h2>
              <Button
                onClick={copyRoomCode}
                variant="outline"
                size="sm"
                className="border-gray-600 hover:bg-gray-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                {room.room_code}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-300">Game Type:</span>
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                  {room.game_type.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Entry Fee:</span>
                <span className="text-white font-semibold">{room.entry_fee} GORB</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Prize Pool:</span>
                <span className="text-green-400 font-semibold">{room.prize_pool} GORB</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Max Players:</span>
                <span className="text-white font-semibold">{room.max_players}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-300">Status:</span>
                <Badge 
                  variant={room.status === 'waiting' ? 'secondary' : 'default'}
                  className={room.status === 'waiting' ? 'bg-yellow-600/20 text-yellow-400' : ''}
                >
                  {room.status}
                </Badge>
              </div>
            </div>

            {isHost && (
              <div className="mt-6 pt-6 border-t border-gray-600">
                <Button
                  onClick={handleStartGame}
                  disabled={!canStart || isStarting}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {isStarting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Starting Game...
                    </div>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Game
                    </>
                  )}
                </Button>
                {!canStart && (
                  <p className="text-sm text-gray-400 text-center mt-2">
                    Need at least 2 players to start
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Players List */}
          <Card className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Players ({players.length}/{room.max_players})
            </h2>

            <div className="space-y-3">
              {players.map((player, index) => (
                <div 
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-white font-medium">
                      {formatWalletAddress(player.wallet_address)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {player.wallet_address === room.host_wallet_address && (
                      <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400">
                        <Crown className="w-3 h-3 mr-1" />
                        Host
                      </Badge>
                    )}
                    {player.wallet_address === currentWallet && (
                      <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                        You
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Empty slots */}
              {Array.from({ length: room.max_players! - players.length }).map((_, index) => (
                <div 
                  key={`empty-${index}`}
                  className="flex items-center gap-3 p-3 bg-gray-700/20 rounded-lg border-2 border-dashed border-gray-600"
                >
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-gray-400">Waiting for player...</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GameRoomLobby;
