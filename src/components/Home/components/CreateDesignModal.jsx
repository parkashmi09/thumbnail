import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

// Template option component
const TemplateOption = memo(({ type, name, imageUrl, onClick }) => (
  <div className="template-option" onClick={() => onClick(type)}>
    <div className="template-image-container">
      <img 
        src={imageUrl} 
        alt={name}
        className="template-image"
        loading="lazy"
      />
    </div>
    <span>{name}</span>
  </div>
));

// Dimension presets for common templates
const TEMPLATE_DIMENSIONS = {
  'youtube-thumbnail': { width: 1280, height: 720, type: 'Youtube Thumbnail' },
  'instagram-post': { width: 1080, height: 1080, type: 'Instagram Post' },
  'instagram-story': { width: 1080, height: 1920, type: 'Instagram Story' },
  'youtube-channel-art': { width: 2560, height: 1440, type: 'Youtube Channel Art' },
  'facebook-post': { width: 940, height: 788, type: 'Facebook Post' },
  'facebook-cover': { width: 851, height: 315, type: 'Facebook Cover' },
  'facebook-ad': { width: 1200, height: 628, type: 'Facebook Ad' },
  'instagram-ad': { width: 1080, height: 1080, type: 'Instagram Ad' },
  'full-hd': { width: 1920, height: 1080, type: 'Full HD' },
};

// Unit conversion helpers
const unitToPx = ({ unit, dpi = 72, unitVal }) => {
  if (unit === 'px') return unitVal;
  
  const cmToPx = (cm) => (cm * dpi) / 2.54;
  const inToPx = (inch) => inch * dpi;
  
  switch (unit) {
    case 'cm':
      return cmToPx(unitVal);
    case 'in':
      return inToPx(unitVal);
    case 'mm':
      return cmToPx(unitVal / 10);
    default:
      return unitVal;
  }
};

// Common template options data
const TEMPLATE_OPTIONS = [
  {
    type: 'youtube-thumbnail',
    name: 'Youtube Thumbnail',
    imageUrl: 'https://i.imgur.com/8koJOqM.png'
  },
  {
    type: 'instagram-post',
    name: 'Instagram Post',
    imageUrl: 'https://i.imgur.com/cNRU9R2.png'
  },
  {
    type: 'instagram-story',
    name: 'Instagram Story',
    imageUrl: 'https://i.imgur.com/ZcX4eKF.png'
  },
  {
    type: 'youtube-channel-art',
    name: 'Youtube Channel Art',
    imageUrl: 'https://i.imgur.com/LxF3qXN.png'
  }
];

const CreateDesignModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [unit, setUnit] = useState('px');
  const [dpi, setDpi] = useState(72);
  
  if (!isOpen) return null;

  const handleNavigateToEditor = (templateType) => {
    const dimensions = TEMPLATE_DIMENSIONS[templateType] || 
      { width: 1280, height: 720, type: 'Custom' };
    
    navigate('/editor', {
      state: {
        width: dimensions.width,
        height: dimensions.height,
        type: dimensions.type,
        unit: 'px',
        dpi: 72,
        useMagic: true
      }
    });
    onClose();
  };
  
  const handleApplyCustomSize = () => {
    if (!width || !height) return;
    
    let w, h;
    
    if (unit === 'px') {
      w = parseInt(width);
      h = parseInt(height);
    } else {
      // Convert from the selected unit to pixels
      w = Math.round(unitToPx({ unit, dpi, unitVal: parseFloat(width) }));
      h = Math.round(unitToPx({ unit, dpi, unitVal: parseFloat(height) }));
    }
    
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      // Could add validation error handling here
      return;
    }
    
    navigate('/editor', {
      state: {
        width: w,
        height: h,
        type: 'Custom',
        unit: unit,
        dpi: dpi,
        useMagic: true
      }
    });
    onClose();
  };

  const handlePresetClick = (preset) => {
    const dimensions = {
      facebook_post: { width: 940, height: 788 },
      facebook_cover: { width: 851, height: 315 },
      facebook_ad: { width: 1200, height: 628 },
      instagram_post: { width: 1080, height: 1080 },
      instagram_story: { width: 1080, height: 1920 },
      instagram_ad: { width: 1080, height: 1080 },
      youtube_thumbnail: { width: 1280, height: 720 },
      youtube_channel: { width: 2560, height: 1440 },
      full_hd: { width: 1920, height: 1080 },
    };

    const selected = dimensions[preset];
    if (selected) {
      setWidth(selected.width.toString());
      setHeight(selected.height.toString());
      setUnit('px');
    }
  };

  return (
    <div className="custom-size-modal-overlay" onClick={onClose}>
      <div className="custom-size-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          <X size={24} />
        </button>
        
        <h2>Custom Size</h2>
        
        <div className="custom-size-inputs">
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Width" 
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </div>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Height" 
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
          <div className="input-group select-group">
            <select 
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="px">px</option>
              <option value="cm">cm</option>
              <option value="in">in</option>
              <option value="mm">mm</option>
            </select>
          </div>
        </div>
        
        <button className="apply-now-button" onClick={handleApplyCustomSize}>
          Apply now
        </button>
        
        <div className="common-dimensions">
          <h3>Common Dimensions</h3>
          
          <div className="template-options">
            {TEMPLATE_OPTIONS.map(option => (
              <TemplateOption 
                key={option.type}
                type={option.type}
                name={option.name}
                imageUrl={option.imageUrl}
                onClick={handleNavigateToEditor}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDesignModal; 