
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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


// Main seeding function
async function seedData() {
    console.log('--- Clearing existing data ---');
    await deleteCollection('users', 100);
    console.log('🗑️  Users collection cleared.');
    await deleteCollection('polls', 100); 
    console.log('🗑️  Polls collection and all sub-collections cleared.');
    
    // --- 1. Seed Users ---
    const usersCollection = db.collection('users');
    console.log('🌱 Seeding users...');
    const userBatch = db.batch();
    allUsers.forEach((user: any) => {
      const docRef = usersCollection.doc(String(user.numericId));
      userBatch.set(docRef, {
         id: String(user.numericId),
         numericId: user.numericId,
         username: user.username,
         displayName: user.displayName,
         avatar: `https://i.pravatar.cc/150?u=${user.username}`,
         birthDate: new Date(user.birthday).toISOString(),
         gender: user.gender,
         pollitPoints: user.pollItPoints || 0,
         tipsReceived: user.tipsReceived || 0,
       });
    });
    await userBatch.commit();
    console.log(`✅ Seeded ${allUsers.length} users.`);
    const userIds = allUsers.map(u => String(u.numericId));
  
    // --- 2. Seed Polls ---
    console.log('🌱 Seeding polls...');
    const pollsCollection = db.collection('polls');
    const pollBatch = db.batch();
    const pollIds: string[] = [];
    
    masterPolls.forEach((poll: any) => {
        const docRef = pollsCollection.doc();
        pollIds.push(docRef.id);
        const now = new Date();
        const createdAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const durationMs = (poll.timer || 1440) * 60 * 1000;

        const pollData: Omit<Poll, 'id'> = {
            question: poll.question,
            description: poll.description || "A community-powered decision.",
            options: poll.options.map((opt: any, index: number) => ({
                id: index + 1,
                text: opt.text,
                votes: Math.floor(Math.random() * 300),
                imageUrl: opt.imageUrl || null,
                affiliateLink: opt.affiliateLink || null,
                'data-ai-hint': opt['data-ai-hint'] || null,
            })),
            type: poll.type || (poll.options.length > 2 ? 'standard' : '2nd_opinion'),
            creatorId: userIds[Math.floor(Math.random() * userIds.length)],
            createdAt: createdAt.toISOString(),
            endsAt: new Date(createdAt.getTime() + durationMs).toISOString(),
            durationMs: durationMs,
            pledged: poll.pledgeAmount > 0,
            pledgeAmount: poll.pledgeAmount || 0,
            tipCount: poll.tipCount || Math.floor(Math.random() * 25),
            isNSFW: poll.nsfw || false,
            isProcessed: false,
            category: poll.category || 'General',
            likes: poll.likes || Math.floor(Math.random() * 500),
            comments: 0, // Will be updated
            videoUrl: poll.videoUrl
        };
        
        // Remove undefined/null values for cleaner Firestore documents
        if (pollData.videoUrl === null || pollData.videoUrl === undefined) delete pollData.videoUrl;

        pollBatch.set(docRef, pollData);
    });
    await pollBatch.commit();
    console.log(`✅ Seeded ${masterPolls.length} polls.`);

    // --- 3. Seed Comments ---
    console.log('🌱 Seeding comments...');
    const commentBatch = db.batch();
    const pollCommentUpdates: { [key: string]: number } = {};

    masterComments.forEach((comment: any) => {
      const randomPollId = pollIds[Math.floor(Math.random() * pollIds.length)];
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
      
      const commentRef = db.collection('polls').doc(randomPollId).collection('comments').doc();

      commentBatch.set(commentRef, {
        pollId: randomPollId,
        userId: String(randomUser.numericId),
        username: randomUser.username,
        avatar: `https://i.pravatar.cc/150?u=${randomUser.username}`,
        text: comment.text,
        createdAt: new Date(comment.createdAt),
      });

      pollCommentUpdates[randomPollId] = (pollCommentUpdates[randomPollId] || 0) + 1;
    });

    await commentBatch.commit();
    console.log(`✅ Seeded ${masterComments.length} comments into random polls.`);

    // --- 4. Update Comment Counts on Polls ---
    console.log('🔄 Updating comment counts on polls...');
    const updateCountsBatch = db.batch();
    for (const pollId in pollCommentUpdates) {
        const pollRef = db.collection('polls').doc(pollId);
        updateCountsBatch.update(pollRef, { comments: pollCommentUpdates[pollId] });
    }
    await updateCountsBatch.commit();
    console.log('✅ Updated comment counts.');
}

async function main() {
    try {
        console.log('--- Starting Comprehensive Database Seed ---');
        await seedData();
        console.log('--- Database Seed Finished Successfully ---');
    } catch (error) {
        console.error('❌ Error during database seed:', error);
        process.exit(1);
    }
}

main();

    