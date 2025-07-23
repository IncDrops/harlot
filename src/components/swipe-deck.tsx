
"use client";

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SwipeableAnalysisCard } from './swipeable-analysis-card';
import { useAuth } from '@/contexts/auth-context';
import type { Analysis } from '@/lib/types';
import { getRecentAnalysesForUser, updateAnalysisStatus } from '@/lib/firebase';
import { Skeleton } from './ui/skeleton';
import { Info, Archive, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SwipeDeck() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchPendingAnalyses() {
      setLoading(true);
      try {
        const pending = await getRecentAnalysesForUser(user.uid, 5, 'in_progress');
        // Reverse so the newest is on top of the deck
        setAnalyses(pending.reverse()); 
      } catch (error) {
        console.error("Failed to fetch pending analyses", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch pending analyses." });
      } finally {
        setLoading(false);
      }
    }

    fetchPendingAnalyses();
  }, [user, toast]);

  const handleSwipe = (analysisId: string, direction: 'right' | 'left') => {
    if (!user) return;

    // Remove the card from the local state immediately for a fluid UX
    setAnalyses((prev) => prev.filter((a) => a.id !== analysisId));

    // Delay the database update to match the animation
    setTimeout(() => {
        if (direction === 'right') {
            // In a real app, this might mean "approve" or "mark as important"
            // For now, we'll just complete it.
            updateAnalysisStatus(analysisId, 'completed').then(() => {
                toast({ title: "Analysis Approved", description: "It has been moved to your completed list." });
            });
        } else {
            // Swiping left archives the analysis
            updateAnalysisStatus(analysisId, 'archived').then(() => {
                toast({ title: "Analysis Archived", description: "You can find it in your archive later." });
            });
        }
    }, 700); // 700ms delay as requested
  };

  if (loading) {
    return <Skeleton className="h-[150px] w-full" />;
  }

  if (analyses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[150px] text-center text-muted-foreground bg-muted/50 rounded-lg">
        <Info className="w-8 h-8 mb-2" />
        <p className="font-semibold">All Caught Up!</p>
        <p className="text-sm">There are no new pending decisions.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[150px] flex items-center justify-center">
       <div className="absolute top-0 left-0 right-0 flex justify-between p-2 text-xs text-muted-foreground uppercase font-semibold">
        <div className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            <span>Archive</span>
        </div>
        <div className="flex items-center gap-2">
            <span>Approve</span>
            <Check className="w-4 h-4" />
        </div>
       </div>
      <AnimatePresence>
        {analyses.map((analysis, index) => (
          <SwipeableAnalysisCard
            key={analysis.id}
            analysis={analysis}
            onSwipe={(direction) => handleSwipe(analysis.id, direction)}
            isTopCard={index === analyses.length - 1}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
