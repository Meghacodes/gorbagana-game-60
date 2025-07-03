
import { useState } from 'react';
import TokenBalance from '@/components/wallet/TokenBalance';
import TokenClaimer from '@/components/wallet/TokenClaimer';
import GameCard from '@/components/ui/GameCard';
import SnakeGame from './SnakeGame';
import FruitLuck from './FruitLuck';
import CrosswordPuzzle from './CrosswordPuzzle';
import MultiplayerHub from '../multiplayer/MultiplayerHub';
import TournamentHub from '../multiplayer/TournamentHub';
import Leaderboard from '../multiplayer/Leaderboard';
import { useTokens } from '@/context/TokenContext';
import { Button } from '@/components/ui/button';
import { Users, Trophy, Crown } from 'lucide-react';

const GameHub = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showMultiplayer, setShowMultiplayer] = useState(false);
  const [showTournaments, setShowTournaments] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { tokenBalance } = useTokens();

  // Get wallet address from localStorage for demo
  const walletAddress = localStorage.getItem('connectedWallet') || '';

  const games = [
    {
      id: 'snake-game',
      title: 'Snake Classic',
      description: 'Control the snake to eat food and grow longer',
      entryFee: 45,
      maxReward: 100,
      image: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=300&fit=crop',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'fruit-luck',
      title: 'Fruit Luck',
      description: 'Match 3 fruits in a row to win big rewards',
      entryFee: 45,
      maxReward: 150,
      image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'crossword-puzzle',
      title: 'Crossword Challenge',
      description: 'Solve the crossword puzzle with given hints',
      entryFee: 45,
      maxReward: 120,
      image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=300&fit=crop',
      color: 'from-blue-500 to-purple-500'
    }
  ];

  if (selectedGame === 'snake-game') {
    return <SnakeGame onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'fruit-luck') {
    return <FruitLuck onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'crossword-puzzle') {
    return <CrosswordPuzzle onBack={() => setSelectedGame(null)} />;
  }

  if (showMultiplayer) {
    return <MultiplayerHub walletAddress={walletAddress} onBack={() => setShowMultiplayer(false)} />;
  }

  if (showTournaments) {
    return <TournamentHub walletAddress={walletAddress} onBack={() => setShowTournaments(false)} />;
  }

  if (showLeaderboard) {
    return <Leaderboard onBack={() => setShowLeaderboard(false)} />;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 md:mb-0">
            Gorbagana GameHub
          </h1>
          <div className="flex items-center gap-4">
            <TokenClaimer />
            <TokenBalance />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button
            onClick={() => setShowMultiplayer(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            <Users className="w-5 h-5 mr-2" />
            Multiplayer Rooms
          </Button>
          
          <Button
            onClick={() => setShowTournaments(true)}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-3 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Tournaments
          </Button>
          
          <Button
            onClick={() => setShowLeaderboard(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            <Crown className="w-5 h-5 mr-2" />
            Leaderboard
          </Button>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              canPlay={tokenBalance >= game.entryFee}
              onPlay={() => setSelectedGame(game.id)}
            />
          ))}
        </div>

        {/* Game Features Overview */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-300 mb-6 text-center">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-8xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-xl border border-purple-500/30">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">🎮 Multiplayer Rooms</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Real-time multiplayer gameplay</li>
                <li>• Create or join game rooms</li>
                <li>• Compete with other players</li>
                <li>• Shared prize pools</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-6 rounded-xl border border-yellow-500/30">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">🏆 Tournaments</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Scheduled tournament events</li>
                <li>• Large prize pools</li>
                <li>• Competitive rankings</li>
                <li>• Champion rewards</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 p-6 rounded-xl border border-blue-500/30">
              <h3 className="text-lg font-semibold text-blue-400 mb-3">👑 Leaderboards</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Global player rankings</li>
                <li>• Track your progress</li>
                <li>• Seasonal competitions</li>
                <li>• Achievement badges</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 p-6 rounded-xl border border-green-500/30">
              <h3 className="text-lg font-semibold text-green-400 mb-3">🔗 Blockchain Gaming</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• GORB token rewards</li>
                <li>• Secure wallet integration</li>
                <li>• Transparent transactions</li>
                <li>• Decentralized gaming</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameHub;
