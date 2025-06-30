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
  getUserById,
} from '@/lib/firebase';
import type { User as AppUser } from '@/lib/types'; // Import custom user type

// --- Auth Context Types ---
interface AuthContextType {
  user: User | null;
  profile: AppUser | null; // Add profile to context
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
  profile: null, // Add profile to default
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
  const [profile, setProfile] = useState<AppUser | null>(null); // Add profile state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // User is signed in, fetch their Firestore profile
        const userProfile = await getUserById(user.uid);
        setProfile(userProfile);
      } else {
        // User is signed out
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
    // Profile will be fetched by onAuthStateChanged
  };

  const signInAnonymouslyHandler = async () => {
    const result = await signInAnonymously(auth);
    setUser(result.user);
     // Profile will be fetched by onAuthStateChanged
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, { displayName, photoURL });
    setUser({ ...auth.currentUser }); // Refresh user state
     if (profile) {
        setProfile({ ...profile, displayName: displayName, avatar: photoURL || profile.avatar });
    }
  };

  const value: AuthContextType = {
    user,
    profile, // Pass profile in value
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
