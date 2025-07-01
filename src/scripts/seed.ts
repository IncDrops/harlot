
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


// Main seeding function
async function seedData() {
    console.log('--- Clearing existing data ---');

    // --- SAFER AUTH USER DELETION ---
    console.log('🗑️  Looking for previously seeded Auth users to delete...');
    try {
        const seededUserEmails = allUsers.map(u => `${u.username}@pollitago.com`);
        
        // Batch lookup users by email
        const userIdentifiers = seededUserEmails.map(email => ({ email }));
        const uidsToDelete: string[] = [];
        
        // Batching because getUsers has a limit of 100 identifiers per call
        for (let i = 0; i < userIdentifiers.length; i += 100) {
            const batch = userIdentifiers.slice(i, i + 100);
            if (batch.length === 0) continue;
            const listUsersResult = await auth.getUsers(batch);
            listUsersResult.users.forEach(userRecord => {
                uidsToDelete.push(userRecord.uid);
            });
        }
        
        if (uidsToDelete.length > 0) {
            await auth.deleteUsers(uidsToDelete);
            console.log(`✅ Deleted ${uidsToDelete.length} previously seeded Auth users. Your personal account was not touched.`);
        } else {
            console.log('✅ No previously seeded Auth users found.');
        }
    } catch (error: any) {
        if(error.code === 'auth/user-not-found') {
             console.log('✅ No previously seeded Auth users found to delete.');
        } else {
            console.error('⚠️  An error occurred while trying to delete seeded users. This might be fine on the first run.', error);
        }
    }
    
    // Clear Firestore
    await deleteCollection('users', 100);
    console.log('🗑️  Users collection cleared.');
    await deleteCollection('polls', 100); 
    console.log('🗑️  Polls collection and all sub-collections cleared.');
    
    // --- 1. Seed Users ---
    const usersCollection = db.collection('users');
    console.log('🌱 Seeding Auth and Firestore users...');
    const userIds: string[] = [];

    // Using a for...of loop for robust async operations
    for (const user of allUsers) {
      const email = `${user.username}@pollitago.com`;
      const password = 'Password123!';

      try {
        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
          email,
          password,
          displayName: user.displayName,
          emailVerified: true,
        });

        const uid = userRecord.uid;
        userIds.push(uid);

        // Create Firestore doc
        const docRef = usersCollection.doc(uid);
        
        let avatarUrl = `https://avatar.iran.liara.run/public/?username=${user.username}`;
        if (user.gender === 'male') {
            avatarUrl = `https://avatar.iran.liara.run/public/boy?username=${user.username}`;
        } else if (user.gender === 'female') {
            avatarUrl = `https://avatar.iran.liara.run/public/girl?username=${user.username}`;
        }

        const userProfileData: User = {
            id: uid,
            username: user.username,
            displayName: user.displayName,
            avatar: avatarUrl,
            birthDate: new Date(user.birthday).toISOString(),
            gender: user.gender as User['gender'],
            pollitPoints: user.pollItPoints || 0,
            tipsReceived: user.tipsReceived || 0,
            bio: user.bio || '',
            pronouns: user.pronouns || ''
        };
        await docRef.set(userProfileData);
      } catch (error) {
        console.error(`❌ Failed to create user ${user.username}:`, error);
      }
    }
    console.log(`✅ Seeded ${userIds.length} users into Auth and Firestore.`);
 
    // --- 2. Seed Polls (BATCHED) ---
    console.log('🌱 Seeding polls with robust data validation...');
    const pollsCollection = db.collection('polls');
    let pollBatch = db.batch();
    const pollIds: string[] = [];
    let pollCount = 0;

    for (const poll of masterPolls) {
        const docRef = pollsCollection.doc();
        pollIds.push(docRef.id);
        const now = new Date();
        const createdAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const durationMs = (poll.timer || 1440) * 60 * 1000;

        const pollData: Omit<Poll, 'id'> = {
            question: poll.question || "Untitled Poll",
            description: poll.description || "A community-powered decision.",
            options: (poll.options || []).map((opt: any, index: number) => ({
                id: index + 1,
                text: opt.text || `Option ${index + 1}`,
                votes: Math.floor(Math.random() * 300),
                imageUrl: opt.imageUrl || null,
                affiliateLink: opt.affiliateLink || null,
            })),
            type: (poll.type || (poll.options?.length > 2 ? 'standard' : '2nd_opinion')) as 'standard' | '2nd_opinion',
            creatorId: userIds[Math.floor(Math.random() * userIds.length)],
            createdAt: createdAt.toISOString(),
            endsAt: new Date(createdAt.getTime() + durationMs).toISOString(),
            durationMs: durationMs,
            pledged: (poll.pledgeAmount || 0) > 0,
            pledgeAmount: poll.pledgeAmount || 0,
            tipCount: poll.tipCount || Math.floor(Math.random() * 25),
            isNSFW: poll.nsfw || false,
            isProcessed: false,
            category: poll.category || 'General',
            likes: poll.likes || Math.floor(Math.random() * 500),
            comments: 0, // Will be updated by the comment seeding part
            videoUrl: poll.videoUrl,
        };
        
        if (!pollData.videoUrl) {
          delete pollData.videoUrl;
        }

        pollBatch.set(docRef, pollData);
        pollCount++;

        // When batch is full, commit it and start a new one
        if (pollCount % BATCH_LIMIT === 0) {
            console.log(`📝 Committing a batch of ${BATCH_LIMIT} polls...`);
            await pollBatch.commit();
            pollBatch = db.batch();
        }
    }

    // Commit any remaining polls in the last batch
    if (pollCount % BATCH_LIMIT !== 0) {
        console.log(`📝 Committing the final batch of ${pollCount % BATCH_LIMIT} polls...`);
        await pollBatch.commit();
    }
    console.log(`✅ Seeded ${masterPolls.length} polls.`);

    // --- 3. Seed Comments (BATCHED) ---
    console.log('🌱 Seeding comments...');
    let commentBatch = db.batch();
    const pollCommentUpdates: { [key: string]: number } = {};
    let commentCount = 0;

    for (const comment of masterComments) {
        const randomPollId = pollIds[Math.floor(Math.random() * pollIds.length)];
        const randomUserIndex = Math.floor(Math.random() * allUsers.length);
        const randomUser = allUsers[randomUserIndex];
        const randomUserId = userIds[randomUserIndex];
        
        const commentRef = db.collection('polls').doc(randomPollId).collection('comments').doc();

        let avatarUrl = `https://avatar.iran.liara.run/public/?username=${randomUser.username}`;
        if (randomUser.gender === 'male') {
            avatarUrl = `https://avatar.iran.liara.run/public/boy?username=${randomUser.username}`;
        } else if (randomUser.gender === 'female') {
            avatarUrl = `https://avatar.iran.liara.run/public/girl?username=${randomUser.username}`;
        }

        commentBatch.set(commentRef, {
          pollId: randomPollId,
          userId: randomUserId,
          username: randomUser.username,
          avatar: avatarUrl,
          text: comment.text,
          createdAt: new Date(comment.createdAt),
        });

        pollCommentUpdates[randomPollId] = (pollCommentUpdates[randomPollId] || 0) + 1;
        commentCount++;

        if (commentCount % BATCH_LIMIT === 0) {
            console.log(`📝 Committing a batch of ${BATCH_LIMIT} comments...`);
            await commentBatch.commit();
            commentBatch = db.batch();
        }
    }

    // Commit the final batch of comments
    if (commentCount % BATCH_LIMIT !== 0) {
        console.log(`📝 Committing the final batch of ${commentCount % BATCH_LIMIT} comments...`);
        await commentBatch.commit();
    }
    console.log(`✅ Seeded ${masterComments.length} comments into random polls.`);

    // --- 4. Update Comment Counts on Polls (BATCHED) ---
    console.log('🔄 Updating comment counts on polls...');
    let updateCountsBatch = db.batch();
    let updatesCount = 0;
    const pollIdsWithNewComments = Object.keys(pollCommentUpdates);

    for (const pollId of pollIdsWithNewComments) {
        const pollRef = db.collection('polls').doc(pollId);
        // Using FieldValue.increment is safer for counters
        const incrementValue = pollCommentUpdates[pollId];
        updateCountsBatch.update(pollRef, { comments: FieldValue.increment(incrementValue) });
        updatesCount++;

        if (updatesCount % BATCH_LIMIT === 0) {
            console.log(`📝 Committing a batch of ${BATCH_LIMIT} comment count updates...`);
            await updateCountsBatch.commit();
            updateCountsBatch = db.batch();
        }
    }

    // Commit any remaining updates
    if (updatesCount > 0 && updatesCount % BATCH_LIMIT !== 0) {
        console.log(`📝 Committing the final batch of ${updatesCount % BATCH_LIMIT} comment count updates...`);
        await updateCountsBatch.commit();
    }
    console.log('✅ Updated comment counts.');
}

async function main() {
    try {
        console.log('--- Starting Comprehensive Database Seed ---');
        await seedData();
        console.log('--- ✔️ Database Seed Finished Successfully ---');
    } catch (error) {
        console.error('❌ Error during database seed:', error);
        process.exit(1);
    }
}

main();
