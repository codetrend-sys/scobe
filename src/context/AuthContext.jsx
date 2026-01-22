import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Load current logged user (if any)
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('current_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Persisted users list - register will add entries here and login will validate against it.
  const [users, setUsers] = useState(() => {
    try {
      const raw = localStorage.getItem('users_list');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const persistUsers = (next) => {
    setUsers(next);
    try { localStorage.setItem('users_list', JSON.stringify(next)); } catch (e) { console.error('persistUsers error', e); }
  };

  const login = (email) => {
    // Only allow login if the email is registered
    const found = users.find(u => u.email?.toLowerCase() === String(email).toLowerCase());
    if (!found) return null;
    setUser(found);
    try { localStorage.setItem('current_user', JSON.stringify(found)); } catch (e) { console.error('login persist error', e); }
    return found;
  };

  const register = (name, email) => {
    // Create new user and persist in users list
    const u = { id: Date.now(), name, email };
    const next = [...users, u];
    persistUsers(next);
    setUser(u);
    try { localStorage.setItem('current_user', JSON.stringify(u)); } catch (e) { console.error('register persist error', e); }
    return u;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('current_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
