
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PollCard } from "@/components/poll-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Poll } from "@/lib/types";

export default function PollFeed() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const q = query(
          collection(db, "polls"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Poll[];

        setPolls(data);
      } catch (err: any) {
        console.error("Error loading polls:", err);
        setError("Failed to load polls. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 px-4 py-6">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (polls.length === 0) {
    return <p className="text-center text-muted-foreground">No polls found.</p>;
  }

  return (
    <div className="space-y-6 px-4 py-6">
      {polls.map((poll) => {
        const isTwoOptionPoll = poll.options.length === 2 && poll.type === 'standard';
        return (
          <PollCard 
            key={poll.id} 
            poll={poll} 
            onVote={() => {}} 
            onSwipe={() => {}} 
            showResults={true}
            isTwoOptionPoll={isTwoOptionPoll} 
          />
        )
      })}
      <p className="text-center text-muted-foreground text-sm">
        You’ve reached the end of the polls.
      </p>
    </div>
  );
}
