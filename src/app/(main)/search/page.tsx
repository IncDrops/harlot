
"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search as SearchIcon, FileSearch, Loader2 } from "lucide-react";
import { searchAnalyses } from "@/lib/firebase";
import type { Analysis } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { AnalysisCard } from "@/components/analysis-card";
import { useAuth } from "@/contexts/auth-context";


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
  const [results, setResults] = useState<Analysis[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const performSearch = async (term: string) => {
    if (!user || term.trim().length < 3) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const analyses = await searchAnalyses(user.uid, term);
      setResults(analyses);
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

  const debouncedSearch = useCallback(debounce(performSearch, 500), [user]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim().length >= 3) {
      setIsSearching(true);
      debouncedSearch(term);
    } else {
      setIsSearching(false);
      setResults([]);
    }
  };
  
  useEffect(() => {
    // Clear results if user logs out
    if(!user) {
      setResults([]);
      setSearchTerm("");
    }
  }, [user]);

  return (
    <div className="container mx-auto py-8">
      <div className="relative mb-8 max-w-2xl mx-auto">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search analyses by name, type, or keyword..."
          className="pl-12 text-lg h-14 rounded-full bg-secondary border-primary/20 focus-visible:ring-primary/40"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />}
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
           <CardDescription>
                {isSearching ? "Searching..." : searchTerm.length >= 3 ? `Showing ${results.length} results for "${searchTerm}"` : "Enter at least 3 characters to begin search."}
            </CardDescription>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map(analysis => (
                <AnalysisCard key={analysis.id} analysis={analysis} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-60 text-muted-foreground rounded-lg border-2 border-dashed border-muted">
                <FileSearch className="w-12 h-12 mb-4 text-muted-foreground/50"/>
              <p className="font-semibold">
                {searchTerm.length >= 3 && !isSearching
                  ? "No Results Found"
                  : "Find Past Analyses"}
              </p>
              <p className="text-sm text-center">
                 {searchTerm.length >= 3 && !isSearching
                  ? "Try a different search term to find what you're looking for."
                  : "Start typing to search for specific decisions, topics, or keywords."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
