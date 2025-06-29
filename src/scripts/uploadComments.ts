import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "./serviceAccountKey.json";
import comments from "./comments_seed.json";

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

const db = getFirestore();

type Comment = {
  pollId: string;
  userId: string;
  username?: string;
  text: string;
  createdAt: string;
};

async function uploadComments() {
  const batch = db.batch();
  const commentsCollection = db.collection("comments");

  (comments as Comment[]).forEach((comment) => {
    const docRef = commentsCollection.doc(); // Auto-ID
    batch.set(docRef, {
      ...comment,
      createdAt: new Date(comment.createdAt),
    });
  });

  await batch.commit();
  console.log(`✅ Uploaded ${(comments as Comment[]).length} comments`);
}

uploadComments().catch(console.error);
