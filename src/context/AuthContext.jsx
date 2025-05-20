import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const login = useCallback((email, password) => {
    // TODO: Implement actual authentication logic
    console.log('Login attempt:', { email, password });
    // Simulate successful login
    setIsAuthenticated(true);
    setUser({ email });
  }, []);

  const signup = useCallback((email, password) => {
    // TODO: Implement actual signup logic
    console.log('Signup attempt:', { email, password });
    // Simulate successful signup and login
    setIsAuthenticated(true);
    setUser({ email });
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const value = {
    isAuthenticated,
    user,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 