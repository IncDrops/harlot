
"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart2, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function UpgradePrompt() {
    return (
        <Card className="bg-secondary/20 border-secondary/30 text-center max-w-2xl mx-auto">
            <CardHeader>
                <Zap className="h-12 w-12 mx-auto text-secondary mb-2" />
                <CardTitle className="font-heading text-2xl">Unlock Actionable Insights</CardTitle>
                <CardDescription>Upgrade your plan to connect Google Analytics and leverage AI to analyze market trends and risks.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild variant="secondary">
                    <Link href="/pricing">
                        View Pricing Plans
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}


export default function AnalyticsPage() {
    const { profile, loading } = useAuth();

    if (loading) {
        return (
             <div className="space-y-8">
                <header>
                    <Skeleton className="h-10 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                </header>
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <Skeleton className="h-8 w-1/3 mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-40" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    const canAccessFeature = profile?.role === 'admin';

  return (
    <div className="space-y-8">
       <header>
            <h1 className="text-4xl font-bold font-heading mb-2">Actionable Insights at Your Fingertips.</h1>
            <p className="text-muted-foreground max-w-2xl">Integrate Google Analytics and leverage AI to analyze market trends and risks.</p>
       </header>

       {!canAccessFeature ? (
            <UpgradePrompt />
       ) : (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart2 className="w-5 h-5" />
                        Google Analytics
                    </CardTitle>
                    <CardDescription>Connect your Google Analytics account to see your data here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button disabled>Connect Your Analytics</Button>
                    <p className="text-xs text-muted-foreground mt-2">
                        Note: Full connection flow is coming soon.
                    </p>
                </CardContent>
            </Card>
       )}
    </div>
  );
}
