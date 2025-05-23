import React, { useEffect, useState } from 'react';
import Pricing from '../../pages/Pricing';
import { X } from 'lucide-react';
import './PricingModal.css';

const PricingModal = ({ isOpen, onClose }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsModalOpen(isOpen);
    
    // If modal is open, prevent background scrolling
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    // Function to check if viewport is mobile size
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };
    
    // Initial check
    checkIsMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIsMobile);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const handleClose = () => {
    setIsModalOpen(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  if (!isOpen) return null;

  return (
    <div className={`pricing-modal-overlay ${isModalOpen ? 'open' : 'closing'}`} onClick={handleClose}>
      <div 
        className={`pricing-modal-container ${isModalOpen ? 'open' : 'closing'}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="pricing-modal-close" onClick={handleClose}>
          <X size={24} />
        </button>
        <Pricing isModal={true} />
      </div>
    </div>
  );
};

export default PricingModal; 