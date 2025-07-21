
// Firebase Config
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  Auth,
  UserCredential,
} from "firebase/auth";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import type { FirebaseStorage as IFirebaseStorage } from "firebase/storage";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  getDoc,
  doc,
  runTransaction,
  increment,
  Timestamp,
  Firestore,
  setDoc,
  deleteDoc,
  where,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  QueryConstraint,
  updateDoc,
  DocumentSnapshot,
} from "firebase/firestore";
import { getFunctions } from 'firebase/functions';
import type { Functions } from 'firebase/functions';
import type { User, Analysis, Notification } from "./types";
import { generateInitialAnalysis, type GenerateInitialAnalysisInput } from "@/ai/flows/generate-initial-analysis";


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

let app: FirebaseApp;
let auth: Auth;
let storage: IFirebaseStorage;
let db: Firestore;
let functions: Functions;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
storage = getStorage(app);
db = getFirestore(app);
functions = getFunctions(app);


// Helper to convert Firestore doc to a serializable object
const fromFirestore = <T>(doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): T => {
    const data = doc.data();
    if (!data) {
        throw new Error("Document data is empty!");
    }
    const processedData: { [key: string]: any } = { ...data };

    for (const key in processedData) {
        const value = processedData[key];
        if (value instanceof Timestamp) {
            processedData[key] = value.toDate().toISOString();
        }
    }
    
    return {
        id: doc.id,
        ...processedData,
    } as T;
};


// ──────────── AUTH FUNCTIONS ────────────

export const signUp = async (email: string, password: string): Promise<UserCredential> => {
  if (!auth) throw new Error("Auth is not initialized.");
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  // NOTE: User profile document is now created by the onAuthStateChanged listener in AuthProvider
  // to handle all sign-up methods consistently (email, Google, etc.).
  await sendEmailVerification(userCred.user);
  return userCred;
};

export const signIn = (email: string, password: string): Promise<UserCredential> => {
  if (!auth) throw new Error("Auth is not initialized.");
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOut = (): Promise<void> => {
  if (!auth) throw new Error("Auth is not initialized.");
  return firebaseSignOut(auth);
};

// ──────────── STORAGE ────────────

export const uploadFile = async (file: File, path: string): Promise<string> => {
  if (!storage) throw new Error("Firebase Storage is not configured.");
  const fileRef = storageRef(storage, path);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};


// ──────────── USERS ────────────
export const getUserById = async (userId: string): Promise<User | null> => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return fromFirestore<User>(userSnap);
    }
    return null;
}

export const updateUserProfileData = async (userId: string, data: Partial<Omit<User, 'id'>>): Promise<void> => {
    if (!userId) throw new Error("User ID is required to update profile.");
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    return fromFirestore<User>(querySnapshot.docs[0]);
};


// ──────────── ANALYSES ────────────

type AnalysisCreationData = Pick<Analysis, 'decisionQuestion' | 'decisionType' | 'dataSources'> & { context?: string };

export const createAnalysis = async (userId: string, data: AnalysisCreationData): Promise<string> => {
    const analysesRef = collection(db, 'analyses');
    
    const aiInput: GenerateInitialAnalysisInput = {
      decisionQuestion: data.decisionQuestion,
      context: data.context || `Decision Type: ${data.decisionType}, Data Sources: ${data.dataSources.join(', ')}`
    }
    const aiResponse = await generateInitialAnalysis(aiInput);

    const newAnalysisData: Omit<Analysis, 'id' | 'createdAt'> = {
        userId,
        decisionQuestion: data.decisionQuestion,
        decisionType: data.decisionType,
        dataSources: data.dataSources,
        status: 'completed',
        completedAt: new Date().toISOString(),
        ...aiResponse,
    };
    
    const docRef = await addDoc(analysesRef, {
        ...newAnalysisData,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};


export const getAnalysisById = async (analysisId: string): Promise<Analysis | null> => {
    const analysisRef = doc(db, 'analyses', analysisId);
    const analysisSnap = await getDoc(analysisRef);
    if (analysisSnap.exists()) {
        return fromFirestore<Analysis>(analysisSnap);
    }
    return null;
};

export const getRecentAnalysesForUser = async (userId: string, count: number = 5): Promise<Analysis[]> => {
    const analysesRef = collection(db, 'analyses');
    const q = query(analysesRef, where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => fromFirestore<Analysis>(doc));
};

export const searchAnalyses = async (searchTerm: string): Promise<Analysis[]> => {
  if (searchTerm.trim().length < 3) return [];
  // This is a mock search function. In a real app, this would query Firestore
  // with a where clause, or ideally, a dedicated search service like Algolia.
  console.log("Searching for:", searchTerm);
  return [];
};


// Export instances
export { auth, storage, db, functions };
export default app;
