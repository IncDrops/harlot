
"use client";

import { type LucideIcon, Newspaper, Bitcoin, LineChart, Lightbulb, Bot, Car, Watch, Laptop } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Link from 'next/link';

const feedCategories: { title: string; icon: LucideIcon | 'code'; content: string; url: string; }[] = [
    { title: "AI Trends", icon: Bot, content: "New foundation model 'Atlas-7' announced by OmniCorp.", url: "#" },
    { title: "Crypto Markets", icon: Bitcoin, content: "BTC breaks $70,000 resistance level.", url: "#" },
    { title: "Tech Stocks", icon: LineChart, content: "NVDA up 3.5% after AI chip keynote.", url: "#" },
    { title: "Startup News", icon: Lightbulb, content: "Gen-AI video startup 'Vivid' raises $50M Series A.", url: "#" },
    { title: "Developer Tools", icon: 'code', content: "Next.js 15 released with major performance boosts.", url: "#" },
    { title: "High-End Auto", icon: Car, content: "Ferrari unveils their first fully-electric supercar concept.", url: "#" },
    { title: "Luxury Watches", icon: Watch, content: "Patek Philippe drops new limited edition Calatrava.", url: "#" },
    { title: "Productivity", icon: Laptop, content: "New M4-powered Macbook Pro reviewed as 'blazing fast'.", url: "#" }
];


export function LiveFeed() {

    return (
        <div className="space-y-4 p-2">
            {feedCategories.map((item, index) => {
                const Icon = item.icon;
                
                return (
                    <Link key={index} href={item.url} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                        <Card className="bg-background/50 border-primary/10">
                            <CardHeader className="p-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    {Icon === 'code' ? (
                                        <span className="w-4 h-4 text-primary text-lg leading-none">{'</>'}</span>
                                    ) : (
                                        <Icon className="w-4 h-4 text-primary" />
                                    )}
                                    {item.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
                                {item.content}
                            </CardContent>
                        </Card>
                    </Link>
                )
            })}
        </div>
    );
}
