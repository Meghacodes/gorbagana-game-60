
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTokens } from '@/context/TokenContext';

interface LuckyDucksProps {
  onBack: () => void;
}

type Symbol = '🦆' | '🐸' | '🐢' | '🐠' | '🦀';

const LuckyDucks = ({ onBack }: LuckyDucksProps) => {
  const { spendTokens, addTokens } = useTokens();
  const [gameState, setGameState] = useState<'lobby' | 'spinning' | 'result'>('lobby');
  const [reels, setReels] = useState<Symbol[][]>([
    ['🐠', '🐢', '🦀'],
    ['🐸', '🦆', '🐠'],
    ['🦀', '🐸', '🐢']
  ]);
  const [spinning, setSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [winLines, setWinLines] = useState<string[]>([]);
  const [jackpot] = useState(500);

  const symbols: Symbol[] = ['🦆', '🐸', '🐢', '🐠', '🦀'];

  const spinReels = () => {
    if (!spendTokens(45)) return;
    
    setSpinning(true);
    setGameState('spinning');
    setWinAmount(0);
    setWinLines([]);

    // Animate spinning for 3 seconds
    const spinInterval = setInterval(() => {
      setReels([
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      
      // Generate final result
      const finalReels = [
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
      ];
      
      setReels(finalReels);
      setSpinning(false);
      
      // Calculate winnings
      const { amount, lines } = calculateWinnings(finalReels);
      setWinAmount(amount);
      setWinLines(lines);
      
      if (amount > 0) {
        addTokens(amount);
      }
      
      setGameState('result');
    }, 3000);
  };

  const getRandomSymbol = (): Symbol => {
    return symbols[Math.floor(Math.random() * symbols.length)];
  };

  const calculateWinnings = (grid: Symbol[][]) => {
    let totalWin = 0;
    const winningLines: string[] = [];

    // Check horizontal lines
    for (let row = 0; row < 3; row++) {
      const line = [grid[0][row], grid[1][row], grid[2][row]];
      const { win, description } = checkLine(line, `Row ${row + 1}`);
      totalWin += win;
      if (win > 0) winningLines.push(description);
    }

    // Check vertical lines
    for (let col = 0; col < 3; col++) {
      const line = [grid[col][0], grid[col][1], grid[col][2]];
      const { win, description } = checkLine(line, `Column ${col + 1}`);
      totalWin += win;
      if (win > 0) winningLines.push(description);
    }

    // Check diagonal lines
    const diag1 = [grid[0][0], grid[1][1], grid[2][2]];
    const diag2 = [grid[0][2], grid[1][1], grid[2][0]];
    
    const diag1Result = checkLine(diag1, 'Diagonal ↘');
    const diag2Result = checkLine(diag2, 'Diagonal ↙');
    
    totalWin += diag1Result.win + diag2Result.win;
    if (diag1Result.win > 0) winningLines.push(diag1Result.description);
    if (diag2Result.win > 0) winningLines.push(diag2Result.description);

    return { amount: totalWin, lines: winningLines };
  };

  const checkLine = (line: Symbol[], position: string) => {
    const [a, b, c] = line;
    
    // 3 Ducks
    if (a === '🦆' && b === '🦆' && c === '🦆') {
      return { win: 150, description: `${position}: 3 Ducks! 🦆🦆🦆` };
    }
    
    // 3 matching non-ducks
    if (a === b && b === c && a !== '🦆') {
      return { win: 75, description: `${position}: 3 ${a}s!` };
    }
    
    // 2 Ducks
    const duckCount = line.filter(s => s === '🦆').length;
    if (duckCount === 2) {
      return { win: 60, description: `${position}: 2 Ducks 🦆🦆` };
    }

    return { win: 0, description: '' };
  };

  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button onClick={onBack} className="bg-gray-700 hover:bg-gray-600">
              ← Back to Hub
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
              Lucky Ducks Casino
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Multiplayer Slot Machine Experience
            </p>
            
            <div className="bg-black/30 rounded-xl p-8 mb-8 border border-yellow-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">Game Rules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="text-yellow-400 font-semibold mb-2">Entry Fee</h3>
                  <p className="text-gray-300">45 GORB tokens per spin</p>
                </div>
                <div>
                  <h3 className="text-yellow-400 font-semibold mb-2">Payouts</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>🦆🦆🦆 Three Ducks: 150 GORB</li>
                    <li>🐸🐸🐸 Three Others: 75 GORB</li>
                    <li>🦆🦆 Two Ducks: 60 GORB</li>
                    <li>❌ No Match: 0 GORB</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-yellow-400 font-semibold mb-2">Symbols</h3>
                  <div className="flex gap-2 text-2xl">
                    <span title="Duck">🦆</span>
                    <span title="Frog">🐸</span>
                    <span title="Turtle">🐢</span>
                    <span title="Fish">🐠</span>
                    <span title="Crab">🦀</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-yellow-400 font-semibold mb-2">Progressive Jackpot</h3>
                  <p className="text-green-400 font-bold text-lg">{jackpot} GORB</p>
                  <p className="text-gray-400 text-xs">Trigger with 3+ winning lines</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={spinReels}
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-12 py-6 text-xl font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Spin (45 GORB)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 p-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Lucky Ducks Casino</h1>
          <div className="bg-black/50 rounded-lg p-2 inline-block mb-4">
            <span className="text-green-400 font-bold">Jackpot: {jackpot} GORB</span>
          </div>
        </div>
        
        {/* Slot Machine */}
        <div className="bg-gradient-to-b from-yellow-600 to-yellow-800 p-8 rounded-2xl border-4 border-yellow-400 mb-8 max-w-md mx-auto">
          <div className="grid grid-cols-3 gap-2 bg-black p-4 rounded-lg">
            {reels.map((reel, colIndex) => (
              <div key={colIndex} className="space-y-2">
                {reel.map((symbol, rowIndex) => (
                  <div 
                    key={rowIndex}
                    className={`w-16 h-16 bg-white rounded-lg flex items-center justify-center text-3xl border-2 ${
                      spinning ? 'animate-pulse border-yellow-400' : 'border-gray-300'
                    }`}
                  >
                    {symbol}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {gameState === 'spinning' && (
          <div className="mb-8">
            <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-yellow-400 font-bold text-lg">Spinning...</p>
          </div>
        )}

        {gameState === 'result' && (
          <div className="mb-8">
            {winAmount > 0 ? (
              <div className="bg-green-900/50 rounded-xl p-6 border border-green-400">
                <h2 className="text-3xl font-bold text-green-400 mb-4">🎉 Winner! 🎉</h2>
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400 mb-4">
                  +{winAmount} GORB
                </div>
                <div className="space-y-2">
                  {winLines.map((line, index) => (
                    <p key={index} className="text-green-300 text-sm">{line}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-red-900/50 rounded-xl p-6 border border-red-400">
                <h2 className="text-2xl font-bold text-red-400 mb-2">No Match</h2>
                <p className="text-gray-300">Better luck next spin!</p>
              </div>
            )}
          </div>
        )}
        
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={spinReels}
            disabled={spinning}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-8 py-4 text-lg font-semibold rounded-xl disabled:opacity-50"
          >
            {spinning ? 'Spinning...' : 'Spin Again (45 GORB)'}
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

export default LuckyDucks;
