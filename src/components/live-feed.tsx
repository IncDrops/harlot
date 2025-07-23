
"use client";

import { type LucideIcon, Bot, Bitcoin, LineChart, Lightbulb, Car, Watch, Laptop, Newspaper, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchNews } from '@/ai/flows/fetch-news-flow';
import { fetchStockQuotes } from '@/ai/flows/fetch-stock-quotes-flow';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';


interface FeedItem {
    title: string;
    url: string;
    source: string;
}

const feedCategories: { title: string; icon: LucideIcon | 'code'; category?: string; type?: 'news' | 'stocks' }[] = [
    { title: "AI Trends", icon: Bot, category: "https://www.technologyreview.com/feed/tag/artificial-intelligence/", type: 'news' },
    { title: "Tech Stocks", icon: LineChart, category: "AAPL,GOOGL,MSFT,AMZN,META", type: 'stocks' },
    { title: "Crypto Markets", icon: Bitcoin, category: "https://www.coindesk.com/arc/outboundfeeds/rss/", type: 'news' }, 
    { title: "Startup News", icon: Lightbulb, category: "https://techcrunch.com/feed/", type: 'news' },
    { title: "Developer Tools", icon: 'code', category: "https://blog.pragmaticengineer.com/rss/", type: 'news' },
    { title: "Travel", icon: Globe, category: "https://skift.com/feed/", type: 'news' },
    { title: "Automotive News", icon: Car, category: "https://feeds.feedblitz.com/autonews/breakingnews", type: 'news' },
    { title: "Luxury Watches", icon: Watch, category: "https://www.hodinkee.com/articles.rss", type: 'news' },
    { title: "Luxury Daily", icon: Newspaper, category: "https://www.luxurydaily.com/feed/", type: 'news' },
    { title: "Productivity", icon: Laptop, category: "https://lifehacker.com/rss", type: 'news' }
];

function FeedCard({ category, title, icon: Icon, type }: { category: string, title: string, icon: LucideIcon | 'code', type: 'news' | 'stocks' }) {
    const [item, setItem] = useState<FeedItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                if (type === 'news') {
                    const news = await fetchNews({ category });
                    if (news.articles.length > 0) {
                        setItem(news.articles[0]);
                    } else {
                        setItem({ title: "No recent news found for this category.", url: "#", source: "System" });
                    }
                } else if (type === 'stocks') {
                     const stock = await fetchStockQuotes({ symbols: category.split(',') });
                     if (stock.quotes.length > 0) {
                        const firstStock = stock.quotes[0];
                        const change = firstStock.change > 0 ? `+${firstStock.change.toFixed(2)}` : firstStock.change.toFixed(2);
                        const changePercent = `(${(firstStock.changesPercentage).toFixed(2)}%)`;
                        setItem({
                            title: `${firstStock.name} is at ${firstStock.price} ${change} ${changePercent}`,
                            url: `https://www.google.com/finance/quote/${firstStock.symbol}:NASDAQ`,
                            source: "Polygon.io"
                        });
                     } else {
                        setItem({ title: "Could not fetch stock data.", url: "#", source: "System" });
                     }
                }
            } catch (error) {
                console.error(`Failed to fetch feed for ${category}`, error);
                setItem({ title: "Could not load feed.", url: "#", source: "Error" });
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [category, type]);

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
            {feedCategories.map((cat) => {
                return <FeedCard key={cat.title} category={cat.category || ''} title={cat.title} icon={cat.icon} type={cat.type || 'news'} />
            })}
        </div>
    );
}
