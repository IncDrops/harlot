
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// This is a placeholder for where the AI response would be displayed.
// In a real app, you would fetch the AI result using the session_id
// from a webhook or by querying your backend.

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      // Here you would typically verify the session and trigger AI generation.
      // For this example, we'll just simulate a delay.
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000); 
      
      return () => clearTimeout(timer);
    } else {
        setError("No session ID found. Your payment may not have been processed correctly.");
        setLoading(false);
    }
  }, [sessionId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground text-center p-4">
      {loading ? (
        <>
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
          <h1 className="text-3xl font-bold font-heading">Processing Your Payment...</h1>
          <p className="text-muted-foreground mt-2">Please wait while we confirm your transaction.</p>
        </>
      ) : error ? (
         <>
          <h1 className="text-3xl font-bold font-heading text-destructive">Payment Error</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
           <Button asChild className="mt-8">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </>
      ) : (
        <>
          <CheckCircle className="h-16 w-16 text-green-500 mb-6" />
          <h1 className="text-4xl font-bold font-heading metallic-gradient">Payment Successful!</h1>
          <p className="text-muted-foreground mt-2 max-w-md">
            Your request has been received. Your AI-powered second opinion is now being generated.
          </p>
          <div className="mt-8 p-6 rounded-2xl bg-muted/50 w-full max-w-2xl text-left">
            <h2 className="font-semibold text-lg mb-2">What happens next?</h2>
            <p className="text-sm text-muted-foreground">
              For this demo, the AI response is not yet connected. In a full implementation, you would receive your generated opinion here or via the delivery method you selected.
            </p>
          </div>
          <Button asChild className="mt-8">
            <Link href="/">Ask Another Question</Link>
          </Button>
        </>
      )}
    </div>
  );
}
