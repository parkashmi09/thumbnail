import React, { useState } from 'react';
import { X } from 'lucide-react';
import './TemplateDetailsModal.css';
import { LoginModal } from '../../Auth/AuthModals';
import { useNavigate } from 'react-router-dom';

const TemplateDetailsModal = ({ template, onClose }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const navigate = useNavigate();

  if (!template) return null;

  // Check if user is logged in
  const isUserLoggedIn = () => {
    return localStorage.getItem('token') && localStorage.getItem('userId');
  };

  // Handle use template click
  const handleUseTemplate = () => {
    if (!isUserLoggedIn()) {
      setShowDetails(false);
      setShowLoginModal(true);
      return;
    }
    navigate(`/editor/${template._id}`);
  };

  // Handle login modal close
  const handleLoginModalClose = () => {
    setShowLoginModal(false);
    onClose();
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    navigate(`/editor/${template._id}`);
  };

  return (
    <>
      {showDetails && (
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
                  <span className="value">{template.category?.categoryName || 'Top Creator'}</span>
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
              <button 
                className="use-template-btn" 
                onClick={handleUseTemplate}
              >
                Use this Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={handleLoginModalClose}
        onLoginSuccess={handleLoginSuccess}
        redirectAfterLogin={`/editor/${template._id}`}
      />
    </>
  );
};

export default TemplateDetailsModal; 