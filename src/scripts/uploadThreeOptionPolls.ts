import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import polls from "../seed/three_option_seed.json";
import serviceAccount from "../serviceAccountKey.json";

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

const db = getFirestore();

async function uploadThreeOptionPolls() {
  const batch = db.batch();
  const pollsCollection = db.collection("polls");

  (polls as any[]).forEach((poll) => {
    const docRef = pollsCollection.doc(poll.id);
    batch.set(docRef, {
      ...poll,
      createdAt: new Date(poll.createdAt),
    });
  });

  await batch.commit();
  console.log(`✅ Uploaded ${polls.length} three-option polls to Firestore`);
}

uploadThreeOptionPolls().catch(console.error);
