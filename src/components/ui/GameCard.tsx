
import { Button } from '@/components/ui/button';

interface Game {
  id: string;
  title: string;
  description: string;
  entryFee: number;
  maxReward: number;
  image: string;
  color: string;
}

interface GameCardProps {
  game: Game;
  canPlay: boolean;
  onPlay: () => void;
}

const GameCard = ({ game, canPlay, onPlay }: GameCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-2">
      <div className="absolute inset-0 bg-gradient-to-br opacity-20 group-hover:opacity-30 transition-opacity duration-300" 
           style={{background: `linear-gradient(135deg, ${game.color.split(' ')[1]}, ${game.color.split(' ')[3]})`}}></div>
      
      <div className="relative z-10 p-6">
        <div className="aspect-video mb-4 rounded-lg overflow-hidden">
          <img 
            src={game.image} 
            alt={game.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
        <p className="text-gray-300 text-sm mb-4">{game.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <p className="text-red-400 text-sm">Entry Fee</p>
            <p className="text-white font-bold">{game.entryFee} GORB</p>
          </div>
          <div className="text-center">
            <p className="text-green-400 text-sm">Max Reward</p>
            <p className="text-white font-bold">{game.maxReward} GORB</p>
          </div>
        </div>
        
        <Button
          onClick={onPlay}
          disabled={!canPlay}
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
            canPlay
              ? `bg-gradient-to-r ${game.color} hover:opacity-90 text-white transform hover:scale-105`
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {canPlay ? 'Enter Game' : 'Insufficient Balance'}
        </Button>
      </div>
    </div>
  );
};

export default GameCard;
