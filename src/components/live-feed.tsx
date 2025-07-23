
"use client";

import { type LucideIcon, Bot, Bitcoin, LineChart, Lightbulb, Car, Watch, Laptop, Newspaper, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchNews } from '@/ai/flows/fetch-news-flow';
import { Skeleton } from './ui/skeleton';
import { usePolygonWS } from '@/hooks/use-polygon-ws';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';


interface FeedItem {
    title: string;
    url: string;
    source: string;
}

const feedCategories: { title: string; icon: LucideIcon | 'code'; category?: string; type?: 'news' | 'stocks' }[] = [
    { title: "AI Trends", icon: Bot, category: "https://www.technologyreview.com/feed/tag/artificial-intelligence/", type: 'news' },
    { title: "Tech Stocks", icon: LineChart, category: "NVDA,MSFT,AAPL,AMZN,GOOG,META", type: 'stocks' },
    { title: "Crypto Markets", icon: Bitcoin, category: "https://www.coindesk.com/arc/outboundfeeds/rss/", type: 'news' }, 
    { title: "Startup News", icon: Lightbulb, category: "https://techcrunch.com/feed/", type: 'news' },
    { title: "Developer Tools", icon: 'code', category: "https://blog.pragmaticengineer.com/rss/", type: 'news' },
    { title: "Travel", icon: Globe, category: "https://skift.com/feed/", type: 'news' },
    { title: "Automotive News", icon: Car, category: "https://feeds.feedblitz.com/autonews/breakingnews", type: 'news' },
    { title: "Luxury Watches", icon: Watch, category: "https://www.hodinkee.com/articles.rss", type: 'news' },
    { title: "Luxury Daily", icon: Newspaper, category: "https://www.luxurydaily.com/feed/", type: 'news' },
    { title: "Productivity", icon: Laptop, category: "https://lifehacker.com/rss", type: 'news' }
];

function StockFeedCard({ symbols, title, icon: Icon }: { symbols: string[], title: string, icon: LucideIcon | 'code' }) {
    const { stocks, loading } = usePolygonWS(symbols);

    const getStockDisplay = () => {
        if (!stocks.length) return null;

        const firstStock = stocks[0];
        const change = firstStock.change > 0 ? `+${firstStock.change.toFixed(2)}` : firstStock.change.toFixed(2);
        const changePercent = `(${(firstStock.changesPercentage).toFixed(2)}%)`;
        
        return (
            <div className="flex items-center gap-1.5 text-xs">
                <span className="font-bold text-foreground">{firstStock.symbol}</span>
                <span className={cn("flex items-center", firstStock.change >= 0 ? 'text-green-500' : 'text-red-500')}>
                    {firstStock.change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {firstStock.price.toFixed(2)}
                </span>
                <span className="text-muted-foreground">{change} {changePercent}</span>
            </div>
        )
    }
    
    const getStockUrl = () => {
        if (!stocks.length) return "#";
        return `https://www.google.com/finance/quote/${stocks[0].symbol}:NASDAQ`;
    }

    return (
         <Link href={getStockUrl()} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
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
                     {loading && !stocks.length ? (
                        <div className="space-y-2">
                           <Skeleton className="h-3 w-5/6" />
                           <Skeleton className="h-3 w-4/6" />
                        </div>
                     ) : stocks.length > 0 ? (
                        getStockDisplay()
                     ) : (
                        <p className="line-clamp-2">Could not load stock data.</p>
                     )}
                </CardContent>
            </Card>
        </Link>
    )
}


function NewsFeedCard({ category, title, icon: Icon }: { category: string, title: string, icon: LucideIcon | 'code' }) {
    const [item, setItem] = useState<FeedItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const news = await fetchNews({ category });
                if (news.articles.length > 0) {
                    setItem(news.articles[0]);
                } else {
                    setItem({ title: "No recent news found for this category.", url: "#", source: "System" });
                }
            } catch (error) {
                console.error(`Failed to fetch feed for ${category}`, error);
                setItem({ title: "Could not load feed.", url: "#", source: "Error" });
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
            {feedCategories.map((cat) => {
                if(cat.type === 'stocks' && cat.category) {
                     return <StockFeedCard key={cat.title} symbols={cat.category.split(',')} title={cat.title} icon={cat.icon} />
                }
                if (cat.type === 'news' && cat.category) {
                     return <NewsFeedCard key={cat.title} category={cat.category || ''} title={cat.title} icon={cat.icon} />
                }
                return null;
            })}
        </div>
    );
}
