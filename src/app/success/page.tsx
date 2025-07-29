
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, ServerCrash, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Analysis } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';


type Status = 'loading' | 'generating' | 'success' | 'error';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const analysisId = searchParams.get('analysis_id');
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  useEffect(() => {
    if (!analysisId) {
      setError("No analysis ID found in the URL. Please check the link and try again.");
      setStatus('error');
      return;
    }
    
    setStatus('generating');

    const unsub = onSnapshot(doc(db, "analyses", analysisId), (doc) => {
        if (doc.exists()) {
            const data = doc.data() as Analysis;
            setAnalysis({ ...data, id: doc.id });
            
            if(data.status === 'completed') {
                setStatus('success');
                unsub(); 
            } else if (data.status === 'archived' || data.status === 'failed') {
                setError("This analysis could not be completed. This may be due to a content safety filter or system error. Please try a different query.");
                setStatus('error');
                unsub();
            }
        } else {
            console.warn("Analysis document not found yet, still listening...");
        }
    }, (err) => {
        console.error("Error listening to analysis document:", err);
        setError("An error occurred while fetching your results.");
        setStatus('error');
    });

    return () => unsub(); 
  }, [analysisId]);

  const handleDownload = () => {
    if (!analysis || !analysis.responses) return;

    let content = `Pollitago.ai Decision\n======================\n\n`;
    content += `Original Query: ${analysis.decisionQuestion}\n\n`;
    
    analysis.responses.forEach(response => {
        if(response.title) {
            content += `--- ${response.title} ---\n`;
        }
        content += `${response.text.replace(/<strong class="text-foreground">/g, '').replace(/<\/strong>/g, '')}\n\n`;
    });

    content += "Disclaimer: Pollitago provides AI-powered insights. You are solely responsible for your ultimate decisions and actions based on this information.";

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pollitago_Decision_${analysis.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const StatusDisplay = () => {
    switch(status) {
        case 'loading':
        case 'generating':
             return (
                <>
                  <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
                  <h1 className="text-3xl font-bold font-heading">Payment Successful! Generating Your Opinion...</h1>
                  <p className="text-muted-foreground mt-2">Please keep this page open. Your results will appear here automatically.</p>
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

      {status === 'success' && analysis && analysis.responses && (
        <div className="w-full max-w-4xl space-y-8 animate-in fade-in-50 duration-500">
            {analysis.responses.map((response, index) => (
                 <Card key={index} className="glassmorphic rounded-2xl shadow-lg text-left">
                    {response.title && (
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold font-heading text-primary">{response.title}</CardTitle>
                        </CardHeader>
                    )}
                    <CardContent>
                        <p 
                            className="text-foreground/90 whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: response.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }}
                        />
                    </CardContent>
                </Card>
            ))}

             <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <Button asChild className="glow-border w-full sm:w-auto">
                    <Link href="/">Ask Another Question</Link>
                </Button>
                <Button variant="outline" onClick={handleDownload} className="w-full sm:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    Download Decision
                </Button>
             </div>
        </div>
      )}
    </div>
  );
}


export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <SuccessPageContent />
        </Suspense>
    )
}
