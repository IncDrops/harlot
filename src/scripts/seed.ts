
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { Poll, User } from '../lib/types';
import path from 'path';

// --- IMPORTANT ---
// This script requires a service account key.
// 1. Go to your Firebase Project Settings -> Service accounts.
// 2. Click "Generate new private key" and save the JSON file.
// 3. Place the file in your project's ROOT directory and name it "serviceAccountKey.json".
// IMPORTANT: Do not commit this file to a public repository!
let serviceAccount: any;
try {
    serviceAccount = require(path.resolve(process.cwd(), 'serviceAccountKey.json'));
} catch (e) {
    console.error("❌ Error: serviceAccountKey.json not found in the project root directory.");
    console.error("Please follow the instructions in the comments of src/scripts/seed.ts to create one.");
    process.exit(1);
}

// Import all data sources
import allUsers from './users_seed_122.json';
import masterPolls from './polls_master.json';
import masterComments from './comments_seed.json';


initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const auth = getAuth();
const BATCH_LIMIT = 450; // Keep safely below the 500 operation limit for Firestore batches

// Helper to recursively delete collections
async function deleteCollection(collectionPath: string, batchSize: number) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise<void>((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });

  async function deleteQueryBatch(query: FirebaseFirestore.Query, resolve: () => void) {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
      resolve();
      return;
    }

    const batch = db.batch();
    for (const doc of snapshot.docs) {
      const subcollections = await doc.ref.listCollections();
      for(const subcollection of subcollections) {
        await deleteCollection(subcollection.path, batchSize);
      }
      batch.delete(doc.ref);
    }
    
    await batch.commit();

    process.nextTick(() => {
      deleteQueryBatch(query, resolve);
    });
  }
}

// Function to delete all Firebase Auth users
async function deleteAllAuthUsers() {
    let pageToken;
    let count = 0;
    do {
        const listUsersResult = await auth.listUsers(1000, pageToken);
        const uidsToDelete = listUsersResult.users.map(u => u.uid);
        if (uidsToDelete.length > 0) {
            await auth.deleteUsers(uidsToDelete);
            count += uidsToDelete.length;
            console.log(`Deleted ${uidsToDelete.length} auth users...`);
        }
        pageToken = listUsersResult.pageToken;
    } while (pageToken);
    console.log(`✅ Deleted a total of ${count} Auth users.`);
}


// Main seeding function
async function clearAllData() {
    console.log('--- Clearing all existing data from Firebase ---');

    // Clear Auth users
    await deleteAllAuthUsers();
    
    // Clear Firestore
    console.log('🗑️  Clearing Firestore collections...');
    await deleteCollection('users', 100);
    console.log('🗑️  Users collection cleared.');
    await deleteCollection('polls', 100); 
    console.log('🗑️  Polls collection cleared.');
    await deleteCollection('messages', 100);
    console.log('🗑️  Messages collection cleared.');

    console.log('✅ All data has been cleared. The database is now empty.');
}

async function main() {
    try {
        console.log('--- Starting Database Clearing Script ---');
        await clearAllData();
        console.log('--- ✔️ Database Clearing Finished Successfully ---');
    } catch (error) {
        console.error('❌ Error during database clearing:', error);
        process.exit(1);
    }
}

main();
