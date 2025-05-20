import React, { useState, useEffect } from 'react';
import './index.css';
import './App.css';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import { CategoryProvider } from './context/CategoryContext.jsx';
import useCustomFonts from './hooks/useCustomFonts';
import Editor from './pages/EditorPage.jsx';
import Pricing from './pages/Pricing';
import { LoginModal } from './components/Auth/AuthModals.jsx';

// Auth protected route component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  useEffect(() => {
    // Check for token and user ID in localStorage
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (token && userId) {
      setIsAuthenticated(true);
    } else {
      setShowAuthModal(true);
    }
    
    setIsLoading(false);
  }, []);
  
  if (isLoading) {
    // Show loading state
    return <div className="loading-container">Loading...</div>;
  }
  
  // Handle modal close
  const handleModalClose = () => {
    setShowAuthModal(false);
    // Redirect to home when auth modal is closed
    window.location.href = '/';
  };
  
  return (
    <>
      {isAuthenticated ? children : (
        <>
          <Navigate to="/" replace />
          <LoginModal isOpen={showAuthModal} onClose={handleModalClose} />
        </>
      )}
    </>
  );
};

// Wrapper component to provide location as key
const EditorWithKey = () => {
  const location = useLocation();
  return (
    <ProtectedRoute>
      <Editor key={location.key} />
    </ProtectedRoute>
  );
};

function App() {
  useCustomFonts();

  return (
    <BrowserRouter>
      <CategoryProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor/:templateId" element={<EditorWithKey />} />
          <Route path="/editor" element={<EditorWithKey />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
      </CategoryProvider>
    </BrowserRouter>
  );
}

export default App;