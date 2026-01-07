import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut, resetPassword, getProfile, Profile, onAuthStateChange } from '../supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await getProfile(user.id);
      setProfile(profileData);
    }
  }, [user]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const profileData = await getProfile(initialSession.user.id);
          setProfile(profileData);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        getProfile(session.user.id).then(profileData => {
          setProfile(profileData);
        });
      } else {
        setProfile(null);
      }
      
      if (event === 'SIGNED_OUT') {
        setError(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    setError(null);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
    }
    return { error };
  };

  const handleSignUp = async (email: string, password: string, displayName?: string) => {
    setError(null);
    const { error } = await signUp(email, password, displayName);
    if (error) {
      setError(error.message);
    }
    return { error };
  };

  const handleSignOut = async () => {
    setError(null);
    await signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const handleResetPassword = async (email: string) => {
    setError(null);
    const { error } = await resetPassword(email);
    if (error) {
      setError(error.message);
    }
    return { error };
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    refreshProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
