
import { RecentAnalyses } from "@/components/recent-analyses";
import { SwipeDeck } from "@/components/swipe-deck";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";


export default function DashboardPage() {
    
  return (
    <div className="space-y-8">
       <section className="p-8 rounded-lg bg-gradient-to-r from-primary/10 to-background border border-primary/20 text-center">
            <h1 className="text-4xl font-bold font-heading mb-2">Transform Indecision into Action</h1>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">Welcome to your command center. Start by defining a strategic question below to receive an unbiased, data-driven analysis from Pollitago.</p>
            <Button asChild size="lg">
              <Link href="/create">
                Start New Analysis <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
       </section>

        <div className="grid grid-cols-1 gap-6">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Decisions</CardTitle>
                        <CardDescription>Review and action newly generated analyses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <SwipeDeck />
                    </CardContent>
                </Card>
                 <RecentAnalyses />
                 <Card>
                    <CardHeader>
                        <CardTitle>Team Insights</CardTitle>
                        <CardDescription>Activity from your organization.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder for future team activity feed */}
                        <p className="text-sm text-muted-foreground">Team activity feed coming soon.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
