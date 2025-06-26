"use client";

import React from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

const getStripePromise = () => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
        console.warn("Stripe publishable key is not set. Tipping will be disabled.");
        return null;
    }
    if (!stripePromise) {
        stripePromise = loadStripe(key);
    }
    return stripePromise;
}

export function StripeProvider({ children }: { children: React.ReactNode }) {
    const stripe = getStripePromise();

    if(!stripe) {
        return <>{children}</>;
    }

    return (
        <Elements stripe={stripe}>
            {children}
        </Elements>
    );
}
