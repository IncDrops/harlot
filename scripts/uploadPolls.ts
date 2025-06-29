import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "./serviceAccountKey.json";
import polls from "./polls_master.json";

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

const db = getFirestore();

async function uploadPolls() {
  const batch = db.batch();
  const pollsCollection = db.collection("polls");

  polls.forEach((poll, index) => {
    const docRef = pollsCollection.doc(); // auto-ID
    batch.set(docRef, {
      ...poll,
      createdAt: new Date()
    });
  });

  await batch.commit();
  console.log(`✅ Uploaded ${polls.length} polls`);
}

uploadPolls().catch(console.error);
