"use client";

// This page is deprecated in the new Pollitago enterprise application.
// It can be removed or repurposed for a different feature.

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DeprecatedPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/');
    }, [router]);

    return (
        <div className="container mx-auto py-8 text-center">
            <p>Redirecting to dashboard...</p>
        </div>
    );
}
