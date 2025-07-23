
"use client";

import { useEffect, useState } from "react";
import { RecentAnalyses } from "@/components/recent-analyses";
import { SwipeDeck } from "@/components/swipe-deck";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckSquare, Zap } from "lucide-react";
import { TodoList } from "@/components/todo-list";
import { Skeleton } from "@/components/ui/skeleton";


export default function DashboardPage() {
    
  return (
    <div className="space-y-8">
       <section className="p-8 rounded-lg bg-gradient-to-r from-primary/10 to-background border border-primary/20 text-center">
            <h1 className="text-4xl font-bold font-heading mb-2">Your AI Second Opinion, Always On.</h1>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">Monitor markets, assess risks, and plan smarter with Pollitago’s intuitive dashboard.</p>
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
                 <Card className="bg-secondary/20 border-secondary/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Zap className="text-secondary" /> Unlock Your Full Potential</CardTitle>
                        <CardDescription>Upgrade your plan to access advanced features like CRM integration, live analytics, and custom data sources.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="secondary">
                            <Link href="/pricing">
                                Upgrade to Pro
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <aside className="lg:col-span-1 space-y-6">
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
