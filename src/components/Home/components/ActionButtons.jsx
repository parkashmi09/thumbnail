import React, { memo } from 'react';
import { Diamond, PenSquare } from 'lucide-react';

const ActionButtons = memo(({ goToEditor }) => (
  <div className="home-action-buttons">
    <button className="create-design-button" onClick={goToEditor} data-tooltip="Create a design">
      <PenSquare size={16} color="#fff" />
      <span>Create design</span>
    </button>
  </div>
));

export default ActionButtons; 