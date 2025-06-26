// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, Auth, UserCredential } from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, Storage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let storage: Storage | null = null;

// Initialize Firebase only if the API key is provided
if (firebaseConfig.apiKey) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
} else {
    console.warn("Firebase API key is missing. Auth features will be disabled. Please create and configure your .env.local file.");
}


// Sign Up
export const signUp = (email: string, password: string): Promise<UserCredential> => {
  if (!auth) {
    return Promise.reject(new Error("Firebase is not configured. Please provide API keys in your .env.local file."));
  }
  return createUserWithEmailAndPassword(auth, email, password);
};

// Sign In
export const signIn = (email: string, password: string): Promise<UserCredential> => {
  if (!auth) {
    return Promise.reject(new Error("Firebase is not configured. Please provide API keys in your .env.local file."));
  }
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign Out
export const signOut = (): Promise<void> => {
  if (!auth) {
    return Promise.reject(new Error("Firebase is not configured. Please provide API keys in your .env.local file."));
  }
  return firebaseSignOut(auth);
};

export const uploadFile = async (file: File, path: string): Promise<string> => {
    if (!storage) {
        throw new Error("Firebase Storage is not configured.");
    }
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
};

export { auth, storage };

export default app;
