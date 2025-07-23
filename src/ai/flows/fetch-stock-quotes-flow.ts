
'use server';
/**
 * @fileOverview A flow to fetch live stock quotes from the Financial Modeling Prep API.
 * 
 * - fetchStockQuotes - A function that takes a list of stock symbols and returns their current quotes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { StockQuoteSchema } from '@/lib/ai-schemas';

const API_KEY = process.env.FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3/quote';

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
        console.error("FMP_API_KEY is not set in environment variables.");
        return { quotes: [] };
    }
    
    const url = `${BASE_URL}/${input.symbols.join(',')}?apikey=${API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`FMP API request failed: ${response.statusText}`);
            return { quotes: [] };
        }
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            console.error("FMP API did not return an array.");
            return { quotes: [] };
        }

        const quotes = data.map((item: any) => ({
            symbol: item.symbol,
            name: item.name,
            price: item.price,
            change: item.change,
            changesPercentage: item.changesPercentage,
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
