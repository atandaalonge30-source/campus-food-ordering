import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthAPI } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const token = localStorage.getItem('tpi_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await AuthAPI.me();
      setUser(data.user);
      setVendor(data.vendor);
    } catch (err) {
      localStorage.removeItem('tpi_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSession(); }, [loadSession]);

  const login = (token, userData, vendorData) => {
    localStorage.setItem('tpi_token', token);
    setUser(userData);
    setVendor(vendorData || null);
  };

  const logout = () => {
    localStorage.removeItem('tpi_token');
    localStorage.removeItem('tpi_cart');
    setUser(null);
    setVendor(null);
  };

  const updateUser = (userData) => setUser(userData);

  return (
    <AuthContext.Provider value={{ user, vendor, loading, login, logout, updateUser, reloadSession: loadSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
