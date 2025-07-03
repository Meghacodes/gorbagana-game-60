
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { useTokens } from '@/context/TokenContext';
import { useToast } from '@/hooks/use-toast';

interface CrosswordPuzzleProps {
  onBack: () => void;
}

interface CrosswordClue {
  id: number;
  clue: string;
  answer: string;
  startRow: number;
  startCol: number;
  direction: 'across' | 'down';
}

const CROSSWORD_DATA: CrosswordClue[] = [
  { id: 1, clue: "Man's best friend", answer: "DOG", startRow: 0, startCol: 0, direction: 'across' },
  { id: 2, clue: "Feline pet", answer: "CAT", startRow: 2, startCol: 0, direction: 'across' },
  { id: 3, clue: "Flying mammal", answer: "BAT", startRow: 4, startCol: 0, direction: 'across' },
  { id: 4, clue: "Canine sound", answer: "DOG", startRow: 0, startCol: 0, direction: 'down' },
  { id: 5, clue: "Opposite of cold", answer: "HOT", startRow: 0, startCol: 2, direction: 'down' },
];

const CrosswordPuzzle = ({ onBack }: CrosswordPuzzleProps) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [grid, setGrid] = useState<string[][]>(Array(5).fill(null).map(() => Array(3).fill('')));
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [completedWords, setCompletedWords] = useState<number[]>([]);
  const { spendTokens, addTokens } = useTokens();
  const { toast } = useToast();

  const startGame = () => {
    if (spendTokens(45)) {
      setGameStarted(true);
      setGrid(Array(5).fill(null).map(() => Array(3).fill('')));
      setCompletedWords([]);
      setSelectedCell(null);
    } else {
      toast({
        title: "Insufficient Tokens",
        description: "You need 45 tokens to play Crossword Challenge.",
        variant: "destructive",
      });
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (!gameStarted) return;
    setSelectedCell({ row, col });
  };

  const handleInputChange = (value: string, row: number, col: number) => {
    if (!gameStarted || value.length > 1) return;
    
    const newGrid = [...grid];
    newGrid[row][col] = value.toUpperCase();
    setGrid(newGrid);
    
    // Check for completed words
    checkCompletedWords(newGrid);
  };

  const checkCompletedWords = (currentGrid: string[][]) => {
    const newCompletedWords: number[] = [];
    
    CROSSWORD_DATA.forEach(clue => {
      let word = '';
      for (let i = 0; i < clue.answer.length; i++) {
        const row = clue.direction === 'across' ? clue.startRow : clue.startRow + i;
        const col = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
        word += currentGrid[row]?.[col] || '';
      }
      
      if (word === clue.answer) {
        newCompletedWords.push(clue.id);
      }
    });
    
    setCompletedWords(newCompletedWords);
    
    // Check if puzzle is complete
    if (newCompletedWords.length === CROSSWORD_DATA.length) {
      const reward = 120;
      addTokens(reward);
      toast({
        title: "🎉 Puzzle Complete! 🎉",
        description: `Congratulations! You earned ${reward} tokens!`,
      });
      setGameStarted(false);
    }
  };

  const isCellActive = (row: number, col: number) => {
    return CROSSWORD_DATA.some(clue => {
      for (let i = 0; i < clue.answer.length; i++) {
        const cellRow = clue.direction === 'across' ? clue.startRow : clue.startRow + i;
        const cellCol = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
        if (cellRow === row && cellCol === col) return true;
      }
      return false;
    });
  };

  const getCellNumber = (row: number, col: number) => {
    const clue = CROSSWORD_DATA.find(c => c.startRow === row && c.startCol === col);
    return clue ? clue.id : null;
  };

  const exitGame = () => {
    if (gameStarted) {
      toast({
        title: "Game Exited",
        description: "Your puzzle progress was lost.",
        variant: "destructive",
      });
    }
    onBack();
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
      <div className="max-w-6xl mx-auto">
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
            <h1 className="text-3xl font-bold text-blue-400">📝 Crossword Challenge</h1>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Crossword Grid */}
          <div className="bg-gray-800 rounded-xl p-6 border border-blue-500/30">
            <h2 className="text-xl font-semibold text-white mb-4">Crossword Grid</h2>
            
            {!gameStarted ? (
              <div className="text-center py-12">
                <Button
                  onClick={startGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                >
                  Start Puzzle (45 tokens)
                </Button>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="grid grid-cols-3 gap-1 bg-gray-900 p-4 rounded-lg">
                  {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const isActive = isCellActive(rowIndex, colIndex);
                      const cellNumber = getCellNumber(rowIndex, colIndex);
                      const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                      
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`
                            w-12 h-12 border-2 relative
                            ${isActive 
                              ? 'bg-white border-gray-400 cursor-pointer' 
                              : 'bg-gray-700 border-gray-600'
                            }
                            ${isSelected ? 'ring-2 ring-blue-400' : ''}
                          `}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                        >
                          {cellNumber && (
                            <span className="absolute top-0 left-0 text-xs text-gray-600 font-bold">
                              {cellNumber}
                            </span>
                          )}
                          {isActive && (
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => handleInputChange(e.target.value, rowIndex, colIndex)}
                              className="w-full h-full text-center text-black font-bold bg-transparent border-none outline-none"
                              maxLength={1}
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Clues */}
          <div className="bg-gray-800 rounded-xl p-6 border border-purple-500/30">
            <h2 className="text-xl font-semibold text-white mb-4">Clues</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Across</h3>
                <div className="space-y-2">
                  {CROSSWORD_DATA.filter(clue => clue.direction === 'across').map(clue => (
                    <div
                      key={clue.id}
                      className={`
                        p-2 rounded-lg
                        ${completedWords.includes(clue.id) 
                          ? 'bg-green-900/30 border border-green-500/50' 
                          : 'bg-gray-700'
                        }
                      `}
                    >
                      <span className="font-bold text-blue-300">{clue.id}.</span>
                      <span className="text-gray-300 ml-2">{clue.clue}</span>
                      {completedWords.includes(clue.id) && (
                        <span className="text-green-400 ml-2">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Down</h3>
                <div className="space-y-2">
                  {CROSSWORD_DATA.filter(clue => clue.direction === 'down').map(clue => (
                    <div
                      key={clue.id}
                      className={`
                        p-2 rounded-lg
                        ${completedWords.includes(clue.id) 
                          ? 'bg-green-900/30 border border-green-500/50' 
                          : 'bg-gray-700'
                        }
                      `}
                    >
                      <span className="font-bold text-purple-300">{clue.id}.</span>
                      <span className="text-gray-300 ml-2">{clue.clue}</span>
                      {completedWords.includes(clue.id) && (
                        <span className="text-green-400 ml-2">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
              <p className="text-gray-300 text-sm">
                <strong>Progress:</strong> {completedWords.length} / {CROSSWORD_DATA.length} words completed
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedWords.length / CROSSWORD_DATA.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrosswordPuzzle;
