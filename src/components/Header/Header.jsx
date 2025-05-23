import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { Menu, X, User, LogOut, Home, Settings, Info, Star, HelpCircle, Crown } from 'lucide-react';
import { Popover } from '@headlessui/react';
import logo from '../../assets/images/LOGO.png';
import { LoginModal, RegisterModal } from '../Auth/AuthModals';
import { Toaster } from 'react-hot-toast';
import ProfileModal from '../ProfileModal/ProfileModal';
import PricingModal from '../PricingModal/PricingModal';

const Header = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    
    if (token && userId) {
      setUser({
        id: userId,
        name: userName || 'User',
      });
    }
  }, [isLoginOpen, isRegisterOpen]); // Re-check when auth modals close

  useEffect(() => {
    // Function to check if viewport is mobile size
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 900);
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

  // Handle clicks outside the drawer to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef.current && 
          !drawerRef.current.contains(event.target) && 
          !event.target.closest('.menu-toggle')) {
        closeDrawer();
      }
    };

    if (isDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDrawerOpen]);
  
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isDrawerOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    setUser(null);
    closeDrawer();
  };

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };
  
  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };
  
  const openPricingModal = () => {
    setIsPricingModalOpen(true);
    closeDrawer();
  };

  const goToHome = () => {
    navigate('/');
    closeDrawer();
  };

  const goToProfile = () => {
    setIsProfileModalOpen(true);
    closeDrawer();
  };

  const goToHelp = () => {
    navigate('/help');
    closeDrawer();
  };

  const goToAbout = () => {
    navigate('/about');
    closeDrawer();
  };

  const handleOpenLogin = () => {
    closeDrawer();
    setIsLoginOpen(true);
  };

  const handleOpenRegister = () => {
    closeDrawer();
    setIsRegisterOpen(true);
  };

  return (
    <div className="header-container">
      <Toaster position="top-center" />
      <header className="home-header">
        {/* Logo Container */}
        <div className="logo-container" onClick={goToHome} style={{ cursor: 'pointer' }}>
          {!isMobile && (
            <img 
              src={logo} 
              alt="Thumbnail Guru Logo" 
              className="logo-image"
            />
          )}
          <div className="logo-text">
            <p className="title mobile-visible">
              THUMBNAIL <span style={{ color: '#00291b', fontFamily:'Sunborn SansOne' }}>GURU</span>
            </p>
          </div>
        </div>

        {/* Desktop Actions - Only shown on larger screens */}
        {!isMobile && (
          <div className="header-actions desktop-actions">
            <button 
              className="pro-button"
              onClick={openPricingModal}
            >
              <div className="pro-button-content">
                <Crown size={16} className="crown-icon" />
                <span>Upgrade Pro</span>
                <div className="discount-badge">20% OFF</div>
              </div>
            </button>
            
            {user ? (
              <Popover className="user-popover">
                {({ open }) => (
                  <>
                    <Popover.Button className="user-button">
                      <div className="user-avatar">
                        <User size={18} />
                      </div>
                      <span className="user-name">{user.name}</span>
                    </Popover.Button>

                    {open && (
                      <div className="backdrop" aria-hidden="true" />
                    )}

                    <Popover.Panel className="user-panel">
                      <div className="panel-header">
                        <span>{user.name}</span>
                      </div>
                      <div className="panel-content">
                        <button className="panel-item" onClick={goToProfile}>
                          <User size={18} />
                          <span>Profile Settings</span>
                        </button>
                        
                        <button className="panel-item" onClick={goToHelp}>
                          <HelpCircle size={18} />
                          <span>Help</span>
                        </button>
                        
                        <button className="panel-item" onClick={goToAbout}>
                          <Info size={18} />
                          <span>About Us</span>
                        </button>
                        
                        <div className="panel-divider"></div>
                        
                        <button className="logout-button" onClick={handleLogout}>
                          <LogOut size={20} />
                          <span>LOGOUT</span>
                        </button>
                      </div>
                    </Popover.Panel>
                  </>
                )}
              </Popover>
            ) : (
              <>
                <button className="login-btn" onClick={() => setIsLoginOpen(true)}>
                  LOG IN
                </button>
                <button className="register-btn" onClick={() => setIsRegisterOpen(true)}>
                  REGISTER NOW
                </button>
              </>
            )}
          </div>
        )}

        {/* Menu Toggle for Mobile - Only shown on mobile screens */}
        {isMobile && (
          <div className='menu-container'>
            <button 
              className="pro-button-mobile"
              onClick={openPricingModal}
            >
              <div className="pro-button-content">
                <Crown size={14} className="crown-icon" />
                <span>Upgrade Pro</span>
              </div>
            </button>
            <button className="menu-toggle" onClick={toggleDrawer} aria-label="Toggle menu">
              {isDrawerOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        )}
      </header>

      {/* Drawer backdrop - separate from the drawer itself */}
      {isDrawerOpen && (
        <div 
          className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} 
          onClick={closeDrawer}
          ref={overlayRef}
        ></div>
      )}

      {/* Redesigned Drawer for Mobile */}
      <div className={`mobile-drawer ${isDrawerOpen ? 'open' : ''}`} ref={drawerRef}>
        <div className="drawer-content">
          <div className="drawer-header">
            <img src={logo} alt="Logo" className="logo-image" />
            <button 
              className="close-button" 
              onClick={() => setIsDrawerOpen(false)} 
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          
          {user ? (
            <>
              <div className="drawer-section">
                <div className="drawer-section-title">Account</div>
                <div className="drawer-item user-info-mobile">
                  <User size={20} />
                  <span>{user.name}</span>
                </div>
                <button className="drawer-item" onClick={goToHome}>
                  <Home size={20} />
                  <span>Home</span>
                </button>
                <button className="drawer-item" onClick={goToProfile}>
                  <Settings size={20} />
                  <span>Profile Settings</span>
                </button>
              </div>
              
              <div className="drawer-section">
                <div className="drawer-section-title">Help & Support</div>
                <button className="drawer-item" onClick={goToHelp}>
                  <HelpCircle size={20} />
                  <span>Help Center</span>
                </button>
                <button className="drawer-item" onClick={goToAbout}>
                  <Info size={20} />
                  <span>About Us</span>
                </button>
              </div>
              
              <div className="drawer-footer">
                <button 
                  className="drawer-item logout-btn-mobile"
                  onClick={handleLogout}
                >
                  <LogOut size={20} />
                  <span>LOG OUT</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="drawer-section">
                <div className="drawer-section-title">Menu</div>
                <button className="drawer-item" onClick={goToHome}>
                  <Home size={20} />
                  <span>Home</span>
                </button>
                <button className="drawer-item">
                  <Star size={20} />
                  <span>Popular Templates</span>
                </button>
                <button className="drawer-item" onClick={goToHelp}>
                  <HelpCircle size={20} />
                  <span>Help Center</span>
                </button>
                <button className="drawer-item" onClick={goToAbout}>
                  <Info size={20} />
                  <span>About Us</span>
                </button>
              </div>
              
              <div className="drawer-section">
                <div className="drawer-section-title">Account</div>
                <button 
                  className="drawer-item login-btn-mobile" 
                  onClick={handleOpenLogin}
                >
                  <User size={20} />
                  <span>LOG IN</span>
                </button>
                <button 
                  className="drawer-item register-btn-mobile" 
                  onClick={handleOpenRegister}
                >
                  <User size={20} />
                  <span>REGISTER NOW</span>
                </button>
              </div>
              
              <div className="drawer-footer">
                <button className="pro-button-drawer" onClick={openPricingModal}>
                  <div className="pro-button-content">
                    <Crown size={18} className="crown-icon" />
                    <span>Upgrade Pro</span>
                    <div className="discount-badge">20% OFF</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
      />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />
    </div>
  );
};

export default Header;