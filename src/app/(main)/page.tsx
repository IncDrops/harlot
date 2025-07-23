
"use client";

import { useEffect, useState } from "react";
import { RecentAnalyses } from "@/components/recent-analyses";
import { SwipeDeck } from "@/components/swipe-deck";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Calendar as CalendarIcon, CheckSquare } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { TodoList } from "@/components/todo-list";
import { Skeleton } from "@/components/ui/skeleton";


export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
    
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
            <aside className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5" />
                            Calendar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        {isClient ? (
                            <Calendar
                                mode="single"
                                className="p-0"
                             />
                        ) : (
                            <Skeleton className="w-[280px] h-[330px]" />
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <CheckSquare className="w-5 h-5" />
                            To-Do List
                        </CardTitle>
                        <CardDescription>Your tasks for today.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TodoList />
                    </CardContent>
                </Card>
            </aside>
        </div>
    </div>
  );
}
