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
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right">("right");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Filter for two-option swipeable polls for the main feed demo
    setPolls(dummyPolls.filter(p => p.options.length === 2 && !p.videoUrl));
  }, []);

  const handleVote = (pollId: number, optionId: number) => {
    console.log(`Voted for option ${optionId} on poll ${pollId}`);
  };

  const handleSwipe = (direction: "left" | "right") => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSwipeDirection(direction);

    const optionIndex = direction === "right" ? 1 : 0;
    if (polls[activeIndex] && polls[activeIndex].options[optionIndex]) {
      handleVote(polls[activeIndex].id, polls[activeIndex].options[optionIndex].id);
    }
    
    setTimeout(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % polls.length);
      
      // End animation lock after full transition
      setTimeout(() => {
        setIsAnimating(false);
      }, 400); 
    }, 400);
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
                key={activeIndex}
                poll={currentPoll}
                onVote={handleVote}
                onSwipe={handleSwipe}
                isTwoOptionPoll={true}
              />
            )}
          </AnimatePresence>
        ) : (
          <Card>
            <CardContent className="p-8">
              <p>No more polls to show!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
