
"use client";

import { usePolygonWS } from "@/hooks/use-polygon-ws";
import type { StockQuote } from "@/lib/ai-schemas";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

const stockSymbols = ["NVDA", "MSFT", "AAPL", "AMZN", "GOOG", "META"];

export function StockTicker() {
    const { stocks, loading } = usePolygonWS(stockSymbols);

    const renderStock = (stock: StockQuote, index: number) => (
        <div key={`${stock.symbol}-${index}`} className="flex items-center gap-2 text-sm mx-4 flex-shrink-0">
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
                <p className="text-sm text-muted-foreground px-4">Connecting to market data feed...</p>
            </div>
        )
    }

    if (!stocks.length) {
        return (
             <div className="h-10 flex items-center bg-background border-t">
                <p className="text-sm text-muted-foreground px-4">Market data feed is temporarily unavailable.</p>
            </div>
        )
    }

    // Duplicate the stocks array to create a seamless loop
    const extendedStocks = [...stocks, ...stocks];

    return (
        <div className="relative h-10 flex items-center overflow-hidden bg-background group">
            <div className="flex animate-marquee-infinite group-hover:pause">
                {extendedStocks.map((stock, index) => renderStock(stock, index))}
            </div>
            <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-background to-transparent" />
            <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-background to-transparent" />
        </div>
    );
}
