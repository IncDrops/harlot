
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, CollectionReference } from 'firebase-admin/firestore';
import { dummyUsers, richPolls } from '../lib/dummy-data';
import type { Poll } from '../lib/types';
import path from 'path';

// --- IMPORTANT ---
// This script requires a service account key.
// 1. Go to your Firebase Project Settings -> Service accounts.
// 2. Click "Generate new private key" and save the JSON file.
// 3. Place the file in your project's ROOT directory and name it "serviceAccountKey.json".
// IMPORTANT: Do not commit this file to a public repository!
let serviceAccount: any;
try {
    // Correct path assuming script is run from project root (e.g., `npm run seed`)
    serviceAccount = require(path.join(process.cwd(), 'serviceAccountKey.json'));
} catch (e) {
    console.error("❌ Error: serviceAccountKey.json not found in the project root directory.");
    console.error("Please follow the instructions in the comments of src/scripts/seed.ts to create one.");
    process.exit(1);
}

// Import all poll data sources
import fourOptionPolls from '../seed/four_option_seed_fixed.json';
import secondOpinionPolls from '../seed/second_opinion_seed.json';
import threeOptionPolls from '../seed/three_option_seed.json';
import twoOptionPolls from '../seed/two_option_seed.json';
import pollsMaster from './polls_master.json';


initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Helper to clear collections
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

// Main seeding function
async function seedData() {
    console.log('--- Clearing existing data ---');
    await deleteCollection(db.collection('users'), 100);
    console.log('🗑️  Users collection cleared.');
    await deleteCollection(db.collection('polls'), 100);
    console.log('🗑️  Polls collection cleared.');
    
    // --- 1. Seed Users ---
    const usersRef = db.collection('users');
    console.log('🌱 Seeding users...');
    const userBatch = db.batch();
    dummyUsers.forEach(user => {
      const docRef = usersRef.doc(String(user.id));
      userBatch.set(docRef, { ...user, birthDate: new Date(user.birthDate) });
    });
    await userBatch.commit();
    console.log(`✅ Seeded ${dummyUsers.length} users.`);
  
    // --- 2. Combine and Standardize All Polls ---
    console.log('🌱 Combining and standardizing all poll sources...');
    let combinedPolls: Omit<Poll, 'id'>[] = [];

    // Add richPolls from dummy-data.ts
    combinedPolls.push(...richPolls);

    // Function to convert minutes to milliseconds
    const timerToMs = (minutes: number) => minutes * 60 * 1000;

    // Process each JSON file and add to combined list
    const allJsonPolls = [
      ...fourOptionPolls,
      ...secondOpinionPolls,
      ...threeOptionPolls,
      ...twoOptionPolls,
      ...pollsMaster
    ];

    allJsonPolls.forEach((poll: any) => {
        // Skip if question is missing, indicating bad data
        if (!poll.question) return;

        const standardizedPoll: Omit<Poll, 'id'> = {
            question: poll.question,
            description: poll.description || `A decision about: ${poll.question}`,
            options: poll.options || [{text: 'Yes', votes: 0}, {text: 'No', votes: 0}],
            type: poll.type || 'standard',
            creatorId: poll.creatorId || dummyUsers[Math.floor(Math.random() * dummyUsers.length)].id,
            createdAt: poll.createdAt ? new Date(poll.createdAt).toISOString() : new Date().toISOString(),
            durationMs: poll.timer ? timerToMs(poll.timer) : 24 * 60 * 60 * 1000, // Default to 1 day
            pledged: poll.pledged ?? (poll.pledge > 0),
            pledgeAmount: poll.pledgeAmount ?? poll.pledge ?? 0,
            tipCount: poll.tipCount ?? 0,
            isNSFW: poll.nsfw ?? poll.isNSFW ?? false,
            category: poll.category || 'General',
            likes: poll.likes ?? 0,
            comments: poll.comments ?? 0,
            videoUrl: poll.videoUrl,
        };
        combinedPolls.push(standardizedPoll);
    });

    console.log(`📊 Total combined polls to be seeded: ${combinedPolls.length}`);

    // --- 3. Seed Combined Polls ---
    const pollsRef = db.collection('polls');
    const pollBatch = db.batch();
    const now = new Date();

    combinedPolls.forEach((poll, i) => {
      const docRef = pollsRef.doc(); // Firestore auto-ID
      const createdAt = new Date(now.getTime() - (i + 1) * 60000 * 15 * (Math.random() + 0.5)); // Stagger creation times
      
      const pollData: Omit<Poll, 'id'> & { endsAt: Date, isProcessed: boolean } = {
        ...poll,
        createdAt: createdAt.toISOString(),
        endsAt: new Date(createdAt.getTime() + poll.durationMs),
        isProcessed: false,
      };
      pollBatch.set(docRef, pollData);
    });
    
    await pollBatch.commit();
    console.log(`✅ Seeded ${combinedPolls.length} polls.`);
}

async function main() {
    console.log('--- Starting Comprehensive Database Seed ---');
    await seedData();
    console.log('--- Database Seed Finished Successfully ---');
}

main().catch(error => {
    console.error('❌ Error during database seed:', error);
    process.exit(1);
});
