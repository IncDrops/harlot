import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';

// Load service account key from root directory
let serviceAccount: any;
try {
    serviceAccount = require(path.resolve(process.cwd(), 'serviceAccountKey.json'));
} catch (e) {
    console.error("❌ Error: serviceAccountKey.json not found in the project root directory.");
    console.error("Please follow the instructions in the comments of src/scripts/seed.ts to create one.");
    process.exit(1);
}

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();

/**
 * Sets custom claims for a list of users.
 * Custom claims can be used for role-based access control.
 * Edit the `usersToUpdate` array below to specify which users get which roles.
 */
const setCustomClaims = async () => {
  // --- CONFIGURE YOUR USERS AND ROLES HERE ---
  const usersToUpdate = [
    { email: 'pr3ttypl3az3@gmail.com', role: 'admin' },
    { email: 'therealharleyknox@gmail.com', role: 'admin' },
    { email: 'traydior951@gmail.com', role: 'moderator' },
    { email: 'jaydior951@gmail.com', role: 'moderator' },
    // Example: { email: 'user@example.com', role: 'moderator' },
  ];
  // -----------------------------------------

  if (usersToUpdate.length === 0) {
    console.log("No users configured in usersToUpdate array. Exiting.");
    process.exit(0);
  }

  console.log("Setting custom claims for configured users...");

  for (const user of usersToUpdate) {
    try {
      // Get the user record by email
      const userRecord = await auth.getUserByEmail(user.email);
      
      // Set the custom claim. This will overwrite any existing claims.
      await auth.setCustomUserClaims(userRecord.uid, { role: user.role });
      
      console.log(`✅ Successfully set role '${user.role}' for ${user.email}`);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        console.warn(`⚠️  User with email ${user.email} not found. Skipping.`);
      } else {
        console.error(`❌ Failed to set role for ${user.email}:`, err.message);
      }
    }
  }

  console.log("\nCustom claims script finished.");
  process.exit(0); // Exit the script when done
};

// Run the function
setCustomClaims();
