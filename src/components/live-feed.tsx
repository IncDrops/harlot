
"use client";

import { type LucideIcon, Bot, Bitcoin, LineChart, Lightbulb, Car, Watch, Laptop, Newspaper } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchNews } from '@/ai/flows/fetch-news-flow';
import { Skeleton } from './ui/skeleton';

interface FeedItem {
    title: string;
    url: string;
    source: string;
}

const feedCategories: { title: string; icon: LucideIcon | 'code'; category: string; }[] = [
    { title: "AI Trends", icon: Bot, category: "general" }, // Mediastack category
    { title: "Crypto Markets", icon: Bitcoin, category: "business" }, // Mediastack category
    { title: "Tech Stocks", icon: LineChart, category: "business" }, // Mediastack category
    { title: "Startup News", icon: Lightbulb, category: "business" }, // Mediastack category
    { title: "Developer Tools", icon: 'code', category: "technology" }, // Mediastack category
    { title: "High-End Auto", icon: Car, category: "general" }, // Mediastack category
    { title: "Luxury Watches", icon: Watch, category: "https://www.watchpro.com/feed/" }, // RSS Feed URL
    { title: "Luxury Daily", icon: Newspaper, category: "https://www.luxurydaily.com/feed/" }, // RSS Feed URL
    { title: "Productivity", icon: Laptop, category: "technology" } // Mediastack category
];

function FeedCard({ category, title, icon: Icon }: { category: string, title: string, icon: LucideIcon | 'code' }) {
    const [item, setItem] = useState<FeedItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                // The fetchNews flow now handles both categories and RSS URLs
                const news = await fetchNews({ category });
                if (news.articles.length > 0) {
                    setItem(news.articles[0]);
                } else {
                    setItem({ title: "No recent news found for this category.", url: "#", source: "System" });
                }
            } catch (error) {
                console.error(`Failed to fetch news for ${category}`, error);
                setItem({ title: "Could not load news.", url: "#", source: "Error" });
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [category]);

    return (
        <Link href={item?.url || "#"} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
            <Card className="bg-background/50 border-primary/10">
                <CardHeader className="p-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {Icon === 'code' ? (
                            <span className="w-4 h-4 text-primary text-lg leading-none">{'</>'}</span>
                        ) : (
                            <Icon className="w-4 h-4 text-primary" />
                        )}
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 text-xs text-muted-foreground h-12">
                     {loading ? (
                        <div className="space-y-2">
                           <Skeleton className="h-3 w-5/6" />
                           <Skeleton className="h-3 w-4/6" />
                        </div>
                     ) : (
                        <p className="line-clamp-2">{item?.title}</p>
                     )}
                </CardContent>
            </Card>
        </Link>
    );
}


export function LiveFeed() {
    return (
        <div className="space-y-4 p-2">
            {feedCategories.map((cat) => (
                <FeedCard key={cat.title} category={cat.category} title={cat.title} icon={cat.icon} />
            ))}
        </div>
    );
}
