import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useCategory } from '../context/CategoryContext';

import Searchbar from "../components/Home/components/Searchbar";
import CategoryCarousel from "../components/Home/components/CategoryCarousel";
import Header from "../components/Header/Header";
import TemplatesGrid from "../components/Home/components/TemplateGrid";
import CreateDesignModal from "../components/Home/components/CreateDesignModal";
import ActionButtons from "../components/Home/components/ActionButtons";
import Loader from "../components/Loader";

const Home = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [accordionState, setAccordionState] = useState({});
  const { selectedCategory, setSelectedCategory } = useCategory();
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [rawCategories, setRawCategories] = useState([]);
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Pagination and search state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const LIMIT = 15; // Changed to 10 templates per page

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://thumnail-maker.onrender.com/api/v1/get/categories");
        const data = await res.json();
        setRawCategories(data);
        setCategories(
          data.map(cat => ({
            id: cat._id,
            label: cat.categoryName,
            icon: cat.categoryImg
          }))
        );
      } catch (e) {
        console.error("Error fetching categories:", e);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Function to fetch templates with pagination and search
  const fetchTemplates = useCallback(async (pageNum = 1, reset = false) => {
    if (pageNum === 1) {
      setLoading(true);
      if (searchTerm) setSearching(true);
    }
    
    let url = `https://thumnail-maker.onrender.com/api/v1/get/templates?page=${pageNum}&limit=${LIMIT}&categoryId=${categoryId}`;
    
    // Add search term if provided
    if (searchTerm) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    
    // Add subcategory filter if selected
    if (selectedSubCategory) {
      url += `&subCategoryId=${selectedSubCategory}`;
    }
    
    try {
      const res = await fetch(url);
      const data = await res.json();

      console.log(data, "data");
      
      const templatesData = data.templates || [];
      
      // Process each template to determine routing data
      const processedTemplates = templatesData.map(template => {
        // If template has subcategories (array with items), use subcategories for routing
        // Otherwise, use category data for routing
        const routingData = template.subCategories && template.subCategories.length > 0 
          ? { type: 'subCategories', data: template.subCategories }
          : { type: 'category', data: template.category };
          
        return {
          ...template,
          routingData
        };
      });
      
      setTemplates(prevTemplates => {
        if (reset || pageNum === 1) {
          return processedTemplates; // Completely replace for reset or first page
        } else {
          // Deduplicate incoming templates against previous ones before appending
          const existingIds = new Set(prevTemplates.map(t => t._id));
          const uniqueNewTemplates = processedTemplates.filter(t => !existingIds.has(t._id));
          return [...prevTemplates, ...uniqueNewTemplates];
        }
      });
      
      // Update pagination info
      setTotalPages(data.totalPages || 1);
      setTotalTemplates(data.total || 0);
      const newHasMore = pageNum < (data.totalPages || 1);
      setHasMore(newHasMore);
      
    } catch (e) {
      console.error("Error fetching templates:", e);
      if (reset || pageNum === 1) {
        setTemplates([]); // Reset templates on error for first page or explicit reset
      }
      setHasMore(false); // Stop further loading attempts on error
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [searchTerm, selectedSubCategory, LIMIT, categoryId]);

  // Initial fetch and fetch when dependencies change
  useEffect(() => {
    setPage(1); // Reset to page 1
    setTemplates([]); // Clear existing templates when category changes
    fetchTemplates(1, true);
  }, [fetchTemplates]);

  // Load more templates for infinite scroll
  const loadMoreTemplates = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      console.log(`Loading next batch of templates: page ${nextPage}`);
      setPage(nextPage);
      setLoading(true); // Set loading state while fetching
      // Fetch immediately instead of delay for better user experience
      fetchTemplates(nextPage, false);
    }
  }, [loading, hasMore, page, fetchTemplates]);

  // Handle search with better UX
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    
    if (term) {
      setSearching(true); // Show searching state right away for better UX
      setPage(1);
      setSelectedSubCategory(null); // Clear subcategory filter when searching
    }
  }, []);

  // Fetch templates by subcategory
  const fetchTemplatesBySubCategory = useCallback((subCategoryId) => {
    setSelectedSubCategory(subCategoryId);
    setSearchTerm(""); // Clear search when filtering by subcategory
    setPage(1);
  }, []);

  const toggleAccordion = (key) => {
    setAccordionState(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderSubCategories = (subCategories, parentKey = "") => {
    if (!subCategories || subCategories.length === 0) return null;
    
    return subCategories.map((sub) => {
      const key = `${parentKey}-${sub._id}`;
      const hasChildren = sub.subCategories && sub.subCategories.length > 0;
      const isOpen = accordionState[key] || false;
      
      return (
        <div className={`accordion-item ${isOpen ? 'open' : ''}`} key={key}>
          <button 
            className="accordion-header" 
            onClick={() => {
              if (hasChildren) {
                toggleAccordion(key);
              } else {
                fetchTemplatesBySubCategory(sub._id);
              }
            }}
          >
            <div className="accordion-title">
              <span>{sub.subCategoryName}</span>
            </div>
            {hasChildren && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
          </button>
          {hasChildren && isOpen && (
            <div className="accordion-content">
              {renderSubCategories(sub.subCategories, key)}
            </div>
          )}
        </div>
      );
    });
  };

  const selectedCategoryObj = rawCategories.find(cat => 
    cat._id === (selectedCategory && selectedCategory.id)
  );

  const goToPricing = () => navigate('/pricing');
  const goToEditor = () => setIsDesignModalOpen(true);
  
  const handleCategoryChange = (category) => {
    console.log(category, "category");
    setSelectedCategory(category); // Set the selected category
    setTemplates([]); // Clear templates immediately when category changes
    setLoading(true); // Set loading state
    setCategoryId(category.id);
    // Explicitly trigger a fetch when category changes
    setPage(1);
    setSelectedSubCategory(null);
    setSearchTerm("");
  };

  // Force refetch when categoryId changes
  useEffect(() => {
    if (categoryId) {
      fetchTemplates(1, true);
    }
  }, [categoryId]);

  return (
    <div className="home-layout">
      <div className="home-root">
        <Header />
        
        {/* Fixed top section with Carousel and Actions */}
        <div className="fixed-top-section">
          {/* Carousel and Search */}
          <div className="carousel-wrapper">
            <CategoryCarousel categories={categories} onCategoryChange={handleCategoryChange} />
            <Searchbar onSearch={handleSearch} />
          </div>
          
        
          {/* <ActionButtons 
            goToPricing={goToPricing} 
            goToEditor={goToEditor} 
          /> */}
        </div>
        
        {/* Scrollable content area */}
        <div className="">
          <div className="home-wrapper">
            {/* Category Sidebar */}
            {selectedCategory && selectedCategoryObj && (
              <div className="side-card side-card--open">
                <div className="side-card-header">
                  {selectedCategoryObj.categoryName}
                  <button 
                    className="side-card-close" 
                    onClick={() => setSelectedCategory(null)} 
                    aria-label="Close sidebar"
                  >
                    ✕
                  </button>
                </div>
                <div className="sidebar-scrollable">
                  {renderSubCategories(selectedCategoryObj.subCategories)}
                </div>
              </div>
            )}
            
            {/* Templates Grid */}
            <div className="template-grid-container">
              <TemplatesGrid 
                templates={templates} 
                loading={loading}
                hasMore={hasMore}
                onLoadMore={loadMoreTemplates}
                isSearching={searching}
                key={categoryId || 'default'} // Add key to force re-render when categoryId changes
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Create Design Modal */}
      <CreateDesignModal 
        isOpen={isDesignModalOpen} 
        onClose={() => setIsDesignModalOpen(false)} 
      />
    </div>
  );
};

export default Home;