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

  // Changer le mot de passe
  const changePassword = async (newPassword) => {
    try {
      setError(null);
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;
      return { ok: true };
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors du changement de mot de passe';
      setError(errorMessage);
      return { ok: false, error: errorMessage };
    }
  };

  // Demander réinitialisation du mot de passe avec code
  const requestPasswordReset = async (email) => {
    try {
      setError(null);

      // Validation de l'email
      if (!email || !email.includes('@')) {
        return { ok: false, error: 'Email invalide' };
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Rate limiting: vérifier les tentatives précédentes (dernière 15 min)
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60000).toISOString();
      const { data: recentAttempts, error: checkError } = await supabase
        .from('password_reset_codes')
        .select('id', { count: 'exact' })
        .eq('email', normalizedEmail)
        .gt('created_at', fifteenMinutesAgo)
        .is('used', false);

      if (checkError) throw checkError;

      // Limiter à 3 tentatives par 15 minutes
      if (recentAttempts && recentAttempts.length >= 3) {
        return { 
          ok: false, 
          error: 'Trop de tentatives. Veuillez réessayer dans 15 minutes.' 
        };
      }

      // Générer un code aléatoire de 6 chiffres
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60000); // Expire dans 15 minutes
      
      // Insérer le code dans la table
      const { error: insertError } = await supabase
        .from('password_reset_codes')
        .insert([
          {
            email: normalizedEmail,
            code,
            expires_at: expiresAt.toISOString(),
          },
        ]);

      if (insertError) throw insertError;

      // Envoyer l'email avec le code via Supabase Edge Function
      try {
        const { data: functionData, error: functionError } = await supabase.functions.invoke(
          'send-reset-code',
          {
            body: { email: normalizedEmail, code },
          }
        );

        if (functionError) {
          console.warn('Erreur lors de l\'envoi d\'email:', functionError);
          // Continuer même si l'email échoue (la base de données est à jour)
        } else {
          // email envoyé (info suppressed)
        }
      } catch (emailError) {
        console.warn('Erreur lors de l\'appel à la fonction Edge:', emailError);
        // Continuer même si l'email échoue
      }

      return { ok: true, message: 'Un code a été envoyé à votre email' };
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la demande de réinitialisation';
      setError(errorMessage);
      return { ok: false, error: errorMessage };
    }
  };

  // Vérifier le code de réinitialisation
  const verifyResetCode = async (email, code) => {
    try {
      setError(null);
      
      const { data, error: selectError } = await supabase
        .from('password_reset_codes')
        .select('id, expires_at, used')
        .eq('email', email.toLowerCase())
        .eq('code', code)
        .single();

      if (selectError) {
        if (selectError.code === 'PGRST116') {
          throw new Error('Code invalide');
        }
        throw selectError;
      }

      if (data.used) {
        throw new Error('Ce code a déjà été utilisé');
      }

      // Vérifier l'expiration en comparant les timestamps directement (ignorant timezone)
      const expiresAtMs = new Date(data.expires_at).getTime();
      const nowMs = Date.now();
      
      // debug info removed
      
      if (expiresAtMs < nowMs) {
        throw new Error(`Ce code a expiré (expire à ${new Date(expiresAtMs).toLocaleTimeString()})`);
      }

      return { ok: true };
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la vérification du code';
      setError(errorMessage);
      return { ok: false, error: errorMessage };
    }
  };

  // Réinitialiser le mot de passe avec le code
  const resetPasswordWithCode = async (email, code, newPassword) => {
    try {
      setError(null);

      // Appeler la Edge Function pour réinitialiser le mot de passe
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: {
          email: email.toLowerCase(),
          code,
          newPassword,
        },
      });

      if (error) {
        console.error('Edge Function Error:', error);
        throw new Error(error.message || 'Erreur lors de la réinitialisation du mot de passe');
      }

      if (!data?.ok) {
        throw new Error(data?.error || 'Erreur inconnue');
      }

      // password reset successful (info suppressed)

      return { 
        ok: true, 
        message: 'Mot de passe réinitialisé avec succès. Veuillez vous connecter.' 
      };
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la réinitialisation du mot de passe';
      setError(errorMessage);
      return { ok: false, error: errorMessage };
    }
  };

  // Ancienne fonction resetPassword (conservée pour compatibilité)
  const resetPassword = async (email) => {
    return requestPasswordReset(email);
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
        changePassword,
        resetPassword,
        requestPasswordReset,
        verifyResetCode,
        resetPasswordWithCode,
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
