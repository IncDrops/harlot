"use client";

import { useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  title: string;
  description: string;
  image: string;
}

export function AnimatedCard({ title, description, image }: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const entry = useIntersectionObserver(cardRef, {
    threshold: 0.1, // Trigger when 10% of the card is visible
    freezeOnceVisible: true, // Animation runs only once
  });

  const isVisible = !!entry?.isIntersecting;

  return (
    <div ref={cardRef} className={cn('card-initial', isVisible && 'card-visible')}>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="relative w-full aspect-video mb-4 rounded-md overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint="card image"
            />
          </div>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
