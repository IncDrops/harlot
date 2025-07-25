
require('dotenv').config();
const functions = require('firebase-functions');
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


// Initialize Firebase Admin
admin.initializeApp();

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
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
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
