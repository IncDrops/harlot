import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ✅ Use imports for proper typings
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
    const docRef = usersCollection.doc(user.id); // use provided ID from seed
    batch.set(docRef, {
      ...user,
      numericId: index + 1, // Add numeric ID for linking polls
      avatar: `https://i.pravatar.cc/150?u=${user.username}`, // Add placeholder avatar
      createdAt: new Date(user.createdAt),
    });
  });

  await batch.commit();
  console.log(`✅ Uploaded ${(users as User[]).length} users`);
}

uploadUsers().catch(console.error);
