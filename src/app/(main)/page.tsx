"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { AnimatedCard } from '@/components/animated-card';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

interface Item {
  id: number;
  title: string;
  description: string;
  image: string;
}

// Mock function to simulate fetching data from an API
async function fetchItems(start: number, count: number): Promise<Item[]> {
  return new Promise(resolve => {
    setTimeout(() => {
      const items: Item[] = [];
      for (let i = 0; i < count; i++) {
        const id = start + i;
        items.push({
          id,
          title: `Strategic Analysis #${id + 1}`,
          description: `This is a detailed summary of the strategic analysis for project number ${id + 1}, focusing on market trends and competitive landscape.`,
          image: `https://placehold.co/600x400.png`
        });
      }
      resolve(items);
    }, 800); // Simulate network delay
  });
}

export default function InfiniteScrollPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMoreItems = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const newItems = await fetchItems(items.length, 6);
    if (newItems.length === 0) {
      setHasMore(false);
    } else {
      setItems(prevItems => [...prevItems, ...newItems]);
    }
    setIsLoading(false);
  }, [isLoading, hasMore, items.length]);
  
  // Use intersection observer for the sentinel
  const entry = useIntersectionObserver(sentinelRef, { threshold: 1.0 });
  const isSentinelVisible = !!entry?.isIntersecting;
  
  useEffect(() => {
    if (isSentinelVisible && hasMore && !isLoading) {
      loadMoreItems();
    }
  }, [isSentinelVisible, hasMore, isLoading, loadMoreItems]);

  // Load initial data
  useEffect(() => {
    loadMoreItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-4 tracking-tight">
          Dynamic Analysis Feed
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Scroll down to seamlessly load and discover new strategic insights.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map(item => (
          <AnimatedCard
            key={item.id}
            title={item.title}
            description={item.description}
            image={item.image}
          />
        ))}
      </div>
      
      {/* Sentinel and Loader */}
      <div ref={sentinelRef} className="h-10 w-full mt-10 flex justify-center items-center">
        {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>Loading more insights...</p>
            </div>
        )}
        {!hasMore && (
          <p className="text-muted-foreground">You've reached the end.</p>
        )}
      </div>
    </div>
  );
}
