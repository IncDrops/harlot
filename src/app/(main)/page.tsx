
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PollCard } from "@/components/PollCard";
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
import { getPolls } from "@/lib/firebase";
import type { QueryDocumentSnapshot } from "firebase/firestore";
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const [votedStates, setVotedStates] = useState<{ [key: string]: boolean }>({});
  const [cardKeys, setCardKeys] = useState<{ [key: string]: number }>({});
  const [swipeDirections, setSwipeDirections] = useState<{ [key: string]: "left" | "right" | null }>({});
  
  const [isAnimating, setIsAnimating] = useState(false);
  const observer = useRef<IntersectionObserver>();

  const [monetizationLockAlert, setMonetizationLockAlert] = useState<{ poll: Poll; optionId: number; onConfirm: () => void; } | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const loadMorePolls = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
        const { polls: newPolls, lastVisible: newLastVisible } = await getPolls(lastVisible);
        
        setPolls(prev => {
            const allPolls = [...prev, ...newPolls];
            const pollMap = new Map(allPolls.map(p => [p.id, p]));
            return Array.from(pollMap.values());
        });
        
        setLastVisible(newLastVisible);

        if (newPolls.length < 10) {
            setHasMore(false);
        }
    } catch (error: any) {
        console.error("Failed to load polls:", error);
        setLoadingError(error.message || "An unknown error occurred. Check Firestore rules and indexes.");
        setHasMore(false);
    } finally {
        setIsLoading(false);
    }
  }, [isLoading, hasMore, lastVisible]);
  
  useEffect(() => {
    if(!polls.length) {
        loadMorePolls();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial load

  useEffect(() => {
    if(polls.length > 0 && isInitialLoad) {
      setTimeout(() => setIsInitialLoad(false), polls.length * 100 + 500);
    }
  }, [polls.length, isInitialLoad]);

  const lastPollElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePolls();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadMorePolls]);

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

  const performVote = (pollId: string, optionId: number) => {
     setPolls(currentPolls =>
        currentPolls.map(p => {
          if (p.id === pollId && Array.isArray(p.options)) {
            const newOptions = [...p.options];
            const optIndex = newOptions.findIndex(o => o.id === optionId);
            if(optIndex !== -1) {
               newOptions[optIndex] = {
                ...newOptions[optIndex],
                votes: newOptions[optIndex].votes + 1,
              };
               const newLikes = p.likes + 1;
               return { ...p, options: newOptions, likes: newLikes };
            }
          }
          return p;
        })
      );
  }

  const handleVote = (pollId: string, optionId: number) => {
    if (!user) {
      router.push('/signin');
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in or create an account to vote.",
      });
      return;
    }

    const poll = polls.find(p => p.id === pollId);
    if (!poll || !Array.isArray(poll.options) || votedStates[pollId]) return;

    const majorityVotes = Math.max(...poll.options.map(o => o.votes), 0);
    const isLocked = poll.pledged && poll.pledgeAmount && (poll.pledgeAmount * 0.5) / (majorityVotes + 1) < 0.10;

    const voteAction = () => {
      const isTwoOptionPoll = poll.options.length === 2;
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

  const handleSwipeVote = (pollId: string, optionId: number, direction: "left" | "right") => {
    if (isAnimating || votedStates[pollId]) return;

    setIsAnimating(true);
    setSwipeDirections(prev => ({ ...prev, [pollId]: direction }));
    
    setTimeout(() => {
        performVote(pollId, optionId);
        setVotedStates(prev => ({ ...prev, [pollId]: true }));
    }, 300);
    
    setTimeout(() => {
        setCardKeys(prev => ({...prev, [pollId]: (prev[pollId] || 0) + 1 }));
        setSwipeDirections(prev => ({ ...prev, [pollId]: null }));
        setIsAnimating(false);
    }, 500); 
  };

  const pollCardVariants = {
    initial: { opacity: 0, y: 50, rotate: 0 },
    shuffle: (index: number) => ({
      opacity: 0,
      x: -300,
      rotate: -10,
      transition: { delay: index * 0.1 }
    }),
    animate: (index: number) => ({
      opacity: 1,
      y: 0,
      x: 0,
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: isInitialLoad ? index * 0.1 : 0
      },
    }),
    exitLeft: { x: "-120%", opacity: 0, rotate: -15, transition: { duration: 0.4, ease: "easeIn" } },
    exitRight: { x: "120%", opacity: 0, rotate: 15, transition: { duration: 0.4, ease: "easeIn" } },
  };

  return (
    <>
    <div className="container mx-auto py-8 px-2 sm:px-4">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <AnimatePresence>
            {polls.map((poll, index) => {
            if (!poll || !Array.isArray(poll.options) || poll.options.length === 0) {
              return null;
            }

            const isLastElement = polls.length === index + 1;
            const hasVoted = votedStates[poll.id] || false;
            const isTwoOptionPoll = poll.options.length === 2;
            const swipeDirection = swipeDirections[poll.id];

            return (
                <motion.div 
                    ref={isLastElement ? lastPollElementRef : null} 
                    key={`${poll.id}-${cardKeys[poll.id] || 0}`}
                    custom={index}
                    variants={pollCardVariants}
                    initial={isInitialLoad ? "shuffle" : "initial"}
                    animate={"animate"}
                    exit={swipeDirection === 'left' ? 'exitLeft' : swipeDirection === 'right' ? 'exitRight' : undefined}
                >
                    <PollCard
                        poll={poll}
                        onVote={handleVote}
                        onSwipe={(direction) => {
                            if (!isTwoOptionPoll || hasVoted || !poll.options) {
                            return;
                            }
                            const optionId = poll.options[direction === 'left' ? 0 : 1].id;
                            handleVote(poll.id, optionId);
                        }}
                        showResults={hasVoted}
                        isTwoOptionPoll={isTwoOptionPoll}
                    />
                </motion.div>
            )
            })}
        </AnimatePresence>
        {isLoading && (
           <Card>
            <CardContent className="p-8">
              <p>Loading more polls...</p>
            </CardContent>
          </Card>
        )}
         {!hasMore && !isLoading && polls.length === 0 && !loadingError && (
            <Card>
                <CardContent className="p-8 text-center">
                    <p>There are no polls yet. Create one!</p>
                </CardContent>
            </Card>
        )}
         {!hasMore && !isLoading && polls.length > 0 && (
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
            if(monetizationLockAlert) {
                monetizationLockAlert.onConfirm();
                setMonetizationLockAlert(null);
            }
          }}>Vote Anyway</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <AlertDialog open={!!loadingError} onOpenChange={() => setLoadingError(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Error Loading Polls</AlertDialogTitle>
          <AlertDialogDescription>
            There was a problem fetching data from the database. This is often caused by a missing Firestore index. Please check your browser's developer console for a link to create the required index.
            <br/><br/>
            <strong className="break-words">Error details:</strong> {loadingError}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setLoadingError(null)}>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
