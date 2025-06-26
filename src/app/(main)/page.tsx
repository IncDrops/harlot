"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { PollCard } from "@/components/poll-card";
import { dummyPolls } from "@/lib/dummy-data";
import { Tagline } from "@/components/logo";
import { Card, CardContent } from "@/components/ui/card";
import type { Poll } from "@/lib/types";

export default function HomePage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  useEffect(() => {
    // Filter for two-option swipeable polls for the main feed demo
    setPolls(dummyPolls.filter(p => p.options.length === 2 && !p.videoUrl));
  }, []);

  useEffect(() => {
    // Reset vote status when the poll changes
    setHasVoted(false);
  }, [activeIndex]);

  const handleVote = (pollId: number, optionIndex: number) => {
    setPolls(currentPolls =>
      currentPolls.map(p => {
        if (p.id === pollId && p.options[optionIndex]) {
          const newOptions = [...p.options];
          newOptions[optionIndex] = {
            ...newOptions[optionIndex],
            votes: newOptions[optionIndex].votes + 1,
          };
          return { ...p, options: newOptions };
        }
        return p;
      })
    );
  };

  const handleSwipe = (direction: "left" | "right") => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSwipeDirection(direction);

    // After a delay to allow the exit animation to start, update the state.
    setTimeout(() => {
      if (hasVoted) {
        // If already voted, swiping again moves to the next poll
        setActiveIndex((prevIndex) => (prevIndex + 1) % (polls.length || 1));
      } else {
        // If it's the first swipe, it's a vote
        const optionIndex = direction === "right" ? 1 : 0;
        const currentPoll = polls[activeIndex];
        if (currentPoll) {
          handleVote(currentPoll.id, optionIndex);
        }
        setHasVoted(true);
      }
      // Update the key to trigger the enter animation of the new/updated card
      setCardKey(prev => prev + 1);
    }, 700); // Data update occurs at 700ms

    setTimeout(() => {
      setIsAnimating(false);
      setSwipeDirection(null);
    }, 800); // Scroll lock persists for 800ms
  };
  
  useEffect(() => {
    if (isAnimating) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAnimating]);

  const currentPoll = polls[activeIndex];

  return (
    <div className="container mx-auto flex flex-col items-center pt-4 h-[calc(100vh-8rem)]">
      <Tagline className="mb-4" />
      <div className="relative flex-1 w-full flex items-center justify-center">
        {polls.length > 0 ? (
          <AnimatePresence initial={false} custom={swipeDirection}>
            {currentPoll && (
              <PollCard
                key={cardKey}
                poll={currentPoll}
                onSwipe={handleSwipe}
                isTwoOptionPoll={true}
                showResults={hasVoted}
                custom={swipeDirection}
              />
            )}
          </AnimatePresence>
        ) : (
          <Card>
            <CardContent className="p-8">
              <p>Loading polls...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
