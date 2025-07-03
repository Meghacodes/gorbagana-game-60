
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { useTokens } from '@/context/TokenContext';
import { useToast } from '@/hooks/use-toast';

interface SnakeGameProps {
  onBack: () => void;
}

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };
const INITIAL_DIRECTION = { x: 0, y: -1 };

const SnakeGame = ({ onBack }: SnakeGameProps) => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const { spendTokens, addTokens } = useTokens();
  const { toast } = useToast();

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, gameStarted, generateFood]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, 150);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameStarted, gameOver]);

  const startGame = () => {
    if (spendTokens(45)) {
      setGameStarted(true);
      setGameOver(false);
      setScore(0);
      setSnake(INITIAL_SNAKE);
      setFood(INITIAL_FOOD);
      setDirection(INITIAL_DIRECTION);
    } else {
      toast({
        title: "Insufficient Tokens",
        description: "You need 45 tokens to play Snake Classic.",
        variant: "destructive",
      });
    }
  };

  const endGame = () => {
    const reward = Math.min(100, Math.floor(score / 2));
    if (reward > 0) {
      addTokens(reward);
      toast({
        title: "Game Over!",
        description: `You earned ${reward} tokens! Score: ${score}`,
      });
    } else {
      toast({
        title: "Game Over!",
        description: `Score: ${score}. Better luck next time!`,
      });
    }
    setGameStarted(false);
    setGameOver(false);
  };

  const exitGame = () => {
    if (gameStarted && !gameOver) {
      toast({
        title: "Game Exited",
        description: "Your game progress was lost.",
        variant: "destructive",
      });
    }
    onBack();
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20">
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
            <h1 className="text-3xl font-bold text-green-400">🐍 Snake Classic</h1>
          </div>
          <Button
            onClick={exitGame}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Exit Game
          </Button>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-green-500/30">
          <div className="flex justify-between items-center mb-4">
            <div className="text-white">
              <span className="text-lg font-semibold">Score: {score}</span>
            </div>
            <div className="text-green-400">
              <span className="text-sm">Use arrow keys to control</span>
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <div 
              className="grid bg-gray-900 border-2 border-green-500/50 rounded-lg p-2"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                width: '500px',
                height: '500px',
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                const x = index % GRID_SIZE;
                const y = Math.floor(index / GRID_SIZE);
                const isSnake = snake.some(segment => segment.x === x && segment.y === y);
                const isFood = food.x === x && food.y === y;
                const isHead = snake[0]?.x === x && snake[0]?.y === y;

                return (
                  <div
                    key={index}
                    className={`
                      border border-gray-700/30
                      ${isSnake ? (isHead ? 'bg-green-400' : 'bg-green-600') : ''}
                      ${isFood ? 'bg-red-500' : ''}
                    `}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            {!gameStarted && !gameOver && (
              <Button
                onClick={startGame}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              >
                Start Game (45 tokens)
              </Button>
            )}
            
            {gameOver && (
              <Button
                onClick={endGame}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                Collect Reward & Exit
              </Button>
            )}
          </div>

          {gameStarted && !gameOver && (
            <div className="text-center text-gray-300 mt-4">
              <p>Snake is moving! Use arrow keys to control direction.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
