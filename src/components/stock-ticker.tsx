
"use client";

import { useEffect, useState } from "react";
import { fetchStockQuotes } from "@/ai/flows/fetch-stock-quotes-flow";
import type { StockQuote } from "@/lib/ai-schemas";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const stockSymbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "META", "TSLA", "NVDA", "JPM", "V", "JNJ"];

export function StockTicker() {
    const [stocks, setStocks] = useState<StockQuote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getQuotes = async () => {
            try {
                const quotes = await fetchStockQuotes({ symbols: stockSymbols });
                setStocks(quotes.quotes);
            } catch (error) {
                console.error("Failed to fetch stock quotes:", error);
            } finally {
                setLoading(false);
            }
        };
        
        getQuotes();

        // Refresh every 30 seconds (2 calls per minute), well within the 5/min limit
        const intervalId = setInterval(getQuotes, 30000); 

        return () => clearInterval(intervalId);
    }, []);

    const renderStock = (stock: StockQuote) => (
        <div key={stock.symbol} className="flex items-center gap-2 text-sm mx-4 flex-shrink-0">
            <span className="font-semibold text-muted-foreground">{stock.symbol}</span>
            <span>${stock.price.toFixed(2)}</span>
            <span className={cn("flex items-center text-xs", stock.change >= 0 ? 'text-green-500' : 'text-red-500')}>
                {stock.change >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                {stock.change.toFixed(2)} ({stock.changesPercentage.toFixed(2)}%)
            </span>
        </div>
    );
    
    if (loading) {
        return (
            <div className="h-10 flex items-center bg-background border-t">
                <p className="text-sm text-muted-foreground px-4">Loading market data...</p>
            </div>
        )
    }

    // Duplicate the stocks array to create a seamless loop
    const extendedStocks = [...stocks, ...stocks];

    return (
        <div className="relative h-10 flex items-center overflow-hidden bg-background group">
            <div className="flex animate-marquee-infinite group-hover:pause">
                {extendedStocks.map((stock, index) => renderStock(stock))}
            </div>
            <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-background to-transparent" />
            <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-background to-transparent" />
        </div>
    );
}
