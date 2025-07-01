import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import serviceAccount from "./serviceAccountKey.json";
import users from "./users_seed_122.json";

// Define the User type structure from the JSON
type UserSeed = {
  id: string; // UUID
  username: string;
  displayName: string;
  bio: string;
  pronouns: string;
  gender: string;
  birthday: string;
  pollItPoints: number;
  tipsReceived: number;
  createdAt: string;
  numericId: number;
};

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

const db = getFirestore();

async function uploadUsers() {
  const batch = db.batch();
  const usersCollection = db.collection("users");

  (users as UserSeed[]).forEach((user) => {
    // The document ID will be the user's auth UID, but we don't have that here.
    // The main `seed.ts` script now handles creating auth users and Firestore docs together.
    // This script is now redundant but kept for reference. Let's adapt it to use the seeded ID.
    const docRef = usersCollection.doc(user.id); 

    batch.set(docRef, {
      id: user.id, // Keep original ID
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      pronouns: user.pronouns,
      gender: user.gender,
      birthDate: user.birthday,
      pollitPoints: user.pollItPoints,
      tipsReceived: user.tipsReceived,
      createdAt: new Date(user.createdAt),
      avatar: `https://i.pravatar.cc/150?u=${user.username}`,
      role: "user",
    });
  });

  await batch.commit();
  console.log(`✅ Uploaded ${(users as UserSeed[]).length} users`);
}

uploadUsers().catch(console.error);
