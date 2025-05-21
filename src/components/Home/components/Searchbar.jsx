import React, { useState, useCallback, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import "./SearchOverlay.css";

// Beautiful SVG component for "No Suggestions Found"
const NoResultsSVG = () => (
  <svg className="no-results-svg" viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00291b" />
        <stop offset="100%" stopColor="#00a67e" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.2"/>
      </filter>
    </defs>
    
    {/* Document stack */}
    <rect x="30" y="40" width="80" height="90" rx="4" fill="#f0f0f0" filter="url(#shadow)"/>
    <rect x="40" y="30" width="80" height="90" rx="4" fill="#f8f8f8" filter="url(#shadow)"/>
    <rect x="50" y="20" width="80" height="90" rx="4" fill="white" filter="url(#shadow)"/>
    
    {/* Text lines */}
    <rect x="65" y="40" width="50" height="5" rx="2.5" fill="#e0e0e0"/>
    <rect x="65" y="55" width="40" height="5" rx="2.5" fill="#e0e0e0"/>
    <rect x="65" y="70" width="45" height="5" rx="2.5" fill="#e0e0e0"/>
    
    {/* Magnifying glass */}
    <circle cx="130" cy="85" r="28" fill="white" stroke="url(#searchGradient)" strokeWidth="5"/>
    <line x1="150" y1="105" x2="170" y2="125" stroke="url(#searchGradient)" strokeWidth="8" strokeLinecap="round"/>
    
    {/* No results indicator */}
    <circle cx="130" cy="85" r="18" fill="rgba(255, 255, 255, 0.8)" />
    <line x1="116" y1="85" x2="144" y2="85" stroke="url(#searchGradient)" strokeWidth="4" strokeLinecap="round"/>
    <line x1="130" y1="71" x2="130" y2="99" stroke="url(#searchGradient)" strokeWidth="4" strokeLinecap="round" opacity="0.4"/>
    
    {/* Decorative elements */}
    <circle cx="40" cy="140" r="5" fill="url(#searchGradient)" opacity="0.2"/>
    <circle cx="160" cy="30" r="8" fill="url(#searchGradient)" opacity="0.2"/>
    <circle cx="175" cy="60" r="4" fill="url(#searchGradient)" opacity="0.2"/>
  </svg>
);

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const searchRef = useRef(null);
  const searchBarRef = useRef(null);
  const [overlayWidth, setOverlayWidth] = useState(0);
  
  // Check if viewport is mobile size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 600);
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
  
  // Update overlay width when search bar resizes
  useEffect(() => {
    if (searchBarRef.current) {
      // Initial width setting
      setOverlayWidth(searchBarRef.current.offsetWidth);
      
      // Set up resize observer for more accurate width tracking
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          setOverlayWidth(entry.target.offsetWidth);
        }
      });
      
      resizeObserver.observe(searchBarRef.current);
      
      // Clean up observer on unmount
      return () => {
        if (searchBarRef.current) {
          resizeObserver.unobserve(searchBarRef.current);
        }
        resizeObserver.disconnect();
      };
    }
  }, []);
  
  // Debounce search using useCallback
  const debouncedSearch = useCallback((value) => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 500); // 500ms debounce time
    
    return () => clearTimeout(timer);
  }, [onSearch]);
  
  // Fetch suggestions when search term changes
  useEffect(() => {
    const fetchSuggestions = async (term) => {
      if (!term || term.length < 1) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch(`https://thumnail-maker.onrender.com/api/v1/template-suggestions?query=${encodeURIComponent(term)}`);
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
      fetchSuggestions(searchTerm);
    }, 300); // Debounce suggestions fetch
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Show suggestions as soon as user types
    if (value.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    
    debouncedSearch(value);
  };
  
  const handleSuggestionClick = (text) => {
    setSearchTerm(text);
    onSearch(text);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setShowSuggestions(false);
    onSearch("");
  };

  return (
    <div className="search-bar-container" ref={searchRef}>
      <div className="search-bar search-bar-floating" ref={searchBarRef}>
        <input 
          type="text" 
          placeholder={isMobile ? "Search..." : "Search templates..."} 
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => searchTerm.length >= 1 && setShowSuggestions(true)}
        />
        <span className="search-icon">
          {searchTerm ? (
            <X 
              size={isMobile ? 18 : 20} 
              className="clear-search-icon" 
              onClick={handleClearSearch}
            />
          ) : (
            <Search size={isMobile ? 18 : 22} />
          )}
        </span>
      </div>
      
      {showSuggestions && (
        <div 
          className="search-suggestions-overlay" 
          style={{ width: overlayWidth > 0 ? `${overlayWidth}px` : '100%' }}
        >
          {isLoading ? (
            <div className="suggestion-skeleton-container">
              <div className="suggestion-skeleton">
                <div className="suggestion-skeleton-image"></div>
                <div className="suggestion-skeleton-text"></div>
              </div>
              <div className="suggestion-skeleton">
                <div className="suggestion-skeleton-image"></div>
                <div className="suggestion-skeleton-text"></div>
              </div>
              <div className="suggestion-skeleton">
                <div className="suggestion-skeleton-image"></div>
                <div className="suggestion-skeleton-text"></div>
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion.text)}
              >
                <div className="suggestion-image">
                  <img src={suggestion.image} alt={suggestion.text} />
                </div>
                <div className="suggestion-text">{suggestion.text}</div>
              </div>
            ))
          ) : (
            <div className="no-suggestions">
              <NoResultsSVG />
              <span>No suggestions found</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(SearchBar);