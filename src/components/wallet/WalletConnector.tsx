
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

interface WalletConnectorProps {
  onConnect: () => void;
}

const WalletConnector = ({ onConnect }: WalletConnectorProps) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Simulate wallet connection
    setTimeout(() => {
      localStorage.setItem('connectedWallet', 'BackpackWallet123');
      onConnect();
      setIsConnecting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 mb-4">
            Gorbagana GameHub
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Token-Gated Gaming Experience
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-6 rounded-xl border border-blue-500/30">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Daily Faucet</h3>
              <p className="text-gray-300 text-sm">Claim 100 tokens every 24 hours</p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-6 rounded-xl border border-purple-500/30">
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Token-Gated Games</h3>
              <p className="text-gray-300 text-sm">45 tokens entry fee per game</p>
            </div>
            <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 p-6 rounded-xl border border-green-500/30">
              <h3 className="text-lg font-semibold text-green-400 mb-2">Earn Rewards</h3>
              <p className="text-gray-300 text-sm">Win tokens based on performance</p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-xl font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
        >
          {isConnecting ? (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Connecting Wallet...
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Wallet className="w-6 h-6" />
              Connect Backpack Wallet
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default WalletConnector;
