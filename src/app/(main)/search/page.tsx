"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search as SearchIcon } from "lucide-react";
import { dummyPolls } from "@/lib/dummy-data";
import { PollCard } from "@/components/poll-card";
import type { Poll } from "@/lib/types";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Poll[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === "") {
      setResults([]);
      return;
    }

    const filteredPolls = dummyPolls.filter(poll =>
      poll.question.toLowerCase().includes(term.toLowerCase())
    );
    setResults(filteredPolls);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="relative mb-8">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search polls, users, or tags..."
          className="pl-10 text-lg h-12 rounded-full shadow-lg"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <div className="space-y-6">
              {results.map(poll => {
                const isTwoOptionPoll = poll.options.length === 2 && poll.type === 'standard';
                return (
                  <PollCard 
                    key={poll.id} 
                    poll={poll} 
                    onSwipe={() => {}} 
                    onVote={() => {}}
                    isTwoOptionPoll={isTwoOptionPoll} 
                    showResults={true}
                  />
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <p>
                {searchTerm
                  ? "No results found."
                  : "Start typing to find polls and users."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
