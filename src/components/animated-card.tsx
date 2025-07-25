"use client";

import { useRef } from 'react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedCard({ children, className }: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const entry = useIntersectionObserver(cardRef, {
    threshold: 0.2, 
    freezeOnceVisible: true,
  });

  const isVisible = !!entry?.isIntersecting;

  return (
    <div ref={cardRef} className={cn('card-initial', isVisible && 'card-visible', className)}>
      <div className="glassmorphic rounded-2xl shadow-lg">
        {children}
      </div>
    </div>
  );
}


interface ExampleCardProps {
  item: {
    id: number;
    query: string;
    tone: string;
    variants: number;
    response: { title: string; text: string }[];
  }
}

export function ExampleCard({ item }: ExampleCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const entry = useIntersectionObserver(cardRef, {
        threshold: 0.1,
        freezeOnceVisible: true,
    });
    const isVisible = !!entry?.isIntersecting;

    return (
      <div ref={cardRef} className={cn('card-initial h-full', isVisible && 'card-visible')}>
        <Card className="glassmorphic rounded-2xl shadow-lg h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-semibold font-heading">"{item.query}"</CardTitle>
            <CardDescription>Tone: {item.tone} | Variants: {item.variants}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            {item.response.map((res, index) => (
              <div key={index}>
                {res.title && <p className="font-bold text-primary/90">{res.title}</p>}
                <p 
                    className="text-foreground/80" 
                    dangerouslySetInnerHTML={{ __html: res.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }}
                />
              </div>
            ))}
          </CardContent>
          <CardFooter>
             <p className="text-xs text-muted-foreground">Pollitago provides AI-powered insights. You are solely responsible for your ultimate decisions.</p>
          </CardFooter>
        </Card>
      </div>
    );
}