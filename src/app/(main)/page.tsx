
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RecentAnalyses } from "@/components/recent-analyses";
import { PlusCircle, Database, Settings, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { SwipeDeck } from "@/components/swipe-deck";


export default function DashboardPage() {
    
  return (
    <div className="container mx-auto py-8">
       <section className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-heading">Welcome Back</h1>
            <p className="text-muted-foreground">Here's a snapshot of your strategic landscape.</p>
       </section>

        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Pending Decisions</CardTitle>
                        <CardDescription>Swipe to triage your latest analyses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SwipeDeck />
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                         <Button asChild className="w-full justify-start">
                            <Link href="/create">
                                <PlusCircle className="mr-2 h-4 w-4" /> New Decision Analysis
                            </Link>
                        </Button>
                         <Button asChild variant="secondary" className="w-full justify-start">
                            <Link href="/data-sources">
                                <Database className="mr-2 h-4 w-4" /> Manage Data Sources
                            </Link>
                        </Button>
                         <Button asChild variant="secondary" className="w-full justify-start">
                            <Link href="/settings">
                                <Settings className="mr-2 h-4 w-4" /> View All Settings
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
                <RecentAnalyses />
                 <Card>
                    <CardHeader>
                        <CardTitle>Data Health Summary</CardTitle>
                        <CardDescription>Status of your integrated sources.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-1">
                       <Link href="/data-sources" className="block p-2 -m-2 rounded-lg hover:bg-accent transition-colors">
                           <div className="flex justify-between items-center">
                               <span>CRM Data</span>
                               <span className="text-sm font-semibold text-green-500">Connected</span>
                           </div>
                       </Link>
                       <Link href="/data-sources" className="block p-2 -m-2 rounded-lg hover:bg-accent transition-colors">
                           <div className="flex justify-between items-center mt-1">
                               <span>ERP System</span>
                               <span className="text-sm font-semibold text-green-500">Connected</span>
                           </div>
                        </Link>
                        <Link href="/data-sources" className="block p-2 -m-2 rounded-lg hover:bg-accent transition-colors">
                            <div className="flex justify-between items-center mt-1">
                               <span>Financial Reports</span>
                               <span className="text-sm font-semibold text-yellow-500">Syncing...</span>
                           </div>
                        </Link>
                    </CardContent>
                    <CardFooter>
                         <Button asChild variant="ghost" size="sm" className="w-full">
                            <Link href="/data-sources">
                                Manage All Sources <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
  );
}
