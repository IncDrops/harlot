// src/scripts/uploadSecondOpinion.ts

import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";
import serviceAccount from "../serviceAccountKey.json";

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

const db = getFirestore();

// Read the seed file
const filePath = "src/seed/second_opinion_seed.json";
const rawData = fs.readFileSync(filePath, "utf-8");
const polls = JSON.parse(rawData);

// Upload each poll
async function uploadPolls() {
  const batch = db.batch();

  polls.forEach((poll: any) => {
    const pollRef = db.collection("polls").doc(poll.id);
    batch.set(pollRef, poll);
  });

  try {
    await batch.commit();
    console.log(`✅ Uploaded ${polls.length} second-opinion polls to Firestore`);
  } catch (error) {
    console.error("❌ Error uploading polls:", error);
  }
}

uploadPolls();
