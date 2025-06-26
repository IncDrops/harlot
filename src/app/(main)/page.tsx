"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PollCard } from "@/components/poll-card";
import { dummyPolls } from "@/lib/dummy-data";
import { Tagline } from "@/components/logo";
import { Card, CardContent } from "@/components/ui/card";
import type { Poll } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";

const POLLS_PER_PAGE = 10;

export default function HomePage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const [votedStates, setVotedStates] = useState<{ [key: number]: boolean }>({});
  const [cardKeys, setCardKeys] = useState<{ [key: number]: number }>({});
  const [swipeDirections, setSwipeDirections] = useState<{ [key: number]: "left" | "right" | null }>({});
  
  const [isAnimating, setIsAnimating] = useState(false);
  const observer = useRef<IntersectionObserver>();
  const isMobile = useIsMobile();

  const allSwipeablePolls = dummyPolls.filter(p => p.options.length === 2);

  const loadMorePolls = useCallback(() => {
    if (!hasMore) return;
    const nextPage = page + 1;
    const newPolls = allSwipeablePolls.slice(0, nextPage * POLLS_PER_PAGE);
    if (newPolls.length >= allSwipeablePolls.length) {
      setHasMore(false);
    }
    setPolls(newPolls);
    setPage(nextPage);
  }, [page, hasMore, allSwipeablePolls]);
  
  useEffect(() => {
    loadMorePolls();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial load

  const lastPollElementRef = useCallback((node: HTMLDivElement) => {
    if (isAnimating) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePolls();
      }
    });
    if (node) observer.current.observe(node);
  }, [isAnimating, hasMore, loadMorePolls]);

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

  const handleVote = (pollId: number, optionIndex: number) => {
    setPolls(currentPolls =>
      currentPolls.map(p => {
        if (p.id === pollId) {
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

  const handleSwipe = (pollId: number, direction: "left" | "right") => {
    if (isAnimating || votedStates[pollId]) return;

    setIsAnimating(true);
    setSwipeDirections(prev => ({ ...prev, [pollId]: direction }));

    setTimeout(() => {
      const optionIndex = direction === "right" ? 1 : 0;
      handleVote(pollId, optionIndex);
      setVotedStates(prev => ({ ...prev, [pollId]: true }));
      setCardKeys(prev => ({ ...prev, [pollId]: (prev[pollId] || 0) + 1 }));
    }, 700);

    setTimeout(() => {
      setIsAnimating(false);
      setSwipeDirections(prev => ({ ...prev, [pollId]: null }));
    }, 800);
  };

  return (
    <div className="container mx-auto py-8 px-2 sm:px-4">
      <Tagline className="mb-4" />
      <div className="w-full max-w-md mx-auto space-y-6">
        {polls.map((poll, index) => {
           const isLastElement = polls.length === index + 1;
           return (
            <div ref={isLastElement ? lastPollElementRef : null} key={poll.id}>
              <AnimatePresence initial={false} custom={swipeDirections[poll.id]}>
                <PollCard
                  key={cardKeys[poll.id] || 0}
                  poll={poll}
                  onSwipe={(direction) => handleSwipe(poll.id, direction)}
                  isTwoOptionPoll={true}
                  showResults={votedStates[poll.id] || false}
                  custom={swipeDirections[poll.id]}
                />
              </AnimatePresence>
            </div>
           )
        })}
        {hasMore && (
           <Card>
            <CardContent className="p-8">
              <p>Loading more polls...</p>
            </CardContent>
          </Card>
        )}
         {!hasMore && (
            <Card>
                <CardContent className="p-8 text-center">
                    <p>You've seen all the polls for now!</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
