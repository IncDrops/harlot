
'use server';
/**
 * @fileOverview A flow to fetch live stock quotes from the Financial Modeling Prep API.
 * 
 * - fetchStockQuotes - A function that returns a list of stock quotes for a predefined list of symbols.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const StockQuoteSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  price: z.number(),
  changesPercentage: z.number(),
});

const FetchStockQuotesOutputSchema = z.object({
  quotes: z.array(StockQuoteSchema),
});
export type FetchStockQuotesOutput = z.infer<typeof FetchStockQuotesOutputSchema>;

// A curated list of important and recognizable stock symbols.
const SYMBOLS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 
    'JPM', 'V', 'MA', 'BAC', 'WMT', 'UNH', 'LLY'
];


async function fetchFromFMP(): Promise<FetchStockQuotesOutput> {
    const apiKey = process.env.FINANCIAL_MODELING_PREP_API_KEY;
    if (!apiKey) {
      console.error("Financial Modeling Prep API key not found.");
      return { quotes: [] };
    }

    const symbolsString = SYMBOLS.join(',');
    const url = `https://financialmodelingprep.com/api/v3/quote/${symbolsString}?apikey=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`FMP API error: ${response.statusText}`);
        return { quotes: [] };
      }
      const data = await response.json();
      
      const quotes = data?.map((quote: any) => ({
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        changesPercentage: quote.changesPercentage,
      })) || [];

      return { quotes };

    } catch (error) {
      console.error("Failed to fetch quotes from FMP", error);
      return { quotes: [] };
    }
}


const fetchStockQuotesFlow = ai.defineFlow(
  {
    name: 'fetchStockQuotesFlow',
    inputSchema: z.void(),
    outputSchema: FetchStockQuotesOutputSchema,
  },
  async () => {
    return fetchFromFMP();
  }
);


export async function fetchStockQuotes(): Promise<FetchStockQuotesOutput> {
    return fetchStockQuotesFlow();
}
