
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Crown, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Player = Database['public']['Tables']['players']['Row'];

interface LeaderboardProps {
  onBack: () => void;
}

const Leaderboard = ({ onBack }: LeaderboardProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('total_tokens_won', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching leaderboard:', error);
    } else {
      setPlayers(data || []);
    }
    setLoading(false);
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1:
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
      case 2:
        return 'from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3:
        return 'from-amber-600/20 to-amber-700/20 border-amber-600/30';
      default:
        return 'from-gray-700/20 to-gray-800/20 border-gray-600/30';
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
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
            Leaderboard
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-300 mt-2">Loading leaderboard...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {players.map((player, index) => {
              const position = index + 1;
              return (
                <Card 
                  key={player.id} 
                  className={`p-4 bg-gradient-to-r ${getRankColor(position)} border transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(position)}
                        <span className="text-2xl font-bold text-white">#{position}</span>
                      </div>
                      
                      <div>
                        <div className="text-white font-semibold">
                          {player.username || formatWalletAddress(player.wallet_address)}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {formatWalletAddress(player.wallet_address)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-xl">
                        {player.total_tokens_won?.toLocaleString() || 0} GORB
                      </div>
                      <div className="text-gray-400 text-sm">
                        {player.total_games_played || 0} games played
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
            
            {players.length === 0 && (
              <div className="text-center py-8">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No players on the leaderboard yet</p>
                <p className="text-gray-500 text-sm">Be the first to win some games!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
