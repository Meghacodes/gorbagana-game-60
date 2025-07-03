
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTokens } from '@/context/TokenContext';

interface UnoGameProps {
  onBack: () => void;
}

type Color = 'red' | 'blue' | 'green' | 'yellow';
type Value = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'skip' | 'reverse' | '+2' | 'wild' | '+4';

interface Card {
  id: string;
  color: Color | 'wild';
  value: Value;
}

const UnoGame = ({ onBack }: UnoGameProps) => {
  const { spendTokens, addTokens } = useTokens();
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'finished'>('lobby');
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [computerCards, setComputerCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<'player' | 'computer' | null>(null);
  const [message, setMessage] = useState('');

  const colors: Color[] = ['red', 'blue', 'green', 'yellow'];
  const values: Value[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', '+2'];

  const createDeck = (): Card[] => {
    const deck: Card[] = [];
    let id = 0;

    // Regular cards
    colors.forEach(color => {
      values.forEach(value => {
        deck.push({ id: `${id++}`, color, value });
        if (value !== '0') {
          deck.push({ id: `${id++}`, color, value });
        }
      });
    });

    // Wild cards
    for (let i = 0; i < 4; i++) {
      deck.push({ id: `${id++}`, color: 'wild', value: 'wild' });
      deck.push({ id: `${id++}`, color: 'wild', value: '+4' });
    }

    return deck.sort(() => Math.random() - 0.5);
  };

  const startGame = () => {
    if (!spendTokens(45)) return;

    const deck = createDeck();
    const playerHand = deck.slice(0, 5);
    const computerHand = deck.slice(5, 10);
    const startCard = deck.slice(10, 11)[0];

    setPlayerCards(playerHand);
    setComputerCards(computerHand);
    setCurrentCard(startCard);
    setGameState('playing');
    setIsPlayerTurn(true);
    setWinner(null);
    setMessage('Your turn! Play a card that matches color or number.');
  };

  const canPlayCard = (card: Card): boolean => {
    if (!currentCard) return false;
    if (card.color === 'wild') return true;
    return card.color === currentCard.color || card.value === currentCard.value;
  };

  const playCard = (card: Card) => {
    if (!isPlayerTurn || !canPlayCard(card)) return;

    setCurrentCard(card);
    const newPlayerCards = playerCards.filter(c => c.id !== card.id);
    setPlayerCards(newPlayerCards);

    if (newPlayerCards.length === 0) {
      setWinner('player');
      setGameState('finished');
      addTokens(90);
      setMessage('You won! +90 GORB tokens!');
      return;
    }

    setIsPlayerTurn(false);
    setMessage('Computer is thinking...');

    // Computer turn
    setTimeout(() => {
      computerPlay();
    }, 1500);
  };

  const computerPlay = () => {
    const playableCards = computerCards.filter(canPlayCard);
    
    if (playableCards.length === 0) {
      // Computer draws a card (simplified)
      setIsPlayerTurn(true);
      setMessage('Computer drew a card. Your turn!');
      return;
    }

    const cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
    setCurrentCard(cardToPlay);
    const newComputerCards = computerCards.filter(c => c.id !== cardToPlay.id);
    setComputerCards(newComputerCards);

    if (newComputerCards.length === 0) {
      setWinner('computer');
      setGameState('finished');
      setMessage('Computer won! Better luck next time.');
      return;
    }

    setIsPlayerTurn(true);
    setMessage('Your turn! Play a card that matches color or number.');
  };

  const getCardDisplay = (card: Card) => {
    const colorMap = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      wild: 'bg-gradient-to-br from-purple-500 to-pink-500'
    };

    return (
      <div className={`w-16 h-24 rounded-lg ${colorMap[card.color]} border-2 border-white flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
        {card.value === 'wild' ? '🌟' : 
         card.value === '+4' ? '+4' :
         card.value === '+2' ? '+2' :
         card.value === 'skip' ? '⏭' :
         card.value === 'reverse' ? '↩' :
         card.value}
      </div>
    );
  };

  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-blue-900 to-green-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button onClick={onBack} className="bg-gray-700 hover:bg-gray-600">
              ← Back to Hub
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-blue-500 mb-4">
              Uno Showdown
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Player vs Computer Card Duel
            </p>
            
            <div className="bg-black/30 rounded-xl p-8 mb-8 border border-red-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">Game Rules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="text-red-400 font-semibold mb-2">Entry Fee</h3>
                  <p className="text-gray-300">45 GORB tokens</p>
                </div>
                <div>
                  <h3 className="text-red-400 font-semibold mb-2">Objective</h3>
                  <p className="text-gray-300">Be first to play all 5 cards</p>
                </div>
                <div>
                  <h3 className="text-red-400 font-semibold mb-2">Rewards</h3>
                  <p className="text-green-400">Winner: 90 GORB tokens</p>
                  <p className="text-gray-400">Loser: 0 GORB tokens</p>
                </div>
                <div>
                  <h3 className="text-red-400 font-semibold mb-2">How to Play</h3>
                  <p className="text-gray-300 text-sm">Match color or number of the center card. Use special cards strategically!</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={startGame}
              className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white px-12 py-6 text-xl font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Start Game (45 GORB)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-red-900 to-blue-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Uno Showdown</h1>
          <p className="text-lg text-gray-300">{message}</p>
        </div>

        {/* Computer Cards */}
        <div className="mb-8">
          <h3 className="text-white text-lg mb-4 text-center">Computer ({computerCards.length} cards)</h3>
          <div className="flex justify-center gap-2">
            {computerCards.map((_, index) => (
              <div key={index} className="w-16 h-24 bg-gray-800 rounded-lg border-2 border-gray-600 flex items-center justify-center">
                <span className="text-gray-400">🃏</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Card */}
        <div className="mb-8">
          <h3 className="text-white text-lg mb-4 text-center">Current Card</h3>
          <div className="flex justify-center">
            {currentCard && getCardDisplay(currentCard)}
          </div>
        </div>

        {/* Player Cards */}
        <div className="mb-8">
          <h3 className="text-white text-lg mb-4 text-center">Your Cards</h3>
          <div className="flex justify-center gap-2 flex-wrap">
            {playerCards.map((card) => (
              <button
                key={card.id}
                onClick={() => playCard(card)}
                disabled={!isPlayerTurn || !canPlayCard(card)}
                className={`transition-all duration-200 hover:scale-110 ${
                  isPlayerTurn && canPlayCard(card) 
                    ? 'cursor-pointer hover:-translate-y-2' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                {getCardDisplay(card)}
              </button>
            ))}
          </div>
        </div>

        {gameState === 'finished' && (
          <div className="text-center mb-8">
            <div className={`rounded-xl p-6 border ${
              winner === 'player' 
                ? 'bg-green-900/50 border-green-400' 
                : 'bg-red-900/50 border-red-400'
            }`}>
              <h2 className={`text-3xl font-bold mb-4 ${
                winner === 'player' ? 'text-green-400' : 'text-red-400'
              }`}>
                {winner === 'player' ? '🎉 You Won! 🎉' : '😞 You Lost'}
              </h2>
              <p className="text-white text-lg">{message}</p>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Button 
            onClick={startGame}
            className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl"
          >
            New Game (45 GORB)
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

export default UnoGame;
