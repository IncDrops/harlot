
require('dotenv').config();
const functions = require('firebase-functions');
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// =================================================================================================
// IMPORTANT: PRODUCTION ENVIRONMENT VARIABLES
// =================================================================================================
// For this function to work in your deployed application, you MUST set the following
// environment variables. With the new setup, you can do this in one of two ways:
//
// 1. (Recommended) In the `functions/.env` file in this directory.
// 2. In the Google Cloud Console for your functions.
//
// 1. STRIPE_SECRET_KEY:
//    - This is your Stripe "Secret key". It starts with 'sk_live_...'.
//
// 2. NEXT_PUBLIC_APP_URL:
//    - This is the public URL of your deployed application (e.g., https://pollitago.com).
//
// =================================================================================================
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// V2 Functions do not require admin.initializeApp() to be called.
// It is initialized automatically by the environment.
if (admin.apps.length === 0) {
    admin.initializeApp();
}


// Stripe Checkout Function
exports.createStripeCheckoutSession = onCall(async (data, context) => {
    const { priceId, query, tone, variants, scheduledTimestamp } = data;

    if (!priceId) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "priceId".');
    }
    if (!query) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "query".');
    }

    try {
        const metadata = {
            query,
            tone,
            variants,
        };

        // If a scheduled timestamp is provided, add it to the metadata.
        if (scheduledTimestamp) {
            metadata.scheduledTimestamp = scheduledTimestamp;
        }


        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
            metadata: metadata
        });

        return { url: session.url };

    } catch (error) {
        console.error("Stripe Checkout Session creation failed:", error);
        throw new functions.https.HttpsError('internal', 'Could not create a Stripe checkout session.');
    }
});

// Securely retrieves a Stripe session after a successful payment.
exports.getStripeSession = onCall(async (data, context) => {
    const { sessionId } = data;

    if (!sessionId) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "sessionId".');
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        // We only want to expose the necessary, non-sensitive data to the client.
        return {
            status: session.status,
            customer_email: session.customer_details ? session.customer_details.email : null,
            metadata: session.metadata
        };

    } catch (error) {
        console.error("Failed to retrieve Stripe session:", error);
        throw new functions.https.HttpsError('internal', 'Could not retrieve payment session details.');
    }
});
