// /src/lib/firebase.ts

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  onAuthStateChanged,
  Auth,
  User,
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
  doc,
  runTransaction,
  increment,
  Timestamp,
  Firestore,
  setDoc,
} from "firebase/firestore";
import type { Comment } from "./types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!, // use pollitago.com
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

let app: FirebaseApp;
let auth: Auth;
let storage: IFirebaseStorage;
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  storage = getStorage(app);
  db = getFirestore(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  storage = getStorage(app);
  db = getFirestore(app);
}

// ──────────── AUTH FUNCTIONS ────────────

export const signUp = async (email: string, password: string): Promise<UserCredential> => {
  if (!auth) throw new Error("Auth is not initialized.");
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(userCred.user); // optional: require verification
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

export const watchUser = (callback: (user: User | null) => void) => {
  if (!auth) throw new Error("Auth is not initialized.");
  return onAuthStateChanged(auth, callback);
};

// ──────────── STORAGE ────────────

export const uploadFile = async (file: File, path: string): Promise<string> => {
  if (!storage) throw new Error("Firebase Storage is not configured.");
  const fileRef = storageRef(storage, path);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};

// ──────────── COMMENTS (1 per user per poll) ────────────

export const getCommentsForPoll = async (pollId: string): Promise<Comment[]> => {
  if (!db) throw new Error("Firestore is not configured.");
  const commentsCol = collection(db, `polls/${pollId}/comments`);
  const q = query(commentsCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    } as Comment;
  });
};

// 🧠 Use UID as comment ID to enforce 1-comment-per-user rule
export const addCommentToPoll = async (
  pollId: string,
  userId: string,
  commentData: Omit<Comment, "id" | "createdAt">
): Promise<void> => {
  if (!db) throw new Error("Firestore is not configured.");
  const pollRef = doc(db, "polls", pollId);
  const userCommentRef = doc(pollRef, "comments", userId);

  try {
    await runTransaction(db, async (transaction) => {
      transaction.set(userCommentRef, {
        ...commentData,
        createdAt: serverTimestamp(),
      });
      transaction.update(pollRef, { comments: increment(1) });
    });
  } catch (e) {
    console.error("Transaction failed: ", e);
    throw e;
  }
};

// ──────────── EXPORTS ────────────

export { auth, storage, db };
export default app;
