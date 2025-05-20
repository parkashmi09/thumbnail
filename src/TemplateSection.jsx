import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import MdPhotoLibrary from '@meronex/icons/md/MdPhotoLibrary';
import { ImagesGrid } from 'polotno/side-panel/images-grid';

// Helper function to create image URL with cache busting
const getImageUrl = (path) => {
  return `${path}?_=${new Date().getTime()}`;
};

export const TemplatesPanel = observer(({ store }) => {
  const [category, setCategory] = useState('All'); // Default category
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch templates from API based on category
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const url = category === 'All' 
          ? '/api/templates' 
          : `/api/templates/category/${category}`;
        
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setTemplates(data);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setTemplates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [category]);

  // Define available categories
  const categories = ['All', 'Instagram', 'YouTube'];

  // Preload images with crossOrigin
  useEffect(() => {
    templates.forEach((template) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = getImageUrl(`/templates/${template.preview}`);
    });
  }, [templates]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Category Selector */}
      <div style={{ padding: '10px', borderBottom: '1px solid #ddd', display: 'flex', gap: '10px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '5px 10px',
              background: category === cat ? 'linear-gradient(90deg, #00291b 0%, #00a67e 100%)' : '#fff',
              color: category === cat ? '#fff' : '#000',
              border: '1px solid #007bff',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <ImagesGrid
        shadowEnabled={false}
        images={templates}
        getPreview={(item) => getImageUrl(`/templates/${item.preview}`)}
        isLoading={isLoading}
        onSelect={async (item) => {
          try {
            const req = await fetch(getImageUrl(`/templates/${item.json}`), {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (!req.ok) {
              throw new Error(`HTTP error! status: ${req.status}`);
            }

            const json = await req.json();
            
            // Ensure all images in the template have crossOrigin set
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
            
            store.loadJSON(json);
          } catch (error) {
            console.error('Error loading template:', error);
          }
        }}
        rowsNumber={1}
      />
    </div>
  );
});

// Define the new custom section
export const TemplatesSection = {
  name: 'all-templates',
  Tab: (props) => (
    <SectionTab name="ALL Templates" {...props}>
      <MdPhotoLibrary />
    </SectionTab>
  ),
  Panel: TemplatesPanel,
};