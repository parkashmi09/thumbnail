import React, { memo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw, Eye, X } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import './TemplateGrid.css';
import { LoginModal } from '../../Auth/AuthModals';
import TemplateDetailsModal from './TemplateDetailsModal';

// Helper function to create image URL with cache busting
const getImageUrl = (path) => {
  return path;
};

// Template Modal Component
const TemplateModal = ({ template, onClose }) => {
  if (!template) return null;

  return (
    <div className="template-modal-overlay" onClick={onClose}>
      <div className="template-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2>{template.name}</h2>
        <div className="template-details">
          <div className="template-info">
            <div className="info-row">
              <span className="label">Template Type:</span>
              <span className="value">Pro Templates <span className="pro-badge">Pro</span></span>
            </div>
            <div className="info-row">
              <span className="label">Template Category:</span>
              <span className="value">Top Creator</span>
            </div>
            <div className="info-row">
              <span className="label">Template Dimensions:</span>
              <span className="value">{template.width} x {template.height} px</span>
            </div>
          </div>
          <div className="template-preview">
            <img 
              src={template.previewPath} 
              alt={template.name}
              className="modal-preview-img"
            />
          </div>
          <button className="use-template-btn" onClick={() => window.location.href = `/editor/${template._id}`}>
            Use this Template
          </button>
        </div>
      </div>
    </div>
  );
};

// Skeleton loader component for templates
const TemplateSkeleton = ({ count = 40 }) => {
  return Array(count).fill(0).map((_, index) => (
    <div 
      className="template-card skeleton-card" 
      key={`skeleton-${index}`}
      style={{ 
        "--item-index": index,
        animation: `fadeInUp 0.5s ease forwards ${index * 0.05}s`
      }}
    >
      <div className="skeleton-img"></div>
    </div>
  ));
};

// Bottom loading indicator when fetching next batch
const BottomLoader = () => (
  <div className="circular-loader-container">
    <div className="circular-loader">
      <svg className="spinner" viewBox="0 0 50 50">
        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle>
      </svg>
    </div>
  </div>
);

// Error message with refresh button
const ErrorMessage = ({ onRefresh }) => (
  <div className="error-message">
    <RefreshCw size={32} className="refresh-icon" />
    <p>Something went wrong while loading templates.</p>
    <button className="refresh-button" onClick={onRefresh}>
      Try Again
    </button>
  </div>
);

const TemplatesGrid = memo(({ templates, loading, hasMore, onLoadMore, isSearching }) => {
  const [hasError, setHasError] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const scrollContainerRef = useRef(null);
  
  // Check if user is logged in
  const isUserLoggedIn = () => {
    return localStorage.getItem('token') && localStorage.getItem('userId');
  };

  // Handle refresh when error occurs
  const handleRefresh = () => {
    setHasError(false);
    onLoadMore();
  };

  // Handle load more with loading state
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      onLoadMore();
    }
  };
  
  // Handle template click - check auth first
  const handleTemplateClick = (template) => {
    if (!isUserLoggedIn()) {
      setSelectedTemplate(template);
      setShowLoginModal(true);
      return;
    }
    window.location.href = `/editor/${template._id}`;
  };
  
  // Handle view details click
  const handleViewDetails = (e, template) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };
  
  // Handle template modal close
  const handleTemplateModalClose = () => {
    setShowTemplateModal(false);
    setSelectedTemplate(null);
  };

  // Handle login modal close
  const handleLoginModalClose = () => {
    setShowLoginModal(false);
    setSelectedTemplate(null);
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    if (selectedTemplate) {
      window.location.href = `/editor/${selectedTemplate._id}`;
    }
  };

  // Show skeleton loader when loading initially and no templates are available
  if ((loading && (!templates || templates.length === 0)) || isSearching) {
    return (
      <div className="template-grid template-grid-five">
        <TemplateSkeleton count={40} />
      </div>
    );
  }

  // Show error message
  if (hasError) {
    return <ErrorMessage onRefresh={handleRefresh} />;
  }

  // Show no results message when not loading and no templates are available
  if (!loading && (!templates || templates.length === 0)) {
    return (
      <div className="no-results-message">
        <span role="img" aria-label="searching" style={{fontSize: '2.5rem', display: 'block', marginBottom: '12px'}}>
          <Search size={24} />
        </span>
        <div style={{fontWeight: 700, fontSize: '1.3rem', color: '#1976d2', marginBottom: '6px'}}>No matching results found</div>
        <div style={{color: '#666', fontSize: '1rem'}}>Try a different category, subcategory, or search term!</div>
      </div>
    );
  }

  return (
    <>
      <div className="template-scroll-container" id="scrollableDiv" ref={scrollContainerRef}>
        <InfiniteScroll
          dataLength={templates.length}
          next={handleLoadMore}
          hasMore={hasMore}
          loader={<BottomLoader />}
          scrollThreshold={0.85}
          className="template-grid template-grid-five"
          onError={() => setHasError(true)}
          refreshFunction={handleRefresh}
          pullDownToRefresh={false}
          scrollableTarget="scrollableDiv"
          style={{ overflow: 'visible', width: '100%' }}
        >
          {templates && templates.map((tpl, index) => (
            <div 
              className="template-card-wrapper"
              key={tpl._id}
              onClick={() => handleTemplateClick(tpl)}
            >
              <div className="template-card">
                <img
                  src={tpl.previewPath}
                  alt={tpl.name}
                  className="template-img"
                  loading="lazy"
                />
                <button 
                  className="view-details-btn"
                  onClick={(e) => handleViewDetails(e, tpl)}
                >
                  <Eye size={20} />
                </button>
              </div>
            </div>
          ))}
        </InfiniteScroll>
        
        {/* Additional sentinel for scroll detection */}
        {hasMore && !loading && (
          <div 
            className="scroll-detector" 
            id="scroll-detector"
            onMouseEnter={handleLoadMore}
          ></div>
        )}
      </div>
      
      {/* Template Modal */}
      {showTemplateModal && (
        <TemplateDetailsModal 
          template={selectedTemplate} 
          onClose={handleTemplateModalClose}
        />
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={handleLoginModalClose}
        onLoginSuccess={handleLoginSuccess}
        redirectAfterLogin={selectedTemplate ? `/editor/${selectedTemplate._id}` : null}
      />
    </>
  );
});

export default TemplatesGrid;