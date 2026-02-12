/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier la session au montage
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session || null;
        
        if (mounted) {
          if (session && session.user) {
            setIsAuthenticated(true);
            setUser(session.user);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch {
        if (mounted) {
          setIsAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkSession();

    // Écouter les changements d'authentification
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        if (session && session.user) {
          setIsAuthenticated(true);
          setUser(session.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  // S'inscrire
  const signup = async (email, password, fullName = '') => {
    try {
      setError(null);
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signupError) throw signupError;
      if (!data.user) throw new Error('Inscription échouée');

      return { ok: true, user: data.user };
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      return { ok: false, error: errorMessage };
    }
  };

  // Se connecter
  const login = async (email, password) => {
    try {
      setError(null);
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;
      if (!data.user) throw new Error('Connexion échouée');

      setIsAuthenticated(true);
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la connexion';
      setError(errorMessage);
      return { ok: false, error: errorMessage };
    }
  };

  // Se déconnecter
  const logout = async () => {
    try {
      setError(null);
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUser(null);
      return { ok: true };
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la déconnexion';
      setError(errorMessage);
      return { ok: false, error: errorMessage };
    }
  };

  // changePassword removed
  const changePassword = async (_newPassword) => {
    return { ok: false, error: 'Feature removed' };
  };

  // Password reset functionality removed.
  // These stubs remain to avoid breaking callers; they return a consistent error.
  const requestPasswordReset = async (_email) => {
    return { ok: false, error: 'Feature removed' };
  };

  const verifyResetCode = async (_email, _code) => {
    return { ok: false, error: 'Feature removed' };
  };

  const resetPasswordWithCode = async (_email, _code, _newPassword) => {
    return { ok: false, error: 'Feature removed' };
  };

  const resetPassword = async (_email) => {
    return { ok: false, error: 'Feature removed' };
  };

  // Récupérer le profil utilisateur
  const getUserProfile = async () => {
    try {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erreur récupération profil:', err);
      return null;
    }
  };

  return (
    <UserAuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        signup,
        login,
        logout,
        // changePassword intentionally removed from public API
        getUserProfile,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) {
    throw new Error('useUserAuth must be used within UserAuthProvider');
  }
  return ctx;
}
