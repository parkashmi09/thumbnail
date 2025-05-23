import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import MdPhotoLibrary from '@meronex/icons/md/MdPhotoLibrary';
import { ImagesGrid } from 'polotno/side-panel/images-grid';

// Helper function to create image URL with cache busting
const getImageUrl = (path) => {
  return `${path}?_=${new Date().getTime()}`;
};

export const TemplatesPanel = observer(({ store, routingData }) => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [categoryName, setCategoryName] = useState('All Templates');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');

  // Set initial subcategory ID when routingData changes
  useEffect(() => {
    if (routingData && routingData.type === 'subCategories' && routingData.data && routingData.data.length > 0) {
      // Set the initial subcategory to the first one in the array
      setSelectedSubCategoryId(routingData.data[0]._id);
      setCategoryName(routingData.data[0].subCategoryName || 'Templates');
    } else if (routingData && routingData.type === 'category' && routingData.data) {
      setCategoryName(routingData.data.categoryName || 'Templates');
    }
  }, [routingData]);

  // Fetch templates based on selected subcategory
  useEffect(() => {
    // Reset error state when fetching new templates
    setLoadError(null);
    
    const fetchTemplates = async () => {
      if (!selectedSubCategoryId && (!routingData || !routingData.data)) {
        console.log("No subcategory ID or routing data available");
        return;
      }

      setIsLoading(true);
      try {
        let url = 'https://thumnail-maker.onrender.com/api/v1/get/templates';
        
        // Use selected subcategory ID if available, otherwise use the first from routingData
        if (selectedSubCategoryId) {
          url += `?subCategoryId=${selectedSubCategoryId}`;
        } else if (routingData && routingData.type === 'category' && routingData.data) {
          url += `?categoryId=${routingData.data._id}`;
        }
        
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        
        // Map API response to template format
        if (data && data.templates) {
          const templatesData = data.templates.map(template => ({
            id: template._id,
            name: template.name,
            // Add cache busting to prevent stale images
            preview: getImageUrl(template.previewPath),
            json: template.jsonPath,
            width: template.width,
            height: template.height,
            // Add additional properties for handling image loading
            crossOrigin: 'anonymous',
            loading: 'lazy'
          }));
          setTemplates(templatesData);
        } else {
          setTemplates([]);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        setLoadError(error.message);
        setTemplates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [selectedSubCategoryId, routingData]);

  // Handle subcategory selection
  const handleSubCategoryClick = (subCatId, subCatName) => {
    setSelectedSubCategoryId(subCatId);
    setCategoryName(subCatName);
    setTemplates([]); // Clear templates when switching subcategories for better UX
    setIsLoading(true); // Show loading state immediately
  };

  // Custom handler for template selection with better error handling
  const handleTemplateSelect = async (item) => {
    try {
      setIsLoading(true);
      const req = await fetch(item.json);
      if (!req.ok) {
        throw new Error(`Failed to load template (${req.status})`);
      }
      const json = await req.json();

      console.log("json is",json);
      
      // Process JSON data to ensure all images have proper loading attributes
      if (json.objects) {
        json.objects = json.objects.map(obj => {
          if (obj.type === 'image') {
            return {
              ...obj,
              crossOrigin: 'anonymous',
            };
          }
          return obj;
        });
      }
      
      // Update page dimensions if template has specific size
      if (item.width && item.height) {
        store.setSize(item.width, item.height);
      }
      
      await store.loadJSON(json);
    } catch (error) {
      console.error('Error loading template:', error);
      alert(`Failed to load template: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Category Header */}
      <div style={{ 
        padding: '15px', 
        borderBottom: '1px solid #ddd', 
        background: 'linear-gradient(90deg, #00291b 0%, #00a67e 100%)',
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        {categoryName}
      </div>

      {/* SubCategories Selector - Show only if multiple subcategories exist */}
      {routingData && routingData.type === 'subCategories' && routingData.data && routingData.data.length > 1 && (
        <div style={{ padding: '10px', borderBottom: '1px solid #ddd', overflowX: 'auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {routingData.data.map((subCat) => (
              <button
                key={subCat._id}
                onClick={() => handleSubCategoryClick(subCat._id, subCat.subCategoryName)}
                style={{
                  padding: '5px 12px',
                  background: selectedSubCategoryId === subCat._id 
                    ? 'linear-gradient(90deg, #00291b 0%, #00a67e 100%)' 
                    : '#f5f5f5',
                  color: selectedSubCategoryId === subCat._id ? 'white' : '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: selectedSubCategoryId === subCat._id ? 'bold' : 'normal',
                  whiteSpace: 'nowrap',
                }}
              >
                {subCat.subCategoryName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loadError ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#e74c3c' }}>
            Error loading templates: {loadError}
            <button 
              onClick={() => {
                setLoadError(null);
                setSelectedSubCategoryId(selectedSubCategoryId); // Trigger a refetch
              }}
              style={{
                display: 'block',
                margin: '10px auto',
                padding: '5px 10px',
                background: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        ) : templates.length === 0 && !isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No templates found
          </div>
        ) : (
          <ImagesGrid
            shadowEnabled={false}
            images={templates}
            getPreview={(item) => item.preview}
            isLoading={isLoading}
            onSelect={handleTemplateSelect}
            rowsNumber={2}
            loadingText="Loading templates..."
            loadingColor="#00a67e"
          />
        )}
      </div>
    </div>
  );
});

// Define the new custom section
export const TemplatesSection = {
  name: 'all-templates',
  Tab: (props) => (
    <SectionTab name="Related Templates" {...props}>
      <MdPhotoLibrary />
    </SectionTab>
  ),
  Panel: TemplatesPanel,
};