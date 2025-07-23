
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TodoList } from "@/components/todo-list";
import { CrmTaskList } from "@/components/crm-task-list";
import { CheckSquare, Briefcase } from "lucide-react";

export default function PlannerPage() {
  return (
    <div className="space-y-8">
       <header>
            <h1 className="text-4xl font-bold font-heading mb-2">Plan Smarter, Succeed Faster.</h1>
            <p className="text-muted-foreground max-w-2xl">Organize product launches, allocate resources, and track progress with AI-driven suggestions.</p>
       </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <CheckSquare className="w-5 h-5" />
                            Internal To-Do List
                        </CardTitle>
                        <CardDescription>Your personal tasks and strategic initiatives for Pollitago.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TodoList />
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Briefcase className="w-5 h-5" />
                            CRM Tasks
                        </CardTitle>
                        <CardDescription>Tasks synced from your connected HubSpot account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CrmTaskList />
                    </CardContent>
                </Card>
            </aside>
        </div>
    </div>
  );
}
