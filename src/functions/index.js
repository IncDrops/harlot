
require('dotenv').config();
const functions = require('firebase-functions/v2');
const { onCall, onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { defineString } = require('firebase-functions/params');

// Define secret parameters
const stripeSecretKey = defineString('STRIPE_SECRET_KEY');
const stripeWebhookSecret = defineString('STRIPE_WEBHOOK_SECRET');

// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = getFirestore();

// Helper function to initialize Stripe within a function call
const getStripe = () => {
    const stripe = require('stripe');
    return stripe(stripeSecretKey.value());
}

// Stripe Checkout Function (Client-callable)
exports.createStripeCheckoutSession = onCall({ secrets: ["STRIPE_SECRET_KEY"] }, async (data, context) => {
    const { priceId, query, tone, variants, scheduledTimestamp } = data;

    if (!priceId || !query) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters.');
    }
    
    // Lazily initialize stripe
    const stripe = getStripe();

    // Create a temporary analysis document so we have an ID to pass to Stripe
    const analysisRef = db.collection('analyses').doc();

    const tempAnalysisData = {
        status: 'scheduled',
        decisionQuestion: query,
        tone: tone,
        variants: variants,
        createdAt: FieldValue.serverTimestamp(),
    };

    if (scheduledTimestamp) {
        tempAnalysisData.scheduledTimestamp = admin.firestore.Timestamp.fromMillis(scheduledTimestamp);
    }
    
    await analysisRef.set(tempAnalysisData);

    try {
        const metadata = {
            query,
            tone,
            variants: variants.toString(), // Metadata values must be strings
            analysisId: analysisRef.id,
        };

        if (scheduledTimestamp) {
            metadata.scheduledTimestamp = scheduledTimestamp.toString();
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?analysis_id=${analysisRef.id}`,
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


// Stripe Webhook Handler (Called by Stripe servers)
exports.stripeWebhook = onRequest({ secrets: ["STRIPE_WEBHOOK_SECRET", "STRIPE_SECRET_KEY", "GENKIT_API_KEY", "GOOGLE_API_KEY"] }, async (req, res) => {
    // Lazily initialize stripe
    const stripe = getStripe();
    const secret = stripeWebhookSecret.value();

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, secret);
    } catch (err) {
        console.error(`❌ Webhook signature verification failed.`, err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { analysisId, query, tone, variants } = session.metadata;

        if (!analysisId) {
            console.error("Webhook received but no analysisId found in metadata.");
            res.status(200).send('Success (no analysisId)'); // Acknowledge to prevent retries
            return;
        }
        
        console.log(`Webhook received for analysisId: ${analysisId}. Starting generation...`);
        const analysisRef = db.collection('analyses').doc(analysisId);

        try {
             // In a real app, you would now trigger the Genkit flow.
            // For now, we will just update the Firestore document with "generated" data
            const { generateDecision } = require('./genkit-shim');

            const aiResponse = await generateDecision({
                query,
                tone,
                variants: parseInt(variants, 10) || 1
            });

            const finalAnalysisData = {
                status: 'completed',
                completedAt: FieldValue.serverTimestamp(),
                responses: aiResponse.responses,
            };

            await analysisRef.update(finalAnalysisData);
            console.log(`✅ Analysis ${analysisId} has been updated with AI results via webhook.`);
        } catch (aiError) {
             console.error(`AI Generation failed for analysisId ${analysisId}:`, aiError);
             // Update the doc to show an error state to the user
             await analysisRef.update({
                 status: 'archived', // or 'failed'
                 responses: [{ title: "Generation Error", text: "There was an error generating the AI response. Please try again later." }],
                 completedAt: FieldValue.serverTimestamp(),
             });
        }
    }

    res.status(200).send('Success');
});

// Genkit Shim for Cloud Functions
// This allows us to call the Genkit flow from our vanilla JS Cloud Function.
const genkitShim = `
'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.generateDecision = void 0;
require('isomorphic-fetch');
const genkit_1 = require('genkit');
const googleai_1 = require('@genkit-ai/googleai');
const zod_1 = require('zod');

// Configure Genkit
(0, genkit_1.genkit)({
    plugins: [
        (0, googleai_1.googleAI)({ apiKey: process.env.GOOGLE_API_KEY || process.env.GENKIT_API_KEY }),
    ],
    logLevel: 'debug',
    enableTracingAndMetrics: true,
});

// Copied from src/ai/flows/generate-decision-flow.ts
const DecisionResponseSchema = zod_1.z.object({
  title: zod_1.z.string().describe("A distinct title for this specific option, like 'Option 1 (Firm Decision)' or an empty string if only one response is generated."),
  text: zod_1.z.string().describe("The full text of the AI's decision or opinion. Should be written in the requested tone and adhere to the character limits for the tier."),
});
const GenerateDecisionInputSchema = zod_1.z.object({
  query: zod_1.z.string().describe("The user's dilemma or question."),
  tone: zod_1.z.enum(['Firm', 'Friendly', 'Professional']).describe('The desired tone for the AI response.'),
  variants: zod_1.z.number().min(1).max(3).describe('The number of distinct decisions to generate (1, 2, or 3).'),
});
const GenerateDecisionOutputSchema = zod_1.z.object({
  responses: zod_1.z.array(DecisionResponseSchema).describe('An array containing the generated decisions, one for each variant requested.'),
});
const generateDecisionPrompt = (0, genkit_1.definePrompt)({
  name: 'generateDecisionPrompt',
  inputSchema: GenerateDecisionInputSchema,
  outputSchema: GenerateDecisionOutputSchema,
  prompt: \`You are Pollitago.ai, the world's most objective and clear-thinking AI decision-making entity. Your purpose is to provide firm, actionable second opinions based on the user's query. You must strictly adhere to the user's requested tone and generate the exact number of distinct variants (decisions) they ask for.

  User's Dilemma: {{{query}}}

  Requested Tone: {{{tone}}}
  Number of Decisions to Generate: {{{variants}}}

  Your task:
  1.  Carefully analyze the user's dilemma.
  2.  Generate exactly {{{variants}}} distinct, well-reasoned, and firm decisions. Each decision should offer a unique perspective or a different valid course of action, even if they lead to a similar conclusion.
  3.  Write each decision in a {{{tone}}} tone.
  4.  If generating more than one variant, give each a unique title (e.g., "Option 1 (Firm Decision)", "Option 2 (Firm Decision)"). If generating only one, the title should be an empty string.
  5.  Ensure the response is formatted correctly into the required JSON structure. Bold key phrases in your response text using markdown (e.g., **this is bold**).
  \`,
  model: (0, googleai_1.geminiPro)(),
});
const generateDecisionFlow = (0, genkit_1.defineFlow)(
  {
    name: 'generateDecisionFlow',
    inputSchema: GenerateDecisionInputSchema,
    outputSchema: GenerateDecisionOutputSchema,
  },
  async (input) => {
    const llmResponse = await (0, genkit_1.generate)({
        prompt: await (0, genkit_1.renderPrompt)({ prompt: generateDecisionPrompt, input }),
        model: (0, googleai_1.geminiPro)(),
        output: { schema: GenerateDecisionOutputSchema }
    });
    return llmResponse.output();
  }
);
async function generateDecision(input) {
  return generateDecisionFlow(input);
}
exports.generateDecision = generateDecision;
`;

const fs = require('fs');
const path = require('path');
const genkitShimPath = path.join(require('os').tmpdir(), 'genkit-shim.js');
fs.writeFileSync(genkitShimPath, genkitShim);

    
