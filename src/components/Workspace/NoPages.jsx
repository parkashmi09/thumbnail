import React from 'react';
import { Plus } from 'lucide-react';
import './WorkspaceControls.css';

export const NoPages = ({ store }) => {
  return (
    <div className="no-pages">
      <div className="no-pages-content">
        <h3>No Pages Yet</h3>
        <p>Create a new page to start designing</p>
        <button className="create-page-button" onClick={() => store.addPage()}>
          <Plus size={20} />
          <span>Create New Page</span>
        </button>
      </div>
    </div>
  );
}; 