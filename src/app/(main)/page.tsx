
import { RecentAnalyses } from "@/components/recent-analyses";
import { SwipeDeck } from "@/components/swipe-deck";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export default function DashboardPage() {
    
  return (
    <div className="space-y-8">
       <section>
            <h1 className="text-3xl font-bold font-heading">Dashboard</h1>
            <p className="text-muted-foreground">Your command center for strategic decisions.</p>
       </section>

        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
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
            </div>

            <div className="lg:col-span-1">
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
