import React from 'react';
import { Plus, Copy, Trash2 } from 'lucide-react';
import './WorkspaceControls.css';

export const CustomPageControls = ({ store, width, height, xPadding, yPadding }) => {
  const activePage = store.activePage;

  const handleAddPage = () => {
    store.addPage();
  };

  const handleDuplicatePage = () => {
    if (activePage) {
      store.duplicatePage(activePage);
    }
  };

  const handleDeletePage = () => {
    if (activePage && store.pages.length > 1) {
      store.deletePage(activePage);
    }
  };

  return (
    <div
      className="page-controls"
      style={{
        position: 'absolute',
        top: yPadding + 'px',
        left: xPadding + 'px',
      }}
    >
      <div className="page-info">
        <span className="page-dimensions">
          {width.toFixed(0)} × {height.toFixed(0)} px
        </span>
      </div>
      <div className="page-actions">
        <button 
          className="control-button" 
          onClick={handleAddPage}
          title="Add new page"
        >
          <Plus size={18} />
        </button>
        <button 
          className="control-button" 
          onClick={handleDuplicatePage}
          title="Duplicate page"
          disabled={!activePage}
        >
          <Copy size={18} />
        </button>
        <button 
          className="control-button" 
          onClick={handleDeletePage}
          title="Delete page"
          disabled={!activePage || store.pages.length <= 1}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}; 