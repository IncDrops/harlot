import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export async function POST(request: Request) {
  try {
    const { amount, currency = 'usd' } = await request.json();

    if (!amount || amount < 100) { // Stripe amounts are in cents, so minimum is $1.00 (100 cents)
        return NextResponse.json({ error: 'Invalid amount. Minimum tip is $1.00.' }, { status: 400 });
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('Stripe Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
