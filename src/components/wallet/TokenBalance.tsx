
import { useTokens } from '@/context/TokenContext';

const TokenBalance = () => {
  const { tokenBalance } = useTokens();

  return (
    <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 px-6 py-3 rounded-xl border border-blue-500/30">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <span className="text-gray-300 text-sm">Balance:</span>
        <span className="text-blue-400 font-bold text-lg">
          {tokenBalance.toLocaleString()}
        </span>
        <span className="text-gray-400 text-sm">GORB</span>
      </div>
    </div>
  );
};

export default TokenBalance;
