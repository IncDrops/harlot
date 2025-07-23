
"use client";

import { useState, useEffect, useRef } from 'react';
import type { StockQuote } from '@/lib/ai-schemas';

const WS_URL = 'wss://socket.polygon.io/stocks';
const API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY;

// Polygon trade message structure
interface PolygonTrade {
  ev: 'T';   // Event type
  sym: string; // Symbol
  p: number;   // Price
  s: number;   // Size
  t: number;   // Timestamp (ms)
}

// Custom hook for Polygon WebSocket connection
export function usePolygonWS(symbols: string[]) {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const ws = useRef<WebSocket | null>(null);

  // Use a ref to store latest stock data to avoid stale closures in ws message handler
  const stocksRef = useRef<StockQuote[]>([]);
  useEffect(() => {
    stocksRef.current = stocks;
  }, [stocks]);

  useEffect(() => {
    if (!API_KEY) {
      console.error("Polygon API key is not set.");
      setLoading(false);
      return;
    }

    // Initialize the stock list with placeholders
    const initialStocks = symbols.map(symbol => ({
      symbol: symbol,
      name: symbol,
      price: 0,
      change: 0,
      changesPercentage: 0,
    }));
    setStocks(initialStocks);
    stocksRef.current = initialStocks;
    
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log('Polygon WebSocket connected.');
      // Authenticate
      ws.current?.send(JSON.stringify({ action: 'auth', params: API_KEY }));
      // Subscribe to tickers
      ws.current?.send(JSON.stringify({ action: 'subscribe', params: symbols.map(s => `T.${s}`).join(',') }));
      setLoading(false);
    };

    ws.current.onmessage = (event) => {
      try {
        const messages = JSON.parse(event.data);
        if (!Array.isArray(messages)) return;

        messages.forEach((msg: PolygonTrade) => {
          if (msg.ev === 'T') {
            const currentStocks = stocksRef.current;
            const existingStockIndex = currentStocks.findIndex(s => s.symbol === msg.sym);
            
            if (existingStockIndex > -1) {
              const updatedStock = { ...currentStocks[existingStockIndex] };
              const oldPrice = updatedStock.price;
              
              if (oldPrice !== 0 && msg.p !== oldPrice) {
                 updatedStock.change = msg.p - oldPrice;
                 updatedStock.changesPercentage = ((msg.p - oldPrice) / oldPrice) * 100;
              }
              updatedStock.price = msg.p;

              // Create a new array to trigger state update
              const newStocks = [...currentStocks];
              newStocks[existingStockIndex] = updatedStock;
              
              setStocks(newStocks);
            }
          }
        });
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.current.onclose = () => {
      console.log('Polygon WebSocket disconnected.');
      setLoading(false);
    };

    ws.current.onerror = (error) => {
      console.error('Polygon WebSocket error:', error);
      setLoading(false);
    };

    // Cleanup on component unmount
    return () => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, [symbols.join(',')]); // Re-run effect if symbols change

  return { stocks, loading };
}
