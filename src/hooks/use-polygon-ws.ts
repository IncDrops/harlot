
"use client";

import { useState, useEffect, useRef } from 'react';
import type { StockQuote } from '@/lib/ai-schemas';

const WS_URL = 'wss://socket.polygon.io/stocks';
const API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY;

// Polygon trade message structure from WebSocket
interface PolygonTradeMessage {
  ev: 'T';   // Event type
  sym: string; // Symbol
  p: number;   // Price
  s: number;   // Size
  t: number;   // Timestamp (ms)
}

// Polygon snapshot ticker structure from REST API
interface PolygonTickerSnapshot {
    ticker: string;
    todaysChange: number;
    todaysChangePerc: number;
    day: {
        c: number; // close
        h: number; // high
        l: number; // low
        o: number; // open
        v: number; // volume
    };
    lastTrade: {
        p: number; // price
        s: number; // size
        t: number; // timestamp
    };
}

// Custom hook for Polygon WebSocket connection
export function usePolygonWS(symbols: string[]) {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!API_KEY) {
      console.error("Polygon API key is not set. Ticker will not be displayed.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchInitialData() {
        try {
            const symbolsString = symbols.join(',');
            const response = await fetch(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${symbolsString}&apiKey=${API_KEY}`);
            if (!response.ok) {
                throw new Error('Failed to fetch initial stock data');
            }
            const data = await response.json();
            
            if (isMounted) {
                const initialStocks = data.tickers.map((snapshot: PolygonTickerSnapshot) => ({
                    symbol: snapshot.ticker,
                    name: snapshot.ticker,
                    price: snapshot.lastTrade.p,
                    change: snapshot.todaysChange,
                    changesPercentage: snapshot.todaysChangePerc,
                }));
                setStocks(initialStocks);
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            if (isMounted) setLoading(false);
        }
    }

    fetchInitialData();

    // Setup WebSocket for real-time updates
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log('Polygon WebSocket connected.');
      ws.current?.send(JSON.stringify({ action: 'auth', params: API_KEY }));
      ws.current?.send(JSON.stringify({ action: 'subscribe', params: symbols.map(s => `T.${s}`).join(',') }));
    };

    ws.current.onmessage = (event) => {
        if (!isMounted) return;
        try {
            const messages: PolygonTradeMessage[] = JSON.parse(event.data);
            if (!Array.isArray(messages)) return;
            
            messages.forEach((msg) => {
                if (msg.ev === 'T') {
                    setStocks(prevStocks => {
                        const stockToUpdate = prevStocks.find(s => s.symbol === msg.sym);
                        if (!stockToUpdate) return prevStocks;
                        
                        const oldPrice = stockToUpdate.price;
                        const newChange = stockToUpdate.change + (msg.p - oldPrice);
                        const newChangePercent = stockToUpdate.changesPercentage + (((msg.p - oldPrice) / oldPrice) * 100);

                        return prevStocks.map(s =>
                            s.symbol === msg.sym
                                ? { ...s, price: msg.p, change: newChange, changesPercentage: newChangePercent }
                                : s
                        );
                    });
                }
            });
        } catch (error) {
            console.error("Error parsing WebSocket message:", error);
        }
    };

    ws.current.onerror = (error) => {
      console.error('Polygon WebSocket error:', error);
    };

    ws.current.onclose = () => {
      console.log('Polygon WebSocket disconnected.');
    };

    return () => {
      isMounted = false;
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, [symbols.join(',')]); // Re-run effect if symbols change

  return { stocks, loading };
}
