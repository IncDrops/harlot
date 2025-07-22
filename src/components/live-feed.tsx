
"use client";

import { Newspaper, Bitcoin, LineChart, Lightbulb, Bot, Car, Watch, Laptop } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const feedCategories = [
    { title: "AI Trends", icon: Bot, content: "New foundation model 'Atlas-7' announced by OmniCorp." },
    { title: "Crypto Markets", icon: Bitcoin, content: "BTC breaks $70,000 resistance level." },
    { title: "Tech Stocks", icon: LineChart, content: "NVDA up 3.5% after AI chip keynote." },
    { title: "Startup News", icon: Lightbulb, content: "Gen-AI video startup 'Vivid' raises $50M Series A." },
    { title: "Developer Tools", icon: 'code', content: "Next.js 15 released with major performance boosts." },
    { title: "High-End Auto", icon: Car, content: "Ferrari unveils their first fully-electric supercar concept." },
    { title: "Luxury Watches", icon: Watch, content: "Patek Philippe drops new limited edition Calatrava." },
    { title: "Productivity", icon: Laptop, content: "New M4-powered Macbook Pro reviewed as 'blazing fast'." }
];

const IconMap = {
    Bot: Bot,
    Bitcoin: Bitcoin,
    LineChart: LineChart,
    Lightbulb: Lightbulb,
    Car: Car,
    Watch: Watch,
    Laptop: Laptop
} as const;


export function LiveFeed() {

    return (
        <div className="space-y-4 p-2">
            {feedCategories.map((item, index) => {
                const Icon = item.icon === 'code' 
                    ? () => <span className="text-lg">{'</>'}</span>
                    : IconMap[item.icon as keyof typeof IconMap];
                
                return (
                    <Card key={index} className="bg-background/50 border-primary/10">
                        <CardHeader className="p-3">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Icon className="w-4 h-4 text-primary" />
                                {item.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
                            {item.content}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    );
}
