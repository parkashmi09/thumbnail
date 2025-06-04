import React, { useState, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import { Upload, Trash2 } from 'lucide-react';
import { ProgressBar, Intent } from '@blueprintjs/core';
import toast from 'react-hot-toast';
import axios from 'axios';

const UploadPanel = observer(({ store }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [userImages, setUserImages] = useState([]);
  const [hoveredImageId, setHoveredImageId] = useState(null);

  // Get userId from localStorage
  const userId = localStorage.getItem('userId');

  // Fetch user's uploaded images
  const fetchUserImages = async () => {
    try {
      const response = await axios.get(`https://dolphin-app-oxsn4.ondigitalocean.app/api/v1/user-uploads?userId=${userId}`);
      setUserImages(response.data);
    } catch (error) {
      console.error('Error fetching user images:', error);
      toast.error('Failed to load your images');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserImages();
    }
  }, [userId]);

  const handleUpload = async (files) => {
    if (!userId) {
      toast.error('Please login to upload images');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    formData.append('uploadedBy', userId);

    try {
      const response = await axios.post(
        'https://dolphin-app-oxsn4.ondigitalocean.app/api/v1/user-uploads',
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(progress);
          },
        }
      );

      toast.success('Images uploaded successfully!');
      fetchUserImages(); // Refresh the images list
      
      // Add uploaded images to the canvas
      response.data.forEach(image => {
        store.activePage?.addElement({
          type: 'image',
          src: image.url,
        });
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handlePaste = useCallback(async (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    const files = [];

    for (let item of items) {
      if (item.type.indexOf('image') === 0) {
        const blob = item.getAsFile();
        files.push(blob);
      }
    }

    if (files.length > 0) {
      handleUpload(files);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  return (
    <div 
      style={{ 
        padding: '20px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${isDragging ? '#00a67e' : '#ccc'}`,
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: isDragging ? 'rgba(0, 166, 126, 0.1)' : 'transparent',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <input
          type="file"
          id="fileInput"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleUpload(e.target.files)}
        />
        <Upload size={40} color={isDragging ? '#00a67e' : '#666'} />
        <p style={{ margin: '10px 0' }}>
          {isDragging ? 'Drop images here' : 'Drag & drop images here or click to upload'}
        </p>
        <p style={{ fontSize: '12px', color: '#666' }}>
          You can also paste images directly
        </p>
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div style={{ margin: '10px 0' }}>
          <ProgressBar
            value={uploadProgress / 100}
            intent={Intent.SUCCESS}
            stripes={true}
            animate={true}
          />
          <p style={{ textAlign: 'center', marginTop: '5px' }}>
            Uploading... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}

      {/* Uploaded Images Grid */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '15px',
        overflowY: 'auto',
        flex: 1,
        padding: '10px'
      }}>
        {userImages.map((image, index) => (
          <div
            key={index}
            onMouseEnter={() => setHoveredImageId(image._id)}
            onMouseLeave={() => setHoveredImageId(null)}
            style={{
              cursor: 'pointer',
              position: 'relative',
              width: '100%',
              paddingBottom: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #eee',
              backgroundColor: '#f5f5f5',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Delete Button */}
            <div
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                padding: '8px',
                background: 'rgba(0,0,0,0.6)',
                borderRadius: '50%',
                cursor: 'pointer',
                opacity: hoveredImageId === image._id ? 1 : 0,
                transition: 'all 0.3s ease',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px'
              }}
              onClick={async (e) => {
                e.stopPropagation(); // Prevent image selection when clicking delete
                try {
                  await axios.delete(`https://dolphin-app-oxsn4.ondigitalocean.app/api/v1/delete-uploads/${image._id}`);
                  toast.success('Image deleted successfully');
                  fetchUserImages(); // Refresh the images list
                } catch (error) {
                  console.error('Delete error:', error);
                  toast.error('Failed to delete image');
                }
              }}
            >
              <Trash2 size={16} color="#fff" />
            </div>

            {/* Image Container */}
            <div
              onClick={() => {
                store.activePage?.addElement({
                  type: 'image',
                  src: image.url,
                });
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                padding: '8px',
                backgroundColor: '#fff'
              }}
            >
              <img
                src={image.url}
                alt={`Uploaded ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=Error';
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// Create upload section
const UploadSection = {
  name: 'upload',
  Tab: (props) => (
    <SectionTab name="Upload" {...props}>
      <Upload />
    </SectionTab>
  ),
  Panel: UploadPanel,
};

export default UploadSection; 