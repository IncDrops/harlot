
"use client";

import { ArrowRight, BrainCircuit, CheckSquare, MessageSquare, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentAnalyses } from "@/components/recent-analyses";
import { TodoList } from "@/components/todo-list";
import { TestimonialCard } from "@/components/testimonial-card";
import { LogoCloud } from "@/components/logo-cloud";

const testimonials = [
    {
        quote: "Pollitago is where we host all of our backend services along with our databases. It's been an integral part of our infrastructure since the very beginning.",
        name: "Paul O'Carroll",
        title: "Founder & CEO at Arcol",
        avatarUrl: "https://i.pravatar.cc/150?u=paulocarroll",
        companyLogoUrl: "/arcol-logo.svg"
    },
    {
        quote: "Even though we already have an internal Kubernetes cluster and infrastructure-as-code setup, we decided to go with Pollitago so that we weren't spending time writing YAML files when we could be working on the product.",
        name: "Paul Butler",
        title: "Founder, Drifting in Space",
        avatarUrl: "https://i.pravatar.cc/150?u=paulbutler",
        companyLogoUrl: "/drifting-in-space-logo.svg"
    },
    {
        quote: "The flexibility and ability for automation with Pollitago helps us move fast and continuously deploy to production with confidence.",
        name: "Saurabh Bhatia",
        title: "Engineering Manager at Paloma Group",
        avatarUrl: "https://i.pravatar.cc/150?u=saurabhbhatia",
        companyLogoUrl: "/paloma-logo.svg"
    },
    {
        quote: "Pollitago is a game changer for us. We're currently serving more than 80,000 developers with a small team... every minute spent on infrastructure is a minute we're not building the best email product in the world.",
        name: "Zeno Rocha",
        title: "CEO at Resend",
        avatarUrl: "https://i.pravatar.cc/150?u=zenorocha",
        companyLogoUrl: "/resend-logo.svg"
    }
];

export default function DashboardPage() {
    
  return (
    <div className="space-y-16 md:space-y-24 container py-12">
        <section className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading mb-4 tracking-tight">Your AI Second Opinion, Always On.</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">Monitor markets, assess risks, and plan smarter with Pollitago’s intuitive dashboard, designed for strategic decision-makers.</p>
            <div className="flex gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/create">
                    Start New Analysis <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                    <Link href="/contact">
                        Contact Sales
                    </Link>
                </Button>
            </div>
       </section>

        <LogoCloud />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
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
            <aside className="lg:col-span-1 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <CheckSquare className="w-5 h-5" />
                            To-Do List
                        </CardTitle>
                        <CardDescription>Your personal action items.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TodoList />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <MessageSquare className="w-5 h-5" />
                            Recent Messages
                        </CardTitle>
                        <CardDescription>Jump back into your conversations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="text-center text-muted-foreground py-4">
                           <p>No recent messages.</p>
                       </div>
                    </CardContent>
                </Card>
            </aside>
        </div>

        <section>
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold font-heading">Trusted by the World’s Most Innovative Teams</h2>
                <p className="text-lg text-muted-foreground mt-2">From startups to enterprises, Pollitago is the backbone of confident decision-making.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                {testimonials.map(t => <TestimonialCard key={t.name} {...t} />)}
            </div>
        </section>

         <section className="text-center max-w-4xl mx-auto p-8 rounded-2xl bg-muted/40 border">
            <BrainCircuit className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Ready to Make Your Next Move?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">Stop guessing. Start analyzing. Transform your strategic process with AI-powered second opinions and gain the confidence to act.</p>
            <Button asChild size="lg">
              <Link href="/create">
                Generate Your First Analysis <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
       </section>

    </div>
  );
}
