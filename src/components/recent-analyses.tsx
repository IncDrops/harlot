
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalysisCard } from "./analysis-card";
import type { Analysis } from "@/lib/types";
import Link from 'next/link';
import { Button } from "./ui/button";
import { ArrowRight, Info } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { getRecentAnalysesForUser } from "@/lib/firebase";
import { Skeleton } from "./ui/skeleton";

export function RecentAnalyses() {
    const { user, loading: authLoading } = useAuth();
    const [analyses, setAnalyses] = useState<Analysis[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            setAnalyses([]);
            return;
        }

        async function fetchAnalyses() {
            try {
                // Fetch completed analyses for the "recent" list
                const recentAnalyses = await getRecentAnalysesForUser(user!.uid, 5, 'completed');
                setAnalyses(recentAnalyses);
            } catch (error) {
                console.error("Failed to fetch recent analyses", error);
            } finally {
                setLoading(false);
            }
        }

        fetchAnalyses();
    }, [user, authLoading]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>Review the latest insights generated.</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
            <Link href="/search">
                View All <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </>
          ) : analyses.length > 0 ? (
             analyses.map((analysis) => (
                <AnalysisCard key={analysis.id} analysis={analysis} />
             ))
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground bg-muted/50 rounded-lg">
                <Info className="w-8 h-8 mb-2" />
                <p className="font-semibold">No Recent Analyses</p>
                <p className="text-sm">{user ? "Start and approve an analysis to see it here." : "Sign in to view your activity."}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
