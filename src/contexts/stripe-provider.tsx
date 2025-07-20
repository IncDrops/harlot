"use client";

// This file is deprecated as Stripe tipping is not part of the new enterprise app.
// It can be removed from the project.

import React from 'react';

export function StripeProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
