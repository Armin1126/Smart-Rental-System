import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('smart_rental_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('smart_rental_token') || null;
  });

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('smart_rental_user', JSON.stringify(userData));
    localStorage.setItem('smart_rental_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smart_rental_user');
    localStorage.removeItem('smart_rental_token');
  };

  const role = user?.role || null;
  const isDealer = role === 'DEALER';
  const isCustomer = role === 'CUSTOMER';

  return (
    <AuthContext.Provider value={{ user, role, token, isDealer, isCustomer, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
