import { useState, useEffect } from 'react';

// Create a custom event for credit updates
export const CREDITS_UPDATED_EVENT = 'credits-updated';

// Function to trigger credit update events across components
export const triggerCreditsUpdate = () => {
  const event = new CustomEvent(CREDITS_UPDATED_EVENT);
  window.dispatchEvent(event);
};

// Function to fetch credits from API
const fetchCredits = async () => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) return 0;

    const response = await fetch(`https://dolphin-app-oxsn4.ondigitalocean.app/api/v1/user/credit/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch credits');
    }
    const data = await response.json();
    return data.credit || 0;
  } catch (error) {
    console.error('Error fetching credits:', error);
    return 0;
  }
};

export const useCredits = () => {
  const [credits, setCredits] = useState(0);
  
  // Fetch credits initially and when auth status changes
  useEffect(() => {
    const checkCredits = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (token && userId) {
        const userCredits = await fetchCredits();
        setCredits(userCredits);
      } else {
        setCredits(0);
      }
    };
    
    // Set up an interval to check credits periodically (every 3 seconds)
    const intervalId = setInterval(checkCredits, 3000);
    
    // Initial check
    checkCredits();
    
    // Listen for credit update events
    const handleCreditsUpdate = () => {
      checkCredits();
    };
    
    window.addEventListener(CREDITS_UPDATED_EVENT, handleCreditsUpdate);
    
    // Clean up
    return () => {
      clearInterval(intervalId);
      window.removeEventListener(CREDITS_UPDATED_EVENT, handleCreditsUpdate);
    };
  }, []);

  return { 
    credits,
    hasCredits: credits > 0 
  };
};

export default useCredits; 