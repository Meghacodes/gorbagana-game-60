
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useTokens } from '@/context/TokenContext';
import { ArrowUp } from 'lucide-react';

interface MarioDashProps {
  onBack: () => void;
}

const MarioDash = ({ onBack }: MarioDashProps) => {
  const { spendTokens, addTokens } = useTokens();
  const [gameState, setGameState] = useState<'lobby' | 'racing' | 'finished'>('lobby');
  const [raceProgress, setRaceProgress] = useState(0);
  const [finalPosition, setFinalPosition] = useState(0);
  const [reward, setReward] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [raceInterval, setRaceInterval] = useState<NodeJS.Timeout | null>(null);
  const [players] = useState([
    { name: 'You', progress: 0, position: 0 },
    { name: 'SpeedRacer', progress: 0, position: 0 },
    { name: 'Lightning', progress: 0, position: 0 },
    { name: 'TurboMax', progress: 0, position: 0 },
    { name: 'RocketFuel', progress: 0, position: 0 },
    { name: 'NitroBlast', progress: 0, position: 0 }
  ]);

  const finishRace = useCallback(() => {
    if (raceInterval) {
      clearInterval(raceInterval);
      setRaceInterval(null);
    }
    
    // Simulate final position (1-6)
    const finalPos = Math.floor(Math.random() * 6) + 1;
    setFinalPosition(finalPos);
    
    // Calculate rewards based on position
    let earnedTokens = 0;
    switch (finalPos) {
      case 1: earnedTokens = 80; break;
      case 2: earnedTokens = 60; break;
      case 3: earnedTokens = 40; break;
      default: earnedTokens = 20; break;
    }
    
    // Add coin bonus (5 tokens per 10 coins)
    const coinBonus = Math.floor(coinsCollected / 10) * 5;
    earnedTokens += coinBonus;
    
    setReward(earnedTokens);
    addTokens(earnedTokens);
    setGameState('finished');
  }, [raceInterval, coinsCollected, addTokens]);

  const startRace = () => {
    if (spendTokens(45)) {
      setGameState('racing');
      setRaceProgress(0);
      setCoinsCollected(0);
      
      // Simulate race progression
      const interval = setInterval(() => {
        setRaceProgress(prev => {
          const newProgress = prev + Math.random() * 3 + 1.5;
          
          // Randomly collect coins
          if (Math.random() < 0.3) {
            setCoinsCollected(coins => coins + 1);
          }
          
          if (newProgress >= 100) {
            return 100;
          }
          return newProgress;
        });
      }, 100);
      
      setRaceInterval(interval);
    }
  };

  useEffect(() => {
    if (raceProgress >= 100) {
      finishRace();
    }
  }, [raceProgress, finishRace]);

  useEffect(() => {
    return () => {
      if (raceInterval) {
        clearInterval(raceInterval);
      }
    };
  }, [raceInterval]);

  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button onClick={onBack} className="bg-gray-700 hover:bg-gray-600">
              ← Back to Hub
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 mb-4">
              Mario Dash Racing
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Side-scrolling Multiplayer Racing Championship
            </p>
            
            <div className="bg-black/30 rounded-xl p-8 mb-8 border border-red-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">Race Rules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="text-orange-400 font-semibold mb-2">Entry Fee</h3>
                  <p className="text-gray-300">45 GORB tokens</p>
                </div>
                <div>
                  <h3 className="text-orange-400 font-semibold mb-2">Rewards</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>🥇 1st Place: 80 GORB</li>
                    <li>🥈 2nd Place: 60 GORB</li>
                    <li>🥉 3rd Place: 40 GORB</li>
                    <li>🏁 4th-6th: 20 GORB</li>
                    <li>🪙 Coin Bonus: +5 GORB per 10 coins</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-orange-400 font-semibold mb-2">Race Format</h3>
                  <p className="text-gray-300">6-player side-scrolling races</p>
                  <p className="text-gray-300 text-sm">60-90 second duration</p>
                </div>
                <div>
                  <h3 className="text-orange-400 font-semibold mb-2">Track Features</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>🍄 Speed boost power-ups</li>
                    <li>🛡️ Shield protection</li>
                    <li>🪙 Collectible coins</li>
                    <li>⚡ Jump boost platforms</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={startRace}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-12 py-6 text-xl font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Start Race (45 GORB)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'racing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-red-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Mario Dash Racing</h1>
            <div className="flex justify-center gap-8 mb-4">
              <div className="bg-black/50 rounded-lg px-4 py-2">
                <span className="text-yellow-400 font-bold">🪙 {coinsCollected}</span>
                <span className="text-gray-300 ml-2">Coins</span>
              </div>
              <div className="bg-black/50 rounded-lg px-4 py-2">
                <span className="text-green-400 font-bold">{Math.round(raceProgress)}%</span>
                <span className="text-gray-300 ml-2">Progress</span>
              </div>
            </div>
            <div className="bg-black/50 rounded-full h-6 w-full max-w-2xl mx-auto overflow-hidden border-2 border-yellow-500">
              <div 
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-300 ease-out"
                style={{ width: `${raceProgress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player, index) => {
              const aiProgress = Math.min(100, raceProgress + (Math.random() * 20 - 10));
              return (
                <div key={index} className={`p-4 rounded-lg border ${
                  player.name === 'You' 
                    ? 'bg-blue-900/50 border-blue-500' 
                    : 'bg-gray-800/50 border-gray-600'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={player.name === 'You' ? 'text-blue-400 font-bold' : 'text-gray-300'}>
                      🏃 {player.name}
                    </span>
                    <span className="text-sm text-gray-400">
                      {Math.round(player.name === 'You' ? raceProgress : aiProgress)}%
                    </span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        player.name === 'You' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                          : 'bg-gradient-to-r from-gray-500 to-gray-400'
                      }`}
                      style={{ width: `${player.name === 'You' ? raceProgress : aiProgress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 text-center">
            <div className="bg-black/30 rounded-lg p-4 inline-block">
              <p className="text-gray-300 text-sm mb-2">Track Elements</p>
              <div className="flex gap-4 justify-center">
                <span className="text-2xl">🍄</span>
                <span className="text-2xl">🛡️</span>
                <span className="text-2xl">🪙</span>
                <span className="text-2xl">⚡</span>
                <span className="text-2xl">🚧</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const coinBonus = Math.floor(coinsCollected / 10) * 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          {finalPosition === 1 && <div className="text-8xl mb-4">🏆</div>}
          {finalPosition === 2 && <div className="text-8xl mb-4">🥈</div>}
          {finalPosition === 3 && <div className="text-8xl mb-4">🥉</div>}
          {finalPosition > 3 && <div className="text-8xl mb-4">🏁</div>}
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Race Finished!
          </h1>
          <p className="text-2xl text-gray-300 mb-4">
            You finished in {finalPosition}{finalPosition === 1 ? 'st' : finalPosition === 2 ? 'nd' : finalPosition === 3 ? 'rd' : 'th'} place
          </p>
          <div className="bg-black/30 rounded-lg p-4 mb-4 inline-block">
            <p className="text-yellow-400 font-bold">🪙 {coinsCollected} coins collected</p>
            {coinBonus > 0 && <p className="text-green-400 text-sm">+{coinBonus} bonus tokens!</p>}
          </div>
        </div>
        
        <div className="bg-black/30 rounded-xl p-8 mb-8 border border-green-500/30">
          <h2 className="text-3xl font-bold text-green-400 mb-4">
            Total Reward
          </h2>
          <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2">
            +{reward} GORB
          </div>
          {coinBonus > 0 && (
            <p className="text-yellow-400 text-sm mb-2">
              (Base: {reward - coinBonus} + Coin bonus: {coinBonus})
            </p>
          )}
          <p className="text-gray-300">
            {reward > 45 ? 'Profit! 🎉' : 'Better luck next time!'}
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => setGameState('lobby')}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-4 text-lg font-semibold rounded-xl"
          >
            Race Again
          </Button>
          <Button 
            onClick={onBack}
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 text-lg font-semibold rounded-xl"
          >
            Back to Hub
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MarioDash;
