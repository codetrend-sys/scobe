import React, { createContext, useContext, useState, useEffect } from 'react';

// Identifiants admin – à adapter selon ton besoin
const ADMIN_EMAIL = 'admin@scobe.local';
const ADMIN_PASSWORD = 'admin123';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_authenticated');
      setIsAdminAuthenticated(saved === 'true');
    } catch {
      setIsAdminAuthenticated(false);
    }
  }, []);

  const login = (email, password) => {
    const ok =
      String(email).toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
      String(password) === ADMIN_PASSWORD;

    if (!ok) return false;

    setIsAdminAuthenticated(true);
    try {
      localStorage.setItem('admin_authenticated', 'true');
    } catch {
      // ignore
    }
    return true;
  };

  const logout = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem('admin_authenticated');
    } catch {
      // ignore
    }
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return ctx;
}

