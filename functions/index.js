const { setGlobalOptions } = require("firebase-functions");
setGlobalOptions({ maxInstances: 10 });

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

admin.initializeApp();
const db = admin.firestore();

// ⏱ Scheduled Poll Processor
exports.processPledgedPolls = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async () => {
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

      const votesQuery = db.collection('votes')
        .where('pollId', '==', pollId)
        .where('optionId', '==', winningOption.id);

      const winningVotes = await votesQuery.get();
      if (winningVotes.empty) return;

      const totalPoints = (poll.pledgeAmount * 0.5) * 100;
      const pointsPerWinner = Math.floor(totalPoints / winningVotes.size);
      if (pointsPerWinner <= 0) return;

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
      console.log(`Processed poll ${pollId}`);
    });

    await Promise.all(promises);
    return null;
  });

// 💸 Stripe Tip Function
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
            name: `Tip to Poll #${pollId}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `https://pollitago.com/success?pollId=${pollId}`,
    cancel_url: `https://pollitago.com/cancel`,
    metadata: {
      userId,
      pollId,
    },
  });

  return { sessionUrl: session.url };
});
