import { useState, useEffect } from 'react';

// Create a custom event for credit updates
export const CREDITS_UPDATED_EVENT = 'credits-updated';

// Function to trigger credit update events across components
export const triggerCreditsUpdate = () => {
  const event = new CustomEvent(CREDITS_UPDATED_EVENT);
  window.dispatchEvent(event);
};

// Prototype credit system
// Uses localStorage to track user credits
// Credits reset daily and when user logs in they get maxUsage credits
const loadCredits = (key, maxUsage) => {
  try {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const thumbnailCredits = localStorage.getItem('thumbnail_credits');
    console.log('thumbnail_credits', thumbnailCredits);
    
    // If user is not logged in, return 0 credits
    if (!token || !userId) {
      return 0;
    }
    
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    // Reset credits if it's a new day
    if (data.date !== new Date().toDateString()) {
      return maxUsage;
    }
    return data.credits || maxUsage;
  } catch (e) {
    console.error('Error loading credits:', e);
  }
  return maxUsage;
};

const saveCredits = (key, credits) => {
  localStorage.setItem(
    key,
    JSON.stringify({
      date: new Date().toDateString(),
      credits,
    })
  );
  // Trigger an update event when credits are saved
  triggerCreditsUpdate();
};

export const useCredits = (key = 'thumbnail_credits', maxUsage = 20) => {
  const [credits, setCredits] = useState(() =>
    loadCredits(key, maxUsage)
  );
  
  // Listen for token changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (token && userId) {
        setCredits(loadCredits(key, maxUsage));
      } else {
        setCredits(0);
      }
    };
    
    // Set up an interval to check credits periodically (every 3 seconds)
    const intervalId = setInterval(checkAuthStatus, 3000);
    
    // Initial check
    checkAuthStatus();
    
    // Listen for credit update events
    const handleCreditsUpdate = () => {
      setCredits(loadCredits(key, maxUsage));
    };
    
    window.addEventListener(CREDITS_UPDATED_EVENT, handleCreditsUpdate);
    
    // Clean up
    return () => {
      clearInterval(intervalId);
      window.removeEventListener(CREDITS_UPDATED_EVENT, handleCreditsUpdate);
    };
  }, [key, maxUsage]);
  
  // Save credits whenever they change
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (token && userId) {
      saveCredits(key, credits);
    }
  }, [key, credits]);

  const consumeCredits = (amount = 1) => {
    setCredits((currentCredits) => {
      const newCredits = Math.max(0, currentCredits - amount);
      return newCredits;
    });
    return credits > 0;
  };
  
  const resetCredits = () => {
    setCredits(maxUsage);
  };

  return { 
    credits, 
    consumeCredits,
    resetCredits,
    hasCredits: credits > 0 
  };
};

export default useCredits; 