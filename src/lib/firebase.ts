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
  deleteDoc,
  where,
  limit,
  collectionGroup,
} from "firebase/firestore";
import type { Comment, Notification, Poll } from "./types";
import { dummyPolls, dummyUsers } from './dummy-data';

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
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as Comment;
  });
};

export const addCommentToPoll = async (pollId: string, commentData: Omit<Comment, "id" | "createdAt">): Promise<void> => {
  const pollRef = doc(db, "polls", pollId);
  const commentRef = doc(collection(pollRef, "comments"));

  await runTransaction(db, async (transaction) => {
    transaction.set(commentRef, {
      ...commentData,
      createdAt: serverTimestamp(),
    });
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

export const getUserByUsername = async (username: string) => {
  const user = dummyUsers.find(u => u.username === username);
  return Promise.resolve(user || null);
};

// ──────────── POLLS ────────────

export const getPollsByUser = async (userId: number) => {
  const polls = dummyPolls.filter(p => p.creatorId === userId);
  return Promise.resolve(polls);
};

// ──────────── SEARCH ────────────

export const searchPolls = async (searchTerm: string): Promise<Poll[]> => {
  const lowercasedTerm = searchTerm.toLowerCase();
  const results = dummyPolls.filter(poll => 
    poll.question.toLowerCase().includes(lowercasedTerm)
  );
  return Promise.resolve(results);
};

// ──────────── NOTIFICATIONS ────────────

export const getNotificationsForUser = async (userId: string): Promise<Notification[]> => {
  const mockNotifications: Notification[] = [
    { id: '1', type: 'tip_received', fromUsername: 'akira_dev', fromId: '2', amount: 5, createdAt: new Date(Date.now() - 3600000).toISOString(), read: false },
    { id: '2', type: 'new_vote', fromUsername: 'yuki_motion', fromId: '1', pollId: '1', createdAt: new Date(Date.now() - 7200000).toISOString(), read: false },
    { id: '3', type: 'new_follower', fromUsername: 'sakura_blossom', fromId: '5', createdAt: new Date(Date.now() - 10800000).toISOString(), read: true },
    { id: '4', type: 'new_comment', fromUsername: 'hana_chan', fromId: '3', pollId: '2', createdAt: new Date(Date.now() - 86400000).toISOString(), read: true },
  ];
  return Promise.resolve(mockNotifications);
};

// ──────────── VOTE LOGIC ────────────

export const submitVote = async ({
  pollId,
  userId,
  optionId,
}: {
  pollId: string;
  userId: string;
  optionId: number;
}): Promise<void> => {
  if (!db) throw new Error("Firestore is not configured.");

  const pollRef = doc(db, "polls", pollId);
  const voteRef = doc(pollRef, "votes", userId); // ensures 1 vote per user per poll

  try {
    await runTransaction(db, async (transaction) => {
      const voteDoc = await transaction.get(voteRef);

      if (voteDoc.exists()) {
        console.warn("User already voted.");
        return;
      }

      const pollDoc = await transaction.get(pollRef);
      if (!pollDoc.exists()) throw new Error("Poll not found.");

      const pollData = pollDoc.data();
      const updatedOptions = pollData.options.map((opt: any) => {
        if (opt.id === optionId) {
          return { ...opt, votes: (opt.votes || 0) + 1 };
        }
        return opt;
      });

      transaction.set(voteRef, {
        userId,
        optionId,
        createdAt: serverTimestamp(),
      });

      transaction.update(pollRef, {
        options: updatedOptions,
      });
    });
  } catch (error) {
    console.error("Vote transaction failed:", error);
    throw error;
  }
};

export { auth, storage, db };
export default app;
