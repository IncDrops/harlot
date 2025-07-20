
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
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
  updateUserProfileData
} from '@/lib/firebase';
import { doc, setDoc } from "firebase/firestore";
import type { User as AppUser } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


// --- Auth Context Types ---
interface AuthContextType {
  user: FirebaseUser | null;
  profile: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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
  reloadProfile: async () => { throw new Error("Firebase not initialized"); },
});

// --- Provider Component ---
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const reloadProfile = useCallback(async () => {
    if (user) {
      try {
        const userProfile = await getUserById(user.uid);
        setProfile(userProfile);
      } catch (error) {
        console.error("Error reloading profile:", error);
        setProfile(null);
      }
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      try {
        if (user) {
          setUser(user);
          let userProfile = await getUserById(user.uid);
          
          if (!userProfile) {
            console.log("No profile found, creating one for new user:", user.uid);
            let username = (user.email || `user${user.uid.slice(0, 6)}`).split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
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
            toast({
              title: "Welcome to Pollitago!",
              description: "Your new strategic advisor account has been created."
            })
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
  }, [toast]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };
  
  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn: firebaseSignIn,
    signUp: firebaseSignUp,
    signOut: firebaseSignOut,
    signInWithGoogle,
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

