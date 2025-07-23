
"use client";

import { useState, useEffect } from 'react';
import type { StockQuote } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export function usePolygonWS(symbols: string[]) {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const tickerDocRef = doc(db, 'app-data', 'ticker');

    const unsubscribe = onSnapshot(tickerDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.quotes && Array.isArray(data.quotes)) {
            // Filter to only include the symbols this component cares about
            const relevantQuotes = data.quotes.filter(q => symbols.includes(q.symbol));
            setStocks(relevantQuotes);
        }
      } else {
        console.warn("Ticker data document does not exist in Firestore.");
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to ticker data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [symbols.join(',')]); // Re-run if the list of symbols changes

  return { stocks, loading };
}
