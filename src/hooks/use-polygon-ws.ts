
"use client";

import { useState, useEffect, useRef } from 'react';
import type { StockQuote } from '@/lib/types';

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
    min: {
        c: number;
    };
    prevDay: {
        c: number;
    };
}


export function usePolygonWS(symbols: string[]) {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!API_KEY) {
      console.error("Polygon API key is not set (NEXT_PUBLIC_POLYGON_API_KEY). Ticker will not be displayed.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    let openPriceMap = new Map<string, number>();

    async function fetchInitialData() {
        if (!isMounted) return;
        setLoading(true);
        try {
            const symbolsString = symbols.join(',');
            const response = await fetch(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${symbolsString}&apiKey=${API_KEY}`);
            if (!response.ok) {
                console.error(`Failed to fetch initial stock data from Polygon API. Status: ${response.status}. This may be due to an invalid API key or insufficient permissions.`);
                throw new Error('Failed to fetch initial stock data');
            }
            const data = await response.json();
            
            if (isMounted) {
                const initialStocks = data.tickers.map((snapshot: PolygonTickerSnapshot) => {
                    openPriceMap.set(snapshot.ticker, snapshot.day.o);
                    return {
                        symbol: snapshot.ticker,
                        name: snapshot.ticker,
                        price: snapshot.lastTrade.p,
                        change: snapshot.todaysChange,
                        changesPercentage: snapshot.todaysChangePerc,
                    };
                });
                setStocks(initialStocks);
            }
        } catch (error) {
            console.error(error);
        } finally {
            if (isMounted) setLoading(false);
        }
    }

    fetchInitialData().then(() => {
        if (!isMounted || !API_KEY) return;

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
                            const openPrice = openPriceMap.get(msg.sym) ?? 0;
                            const newChange = openPrice > 0 ? msg.p - openPrice : 0;
                            const newChangePercent = openPrice > 0 ? (newChange / openPrice) * 100 : 0;

                            return prevStocks.map(s =>
                                s.symbol === msg.sym
                                    ? { 
                                        ...s, 
                                        price: msg.p,
                                        change: newChange,
                                        changesPercentage: newChangePercent,
                                      }
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
    });

    return () => {
      isMounted = false;
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, [symbols.join(',')]);

  return { stocks, loading };
}
