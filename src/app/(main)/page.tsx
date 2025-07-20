
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentAnalyses } from "@/components/recent-analyses";
import { PlusCircle, Database, Settings } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";


export default function DashboardPage() {
    
  return (
    <div className="container mx-auto py-8">
       <section className="mb-8">
            <h1 className="text-3xl font-bold font-heading">Welcome Back</h1>
            <p className="text-muted-foreground">Here's a snapshot of your strategic landscape.</p>
       </section>

        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <RecentAnalyses />
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
                            <Link href="#">
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
                 <Card>
                    <CardHeader>
                        <CardTitle>Data Health Summary</CardTitle>
                        <CardDescription>Status of your integrated sources.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="flex justify-between items-center">
                           <span>CRM Data</span>
                           <span className="text-green-500 font-semibold">Connected</span>
                       </div>
                       <div className="flex justify-between items-center mt-2">
                           <span>ERP System</span>
                           <span className="text-green-500 font-semibold">Connected</span>
                       </div>
                        <div className="flex justify-between items-center mt-2">
                           <span>Financial Reports</span>
                           <span className="text-yellow-500 font-semibold">Syncing...</span>
                       </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
