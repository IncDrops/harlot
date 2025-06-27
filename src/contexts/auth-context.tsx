"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  updateProfile,
  User,
  UserCredential
} from 'firebase/auth';
import {
  auth,
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  signOut as firebaseSignOut,
} from '@/lib/firebase';

// --- Auth Context Types ---
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
}

// --- Default Context ---
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => { throw new Error("Firebase not initialized"); },
  signUp: async () => { throw new Error("Firebase not initialized"); },
  signOut: async () => { throw new Error("Firebase not initialized"); },
  signInWithGoogle: async () => { throw new Error("Firebase not initialized"); },
  signInAnonymously: async () => { throw new Error("Firebase not initialized"); },
  updateUserProfile: async () => { throw new Error("Firebase not initialized"); },
});

// --- Provider Component ---
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
  };

  const signInAnonymouslyHandler = async () => {
    const result = await signInAnonymously(auth);
    setUser(result.user);
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, { displayName, photoURL });
    setUser(auth.currentUser); // Refresh user state
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn: firebaseSignIn,
    signUp: firebaseSignUp,
    signOut: firebaseSignOut,
    signInWithGoogle,
    signInAnonymously: signInAnonymouslyHandler,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// --- Hook to use Auth ---
export const useAuth = () => useContext(AuthContext);
