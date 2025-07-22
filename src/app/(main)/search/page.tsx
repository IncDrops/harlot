
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search as SearchIcon, FileSearch, Loader2 } from "lucide-react";
import { searchAnalyses } from "@/lib/firebase";
import type { Analysis } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { AnalysisCard } from "@/components/analysis-card";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";


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
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastDocId = useRef<string | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();
  const observer = useRef<IntersectionObserver | null>(null);

  const resetSearch = () => {
      setResults([]);
      lastDocId.current = null;
      setHasMore(true);
  }

  const performSearch = async (term: string, cursor?: string | null) => {
    if (!user || term.trim().length < 3) {
      resetSearch();
      return;
    }

    if(cursor) {
      setIsFetchingMore(true);
    } else {
      setIsSearching(true);
      resetSearch();
    }
    
    try {
      const { analyses, lastVisibleId } = await searchAnalyses(user.uid, term, cursor);
      if(analyses.length === 0) {
        setHasMore(false);
      } else {
        setResults(prev => cursor ? [...prev, ...analyses] : analyses);
        lastDocId.current = lastVisibleId;
      }
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        variant: "destructive",
        title: "Search Error",
        description: "Could not perform search. Please check your connection.",
      });
    } finally {
      setIsSearching(false);
      setIsFetchingMore(false);
    }
  };

  const debouncedSearch = useCallback(debounce(performSearch, 500), [user]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim().length >= 3) {
      debouncedSearch(term);
    } else {
      setIsSearching(false);
      resetSearch();
    }
  };
  
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
      if (isFetchingMore || !hasMore) return;
      if(observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(entries => {
          if(entries[0].isIntersecting && hasMore && searchTerm.trim().length >= 3) {
              performSearch(searchTerm, lastDocId.current);
          }
      });
      if(node) observer.current.observe(node);

  }, [isFetchingMore, hasMore, searchTerm, user]);

  useEffect(() => {
    // Clear results if user logs out
    if(!user) {
      setSearchTerm("");
      resetSearch();
    }
  }, [user]);

  const showInitialMessage = searchTerm.length < 3 && !isSearching;
  const showNoResults = !isSearching && !isFetchingMore && results.length === 0 && searchTerm.length >= 3;
  const showResults = results.length > 0;
  
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
                {isSearching ? "Searching..." : showNoResults ? `No results found for "${searchTerm}"` : `Enter at least 3 characters to begin search.`}
            </CardDescription>
        </CardHeader>
        <CardContent>
          {isSearching && !showResults ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : showResults ? (
            <div className="space-y-4">
              {results.map((analysis, index) => {
                  if(results.length === index + 1) {
                      return <div ref={lastElementRef} key={analysis.id}><AnalysisCard analysis={analysis} /></div>
                  }
                  return <AnalysisCard key={analysis.id} analysis={analysis} />
              })}
               {isFetchingMore && (
                 <>
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                 </>
               )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-60 text-muted-foreground rounded-lg border-2 border-dashed border-muted">
                <FileSearch className="w-12 h-12 mb-4 text-muted-foreground/50"/>
              <p className="font-semibold">
                {showInitialMessage ? "Find Past Analyses" : "No Results Found"}
              </p>
              <p className="text-sm text-center">
                 {showInitialMessage ? "Start typing to search for specific decisions, topics, or keywords." : "Try a different search term to find what you're looking for."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
