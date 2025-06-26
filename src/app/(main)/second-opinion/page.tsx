"use client";
import { useState, useEffect } from "react";
import { PollCard } from "@/components/poll-card";
import { dummyPolls } from "@/lib/dummy-data";
import type { Poll } from "@/lib/types";

export default function SecondOpinionPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  
  useEffect(() => {
    setPolls(dummyPolls.filter(p => p.type === '2nd_opinion'));
  }, []);

  const handleVote = (pollId: number, optionId: number) => {
    console.log(`Voted for option ${optionId} on poll ${pollId}`);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold font-headline mb-4">2nd Opinion Feed</h1>
      <p className="text-muted-foreground mb-8">
        Crucial decisions need a second opinion. Vote to help others out.
      </p>
      <div className="space-y-6">
        {polls.map(poll => (
          <PollCard 
            key={poll.id} 
            poll={poll} 
            onVote={handleVote}
            onSwipe={() => {}} 
            isTwoOptionPoll={false}
          />
        ))}
      </div>
    </div>
  );
}
