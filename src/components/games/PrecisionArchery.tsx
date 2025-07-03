
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTokens } from '@/context/TokenContext';

interface PrecisionArcheryProps {
  onBack: () => void;
}

interface Player {
  name: string;
  score: number;
  eliminated: boolean;
}

const PrecisionArchery = ({ onBack }: PrecisionArcheryProps) => {
  const { spendTokens, addTokens } = useTokens();
  const [gameState, setGameState] = useState<'lobby' | 'tournament' | 'aiming' | 'finished'>('lobby');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [playerTurn, setPlayerTurn] = useState(0);
  const [dartsThrown, setDartsThrown] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [windFactor, setWindFactor] = useState(0);
  const [aimPosition, setAimPosition] = useState({ x: 50, y: 50 });
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [finalPosition, setFinalPosition] = useState(0);
  const [reward, setReward] = useState(0);

  const initializeTournament = () => {
    const tournamentPlayers: Player[] = [
      { name: 'You', score: 0, eliminated: false },
      { name: 'BullsEye', score: 0, eliminated: false },
      { name: 'Archer23', score: 0, eliminated: false },
      { name: 'Hawkeye', score: 0, eliminated: false },
      { name: 'Precision', score: 0, eliminated: false },
      { name: 'DeadShot', score: 0, eliminated: false },
      { name: 'Marksman', score: 0, eliminated: false },
      { name: 'Robin', score: 0, eliminated: false }
    ];
    
    setPlayers(tournamentPlayers);
    setCurrentRound(1);
    setPlayerTurn(0);
    setDartsThrown(0);
    setRoundScore(0);
    setWindFactor(Math.random() * 20 - 10); // -10 to +10 wind
  };

  const startTournament = () => {
    if (spendTokens(45)) {
      initializeTournament();
      setGameState('tournament');
    }
  };

  const calculateScore = (x: number, y: number, power: number, wind: number) => {
    // Calculate distance from center (50, 50)
    const adjustedX = x + (wind * 0.5); // Wind affects horizontal position
    const distance = Math.sqrt((adjustedX - 50) ** 2 + (y - 50) ** 2);
    
    // Power affects accuracy (higher power = less accurate)
    const powerPenalty = Math.abs(power - 75) * 0.1; // Optimal power is 75
    const finalDistance = distance + powerPenalty;
    
    // Score based on dart board zones
    if (finalDistance <= 2) return 50; // Bullseye
    if (finalDistance <= 5) return 25; // Inner ring
    if (finalDistance <= 15) {
      // Numbered sections (simplified)
      const angle = Math.atan2(y - 50, adjustedX - 50);
      const section = Math.floor((angle + Math.PI) / (Math.PI / 10)) + 1;
      const baseScore = Math.min(20, Math.max(1, Math.floor(21 - finalDistance)));
      
      // Triple ring (distance 8-10)
      if (finalDistance >= 8 && finalDistance <= 10) return baseScore * 3;
      // Double ring (distance 12-14)
      if (finalDistance >= 12 && finalDistance <= 14) return baseScore * 2;
      
      return baseScore;
    }
    if (finalDistance <= 25) return Math.max(1, Math.floor(10 - finalDistance / 3));
    
    return 0; // Miss
  };

  const throwDart = () => {
    if (dartsThrown >= 3) return;
    
    const score = calculateScore(aimPosition.x, aimPosition.y, power, windFactor);
    const newRoundScore = roundScore + score;
    
    setRoundScore(newRoundScore);
    setDartsThrown(dartsThrown + 1);
    
    // Reset aim and power
    setAimPosition({ x: 50 + (Math.random() * 10 - 5), y: 50 + (Math.random() * 10 - 5) });
    setPower(0);
    
    if (dartsThrown === 2) {
      // End of player's turn
      const updatedPlayers = [...players];
      updatedPlayers[playerTurn].score += newRoundScore;
      setPlayers(updatedPlayers);
      
      if (playerTurn === 0) {
        // Player's turn complete, simulate AI turns
        simulateAITurns(updatedPlayers);
      }
    }
  };

  const simulateAITurns = (currentPlayers: Player[]) => {
    const aiPlayers = [...currentPlayers];
    
    // Simulate AI scores
    for (let i = 1; i < aiPlayers.length; i++) {
      if (!aiPlayers[i].eliminated) {
        const aiScore = Math.floor(Math.random() * 120) + 30; // 30-150 points
        aiPlayers[i].score += aiScore;
      }
    }
    
    setPlayers(aiPlayers);
    processRoundEnd(aiPlayers);
  };

  const processRoundEnd = (roundPlayers: Player[]) => {
    const activePlayers = roundPlayers.filter(p => !p.eliminated);
    
    if (activePlayers.length <= 1) {
      // Tournament finished
      const finalPlayers = [...roundPlayers].sort((a, b) => b.score - a.score);
      const playerPosition = finalPlayers.findIndex(p => p.name === 'You') + 1;
      
      setFinalPosition(playerPosition);
      
      let earnedTokens = 0;
      switch (playerPosition) {
        case 1: earnedTokens = 100; break;
        case 2: earnedTokens = 70; break;
        case 3:
        case 4: earnedTokens = 50; break;
        case 5:
        case 6:
        case 7:
        case 8: earnedTokens = 30; break;
      }
      
      setReward(earnedTokens);
      addTokens(earnedTokens);
      setGameState('finished');
      return;
    }
    
    if (activePlayers.length <= 4) {
      // Eliminate lowest scorer
      const sortedPlayers = activePlayers.sort((a, b) => a.score - b.score);
      const eliminated = sortedPlayers[0];
      
      const updatedPlayers = roundPlayers.map(p => 
        p.name === eliminated.name ? { ...p, eliminated: true } : p
      );
      
      setPlayers(updatedPlayers);
      
      if (eliminated.name === 'You') {
        // Player eliminated
        const playerPosition = roundPlayers.filter(p => !p.eliminated).length;
        setFinalPosition(playerPosition);
        setReward(playerPosition <= 4 ? 50 : 30);
        addTokens(playerPosition <= 4 ? 50 : 30);
        setGameState('finished');
        return;
      }
    }
    
    // Continue to next round
    setCurrentRound(currentRound + 1);
    setPlayerTurn(0);
    setDartsThrown(0);
    setRoundScore(0);
    setWindFactor(Math.random() * 20 - 10);
  };

  const startCharging = () => {
    setIsCharging(true);
    setPower(0);
    
    const chargeInterval = setInterval(() => {
      setPower(prev => {
        if (prev >= 100) {
          clearInterval(chargeInterval);
          setIsCharging(false);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const stopCharging = () => {
    setIsCharging(false);
  };

  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button onClick={onBack} className="bg-gray-700 hover:bg-gray-600">
              ← Back to Hub
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4">
              Precision Archery
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Tournament-Style Dart Board Competition
            </p>
            
            <div className="bg-black/30 rounded-xl p-8 mb-8 border border-green-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">Tournament Rules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="text-green-400 font-semibold mb-2">Entry Fee</h3>
                  <p className="text-gray-300">45 GORB tokens</p>
                </div>
                <div>
                  <h3 className="text-green-400 font-semibold mb-2">Tournament Format</h3>
                  <p className="text-gray-300">8-player elimination bracket</p>
                  <p className="text-gray-300 text-sm">3 darts per round</p>
                </div>
                <div>
                  <h3 className="text-green-400 font-semibold mb-2">Scoring</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>🎯 Bullseye: 50 points</li>
                    <li>⭕ Inner ring: 25 points</li>
                    <li>🔵 Double/Triple zones: 2x/3x</li>
                    <li>📍 Outer areas: 1-20 points</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-green-400 font-semibold mb-2">Rewards</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>🏆 Winner: 100 GORB</li>
                    <li>🥈 Runner-up: 70 GORB</li>
                    <li>🥉 Semi-finals: 50 GORB</li>
                    <li>🏁 Quarter-finals: 30 GORB</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={startTournament}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-12 py-6 text-xl font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Enter Tournament (45 GORB)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'tournament') {
    const activePlayers = players.filter(p => !p.eliminated);
    const isPlayerTurn = playerTurn === 0 && players[0] && !players[0].eliminated;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Precision Archery Tournament</h1>
            <div className="flex justify-center gap-8 mb-4">
              <div className="bg-black/50 rounded-lg px-4 py-2">
                <span className="text-blue-400 font-bold">Round {currentRound}</span>
              </div>
              <div className="bg-black/50 rounded-lg px-4 py-2">
                <span className="text-green-400 font-bold">🌪️ Wind: {windFactor.toFixed(1)}</span>
              </div>
              <div className="bg-black/50 rounded-lg px-4 py-2">
                <span className="text-yellow-400 font-bold">Score: {roundScore}</span>
              </div>
              <div className="bg-black/50 rounded-lg px-4 py-2">
                <span className="text-orange-400 font-bold">Darts: {dartsThrown}/3</span>
              </div>
            </div>
          </div>
          
          {isPlayerTurn && dartsThrown < 3 && (
            <div className="mb-8 text-center">
              <div className="bg-black/30 rounded-xl p-6 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-white mb-4">Your Turn</h3>
                
                {/* Dart Board */}
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-full border-4 border-yellow-400">
                    {/* Scoring rings */}
                    <div className="absolute inset-4 bg-white rounded-full opacity-90"></div>
                    <div className="absolute inset-8 bg-red-500 rounded-full"></div>
                    <div className="absolute inset-12 bg-white rounded-full"></div>
                    <div className="absolute inset-16 bg-green-600 rounded-full"></div>
                    <div className="absolute inset-20 bg-red-700 rounded-full"></div>
                    
                    {/* Crosshair */}
                    <div 
                      className="absolute w-2 h-2 bg-blue-400 rounded-full border border-white transform -translate-x-1 -translate-y-1 transition-all duration-200"
                      style={{ 
                        left: `${aimPosition.x}%`, 
                        top: `${aimPosition.y}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Power Meter */}
                <div className="mb-4">
                  <div className="bg-gray-700 rounded-full h-4 w-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-100 ${
                        power < 30 ? 'bg-red-500' : 
                        power < 70 ? 'bg-yellow-500' : 
                        power < 90 ? 'bg-green-500' : 'bg-red-600'
                      }`}
                      style={{ width: `${power}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">Power: {power}%</p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onMouseDown={startCharging}
                    onMouseUp={stopCharging}
                    onMouseLeave={stopCharging}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Hold to Charge
                  </Button>
                  <Button
                    onClick={throwDart}
                    disabled={power === 0}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    Throw Dart
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Player Standings */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {players.map((player, index) => (
              <div key={index} className={`p-4 rounded-lg border transition-all ${
                player.eliminated 
                  ? 'bg-red-900/30 border-red-600 opacity-50' 
                  : player.name === 'You' 
                    ? 'bg-blue-900/50 border-blue-500' 
                    : 'bg-gray-800/50 border-gray-600'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-semibold ${
                    player.eliminated ? 'text-red-400' :
                    player.name === 'You' ? 'text-blue-400' : 'text-gray-300'
                  }`}>
                    🏹 {player.name}
                  </span>
                  {player.eliminated && <span className="text-red-400 text-xs">ELIMINATED</span>}
                </div>
                <div className="text-lg font-bold">
                  <span className={player.name === 'You' ? 'text-blue-400' : 'text-gray-300'}>
                    {player.score} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              {activePlayers.length} players remaining • Round {currentRound}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          {finalPosition === 1 && <div className="text-8xl mb-4">🏆</div>}
          {finalPosition === 2 && <div className="text-8xl mb-4">🥈</div>}
          {finalPosition <= 4 && finalPosition > 2 && <div className="text-8xl mb-4">🥉</div>}
          {finalPosition > 4 && <div className="text-8xl mb-4">🏹</div>}
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Tournament Finished!
          </h1>
          <p className="text-2xl text-gray-300 mb-2">
            You finished in {finalPosition}{finalPosition === 1 ? 'st' : finalPosition === 2 ? 'nd' : finalPosition === 3 ? 'rd' : 'th'} place
          </p>
        </div>
        
        <div className="bg-black/30 rounded-xl p-8 mb-8 border border-green-500/30">
          <h2 className="text-3xl font-bold text-green-400 mb-4">
            Tournament Reward
          </h2>
          <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-2">
            +{reward} GORB
          </div>
          <p className="text-gray-300">
            {reward > 45 ? 'Well played! 🎯' : 'Keep practicing!'}
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => setGameState('lobby')}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl"
          >
            New Tournament
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

export default PrecisionArchery;
