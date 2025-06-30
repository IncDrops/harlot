import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import serviceAccount from "./serviceAccountKey.json";
import users from "./users_seed.json";

// Define the User type structure
type User = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  pronouns: string;
  gender: string;
  birthday: string;
  pollItPoints: number;
  tipsReceived: number;
  createdAt: string;
};

initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

const db = getFirestore();

async function uploadUsers() {
  const batch = db.batch();
  const usersCollection = db.collection("users");

  (users as User[]).forEach((user, index) => {
    const numericId = (index + 1).toString(); // "1", "2", ..., "22"
    const docRef = usersCollection.doc(numericId);

    batch.set(docRef, {
      uid: user.id, // keep original UUID in case it's needed later
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      pronouns: user.pronouns,
      gender: user.gender,
      birthday: user.birthday,
      pollItPoints: user.pollItPoints,
      tipsReceived: user.tipsReceived,
      createdAt: new Date(user.createdAt),
      numericId: Number(numericId),
      avatar: `https://i.pravatar.cc/150?u=${user.username}`,
      role: "user",
    });
  });

  await batch.commit();
  console.log(`✅ Uploaded ${(users as User[]).length} users`);
}

uploadUsers().catch(console.error);
