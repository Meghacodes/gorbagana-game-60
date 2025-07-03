
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { useTokens } from '@/context/TokenContext';
import { useToast } from '@/hooks/use-toast';

interface FruitLuckProps {
  onBack: () => void;
}

const FRUITS = ['🍎', '🍊', '🍌', '🍇', '🍓', '🥝'];

const FruitLuck = ({ onBack }: FruitLuckProps) => {
  const [slots, setSlots] = useState(['🍎', '🍊', '🍌']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const { spendTokens, addTokens } = useTokens();
  const { toast } = useToast();

  const spin = async () => {
    if (isSpinning) return;
    
    if (!spendTokens(45)) {
      toast({
        title: "Insufficient Tokens",
        description: "You need 45 tokens to play Fruit Luck.",
        variant: "destructive",
      });
      return;
    }

    setIsSpinning(true);
    setLastResult(null);

    // Animate spinning
    const spinDuration = 2000;
    const spinInterval = 100;
    const spinSteps = spinDuration / spinInterval;
    
    let step = 0;
    const spinAnimation = setInterval(() => {
      setSlots([
        FRUITS[Math.floor(Math.random() * FRUITS.length)],
        FRUITS[Math.floor(Math.random() * FRUITS.length)],
        FRUITS[Math.floor(Math.random() * FRUITS.length)]
      ]);
      
      step++;
      if (step >= spinSteps) {
        clearInterval(spinAnimation);
        
        // Final result
        const finalSlots = [
          FRUITS[Math.floor(Math.random() * FRUITS.length)],
          FRUITS[Math.floor(Math.random() * FRUITS.length)],
          FRUITS[Math.floor(Math.random() * FRUITS.length)]
        ];
        
        setSlots(finalSlots);
        setIsSpinning(false);
        
        // Check for win
        if (finalSlots[0] === finalSlots[1] && finalSlots[1] === finalSlots[2]) {
          const reward = 150;
          addTokens(reward);
          setLastResult('win');
          toast({
            title: "🎉 JACKPOT! 🎉",
            description: `Three ${finalSlots[0]} in a row! You won ${reward} tokens!`,
          });
        } else {
          setLastResult('lose');
          toast({
            title: "No Match",
            description: "Better luck next time!",
            variant: "destructive",
          });
        }
      }
    }, spinInterval);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-red-900/20 to-pink-900/20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Hub
            </Button>
            <h1 className="text-3xl font-bold text-red-400">🍎 Fruit Luck</h1>
          </div>
          <Button
            onClick={onBack}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Exit Game
          </Button>
        </div>

        <div className="bg-gray-800 rounded-xl p-8 border border-red-500/30">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Match 3 Fruits to Win!</h2>
            <p className="text-gray-300">Get 3 identical fruits in a row to win 150 tokens</p>
          </div>

          {/* Slot Machine */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-900 p-8 rounded-xl border-2 border-red-500/50">
              <div className="flex gap-4">
                {slots.map((fruit, index) => (
                  <div
                    key={index}
                    className={`
                      w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center
                      text-5xl border-2 border-gray-600
                      ${isSpinning ? 'animate-bounce' : ''}
                      ${lastResult === 'win' ? 'border-green-400 bg-green-900/30' : ''}
                      ${lastResult === 'lose' ? 'border-red-400 bg-red-900/30' : ''}
                    `}
                  >
                    {fruit}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Spin Button */}
          <div className="flex justify-center mb-6">
            <Button
              onClick={spin}
              disabled={isSpinning}
              className={`
                px-8 py-4 text-xl font-bold rounded-xl transition-all duration-300
                ${isSpinning 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 transform hover:scale-105'
                }
              `}
            >
              {isSpinning ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Spinning...
                </div>
              ) : (
                'Spin (45 tokens)'
              )}
            </Button>
          </div>

          {/* Payout Table */}
          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Payout Table</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              {FRUITS.map((fruit, index) => (
                <div key={index} className="bg-gray-800 p-3 rounded-lg">
                  <div className="text-2xl mb-1">{fruit} {fruit} {fruit}</div>
                  <div className="text-green-400 font-semibold">150 tokens</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FruitLuck;
