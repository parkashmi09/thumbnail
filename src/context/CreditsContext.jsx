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
  const { credits, hasCredits } = useCredits();
  
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
  
  // Provide the credits to the entire app
  const value = {
    credits,
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