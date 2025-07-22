
"use client";

import { useEffect, useState } from "react";
import { fetchStockQuotes } from "@/ai/flows/fetch-stock-quotes-flow";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StockQuote {
  symbol: string;
  price: number;
  changesPercentage: number;
}

function TickerItem({ quote }: { quote: StockQuote }) {
  const isUp = quote.changesPercentage >= 0;
  return (
    <div className="flex items-center gap-4 text-sm mx-4 flex-shrink-0">
      <span className="font-bold text-foreground">{quote.symbol}</span>
      <span className="text-muted-foreground">${quote.price.toFixed(2)}</span>
      <span className={cn("flex items-center font-semibold", isUp ? "text-green-500" : "text-red-500")}>
        {isUp ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
        {quote.changesPercentage.toFixed(2)}%
      </span>
    </div>
  );
}

export function StockTicker() {
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { quotes } = await fetchStockQuotes();
        // We duplicate the quotes to ensure a seamless loop for the marquee effect
        setQuotes([...quotes, ...quotes]); 
      } catch (error) {
        console.error("Failed to fetch stock quotes", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-12 bg-muted/50 rounded-lg animate-pulse" />
    );
  }

  if (quotes.length === 0) {
    return null; // Don't render anything if we fail to fetch data
  }

  return (
    <div className="relative w-full h-12 flex items-center overflow-hidden bg-background border-y border-border group">
        <div className="animate-marquee-infinite group-hover:pause flex">
            {quotes.map((quote, index) => (
            <TickerItem key={`${quote.symbol}-${index}`} quote={quote} />
            ))}
        </div>
    </div>
  );
}

