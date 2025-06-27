require('dotenv').config();
const functions = require('firebase-functions');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const bodyParser = require('body-parser');
const { setGlobalOptions } = require('firebase-functions');
setGlobalOptions({ maxInstances: 10 });

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Setup raw express app for Stripe webhook
const app = express();

// Middleware for JSON parsing EXCEPT Stripe webhooks
app.use(
  (req, res, next) => {
    if (req.originalUrl === '/stripeWebhook') {
      bodyParser.raw({ type: 'application/json' })(req, res, next);
    } else {
      bodyParser.json()(req, res, next);
    }
  }
);

// ⏱ Scheduled Poll Processor for PollitPoints
exports.processPledgedPolls = onSchedule('every 60 minutes', async (event) => {
  const now = admin.firestore.Timestamp.now();
  const query = db.collection('polls')
    .where('pledged', '==', true)
    .where('isProcessed', '==', false)
    .where('endsAt', '<=', now);

    const pollsToProcess = await query.get();
    if (pollsToProcess.empty) return null;

    const promises = pollsToProcess.docs.map(async (pollDoc) => {
      const poll = pollDoc.data();
      const pollId = pollDoc.id;

      const winningOption = poll.options.reduce((prev, current) =>
        (prev.votes > current.votes ? prev : current)
      );

      const votesQuery = db.collectionGroup('votes')
        .where('pollId', '==', pollId)
        .where('optionId', '==', winningOption.id);

      const winningVotes = await votesQuery.get();
      if (winningVotes.empty) {
        await pollDoc.ref.update({ isProcessed: true });
        return;
      }

      const totalPoints = (poll.pledgeAmount * 0.5) * 100;
      const pointsPerWinner = Math.floor(totalPoints / winningVotes.size);

      if (pointsPerWinner <= 0) {
        await pollDoc.ref.update({ isProcessed: true });
        return;
      }

      const batch = db.batch();
      winningVotes.docs.forEach((voteDoc) => {
        const userId = voteDoc.data().userId;
        const userRef = db.collection('users').doc(userId);
        batch.update(userRef, {
          pollitPoints: admin.firestore.FieldValue.increment(pointsPerWinner),
        });
      });

      batch.update(pollDoc.ref, { isProcessed: true });
      await batch.commit();
    });

    await Promise.all(promises);
    return null;
  });

// 💸 Stripe Tip Checkout
exports.createTipSession = functions.https.onCall(async (data, context) => {
  const { amount, userId, pollId } = data;

  if (!amount || !userId || !pollId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Tip for poll by user ${userId}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `https://pollitago.com/poll/${pollId}?tip_success=true`,
    cancel_url: `https://pollitago.com/poll/${pollId}`,
    metadata: {
      tipperId: context.auth?.uid || "anonymous",
      creatorId: userId,
      pollId,
    },
  });

  return { sessionUrl: session.url };
});

// 🔔 Stripe Webhook
app.post('/stripeWebhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Stripe Webhook Signature Verification Failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { creatorId, pollId, tipperId } = session.metadata;

      if (!creatorId || !pollId || !tipperId) {
        console.error('❌ Missing metadata in session:', session.metadata);
        return res.status(400).send('Missing metadata.');
      }

      const points = Math.floor(session.amount_total / 100) * 10;
      const userRef = db.collection('users').doc(creatorId);
      await userRef.update({
        pollitPoints: admin.firestore.FieldValue.increment(points),
      });

      const notificationRef = userRef.collection('notifications');
      await notificationRef.add({
        type: 'tip_received',
        fromId: tipperId,
        pollId,
        amount: session.amount_total / 100,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });

      console.log(`✅ Tip processed: ${points} points to ${creatorId}`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// ✅ Export webhook as Firebase HTTPS function
exports.stripeWebhook = functions.https.onRequest(app);
