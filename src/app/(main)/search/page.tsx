"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search as SearchIcon } from "lucide-react";
// import { searchAnalyses } from "@/lib/firebase"; // This will need to be created
import type { Analysis } from "@/lib/types";
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
  const [results, setResults] = useState<Analysis[]>([]);
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
      // const analyses = await searchAnalyses(term);
      // setResults(analyses);
      // Mock results for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResults([]); 
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
    setIsSearching(true);
    debouncedSearch(term);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="relative mb-8 max-w-2xl mx-auto">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search analyses by name, type, or keyword..."
          className="pl-10 text-lg h-12 rounded-lg"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
           <CardDescription>
                {isSearching ? "Searching for analyses..." : searchTerm ? `Showing results for "${searchTerm}"` : "Your past analyses will appear here."}
            </CardDescription>
        </CardHeader>
        <CardContent>
          {isSearching ? (
             <div className="flex items-center justify-center h-48 text-muted-foreground">
                <p>Searching...</p>
             </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {/* {results.map(analysis => (
                // Analysis result card component will go here
              ))} */}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground rounded-lg border-2 border-dashed">
                <SearchIcon className="w-12 h-12 mb-4 text-muted-foreground/50"/>
              <p>
                {searchTerm.length >= 3
                  ? "No results found."
                  : "Start typing to find past analyses."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
