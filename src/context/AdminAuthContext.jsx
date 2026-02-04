import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

const AdminAuthContext = createContext(null);
const ADMIN_EMAIL = 'admin@scobe.local';

export function AdminAuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function checkSession() {
      try {
        const { data } = await supabase.auth.getSession();
          const session = data?.session || null;
          if (mounted && session && session.user?.email === ADMIN_EMAIL) {
            setIsAdminAuthenticated(true);
            setAdminUser(session.user || null);
          } else if (mounted) {
            setIsAdminAuthenticated(false);
            setAdminUser(null);
          }
      } catch (err) {
        if (mounted) {
          setIsAdminAuthenticated(false);
          setAdminUser(null);
        }
      }
    }

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user?.email === ADMIN_EMAIL) {
        setIsAdminAuthenticated(true);
        setAdminUser(session.user || null);
      } else {
        setIsAdminAuthenticated(false);
        setAdminUser(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const user = data?.user || data?.session?.user || null;
      if (!user) return { ok: false, error: 'No user' };
      if (user.email !== ADMIN_EMAIL) {
        // Sign out any non-admin user immediately
        try {
          await supabase.auth.signOut();
        } catch {}
        return { ok: false, error: 'Accès réservé à l\'administrateur' };
      }
      // success for admin
      setIsAdminAuthenticated(true);
      setAdminUser(user);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || err };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setIsAdminAuthenticated(false);
      setAdminUser(null);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, adminUser, login, logout }}>
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

