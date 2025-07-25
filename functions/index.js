
require('dotenv').config();
const functions = require('firebase-functions');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onCall, onRequest } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


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
        res.redirect(`${origin}/data-sources?status=success&source=google`);
    } else {
        console.error(`Unauthorized redirect origin: ${origin}`);
        res.status(400).send('Invalid origin specified.');
    }

  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    res.status(500).send('Authentication failed. Please try again.');
  }
});


// This function handles the OAuth2 callback from HubSpot
exports.hubspotAuthCallback = onRequest({ cors: true }, async (req, res) => {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).send('Authorization code is missing from HubSpot callback.');
    }
    if (!state) {
        return res.status(400).send('State parameter is missing.');
    }
    
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

    const tokenUrl = 'https://api.hubapi.com/oauth/v1/token';
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', process.env.HUBSPOT_CLIENT_ID);
    params.append('client_secret', process.env.HUBSPOT_CLIENT_SECRET);
    params.append('redirect_uri', process.env.HUBSPOT_REDIRECT_URI);
    params.append('code', code);

    try {
        const response = await axios.post(tokenUrl, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const { access_token, refresh_token, expires_in } = response.data;
        const expiryDate = Date.now() + (expires_in * 1000);

        const integrationRef = db.collection('users').doc(userId).collection('integrations').doc('hubspot');
        await integrationRef.set({
            provider: 'hubspot',
            accessToken: access_token,
            refreshToken: refresh_token,
            expiryDate,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        // Redirect back to the app
        const allowedOrigins = [
            'http://localhost:9003',
            'https://pollitago.com',
             functions.config().app?.url
        ].filter(Boolean);

        if (allowedOrigins.includes(origin)) {
            res.redirect(`${origin}/data-sources?status=success&source=hubspot`);
        } else {
            console.error(`Unauthorized redirect origin: ${origin}`);
            res.status(400).send('Invalid origin specified.');
        }

    } catch (error) {
        console.error('Error exchanging HubSpot code for token:', error.response ? error.response.data : error.message);
        res.status(500).send('HubSpot authentication failed.');
    }
});


// This function runs every 10 minutes to fetch stock data from Financial Modeling Prep and store it in Firestore.
exports.updateStockTicker = onSchedule('every 10 minutes', async (event) => {
    const FMP_API_KEY = process.env.FINANCIAL_MODELING_PREP_API_KEY;
    if (!FMP_API_KEY) {
        console.error("Financial Modeling Prep API key is not set. Skipping execution.");
        return;
    }

    const symbols = ["NVDA", "MSFT", "AAPL", "AMZN", "GOOG", "META"];
    const symbolsString = symbols.join(',');
    const url = `https://financialmodelingprep.com/api/v3/quote/${symbolsString}`;

    try {
        const response = await axios.get(url, {
            params: {
                apikey: FMP_API_KEY
            }
        });
        
        if (response.status !== 200 || !response.data) {
            console.error('Failed to fetch stock data from FMP. Status:', response.status);
            return;
        }

        const quotes = response.data;
        const stockQuotes = quotes.map((quote) => ({
            symbol: quote.symbol,
            name: quote.name,
            price: quote.price,
            change: quote.change,
            changesPercentage: quote.changesPercentage,
        }));
        
        const tickerDocRef = db.collection('app-data').doc('ticker');
        
        await tickerDocRef.set({
            quotes: stockQuotes,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`Successfully fetched and stored ${stockQuotes.length} stock quotes.`);

    } catch (error) {
        console.error("Error updating stock ticker data:", error.response ? error.response.data : error.message);
    }
});


// Stripe Checkout Function
exports.createStripeCheckoutSession = onCall(async (data, context) => {
    const { priceId, query, tone, variants } = data;

    if (!priceId) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "priceId".');
    }
    if (!query) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "query".');
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.APP_URL}/`,
            metadata: {
                query,
                tone,
                variants,
            }
        });

        return { url: session.url };

    } catch (error) {
        console.error("Stripe Checkout Session creation failed:", error);
        throw new functions.https.HttpsError('internal', 'Could not create a Stripe checkout session.');
    }
});
