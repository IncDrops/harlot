"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { PollCard } from "@/components/poll-card";
import { dummyPolls } from "@/lib/dummy-data";
import { Tagline } from "@/components/logo";
import { Card, CardContent } from "@/components/ui/card";
import type { Poll } from "@/lib/types";

const POLLS_PER_PAGE = 10;

export default function HomePage() {
  const allSwipeablePolls = useMemo(() => dummyPolls.filter(p => p.options.length === 2 && !p.videoUrl), []);
  
  const [polls, setPolls] = useState<Poll[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [loadedAll, setLoadedAll] = useState(false);

  useEffect(() => {
    // Initial load
    setPolls(allSwipeablePolls.slice(0, POLLS_PER_PAGE));
    if (allSwipeablePolls.length <= POLLS_PER_PAGE) {
      setLoadedAll(true);
    }
  }, [allSwipeablePolls]);
  
  // Infinite scroll effect
  useEffect(() => {
    if (!loadedAll && polls.length > 0 && activeIndex >= polls.length - 3) {
      const currentLength = polls.length;
      const morePolls = allSwipeablePolls.slice(currentLength, currentLength + POLLS_PER_PAGE);

      if (morePolls.length > 0) {
        setPolls(prevPolls => [...prevPolls, ...morePolls]);
      } else {
        setLoadedAll(true);
      }
    }
  }, [activeIndex, polls, loadedAll, allSwipeablePolls]);


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
      const currentPoll = polls[activeIndex];
      if (!currentPoll) {
        setIsAnimating(false);
        return;
      }
      
      if (hasVoted) {
        // If already voted, swiping again moves to the next poll
        setActiveIndex((prevIndex) => (prevIndex + 1));
      } else {
        // If it's the first swipe, it's a vote
        // Right swipe is for the second option (index 1), Left for the first (index 0)
        // Assuming "in favor" of creator's suggestion is the second option.
        const optionIndex = direction === "right" ? 1 : 0;
        handleVote(currentPoll.id, optionIndex);
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
        {polls.length > 0 && currentPoll ? (
          <AnimatePresence initial={false} custom={swipeDirection}>
              <PollCard
                key={cardKey}
                poll={currentPoll}
                onSwipe={handleSwipe}
                isTwoOptionPoll={true}
                showResults={hasVoted}
                custom={swipeDirection}
              />
          </AnimatePresence>
        ) : loadedAll && activeIndex >= polls.length ? (
            <Card>
                <CardContent className="p-8">
                    <p>You've seen all the polls for now!</p>
                </CardContent>
            </Card>
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
