import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { 
  auth, 
  signInWithGoogle, 
  signOutUser, 
  onAuthChange 
} from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: () => Promise<User | null>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (): Promise<User | null> => {
    setError(null);
    try {
      setLoading(true);
      const signedInUser = await signInWithGoogle();
      setUser(signedInUser);
      return signedInUser;
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      // If user closed popup, don't show annoying error, otherwise show friendly message
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError(err.message || 'Google authorization failed.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    setError(null);
    try {
      setLoading(true);
      await signOutUser();
      setUser(null);
    } catch (err: any) {
      console.error('Sign-out failed:', err);
      setError(err.message || 'Sign out failed.');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated: !!user,
        signIn: handleSignIn,
        signOut: handleSignOut,
        clearError,
      }}
    >
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
