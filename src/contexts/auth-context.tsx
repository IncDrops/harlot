"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, signIn as firebaseSignIn, signUp as firebaseSignUp, signOut as firebaseSignOut } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: typeof firebaseSignIn;
  signUp: typeof firebaseSignUp;
  signOut: typeof firebaseSignOut;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => { throw new Error("Firebase not initialized") },
  signUp: async () => { throw new Error("Firebase not initialized") },
  signOut: async () => { throw new Error("Firebase not initialized") },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If firebase auth is not initialized, we can't subscribe to auth state changes.
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signIn: firebaseSignIn,
    signUp: firebaseSignUp,
    signOut: firebaseSignOut,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
