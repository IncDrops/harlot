const { setGlobalOptions } = require("firebase-functions");
setGlobalOptions({ maxInstances: 10 });

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

admin.initializeApp();
const db = admin.firestore();

// ⏱ Scheduled Poll Processor for PollitPoints
exports.processPledgedPolls = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();

    const query = db.collection('polls')
      .where('pledged', '==', true)
      .where('isProcessed', '==', false) // Add this field to your poll documents
      .where('endsAt', '<=', now); // Add 'endsAt' timestamp to your poll documents

    const pollsToProcess = await query.get();
    if (pollsToProcess.empty) {
      console.log("No polls to process.");
      return null;
    }

    const promises = pollsToProcess.docs.map(async (pollDoc) => {
      const poll = pollDoc.data();
      const pollId = pollDoc.id;

      const winningOption = poll.options.reduce((prev, current) =>
        (prev.votes > current.votes ? prev : current)
      );

      // In a real app, votes would be stored in a subcollection to get individual user IDs
      // For this implementation, we'll simulate finding winning voters.
      // This is a placeholder for a more complex query on a 'votes' collection.
      const votesQuery = db.collectionGroup('votes')
        .where('pollId', '==', pollId)
        .where('optionId', '==', winningOption.id);

      const winningVotes = await votesQuery.get();
      if (winningVotes.empty) {
        console.log(`Poll ${pollId} has no winning votes.`);
        await pollDoc.ref.update({ isProcessed: true });
        return;
      };

      // $0.01 = 1 point. 50% of pledge goes to voters.
      const totalPoints = (poll.pledgeAmount * 0.5) * 100;
      const pointsPerWinner = Math.floor(totalPoints / winningVotes.size);
      
      if (pointsPerWinner <= 0) {
        console.log(`Payout too small for poll ${pollId}.`);
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
      console.log(`Processed poll ${pollId}, awarded ${pointsPerWinner} points to ${winningVotes.size} users.`);
    });

    await Promise.all(promises);
    return null;
  });

// 💸 Stripe Tip Function (Example, requires more setup for production)
exports.createTipSession = functions.https.onCall(async (data, context) => {
  const { amount, userId, pollId } = data;

  if (!amount || !userId || !pollId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields.');
  }

  // In a production app, you would use Stripe Connect to pay out to the creator
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Tip for poll by user ${userId}`,
            metadata: { pollId }
          },
          unit_amount: Math.round(amount * 100), // amount in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `https://your-app-domain.com/poll/${pollId}?tip_success=true`,
    cancel_url: `https://your-app-domain.com/poll/${pollId}`,
    metadata: {
      tipperId: context.auth.uid,
      creatorId: userId,
      pollId,
    },
  });

  return { sessionUrl: session.url };
});

//  webhook to listen for successful payments and award points/notify creators
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    // This is a simplified example. See Stripe docs for full implementation.
    const event = req.body;
    
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const { creatorId, pollId, tipperId } = session.metadata;

            // 1. Give creator PollitPoints (e.g., 10 points per dollar tipped)
            const pointsFromTip = Math.floor(session.amount_total / 100) * 10;
            const userRef = db.collection('users').doc(creatorId);
            await userRef.update({
                pollitPoints: admin.firestore.FieldValue.increment(pointsFromTip)
            });

            // 2. Create a notification for the creator
            const notificationRef = db.collection('users').doc(creatorId).collection('notifications');
            await notificationRef.add({
                type: 'tip_received',
                fromId: tipperId,
                pollId: pollId,
                amount: session.amount_total / 100,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                read: false,
            });
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});
