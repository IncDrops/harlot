import admin from "firebase-admin";
import { Firestore } from "firebase-admin/firestore";

// Initialize Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // 🔄 Change if using cert
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function syncUsersToFirestore(): Promise<void> {
  console.log("🚀 Starting sync of Auth users to Firestore...");
  let nextPageToken: string | undefined;

  try {
    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);

      for (const user of listUsersResult.users) {
        const { uid, email, displayName, photoURL, metadata } = user;

        const userRef = db.collection("users").doc(uid);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
          const newUserData = {
            uid,
            email: email || null,
            displayName: displayName || "",
            photoURL: photoURL || "",
            role: "user", // 🔧 you can customize roles or flags here
            provider: user.providerData.length ? user.providerData[0].providerId : "password",
            lastLogin: metadata.lastSignInTime ? new Date(metadata.lastSignInTime) : null,
            createdAt: metadata.creationTime ? new Date(metadata.creationTime) : admin.firestore.FieldValue.serverTimestamp(),
            syncedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          await userRef.set(newUserData);
          console.log(`✅ Synced: ${uid} (${email})`);
        } else {
          console.log(`ℹ️ Already in Firestore: ${uid}`);
        }
      }

      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log("🎉 Sync complete. All users processed.");
  } catch (error) {
    console.error("❌ Error syncing users:", error);
    process.exit(1);
  }
}

syncUsersToFirestore();
