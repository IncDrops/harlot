
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PollCard } from "@/components/PollCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Poll } from "@/lib/types";

export default function PollFeed() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [endReached, setEndReached] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchPolls = useCallback(async (initial = false) => {
    try {
      const pollsCollection = collection(db, "polls");
      const constraints = [orderBy("createdAt", "desc"), limit(10)];
      if (lastDoc && !initial) {
        constraints.push(startAfter(lastDoc));
      }
      
      const pollQuery = query(pollsCollection, ...constraints);
      const snapshot = await getDocs(pollQuery);

      const newPolls = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Poll[];

      if (initial) {
        setPolls(newPolls);
      } else {
        setPolls((prev) => [...prev, ...newPolls]);
      }

      if (snapshot.docs.length < 10) {
        setEndReached(true);
      } else {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
    } catch (err) {
      console.error("Failed to load polls:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [lastDoc]);

  useEffect(() => {
    fetchPolls(true);
  }, []); // Changed dependency to empty to only run on mount

  useEffect(() => {
    if (loading || endReached) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true);
          fetchPolls();
        }
      },
      { threshold: 1.0 }
    );

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [fetchPolls, loadingMore, endReached, loading]);

  // Dummy handlers to make component functional
  const handleVote = (pollId: string, optionId: number) => {
    console.log(`Voted on poll ${pollId} for option ${optionId}`);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    console.log(`Swiped ${direction}`);
  };

  return (
    <div className="space-y-6 px-4 py-6">
      {loading && (
        <>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </>
      )}

      {!loading && polls.length === 0 && (
        <p className="text-center text-muted-foreground">No polls found.</p>
      )}

      {polls.map((poll) => {
         const isTwoOptionPoll = poll.options.length === 2 && poll.type === 'standard';
         return (
             <PollCard
                key={poll.id}
                poll={poll}
                onVote={handleVote}
                onSwipe={handleSwipe}
                showResults={false} // Default to not showing results
                isTwoOptionPoll={isTwoOptionPoll}
              />
         )
      })}

      <div ref={observerRef}></div>

      {loadingMore && (
        <div className="text-center text-muted-foreground text-sm">
          Loading more polls...
        </div>
      )}

      {!loading && endReached && polls.length > 0 && (
        <p className="text-center text-muted-foreground text-sm">
          You’ve reached the end of the polls.
        </p>
      )}
    </div>
  );
}
