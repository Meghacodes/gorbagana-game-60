
import { useState, useEffect } from 'react';
import WalletConnector from '@/components/wallet/WalletConnector';
import GameHub from '@/components/games/GameHub';
import { TokenProvider } from '@/context/TokenContext';

const Index = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    // Check if wallet was previously connected
    const savedWallet = localStorage.getItem('connectedWallet');
    if (savedWallet) {
      setIsWalletConnected(true);
    }
  }, []);

  return (
    <TokenProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {!isWalletConnected ? (
          <WalletConnector onConnect={() => setIsWalletConnected(true)} />
        ) : (
          <GameHub />
        )}
      </div>
    </TokenProvider>
  );
};

export default Index;
