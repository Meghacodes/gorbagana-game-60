
import React, { createContext, useContext, useState, useEffect } from 'react';

interface TokenContextType {
  tokenBalance: number;
  lastClaimTime: number;
  canClaim: boolean;
  timeUntilNextClaim: number;
  claimTokens: () => void;
  spendTokens: (amount: number) => boolean;
  addTokens: (amount: number) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider = ({ children }: { children: React.ReactNode }) => {
  const [tokenBalance, setTokenBalance] = useState(100); // Start with 100 tokens
  const [lastClaimTime, setLastClaimTime] = useState(0);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState(0);

  const CLAIM_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const DAILY_TOKENS = 100;

  useEffect(() => {
    // Load saved data from localStorage
    const savedBalance = localStorage.getItem('tokenBalance');
    const savedLastClaim = localStorage.getItem('lastClaimTime');
    
    if (savedBalance) setTokenBalance(parseInt(savedBalance));
    if (savedLastClaim) setLastClaimTime(parseInt(savedLastClaim));
  }, []);

  useEffect(() => {
    // Update countdown timer every second
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastClaim = now - lastClaimTime;
      const remaining = Math.max(0, CLAIM_COOLDOWN - timeSinceLastClaim);
      setTimeUntilNextClaim(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastClaimTime]);

  const canClaim = timeUntilNextClaim === 0 && lastClaimTime > 0 ? true : lastClaimTime === 0;

  const claimTokens = () => {
    if (canClaim) {
      const newBalance = tokenBalance + DAILY_TOKENS;
      const now = Date.now();
      
      setTokenBalance(newBalance);
      setLastClaimTime(now);
      
      localStorage.setItem('tokenBalance', newBalance.toString());
      localStorage.setItem('lastClaimTime', now.toString());
    }
  };

  const spendTokens = (amount: number): boolean => {
    if (tokenBalance >= amount) {
      const newBalance = tokenBalance - amount;
      setTokenBalance(newBalance);
      localStorage.setItem('tokenBalance', newBalance.toString());
      return true;
    }
    return false;
  };

  const addTokens = (amount: number) => {
    const newBalance = tokenBalance + amount;
    setTokenBalance(newBalance);
    localStorage.setItem('tokenBalance', newBalance.toString());
  };

  return (
    <TokenContext.Provider value={{
      tokenBalance,
      lastClaimTime,
      canClaim,
      timeUntilNextClaim,
      claimTokens,
      spendTokens,
      addTokens
    }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useTokens = () => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useTokens must be used within a TokenProvider');
  }
  return context;
};
