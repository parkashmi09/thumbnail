import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useCategory } from '../../../context/CategoryContext.jsx';

const MOBILE_BREAKPOINT = 600; // Reduced breakpoint for better mobile detection

const LoadingSkeleton = () => {
  return (
    <div className="category-carousel">
      <div className="carousel-items-wrapper">
        <div className="carousel-items">
          {[...Array(6)].map((_, index) => (
            <div className="category-item skeleton" key={index}>
              <div className="skeleton-icon"></div>
              <div className="skeleton-text"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CategoryCarousel = ({ categories, onCategoryChange }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);
  const [currentIndex, setCurrentIndex] = useState(3); // Start at first real item
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef(null);
  const wrapperRef = useRef(null);
  const itemRef = useRef(null);
  const { setSelectedCategory } = useCategory();

  const itemsPerView = isMobile ? 3 : 6;
  const realLength = categories.length;

  // Prepare circular list: [last3, ...categories, first3]
  const extendedCategories = [
    ...categories.slice(-3),
    ...categories,
    ...categories.slice(0, 3)
  ];

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Responsive
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      // Reset to first real item on resize
      setCurrentIndex(3);
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-slide on mobile
  useEffect(() => {
    if (!isMobile) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1); // Move by 1 item instead of itemsPerView for smoother scrolling
      setIsTransitioning(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [isMobile, itemsPerView]);

  // Handle circular jump (after transition ends)
  useEffect(() => {
    if (!isTransitioning) return;
    const handleTransitionEnd = () => {
      let newIndex = currentIndex;
      let changed = false;
      if (currentIndex >= realLength + 3) {
        newIndex = 3;
        changed = true;
      } else if (currentIndex < 3) {
        newIndex = realLength + 3 - itemsPerView;
        changed = true;
      }
      if (changed) {
        setIsTransitioning(false);
        setTimeout(() => {
          setCurrentIndex(newIndex);
        }, 20);
      }
    };
    const node = carouselRef.current;
    if (node) {
      node.addEventListener('transitionend', handleTransitionEnd);
      return () => node.removeEventListener('transitionend', handleTransitionEnd);
    }
  }, [currentIndex, isTransitioning, realLength, itemsPerView]);

  // Update transform for smooth sliding
  useEffect(() => {
    if (!carouselRef.current) return;
    if (isMobile && itemRef.current) {
      const itemWidth = itemRef.current.offsetWidth;
      carouselRef.current.style.transition = isTransitioning ? 'transform 0.5s cubic-bezier(.4,0,.2,1)' : 'none';
      carouselRef.current.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
    } else {
      const itemWidthPercent = 100 / itemsPerView;
      carouselRef.current.style.transition = isTransitioning ? 'transform 0.5s cubic-bezier(.4,0,.2,1)' : 'none';
      carouselRef.current.style.transform = `translateX(-${currentIndex * itemWidthPercent}%)`;
    }
    if (!isTransitioning) {
      setTimeout(() => setIsTransitioning(true), 20);
    }
  }, [currentIndex, isMobile, itemsPerView, isTransitioning]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => prevIndex - (isMobile ? 1 : itemsPerView)); // Move by 1 on mobile
    setIsTransitioning(true);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => prevIndex + (isMobile ? 1 : itemsPerView)); // Move by 1 on mobile
    setIsTransitioning(true);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="category-carousel">
      <motion.button
        className="carousel-arrow"
        onClick={handlePrev}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronLeft size={isMobile ? 24 : 42} />
      </motion.button>
      <div className="carousel-items-wrapper" ref={wrapperRef}>
        <motion.div
          className="carousel-items"
          ref={carouselRef}
        >
          {extendedCategories.map((cat, index) => (
            <motion.div
              className="category-item"
              key={`${cat.label}-${cat.id}-${index}`}
              ref={index === 3 ? itemRef : null}
              onClick={() => {
                setSelectedCategory(cat)
                onCategoryChange(cat)
              }}
              style={{ cursor: 'pointer' }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: (index % realLength) * 0.05 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src={cat.icon} alt={cat.label} className="cat-icon" />
              <span className="cat-label">{cat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <motion.button
        className="carousel-arrow"
        onClick={handleNext}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronRight size={isMobile ? 24 : 42} />
      </motion.button>
    </div>
  );
};

export default React.memo(CategoryCarousel);