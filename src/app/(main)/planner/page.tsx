
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TodoList } from "@/components/todo-list";
import { CheckSquare } from "lucide-react";

export default function PlannerPage() {
  return (
    <div className="space-y-8">
       <header>
            <h1 className="text-4xl font-bold font-heading mb-2">Plan Smarter, Succeed Faster.</h1>
            <p className="text-muted-foreground max-w-2xl">Organize product launches, allocate resources, and track progress with AI-driven suggestions.</p>
       </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <CheckSquare className="w-5 h-5" />
                            To-Do List
                        </CardTitle>
                        <CardDescription>Your tasks and strategic initiatives.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TodoList />
                    </CardContent>
                </Card>
            </div>
            <aside className="lg:col-span-1 space-y-6">
                {/* Future planner components like a calendar or notes can go here */}
            </aside>
        </div>
    </div>
  );
}
