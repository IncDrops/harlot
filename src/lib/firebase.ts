
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
import type { User, Analysis, Notification, Feedback, Todo, DataIntegration } from "./types";
import { generateInitialAnalysis } from "@/ai/flows/generate-initial-analysis";
import type { GenerateInitialAnalysisInput } from "@/lib/ai-schemas";


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
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

type AnalysisCreationData = Pick<Analysis, 'decisionQuestion' | 'decisionType' > & { context?: string, dataSources?: string[] };

export const createAnalysis = async (userId: string, data: AnalysisCreationData): Promise<string> => {
    const analysesRef = collection(db, 'analyses');
    
    const aiInput: GenerateInitialAnalysisInput = {
      decisionQuestion: data.decisionQuestion,
      context: data.context || `Decision Type: ${data.decisionType}`
    }
    
    // Create an "in_progress" version first so it shows up in the UI immediately.
     const tempAnalysisData: Omit<Analysis, 'id'> = {
        userId,
        status: 'in_progress',
        decisionQuestion: data.decisionQuestion,
        decisionType: data.decisionType,
        dataSources: data.dataSources || [],
        createdAt: new Date().toISOString(),
        completedAt: '',
        primaryRecommendation: 'Analysis is being generated...',
        executiveSummary: '',
        keyFactors: [],
        risks: [],
        confidenceScore: 0,
    };
    
    const docRef = await addDoc(analysesRef, {
        ...tempAnalysisData,
        createdAt: serverTimestamp(),
    });

    // Then, run the actual AI generation in the background and update the doc.
    try {
      const aiResponse = await generateInitialAnalysis(aiInput);
      const finalAnalysisData: Partial<Analysis> = {
          status: 'completed',
          completedAt: new Date().toISOString(),
          ...aiResponse,
      };
      await updateDoc(docRef, {
          ...finalAnalysisData,
          completedAt: serverTimestamp(), // Use server timestamp for completion
      });
    } catch (error) {
       console.error("Error during AI generation, updating doc to 'archived'", error);
       await updateDoc(docRef, {
            status: 'archived', // Archive on failure
            primaryRecommendation: 'AI analysis failed to generate. This may be due to a network error or content safety violation. Please try again with a different query.',
            executiveSummary: 'The analysis could not be completed.'
        });
    }
    
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

export const getRecentAnalysesForUser = async (userId: string, count: number = 5, status?: Analysis['status']): Promise<Analysis[]> => {
    const analysesRef = collection(db, 'analyses');
    const constraints: QueryConstraint[] = [
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(count)
    ];

    if (status) {
        constraints.push(where('status', '==', status));
    } else {
        // Exclude archived analyses by default from general "recent" queries
        constraints.push(where('status', '!=', 'archived'));
    }

    const q = query(analysesRef, ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => fromFirestore<Analysis>(doc));
};

export const searchAnalyses = async (
    userId: string,
    searchTerm: string,
    pageSize: number = 10,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ analyses: Analysis[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> => {
    // Note: Firestore doesn't support native text search.
    // This implementation performs a basic "startsWith" query on the decision question,
    // which is limited. A real production app should use a dedicated search service
    // like Algolia or Elasticsearch for robust search.

    if (!userId || searchTerm.trim().length < 3) {
        return { analyses: [], lastVisible: null };
    }

    const analysesRef = collection(db, 'analyses');
    const lowercasedTerm = searchTerm.toLowerCase();

    const queryConstraints: QueryConstraint[] = [
        where('userId', '==', userId),
        // This query finds questions that start with the search term.
        where('decisionQuestion', '>=', searchTerm),
        where('decisionQuestion', '<=', searchTerm + '\uf8ff'),
        orderBy('decisionQuestion', 'asc'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
    ];

    if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
    }

    const q = query(analysesRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    const analyses = querySnapshot.docs
        // Secondary filtering for more flexible matching (case-insensitive contains)
        // This part runs client-side on the documents returned by Firestore.
        .map(doc => fromFirestore<Analysis>(doc))
        .filter(analysis =>
            analysis.decisionQuestion.toLowerCase().includes(lowercasedTerm) ||
            analysis.decisionType.toLowerCase().includes(lowercasedTerm)
        );
        
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { analyses, lastVisible };
};

export const updateAnalysisStatus = async (analysisId: string, status: Analysis['status']): Promise<void> => {
    const analysisRef = doc(db, 'analyses', analysisId);
    await updateDoc(analysisRef, { status });
};

// This is a new function to create a placeholder for a scheduled analysis
export const createScheduledAnalysis = async (
    { query, tone, variants, scheduledAt, userId }: 
    { query: string, tone: string, variants: number, scheduledAt: string, userId?: string | null }
): Promise<string> => {
    const analysesRef = collection(db, 'analyses');
    
    // We don't have a real user ID for anonymous purchases, so we'll use a placeholder
    const docOwnerId = userId || 'anonymous_user';

    const scheduledData: Partial<Analysis> = {
        userId: docOwnerId,
        status: 'scheduled',
        decisionQuestion: query,
        decisionType: `Scheduled - ${tone} - ${variants} variants`,
        createdAt: new Date().toISOString(),
        completedAt: scheduledAt, // We can reuse this field for the scheduled time
        primaryRecommendation: `This analysis is scheduled to run at ${new Date(scheduledAt).toLocaleString()}.`,
        executiveSummary: '',
        keyFactors: [],
        risks: [],
        confidenceScore: 0,
    };

    const docRef = await addDoc(analysesRef, {
        ...scheduledData,
        createdAt: serverTimestamp(),
        completedAt: Timestamp.fromDate(new Date(scheduledAt)),
    });

    return docRef.id;
};


// ──────────── FEEDBACK ────────────

export const addFeedbackToAnalysis = async (analysisId: string, feedbackData: Omit<Feedback, 'id' | 'createdAt'>): Promise<void> => {
    if (!analysisId) throw new Error("Analysis ID is required to add feedback.");
    const feedbackRef = collection(db, 'analyses', analysisId, 'feedback');
    await addDoc(feedbackRef, {
        ...feedbackData,
        createdAt: serverTimestamp(),
    });
};


// ──────────── TODOS ────────────

export const getUserTodos = async (userId: string): Promise<Todo[]> => {
    const todosRef = collection(db, `users/${userId}/todos`);
    const q = query(todosRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => fromFirestore<Todo>(doc));
};

export const addTodo = async (userId: string, text: string): Promise<string> => {
    const todosRef = collection(db, `users/${userId}/todos`);
    const newTodoRef = await addDoc(todosRef, {
        text,
        completed: false,
        createdAt: serverTimestamp(),
    });
    return newTodoRef.id;
};

export const updateTodoStatus = async (userId: string, todoId: string, completed: boolean): Promise<void> => {
    const todoRef = doc(db, `users/${userId}/todos`, todoId);
    await updateDoc(todoRef, { completed });
};

export const deleteTodo = async (userId: string, todoId: string): Promise<void> => {
    const todoRef = doc(db, `users/${userId}/todos`, todoId);
    await deleteDoc(todoRef);
};

// ──────────── INTEGRATIONS ────────────
export const getUserIntegrations = async (userId: string): Promise<DataIntegration[]> => {
    if (!userId) return [];
    try {
        const integrationsRef = collection(db, 'users', userId, 'integrations');
        const querySnapshot = await getDocs(integrationsRef);
        if (querySnapshot.empty) {
            return [];
        }
        return querySnapshot.docs.map(doc => fromFirestore<DataIntegration>(doc));
    } catch (error) {
        console.error("Error fetching user integrations:", error);
        return [];
    }
};


// Export instances
export { auth, storage, db, functions };
export default app;
