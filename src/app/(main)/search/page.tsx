
"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search as SearchIcon } from "lucide-react";
import { searchPolls } from "@/lib/firebase";
import { PollCard } from "@/components/poll-card";
import type { Poll } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// Debounce function
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Poll[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const performSearch = async (term: string) => {
    if (term.trim().length < 3) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const filteredPolls = await searchPolls(term);
      setResults(filteredPolls);
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "Could not perform search. Please check your connection.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(debounce(performSearch, 500), []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="relative mb-8">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search polls by keyword (3+ chars)..."
          className="pl-10 text-lg h-12 rounded-full shadow-lg"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          {isSearching ? (
             <div className="flex items-center justify-center h-48 text-muted-foreground">
                <p>Searching...</p>
             </div>
          ) : results.length > 0 ? (
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
                    showResults={true} // Always show results for searched polls
                  />
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <p>
                {searchTerm.length >= 3
                  ? "No results found."
                  : "Start typing to find polls."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
