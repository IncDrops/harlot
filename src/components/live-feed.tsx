
"use client";

import { type LucideIcon, Bot, Bitcoin, LineChart, Lightbulb, Car, Watch, Laptop, Newspaper, Globe, ArrowDown, ArrowUp } from 'lucide-react';
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

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
}

const feedCategories: { title: string; icon: LucideIcon | 'code'; category?: string; type?: 'news' | 'stock' }[] = [
    { title: "AI Trends", icon: Bot, category: "https://www.technologyreview.com/feed/tag/artificial-intelligence/", type: 'news' },
    { title: "Crypto Markets", icon: Bitcoin, category: "https://www.coindesk.com/arc/outboundfeeds/rss/", type: 'news' }, 
    { title: "Tech Stocks", icon: LineChart, type: 'stock' },
    { title: "Startup News", icon: Lightbulb, category: "https://techcrunch.com/feed/", type: 'news' },
    { title: "Developer Tools", icon: 'code', category: "https://blog.pragmaticengineer.com/rss/", type: 'news' },
    { title: "Travel", icon: Globe, category: "https://skift.com/feed/", type: 'news' },
    { title: "Automotive News", icon: Car, category: "https://feeds.feedblitz.com/autonews/breakingnews", type: 'news' },
    { title: "Luxury Watches", icon: Watch, category: "https://www.hodinkee.com/articles.rss", type: 'news' },
    { title: "Luxury Daily", icon: Newspaper, category: "https://www.luxurydaily.com/feed/", type: 'news' },
    { title: "Productivity", icon: Laptop, category: "https://lifehacker.com/rss", type: 'news' }
];

function StockFeedCard({ title, icon: Icon }: { title: string, icon: LucideIcon | 'code' }) {
    const [quote, setQuote] = useState<StockQuote | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const response = await fetchStockQuotes();
                if (response.quotes.length > 0) {
                    // Pick a random quote to display
                    const randomIndex = Math.floor(Math.random() * response.quotes.length);
                    setQuote(response.quotes[randomIndex]);
                }
            } catch (error) {
                console.error("Failed to fetch stock quote", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const isUp = quote ? quote.changesPercentage >= 0 : false;
    const url = quote ? `https://finance.yahoo.com/quote/${quote.symbol}` : "#";

    return (
        <Link href={url} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
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
                     ) : quote ? (
                        <div>
                            <p className="font-bold text-sm text-foreground truncate">{quote.name}</p>
                            <div className="flex items-center gap-2 text-xs">
                                <span>${quote.price.toFixed(2)}</span>
                                <span className={cn("flex items-center font-semibold", isUp ? "text-green-500" : "text-red-500")}>
                                    {isUp ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                                    {quote.changesPercentage.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                     ) : (
                        <p className="line-clamp-2">Could not load stock data.</p>
                     )}
                </CardContent>
            </Card>
        </Link>
    );
}


function FeedCard({ category, title, icon: Icon }: { category: string, title: string, icon: LucideIcon | 'code' }) {
    const [item, setItem] = useState<FeedItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                // The fetchNews flow now handles RSS URLs
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
            {feedCategories.map((cat) => {
                if(cat.type === 'stock') {
                    return <StockFeedCard key={cat.title} title={cat.title} icon={cat.icon} />
                }
                return <FeedCard key={cat.title} category={cat.category || ''} title={cat.title} icon={cat.icon} />
            })}
        </div>
    );
}
