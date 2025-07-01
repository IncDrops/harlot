// This script is deprecated and has been moved to /src/scripts/setCustomClaims.ts
// Please use `npm run set-claims` from the root directory to manage user roles.
import * as admin from 'firebase-admin';

admin.initializeApp();

const setClaims = async () => {
  const usersToUpdate = [
    { email: 'therealharleyknox@gmail.com', role: 'admin' }
    // NOTE: Other users will be added manually later
  ];

  for (const user of usersToUpdate) {
    try {
      const userRecord = await admin.auth().getUserByEmail(user.email);
      await admin.auth().setCustomUserClaims(userRecord.uid, { role: user.role });
      console.log(`✅ Set role '${user.role}' for ${user.email}`);
    } catch (err) {
      console.error(`❌ Failed to set role for ${user.email}:`, err);
    }
  }

  process.exit(0);
};

setClaims();
