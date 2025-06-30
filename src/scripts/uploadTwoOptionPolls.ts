import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import serviceAccount from "../serviceAccountKey.json";

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

const db = getFirestore();
const filePath = path.join(__dirname, "../seed/two_option_seed.json");
const raw = fs.readFileSync(filePath, "utf-8");
const parsed = JSON.parse(raw);

async function uploadTwoOptionPolls() {
  const batch = db.batch();
  const pollsCollection = db.collection("polls");

  parsed.forEach((poll: any, index: number) => {
    const id = uuidv4();
    const docRef = pollsCollection.doc(id);

    const totalVotes = poll.options.reduce((acc: number, opt: any) => acc + (opt.votes || 0), 0);
    const payout = poll.pledge ? poll.pledge / (totalVotes || 1) : 0;

    batch.set(docRef, {
      ...poll,
      id,
      type: "two-option",
      createdAt: new Date(poll.createdAt || Date.now()),
      nsfw: !!poll.nsfw,
      pledge: poll.pledge || 0,
      tipCount: poll.tipCount || 0,
      likes: poll.likes || 0,
      comments: poll.comments || 0,
      payoutThresholdReached: payout < 0.1 && poll.pledge > 0,
    });
  });

  await batch.commit();
  console.log(`✅ Uploaded ${parsed.length} two-option polls`);
}

uploadTwoOptionPolls().catch(console.error);
