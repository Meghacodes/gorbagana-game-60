
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type Tournament = Database['public']['Tables']['tournaments']['Row'];
type TournamentParticipant = Database['public']['Tables']['tournament_participants']['Row'];

interface TournamentHubProps {
  walletAddress: string;
  onBack: () => void;
}

const TournamentHub = ({ walletAddress, onBack }: TournamentHubProps) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .in('status', ['upcoming', 'active'])
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching tournaments:', error);
      toast.error('Failed to fetch tournaments');
    } else {
      setTournaments(data || []);
    }
    setLoading(false);
  };

  const joinTournament = async (tournamentId: string) => {
    const { error } = await supabase
      .from('tournament_participants')
      .insert({
        tournament_id: tournamentId,
        wallet_address: walletAddress,
      });

    if (error) {
      console.error('Error joining tournament:', error);
      toast.error('Failed to join tournament');
    } else {
      toast.success('Successfully joined tournament!');
      fetchTournaments();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
            Tournament Hub
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-300 mt-2">Loading tournaments...</p>
          </div>
        ) : tournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <Card key={tournament.id} className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <Badge 
                    variant={tournament.status === 'upcoming' ? 'secondary' : 'default'}
                    className={tournament.status === 'upcoming' ? 'bg-blue-600/20 text-blue-400' : 'bg-green-600/20 text-green-400'}
                  >
                    {tournament.status}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{tournament.name}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{formatDate(tournament.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Max {tournament.max_participants} players</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Entry: {tournament.entry_fee} GORB
                  </div>
                  <div className="text-sm text-green-400">
                    Prize Pool: {tournament.prize_pool} GORB
                  </div>
                </div>
                
                <Button 
                  onClick={() => joinTournament(tournament.id)}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Join Tournament
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No tournaments available at the moment</p>
            <p className="text-gray-500 text-sm">Check back later for upcoming tournaments!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentHub;
