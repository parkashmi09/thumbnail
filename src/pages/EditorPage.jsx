import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno';
import { Workspace } from 'polotno/canvas/workspace';
import { SidePanel, SectionTab } from 'polotno/side-panel';
import { Toolbar } from 'polotno/toolbar/toolbar';
import { PagesTimeline } from 'polotno/pages-timeline';
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons';
import { createStore } from 'polotno/model/store';
import { DEFAULT_SECTIONS } from 'polotno/side-panel';
import { observer } from 'mobx-react-lite';
import { Button, Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import { AuthProvider } from '../context/AuthContext';
import { TemplatesSection } from '../TemplateSection';
import Header from '../components/Header/Header';
import CustomElements from '../components/CustomElements/CustomElements';
import ActionControls from '../components/ActionControls';
import Loader from '../components/Loader';

// Create store instance function to allow recreation on component mount
const createEditorStore = () => {
  const store = createStore({
    key: 'nFA5H9elEytDyPyvKL7T', // This key is for Polotno editor store
    showCredit: true,
  });

  // Ensure at least one page exists
  if (store.pages.length === 0) {
    store.addPage();
  }
  
  return store;
};

// Custom Size/Resize Section for Side Panel
const ResizePanel = {
  name: 'resize',
  Tab: (props) => (
    <SectionTab name="Resize" {...props}>
      <span>📏</span>
    </SectionTab>
  ),
  Panel: observer(({ store }) => {
    const [width, setWidth] = useState(store.width || 1280);
    const [height, setHeight] = useState(store.height || 720);
    const [unit, setUnit] = useState(store.unit || 'px');
    
    // Update local state when store dimensions change
    useEffect(() => {
      setWidth(store.width);
      setHeight(store.height);
      setUnit(store.unit || 'px');
    }, [store.width, store.height, store.unit]);
    
    const handleResize = () => {
      const w = parseInt(width);
      const h = parseInt(height);
      
      if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
        return;
      }
      
      store.setSize(w, h);
    };
    
    const applyPreset = (preset) => {
      const presets = {
        'instagram-post': { width: 1080, height: 1080 },
        'instagram-story': { width: 1080, height: 1920 },
        'youtube-thumbnail': { width: 1280, height: 720 },
        'youtube-channel': { width: 2560, height: 1440 },
        'facebook-post': { width: 940, height: 788 },
        'facebook-cover': { width: 851, height: 315 },
        'facebook-ad': { width: 1200, height: 628 },
        'instagram-ad': { width: 1080, height: 1080 },
        'full-hd': { width: 1920, height: 1080 },
      };
      
      const selected = presets[preset];
      if (selected) {
        setWidth(selected.width);
        setHeight(selected.height);
        setUnit('px');
        store.setSize(selected.width, selected.height);
      }
    };
    
    return (
      <div style={{ padding: '15px' }}>
        <h3>Canvas Size</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Width:</label>
          <input 
            type="number" 
            value={width} 
            onChange={(e) => setWidth(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          
          <label style={{ display: 'block', marginBottom: '5px' }}>Height:</label>
          <input 
            type="number" 
            value={height} 
            onChange={(e) => setHeight(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          
          <label style={{ display: 'block', marginBottom: '5px' }}>Unit:</label>
          <select 
            value={unit} 
            onChange={(e) => setUnit(e.target.value)}
            style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
          >
            <option value="px">Pixels (px)</option>
            <option value="cm">Centimeters (cm)</option>
            <option value="in">Inches (in)</option>
            <option value="mm">Millimeters (mm)</option>
          </select>
          
          <button 
            onClick={handleResize}
            style={{
              width: '100%',
              padding: '10px',
              background: 'linear-gradient(90deg, #00291b 0%, #00a67e 100%)',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            Apply Size
          </button>
        </div>
        
        <h3>Common Presets</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button 
            onClick={() => applyPreset('instagram-post')}
            style={{ padding: '8px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
          >
            Instagram Post
          </button>
          <button 
            onClick={() => applyPreset('instagram-story')}
            style={{ padding: '8px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
          >
            Instagram Story
          </button>
          <button 
            onClick={() => applyPreset('youtube-thumbnail')}
            style={{ padding: '8px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
          >
            YouTube Thumbnail
          </button>
          <button 
            onClick={() => applyPreset('facebook-post')}
            style={{ padding: '8px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
          >
            Facebook Post
          </button>
        </div>
      </div>
    );
  }),
};

// Utility function to resize image to stay within 0.25 megapixels (250,000 pixels)
const resizeImage = (blob, maxPixels = 250000) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    img.onload = () => {
      let { width, height } = img;
      const totalPixels = width * height;

      // If image exceeds the limit, resize it
      if (totalPixels > maxPixels) {
        const scale = Math.sqrt(maxPixels / totalPixels);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (resizedBlob) => {
          if (resizedBlob) {
            resolve(resizedBlob);
          } else {
            reject(new Error('Failed to resize image'));
          }
        },
        'image/png'
      );
    };
    img.onerror = () => reject(new Error('Failed to load image for resizing'));
  });
};

// Custom Remove Background Section for Side Panel
const RemoveBackgroundSection = {
  name: 'remove-background',
  Tab: (props) => (
    <SectionTab name="Remove Background" {...props}>
      <span>🖼️</span>
    </SectionTab>
  ),
  Panel: observer(({ store }) => {
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Handle image file selection
    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };

    // Function to call Pixian Background Remover API
    const removeBackground = async () => {
      if (!imageFile) return;

      setLoading(true);
      setError(null);

      try {
        // Resize the image to 0.25 megapixels
        const resizedImage = await resizeImage(imageFile);

        // Prepare form data for Pixian API
        const formData = new FormData();
        formData.append('image', resizedImage, 'image.png');
        formData.append('test', 'true'); // Add test=true parameter

        const username = 'pxymy6dl6t975nh';
        const apiKey = '527sdkif1ootsq72g6gtp99ifc3lrbdogtbq9se8tlr9t04vbqrr';
        const authHeader = `Basic ${btoa(`${username}:${apiKey}`)}`;

        const req = await fetch('https://api.pixian.ai/api/v2/remove-background', {
          method: 'POST',
          headers: {
            Authorization: authHeader,
          },
          body: formData,
        });

        if (!req.ok) {
          const errorMessage = await req.text();
          throw new Error(errorMessage || 'Error while removing background');
        }

        const responseBlob = await req.blob();
        const resultUrl = URL.createObjectURL(responseBlob);

        // Add the processed image to the canvas
        store.activePage.addElement({
          type: 'image',
          src: resultUrl,
          x: store.width / 2 - 200,
          y: 300,
          width: 400,
          height: 400,
        });

        setPreviewUrl(resultUrl); // Update preview with the new image
      } catch (err) {
        setError(err.message);
        if (err.message.includes('Network Error')) {
          setError('Network error. Please check your internet connection and try again.');
        } else {
          setError('Failed to remove background. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    return (
      <div style={{ padding: '10px', maxHeight: '100%', overflow: 'auto' }}>
        <h3>Remove Background</h3>

        {/* Image Upload Input */}
        <div style={{ marginBottom: '10px' }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ marginBottom: '10px' }}
          />
        </div>

        {/* Image Preview */}
        {previewUrl && (
          <div style={{ marginBottom: '20px' }}>
            <img
              src={previewUrl}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
            />
          </div>
        )}

        {/* Remove Background Button */}
        <button
          onClick={removeBackground}
          disabled={!imageFile || loading}
          // className="bp5-button bp5-intent-primary"
          intent="primary"
          style={{
            marginBottom: "10px",
            padding: "5px 15px",
            borderRadius: "5px",
            background: "linear-gradient(90deg, #00291b 0%, #00a67e 100%)",
            color: "#fff",
          }}
        >
          {loading ? "Processing..." : "Remove Background"}
        </button>

        {/* Error Message */}
        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            Error: {error}
          </div>
        )}
      </div>
    );
  }),
};

// Custom Toolbar Component for Image Remove Background
const ImageRemoveBackground = observer(({ store, element }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to call Pixian Background Remover API
  const removeBackground = async () => {
    if (!element || !element.src) return;

    setLoading(true);
    setError(null);

    try {
      // Prepare form data for Pixian API
      const formData = new FormData();
      // Fetch the image from the element's src and convert to a blob
      const response = await fetch(element.src);
      const imageBlob = await response.blob();
      // Resize the image to 0.25 megapixels
      const resizedImage = await resizeImage(imageBlob);
      formData.append('image', resizedImage, 'image.png');
      formData.append('test', 'true'); // Add test=true parameter

      const username = 'pxymy6dl6t975nh';
      const apiKey = '527sdkif1ootsq72g6gtp99ifc3lrbdogtbq9se8tlr9t04vbqrr';
      const authHeader = `Basic ${btoa(`${username}:${apiKey}`)}`;

      const req = await fetch('https://api.pixian.ai/api/v2/remove-background', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
        },
        body: formData,
      });

      if (!req.ok) {
        const errorMessage = await req.text();
        throw new Error(errorMessage || 'Error while removing background');
      }

      const responseBlob = await req.blob();
      const resultUrl = URL.createObjectURL(responseBlob);

      // Update the selected image element with the new src
      element.set({
        src: resultUrl,
      });

      setIsModalOpen(false); // Close modal on success
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Network Error')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError('Failed to remove background. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        text="Remove Background"
        intent="primary"
        style={{
          padding: "5px 15px",
          borderRadius: "5px",
          background: "linear-gradient(90deg, #00291b 0%, #00a67e 100%)",
          color: "#fff",
          cursor: "pointer",
          // marginBottom: "10px",
        }}
        disabled={loading}
      >
        Remove Background
      </button>
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Remove Background"
        style={{ width: '400px' }}
      >
        <DialogBody>
          <div style={{ textAlign: 'center' }}>
            <img
              src={element?.src}
              alt="Selected"
              style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', marginBottom: '20px' }}
            />
            {loading && <p>Processing...</p>}
            {error && (
              <div style={{ color: 'red', marginTop: '10px' }}>
                Error: {error}
              </div>
            )}
            {!loading && !error && (
              <p>Are you sure you want to remove the background of this image?</p>
            )}
          </div>
        </DialogBody>
        <DialogFooter
          actions={
            <>
              <Button
                text="Cancel"
                onClick={() => setIsModalOpen(false)}
                disabled={loading}
              />
              <Button
                intent="primary"
                text="Confirm"
                onClick={removeBackground}
                disabled={loading}
              />
            </>
          }
        />
      </Dialog>
    </>
  );
});

const Editor = () => {
  const { templateId } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [store] = useState(createEditorStore);
  
  // Get dimensions from location state or default values
  const stateData = location.state || {};
  const width = stateData.width || 1280;
  const height = stateData.height || 720;
  const unit = stateData.unit || 'px';
  const dpi = stateData.dpi || 72;
  const designType = stateData.type || 'Custom';
  const useMagic = stateData.useMagic || false;

  useEffect(() => {
    // Set page size with dimensions from router state
    if (width > 0 && height > 0) {
      // Set page size for the first page
      if (store.pages.length > 0) {
        store.pages[0].set({
          width,
          height,
        });
      }

      // Also set store dimensions to match
      store.setSize(width, height);
      
      // Set unit if provided
      if (unit && ['px', 'mm', 'cm', 'in'].includes(unit)) {
        store.setUnit({
          unit,
          dpi,
        });
      }
    }
  }, [width, height, unit, dpi, store]);

  useEffect(() => {
    const fetchAndLoadTemplate = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://thumnail-maker.onrender.com/api/v1/templates/${templateId}`);
        if (!res.ok) throw new Error('Template not found');
        const tpl = await res.json();
        if (tpl.jsonPath) {
          const jsonRes = await fetch(tpl.jsonPath);
          const json = await jsonRes.json();
          await store.loadJSON(json);
        }
      } catch (e) {
        // Only set error if we're not creating a new design
        if (templateId !== 'new') {
          setError(e.message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (templateId && templateId !== 'new') {
      fetchAndLoadTemplate();
    } else {
      // If templateId is 'new' or not provided, just set loading to false
      // This will create a blank canvas with dimensions from URL params
      setLoading(false);
    }
  }, [templateId, store]);

  // Update sections to include ResizePanel and RemoveBackgroundSection
  const sections = [
    { ...TemplatesSection, templateId },
    CustomElements,
    ResizePanel,
    RemoveBackgroundSection,
    ...DEFAULT_SECTIONS.filter(section => section.name !== 'templates' && section.name !== 'elements'),
  ];

  if (loading) return <Loader text="Loading editor..." />;
  
  // Only show error if template was requested but not found
  if (error && templateId && templateId !== 'new') {
    return <div style={{ padding: 40, color: 'red', textAlign: 'center' }}>Error: {error}</div>;
  }

  return (
    <AuthProvider>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <div className="canvas-editor">
            <PolotnoContainer>
              <SidePanelWrap>
                <SidePanel store={store} sections={sections} defaultSection="all-templates" />
              </SidePanelWrap>
              <WorkspaceWrap>
                <Toolbar
                  store={store}
                  components={{
                    ActionControls,
                    ImageRemoveBackground, // Add the custom Remove Background button for images
                  }}
                />
                <Workspace store={store} />
                <ZoomButtons store={store} />
                <PagesTimeline store={store} />
              </WorkspaceWrap>
            </PolotnoContainer>
          </div>
        </main>
      </div>
    </AuthProvider>
  );
};

export default Editor;