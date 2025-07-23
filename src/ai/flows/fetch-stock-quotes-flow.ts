
'use server';
/**
 * @fileOverview A flow to fetch live stock quotes from the Polygon.io API.
 * 
 * - fetchStockQuotes - A function that takes a list of stock symbols and returns their current quotes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { StockQuoteSchema } from '@/lib/ai-schemas';

const API_KEY = process.env.POLYGON_API_KEY;
const BASE_URL = 'https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers';

const FetchStockQuotesInputSchema = z.object({
  symbols: z.array(z.string()).describe('An array of stock ticker symbols.'),
});
export type FetchStockQuotesInput = z.infer<typeof FetchStockQuotesInputSchema>;

const FetchStockQuotesOutputSchema = z.object({
  quotes: z.array(StockQuoteSchema),
});
export type FetchStockQuotesOutput = z.infer<typeof FetchStockQuotesOutputSchema>;


const fetchStockQuotesFlow = ai.defineFlow(
  {
    name: 'fetchStockQuotesFlow',
    inputSchema: FetchStockQuotesInputSchema,
    outputSchema: FetchStockQuotesOutputSchema,
  },
  async (input) => {
    if (!API_KEY) {
        console.error("POLYGON_API_KEY is not set in environment variables.");
        return { quotes: [] };
    }
    
    const url = `${BASE_URL}?tickers=${input.symbols.join(',')}&apiKey=${API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Polygon.io API request failed: ${response.statusText}`);
            return { quotes: [] };
        }
        const data = await response.json();
        
        if (!data.tickers || !Array.isArray(data.tickers)) {
            console.error("Polygon.io API did not return a valid tickers array.");
            return { quotes: [] };
        }

        const quotes = data.tickers.map((item: any) => ({
            symbol: item.ticker,
            name: item.ticker, // Polygon snapshot doesn't include name, using ticker as fallback
            price: item.day.c, // 'c' is the close price for the day
            change: item.todaysChange,
            changesPercentage: item.todaysChangePerc,
        }));
        
        return { quotes };

    } catch (error) {
        console.error("Error fetching stock quotes:", error);
        return { quotes: [] };
    }
  }
);

export async function fetchStockQuotes(input: FetchStockQuotesInput): Promise<FetchStockQuotesOutput> {
    return fetchStockQuotesFlow(input);
}
