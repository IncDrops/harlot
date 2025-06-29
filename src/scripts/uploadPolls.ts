import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Import the JSON files
import serviceAccount from "./serviceAccountKey.json";
import polls from "./polls_master.json";

// Define PollOption and Poll types
type PollOption = {
  id: number;
  text: string;
  votes: number;
  imageUrl: string;
  affiliateLink: string;
};

type Poll = {
  id: string;
  creatorId: string;
  question: string;
  options: PollOption[];
  description: string;
  videoUrl?: string | null;
  type: string;
  createdAt?: Date;
};

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

const db = getFirestore();

async function uploadPolls() {
  const batch = db.batch();
  const pollsCollection = db.collection("polls");

  (polls as any[]).forEach((poll) => {
    const docRef = pollsCollection.doc(); // auto-generated ID
    batch.set(docRef, {
      ...poll,
      id: String(poll.id),
      creatorId: String(poll.creatorId),
      createdAt: new Date(),
    });
  });

  await batch.commit();
  console.log(`✅ Uploaded ${(polls as any[]).length} polls`);
}

uploadPolls().catch(console.error);
