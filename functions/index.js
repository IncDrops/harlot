
require('dotenv').config();
const functions = require('firebase-functions');
const { onCall, onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// =================================================================================================
// IMPORTANT: PRODUCTION ENVIRONMENT VARIABLES
// =================================================================================================
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
// =================================================================================================

if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();


// Stripe Checkout Function (Client-callable)
exports.createStripeCheckoutSession = onCall(async (data, context) => {
    const { priceId, query, tone, variants, scheduledTimestamp } = data;

    if (!priceId || !query) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters.');
    }

    // Create a temporary analysis document so we have an ID to pass to Stripe
    const analysisRef = db.collection('analyses').doc();

    const tempAnalysisData = {
        status: 'scheduled', // Start as scheduled, webhook will update it
        decisionQuestion: query,
        tone: tone,
        variants: variants,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        // We can't put a userId here because the user isn't logged in
    };

    if (scheduledTimestamp) {
        tempAnalysisData.scheduledTimestamp = admin.firestore.Timestamp.fromMillis(scheduledTimestamp);
    }
    
    await analysisRef.set(tempAnalysisData);

    try {
        const metadata = {
            query,
            tone,
            variants,
            analysisId: analysisRef.id, // Pass our new analysis ID to the webhook
        };

        if (scheduledTimestamp) {
            metadata.scheduledTimestamp = scheduledTimestamp;
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'payment',
            // Pass the analysisId in the success URL so the success page can find it.
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?analysis_id=${analysisRef.id}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
            metadata: metadata,
        });

        return { url: session.url };

    } catch (error) {
        console.error("Stripe Checkout Session creation failed:", error);
        await analysisRef.delete(); // Clean up the temp doc on failure
        throw new functions.https.HttpsError('internal', 'Could not create a Stripe checkout session.');
    }
});

// Securely retrieves a Stripe session after a successful payment for the success page.
exports.getStripeSession = onCall(async (data, context) => {
    const { sessionId } = data;

    if (!sessionId) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "sessionId".');
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        return {
            status: session.status,
            customer_email: session.customer_details ? session.customer_details.email : null,
        };

    } catch (error) {
        console.error("Failed to retrieve Stripe session:", error);
        throw new functions.https.HttpsError('internal', 'Could not retrieve payment session details.');
    }
});


// Stripe Webhook Handler (Called by Stripe servers)
exports.stripeWebhook = onRequest({ secrets: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"] }, async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (err) {
        console.error(`❌ Webhook signature verification failed.`, err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { analysisId, query, tone, variants, scheduledTimestamp } = session.metadata;

        if (!analysisId) {
            console.error("Webhook received but no analysisId found in metadata.");
            res.status(200).send('Success (no analysisId)');
            return;
        }
        
        console.log(`Webhook received for analysisId: ${analysisId}. Starting generation...`);
        
        const analysisRef = db.collection('analyses').doc(analysisId);
        
        // In a real app, you would now trigger the Genkit flow.
        // For now, we will just update the Firestore document with "generated" data
        // to prove the webhook works.
        const mockAiResponse = {
            primaryRecommendation: "This is a firm recommendation based on your query.",
            executiveSummary: "This is the executive summary of the decision.",
            keyFactors: [{ factor: "Key Factor 1", impact: 5, value: "High importance" }],
            risks: [{ risk: "Potential Risk 1", mitigation: "Mitigation strategy here." }],
            confidenceScore: 95,
        };

        const finalAnalysisData = {
            status: 'completed',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            ...mockAiResponse
        };

        await analysisRef.update(finalAnalysisData);
        console.log(`✅ Analysis ${analysisId} has been updated with AI results.`);
    }

    res.status(200).send('Success');
});
