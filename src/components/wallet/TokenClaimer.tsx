
import { Button } from '@/components/ui/button';
import { useTokens } from '@/context/TokenContext';
import Timer from '@/components/ui/Timer';

const TokenClaimer = () => {
  const { canClaim, claimTokens, timeUntilNextClaim } = useTokens();

  return (
    <div className="flex items-center gap-4">
      {!canClaim && timeUntilNextClaim > 0 && (
        <Timer timeRemaining={timeUntilNextClaim} />
      )}
      <Button
        onClick={claimTokens}
        disabled={!canClaim}
        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
          canClaim
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transform hover:scale-105'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        {canClaim ? 'Claim 100 GORB' : 'Claimed Today'}
      </Button>
    </div>
  );
};

export default TokenClaimer;
