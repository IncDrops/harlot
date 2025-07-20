"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously as firebaseSignInAnonymously,
  updateProfile,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import {
  auth,
  db,
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  signOut as firebaseSignOut,
  getUserById,
} from '@/lib/firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { User as AppUser } from '@/lib/types';

// --- Auth Context Types ---
interface AuthContextType {
  user: FirebaseUser | null;
  profile: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  reloadProfile: () => Promise<void>;
}

// --- Default Context ---
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => { throw new Error("Firebase not initialized"); },
  signUp: async () => { throw new Error("Firebase not initialized"); },
  signOut: async () => { throw new Error("Firebase not initialized"); },
  signInWithGoogle: async () => { throw new Error("Firebase not initialized"); },
  signInAnonymously: async () => { throw new Error("Not implemented"); },
  updateUserProfile: async () => { throw new Error("Firebase not initialized"); },
  reloadProfile: async () => { throw new Error("Firebase not initialized"); },
});

// --- Provider Component ---
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadProfile = async () => {
    if (user) {
      try {
        const userProfile = await getUserById(user.uid);
        setProfile(userProfile);
      } catch (error) {
        console.error("Error reloading profile:", error);
        setProfile(null);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      try {
        if (user) {
          setUser(user);
          let userProfile = await getUserById(user.uid);
          if (!userProfile) {
            let username = (user.email || `user${user.uid.slice(0, 6)}`).split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 15);
            if (username.length < 3) {
                username = `${username}${user.uid.slice(0, 4)}`;
            }
            username = username.slice(0, 20);

            const newUserProfileData: Omit<AppUser, 'id'> = {
              displayName: user.displayName || username,
              username: username,
              avatar: user.photoURL || `https://avatar.iran.liara.run/public/?username=${username}`,
              role: 'user', // Default role for new sign-ups
            };
            
            await setDoc(doc(db, "users", user.uid), newUserProfileData);
            userProfile = { id: user.uid, ...newUserProfileData };
          }
          setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Error during authentication state change:", error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInAnonymously = async () => {
    // This functionality is removed for the enterprise version
    throw new Error("Anonymous sign-in is not supported for this application.");
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, { displayName, photoURL });
    setUser({ ...auth.currentUser });
     if (profile) {
        setProfile({ ...profile, displayName: displayName, avatar: photoURL || profile.avatar });
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn: firebaseSignIn,
    signUp: firebaseSignUp,
    signOut: firebaseSignOut,
    signInWithGoogle,
    signInAnonymously,
    updateUserProfile,
    reloadProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Hook to use Auth ---
export const useAuth = () => useContext(AuthContext);
