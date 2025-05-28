import React, { memo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import './TemplateGrid.css';
import { LoginModal } from '../../Auth/AuthModals';

// Helper function to create image URL with cache busting
const getImageUrl = (path) => {
  return path;
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
  console.log(templates,"templates");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const scrollContainerRef = useRef(null);
  
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
  
  // Check if user is logged in
  const isUserLoggedIn = () => {
    return localStorage.getItem('token') && localStorage.getItem('userId');
  };
  
  // Handle template click
  const handleTemplateClick = (e, template) => {
    if (!isUserLoggedIn()) {
      e.preventDefault();
      setSelectedTemplate(template);
      setShowAuthModal(true);
    }
  };
  
  // Handle auth modal close
  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    setSelectedTemplate(null);
  };
  
  // Handle successful login
  const handleLoginSuccess = () => {
    setShowAuthModal(false);
    if (selectedTemplate) {
      window.location.href = `/editor/${selectedTemplate._id}`;
      if (selectedTemplate.routingData) {
        sessionStorage.setItem('templateRoutingData', JSON.stringify(selectedTemplate.routingData));
      }
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
            <Link
              to={`/editor/${tpl._id}`}
              state={{ routingData: tpl.routingData }}
              className="template-card"
              key={tpl._id}
              style={{ 
                "--item-index": index,
                opacity: 1,
                visibility: 'visible'
              }}
              onClick={(e) => handleTemplateClick(e, tpl)}
            >
              <img
                src={getImageUrl(tpl.previewPath)}
                alt={tpl.name || 'Template'}
                className="template-img"
                loading="lazy"
                style={{ 
                  crossOrigin: "anonymous"
                }}
              />
            </Link>
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
      
      {/* Auth Modal for login */}
      <LoginModal 
        isOpen={showAuthModal} 
        onClose={handleAuthModalClose}
        onLoginSuccess={handleLoginSuccess}
        redirectAfterLogin={selectedTemplate ? `/editor/${selectedTemplate._id}` : null}
      />
    </>
  );
});

export default TemplatesGrid;