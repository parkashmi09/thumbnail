import React, { memo } from 'react';
import { Diamond, PenSquare } from 'lucide-react';

const ActionButtons = memo(({ goToPricing, goToEditor }) => (
  <div className="home-action-buttons">
    <button className="upgrade-button" onClick={goToPricing} data-tooltip="Upgrade with 20% OFF">
      <Diamond size={20} color="#fff" />
      <span>Upgrade with 20% OFF</span>
    </button>
    <button className="create-design-button" onClick={goToEditor} data-tooltip="Create a design">
      <PenSquare size={20} color="#fff" />
      <span>Create a design</span>
    </button>
  </div>
));

export default ActionButtons; 