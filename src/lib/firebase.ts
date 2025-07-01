
// Firebase Config
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  onAuthStateChanged,
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
  documentId,
} from "firebase/firestore";
import { getFunctions } from 'firebase/functions';
import type { Functions } from 'firebase/functions';
import type { Comment, Notification, Poll, User } from "./types";

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
  auth = getAuth(app);
  storage = getStorage(app);
  db = getFirestore(app);
  functions = getFunctions(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  storage = getStorage(app);
  db = getFirestore(app);
  functions = getFunctions(app);
}

// Helper to convert Firestore doc to a serializable object
const fromFirestore = <T>(doc: QueryDocumentSnapshot<DocumentData>): T => {
    const data = doc.data();
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
  // You might want to create a user document in Firestore here as well
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

// ──────────── COMMENTS ────────────

export const getCommentsForPoll = async (pollId: string): Promise<Comment[]> => {
  const commentsCol = collection(db, `polls/${pollId}/comments`);
  const q = query(commentsCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromFirestore<Comment>(doc));
};

export const addCommentToPoll = async (pollId: string, commentData: Omit<Comment, "id" | "createdAt">): Promise<void> => {
  const pollRef = doc(db, "polls", pollId);
  const commentCol = collection(pollRef, "comments");

  await runTransaction(db, async (transaction) => {
    // We get the poll doc to ensure it exists, but we don't need to read it.
    await transaction.get(pollRef); 
    
    // Add the new comment
    const newCommentRef = doc(commentCol);
    transaction.set(newCommentRef, {
      ...commentData,
      createdAt: serverTimestamp(),
    });

    // Increment the comment count on the poll
    transaction.update(pollRef, { comments: increment(1) });
  });
};


// ──────────── LIKES ────────────

export const toggleLikeOnPoll = async (pollId: string, userId: string): Promise<void> => {
  const pollRef = doc(db, "polls", pollId);
  const likeRef = doc(pollRef, "likes", userId);

  await runTransaction(db, async (transaction) => {
    const likeDoc = await transaction.get(likeRef);
    if (likeDoc.exists()) {
      transaction.delete(likeRef);
      transaction.update(pollRef, { likes: increment(-1) });
    } else {
      transaction.set(likeRef, { userId, createdAt: serverTimestamp() });
      transaction.update(pollRef, { likes: increment(1) });
    }
  });
};

// ──────────── USERS ────────────
export const getUserById = async (userId: string): Promise<User | null> => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return fromFirestore<User>(userSnap as QueryDocumentSnapshot<DocumentData>);
    }
    return null;
}

export const getUserByNumericId = async (numericId: string): Promise<User | null> => {
    const usersRef = collection(db, 'users');
    // Note: This requires a Firestore index on 'numericId'
    const q = query(usersRef, where('numericId', '==', parseInt(numericId, 10)), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    return fromFirestore<User>(querySnapshot.docs[0]);
}

export const getUserByUsername = async (username: string): Promise<User | null> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    return fromFirestore<User>(querySnapshot.docs[0]);
};

// ──────────── POLLS ────────────
export const createPoll = async (pollData: Omit<Poll, 'id'>): Promise<string> => {
  const pollRef = await addDoc(collection(db, 'polls'), pollData);
  return pollRef.id;
}

export const getPolls = async (lastVisible: QueryDocumentSnapshot | null = null) => {
    const pollsRef = collection(db, 'polls');
    const constraints: QueryConstraint[] = [orderBy(documentId(), 'desc'), limit(25)];
    if(lastVisible) {
        constraints.push(startAfter(lastVisible));
    }
    const q = query(pollsRef, ...constraints);
    const documentSnapshots = await getDocs(q);
    
    const polls = documentSnapshots.docs.map(doc => fromFirestore<Poll>(doc)).filter(p => p.options && p.options.length > 0);
    const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];

    return { polls, lastVisible: newLastVisible || null };
};


export const getPollsByUser = async (userId: string): Promise<Poll[]> => {
    const pollsRef = collection(db, 'polls');
    const q = query(pollsRef, where('creatorId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => fromFirestore<Poll>(doc));
};

// ──────────── SEARCH ────────────

export const searchPolls = async (searchTerm: string): Promise<Poll[]> => {
  if (searchTerm.trim() === '') return [];
  // Note: This is a client-side search for simplicity with a small dataset.
  // For production with a large number of polls, a dedicated search service
  // like Algolia or Typesense integrated with Firebase is recommended.
  const pollsRef = collection(db, 'polls');
  const q = query(pollsRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  const allPolls = querySnapshot.docs.map(doc => fromFirestore<Poll>(doc));
  
  const lowercasedTerm = searchTerm.toLowerCase();
  return allPolls.filter(poll => 
    poll.question.toLowerCase().includes(lowercasedTerm) ||
    (poll.category && poll.category.toLowerCase().includes(lowercasedTerm))
  );
};


// ──────────── NOTIFICATIONS ────────────

export const getNotificationsForUser = async (userId: string): Promise<Notification[]> => {
    const notificationsRef = collection(db, `users/${userId}/notifications`);
    const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(20));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => fromFirestore<Notification>(doc));
};

export { auth, storage, db, functions };
export default app;
