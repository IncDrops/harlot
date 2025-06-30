
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PollCard } from "@/components/poll-card";
import { dummyPolls } from "@/lib/dummy-data";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import type { Poll } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

const POLLS_PER_PAGE = 10;

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const [votedStates, setVotedStates] = useState<{ [key: number]: boolean }>({});
  const [cardKeys, setCardKeys] = useState<{ [key: number]: number }>({});
  const [swipeDirections, setSwipeDirections] = useState<{ [key: number]: "left" | "right" | null }>({});
  
  const [isAnimating, setIsAnimating] = useState(false);
  const observer = useRef<IntersectionObserver>();

  const [monetizationLockAlert, setMonetizationLockAlert] = useState<{ poll: Poll; optionId: number; onConfirm: () => void; } | null>(null);

  const loadMorePolls = useCallback(() => {
    if (!hasMore) return;
    const newPolls = dummyPolls.slice(0, (page + 1) * POLLS_PER_PAGE);
    if (newPolls.length >= dummyPolls.length) {
      setHasMore(false);
    }
    setPolls(newPolls);
    setPage(prev => prev + 1);
  }, [page, hasMore]);
  
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

  const performVote = (pollId: number, optionId: number) => {
     setPolls(currentPolls =>
        currentPolls.map(p => {
          if (p.id === pollId) {
            const newOptions = [...p.options];
            const optIndex = newOptions.findIndex(o => o.id === optionId);
            if(optIndex !== -1) {
               newOptions[optIndex] = {
                ...newOptions[optIndex],
                votes: newOptions[optIndex].votes + 1,
              };
               // Also update likes for engagement
               const newLikes = p.likes + 1;
               return { ...p, options: newOptions, likes: newLikes };
            }
          }
          return p;
        })
      );
  }

  const handleVote = (pollId: number, optionId: number) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in or create an account to vote.",
      });
      return;
    }

    const poll = polls.find(p => p.id === pollId);
    if (!poll || votedStates[pollId]) return;

    const majorityVotes = Math.max(...poll.options.map(o => o.votes), 0);
    const isLocked = poll.pledged && poll.pledgeAmount && (poll.pledgeAmount * 0.5) / (majorityVotes + 1) < 0.10;

    const voteAction = () => {
      const isTwoOptionPoll = poll.options.length === 2 && poll.type === 'standard';
      if (isTwoOptionPoll) {
        const direction = poll.options.findIndex(o => o.id === optionId) === 0 ? 'left' : 'right';
        handleSwipeVote(pollId, optionId, direction);
      } else {
        performVote(pollId, optionId);
        setVotedStates(prev => ({ ...prev, [pollId]: true }));
      }
    };
    
    if (isLocked) {
      setMonetizationLockAlert({ poll, optionId, onConfirm: voteAction });
    } else {
      voteAction();
    }
  };


  const handleSwipeVote = (pollId: number, optionId: number, direction: "left" | "right") => {
    if (isAnimating || votedStates[pollId]) return;

    setIsAnimating(true);
    setSwipeDirections(prev => ({ ...prev, [pollId]: direction }));
    
    // Perform vote after a delay to allow animation to start
    setTimeout(() => {
        performVote(pollId, optionId);
        setVotedStates(prev => ({ ...prev, [pollId]: true }));
    }, 700);
    
    // Lock scroll and reset card after animation completes
    setTimeout(() => {
        setSwipeDirections(prev => ({ ...prev, [pollId]: null }));
        setCardKeys(prev => ({...prev, [pollId]: (prev[pollId] || 0) + 1 }));
        setIsAnimating(false);
    }, 800);
  };

  return (
    <>
    <div className="container mx-auto py-8 px-2 sm:px-4">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {polls.map((poll, index) => {
           const isLastElement = polls.length === index + 1;
           const hasVoted = votedStates[poll.id] || false;
           const isTwoOptionPoll = poll.options.length === 2 && poll.type === 'standard';
           return (
            <div ref={isLastElement ? lastPollElementRef : null} key={`${poll.id}-${cardKeys[poll.id] || 0}`}>
                <PollCard
                  poll={poll}
                  onVote={handleVote}
                  onSwipe={(direction) => {
                    if (!isTwoOptionPoll || hasVoted) {
                      return;
                    }
                    const optionId = poll.options[direction === 'left' ? 0 : 1].id;
                    handleVote(poll.id, optionId);
                  }}
                  showResults={hasVoted}
                  isTwoOptionPoll={isTwoOptionPoll}
                  custom={swipeDirections[poll.id]}
                />
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
    <AlertDialog open={!!monetizationLockAlert} onOpenChange={() => setMonetizationLockAlert(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Vote Monetization Locked</AlertDialogTitle>
          <AlertDialogDescription>
            The potential payout for this vote is less than $0.10. Your vote will still be counted, but it won't be eligible for a monetary reward.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setMonetizationLockAlert(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => {
            monetizationLockAlert?.onConfirm();
            setMonetizationLockAlert(null);
          }}>Vote Anyway</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
