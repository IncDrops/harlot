
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, ServerCrash } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { generateDecision } from '@/ai/flows/generate-decision-flow';
import type { GenerateDecisionOutput } from '@/ai/flows/generate-decision-flow';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

type Status = 'loading' | 'verifying' | 'generating' | 'success' | 'error';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<GenerateDecisionOutput | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found. Your payment may not have been processed correctly.");
      setStatus('error');
      return;
    }

    async function verifyAndGenerate() {
      setStatus('verifying');
      try {
        // 1. Verify session with the backend
        const getStripeSession = httpsCallable(functions, 'getStripeSession');
        const { data }: any = await getStripeSession({ sessionId });

        if (data.status !== 'complete') {
          throw new Error('Payment was not completed successfully.');
        }

        // 2. Generate decision using the verified metadata
        setStatus('generating');
        const { query, tone, variants } = data.metadata;
        if (!query || !tone || !variants) {
          throw new Error('Could not retrieve decision parameters from payment session.');
        }

        const decisionResponse = await generateDecision({
          query,
          tone,
          variants: parseInt(variants, 10),
        });

        setDecision(decisionResponse);
        setStatus('success');

      } catch (err: any) {
        console.error("Error during success page processing:", err);
        setError(err.message || "An unknown error occurred during processing.");
        setStatus('error');
      }
    }

    verifyAndGenerate();
  }, [sessionId]);
  
  const StatusDisplay = () => {
    switch(status) {
        case 'loading':
        case 'verifying':
            return (
                <>
                  <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
                  <h1 className="text-3xl font-bold font-heading">Verifying Your Payment...</h1>
                  <p className="text-muted-foreground mt-2">Please wait while we confirm your transaction. This won't take long.</p>
                </>
            );
        case 'generating':
             return (
                <>
                  <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
                  <h1 className="text-3xl font-bold font-heading">Generating Your Opinion...</h1>
                  <p className="text-muted-foreground mt-2">The AI is analyzing your request. Your decision will appear shortly.</p>
                </>
            );
        case 'error':
             return (
                 <>
                  <ServerCrash className="h-16 w-16 text-destructive mb-6" />
                  <h1 className="text-3xl font-bold font-heading text-destructive">An Error Occurred</h1>
                  <p className="text-muted-foreground mt-2">{error}</p>
                   <Button asChild className="mt-8">
                    <Link href="/">Return to Homepage</Link>
                  </Button>
                </>
             );
        case 'success':
            return (
                 <>
                  <CheckCircle className="h-16 w-16 text-green-500 mb-6" />
                  <h1 className="text-4xl font-bold font-heading metallic-gradient">Your Opinion is Ready!</h1>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    Thank you for using Pollitago. Your AI-powered second opinion is below.
                  </p>
                </>
            )
        default:
            return null;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground text-center p-4">
      <div className="mb-12">
        <StatusDisplay />
      </div>

      {status === 'success' && decision && (
        <div className="w-full max-w-4xl space-y-8">
            {decision.responses.map((res, index) => (
                 <Card key={index} className="glassmorphic rounded-2xl shadow-lg text-left">
                    <CardHeader>
                        {res.title && <CardTitle className="text-xl font-semibold font-heading text-primary">{res.title}</CardTitle>}
                    </CardHeader>
                    <CardContent>
                        <p 
                            className="text-foreground/90 whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: res.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }}
                        />
                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground">Pollitago provides AI-powered insights. You are solely responsible for your ultimate decisions.</p>
                    </CardFooter>
                 </Card>
            ))}
             <Button asChild className="mt-8 glow-border">
                <Link href="/">Ask Another Question</Link>
            </Button>
        </div>
      )}
    </div>
  );
}
