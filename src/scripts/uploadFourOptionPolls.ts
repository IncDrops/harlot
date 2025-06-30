import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "./serviceAccountKey.json";
import polls from "../seed/four_option_seed_fixed.json";

// Define the shape of a poll
type Option = {
  text: string;
  votes: number;
  affiliateLink?: string;
};

type FourOptionPoll = {
  id: string;
  type: "four-option";
  question: string;
  description: string;
  options: Option[];
  creatorId: string;
  createdAt: string;
  timer: number;
  pledge: number;
  tipCount: number;
  likes: number;
  comments: number;
  nsfw: boolean;
};

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

const db = getFirestore();

async function uploadFourOptionPolls() {
  const batch = db.batch();
  const pollsCollection = db.collection("polls");

  (polls as FourOptionPoll[]).forEach((poll) => {
    const docRef = pollsCollection.doc(poll.id);
    batch.set(docRef, {
      ...poll,
      createdAt: new Date(poll.createdAt),
    });
  });

  await batch.commit();
  console.log(`✅ Uploaded ${(polls as FourOptionPoll[]).length} four-option polls`);
}

uploadFourOptionPolls().catch(console.error);
