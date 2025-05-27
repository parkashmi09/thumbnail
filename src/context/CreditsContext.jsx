import React, { createContext, useContext, useState, useEffect } from 'react';
import useCredits, { CREDITS_UPDATED_EVENT } from '../hooks/useCredits';

// Create the context
const CreditsContext = createContext(null);

// Custom hook to use the credits context
export const useCreditsContext = () => {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error('useCreditsContext must be used within a CreditsProvider');
  }
  return context;
};

// Provider component
export const CreditsProvider = ({ children }) => {
  // Use our credits hook
  const { credits, consumeCredits, resetCredits, hasCredits } = useCredits('thumbnail_credits', 20);
  
  // Add a forceUpdate state to trigger re-renders when needed
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Listen for credit update events
  useEffect(() => {
    const handleCreditsUpdate = () => {
      setForceUpdate(prev => prev + 1);
    };
    
    window.addEventListener(CREDITS_UPDATED_EVENT, handleCreditsUpdate);
    
    return () => {
      window.removeEventListener(CREDITS_UPDATED_EVENT, handleCreditsUpdate);
    };
  }, []);
  
  // Enhanced consumeCredits that triggers updates
  const enhancedConsumeCredits = (amount) => {
    const result = consumeCredits(amount);
    // Force a context update after consumption
    setForceUpdate(prev => prev + 1);
    return result;
  };
  
  // Provide the credits and functions to consume/reset them to the entire app
  const value = {
    credits,
    consumeCredits: enhancedConsumeCredits,
    resetCredits,
    hasCredits,
    forceUpdate // Include this in the context value to trigger re-renders
  };
  
  return (
    <CreditsContext.Provider value={value}>
      {children}
    </CreditsContext.Provider>
  );
};

export default CreditsProvider; 