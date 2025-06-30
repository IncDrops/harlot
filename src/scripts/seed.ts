
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, CollectionReference } from 'firebase-admin/firestore';
import { dummyUsers, richPolls } from '../lib/dummy-data';
import type { Poll } from '../lib/types';

// This script requires a service account key to run.
// 1. Go to your Firebase Project Settings -> Service accounts.
// 2. Click "Generate new private key" and save the JSON file.
// 3. Rename the file to "serviceAccountKey.json" and place it in the "src/scripts" directory.
// IMPORTANT: Never commit this file to a public repository!
let serviceAccount: any;
try {
    serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
    console.error("❌ Error: serviceAccountKey.json not found.");
    console.error("Please follow the instructions in the comments of src/scripts/seed.ts to create one.");
    process.exit(1);
}


initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function deleteCollection(collectionRef: CollectionReference, batchSize: number) {
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise<void>((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(query: FirebaseFirestore.Query, resolve: () => void) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

async function seedData() {
    // --- Seed Users ---
    const usersRef = db.collection('users');
    console.log('🗑️  Clearing existing users...');
    await deleteCollection(usersRef, 50);
    console.log('🌱 Seeding users...');
    const userBatch = db.batch();
    dummyUsers.forEach(user => {
      const docRef = usersRef.doc(user.id);
      userBatch.set(docRef, { ...user, birthDate: new Date(user.birthDate) });
    });
    await userBatch.commit();
    console.log(`✅ Seeded ${dummyUsers.length} users.`);
  
    // --- Seed Polls ---
    const pollsRef = db.collection('polls');
    console.log('🗑️  Clearing existing polls...');
    await deleteCollection(pollsRef, 50);
    console.log('🌱 Seeding rich polls...');
    const pollBatch = db.batch();
    const now = new Date();
    richPolls.forEach((poll, i) => {
      const docRef = pollsRef.doc(); // Firestore auto-ID
      const creator = dummyUsers[i % dummyUsers.length];
      const createdAt = new Date(now.getTime() - (i+1) * 60000 * 45 * (Math.random() + 0.5)); // Stagger creation times
      
      const pollData = {
        ...poll,
        creatorId: creator.id,
        createdAt: createdAt, // use Date object for firestore
        endsAt: new Date(createdAt.getTime() + poll.durationMs),
        isProcessed: false,
      };
      pollBatch.set(docRef, pollData);
    });
    await pollBatch.commit();
    console.log(`✅ Seeded ${richPolls.length} polls.`);
  }

async function main() {
    console.log('--- Starting Database Seed ---');
    await seedData();
    console.log('--- Database Seed Finished Successfully ---');
}

main().catch(error => {
    console.error('❌ Error during database seed:', error);
    process.exit(1);
});
