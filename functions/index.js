
require('dotenv').config();
const functions = require('firebase-functions');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onCall, onRequest } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');
const { OAuth2Client } = require('google-auth-library');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Google OAuth2 Client
const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  process.env.GOOGLE_OAUTH_REDIRECT_URI
);

// This function handles the OAuth2 callback from Google after a user grants permission.
exports.googleAuthCallback = onRequest({ cors: true }, async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).send('Authorization code is missing.');
    }
    if (!state) {
        return res.status(400).send('State parameter is missing.');
    }
    
    // The 'state' parameter now contains a JSON string with the userId and original origin
    let parsedState;
    try {
        parsedState = JSON.parse(state);
    } catch (e) {
        return res.status(400).send('Invalid state parameter format.');
    }

    const { userId, origin } = parsedState;

    if (!userId || !origin) {
        return res.status(400).send('State is missing required properties (userId, origin).');
    }


    // Exchange the authorization code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    const { access_token, refresh_token, scope, token_type, expiry_date } = tokens;

    if (!refresh_token) {
        // A refresh token is only provided on the first authorization.
        // If it's missing, the user has likely already connected this app.
        // We can just update their access token if needed.
        console.log(`User ${userId} re-authenticated with Google Analytics. No new refresh token provided.`);
    }

    // Securely store the refresh token in Firestore, associated with the user
    // We store the refresh token to get new access tokens later without user interaction.
    const integrationRef = db.collection('users').doc(userId).collection('integrations').doc('google_analytics');
    
    await integrationRef.set({
      provider: 'google',
      accessToken: access_token,
      refreshToken: refresh_token || null, // Store null if not provided
      scope,
      tokenType: token_type,
      expiryDate: expiry_date,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Redirect user back to the data sources page on the original domain
    // Whitelist allowed domains for security
    const allowedOrigins = [
        'http://localhost:9003',
        'https://pollitago.com',
        functions.config().app?.url // From firebase functions:config:set app.url="..."
    ].filter(Boolean); // filter out null/undefined values

    if (allowedOrigins.includes(origin)) {
        res.redirect(`${origin}/data-sources?status=success`);
    } else {
        console.error(`Unauthorized redirect origin: ${origin}`);
        res.status(400).send('Invalid origin specified.');
    }

  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    res.status(500).send('Authentication failed. Please try again.');
  }
});


// This file is ready for new, enterprise-focused cloud functions.
// Example of a function structure:
// exports.someNewEnterpriseFunction = onCall(async (request) => {
//   // ... logic for your new feature
//   return { success: true };
// });
