
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Database, Settings, ArrowRight } from "lucide-react";
import Link from "next/link";


export default function DashboardPage() {
    
  return (
    <div className="space-y-8">
       <section className="mb-8">
            <h1 className="text-3xl font-bold font-heading">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your new live data dashboard.</p>
       </section>

        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-3">
                 <Card>
                    <CardHeader>
                        <CardTitle>Getting Started</CardTitle>
                        <CardDescription>This is your main dashboard area. We will build out your custom data visualizations here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>The left sidebar contains your live data feeds. We will make these customizable and interactive next.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
