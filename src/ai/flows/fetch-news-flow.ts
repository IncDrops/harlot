
'use server';
/**
 * @fileOverview A flow to fetch live news articles from the Mediastack API.
 *
 * - fetchNews - A function that takes a category and returns a list of news articles.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const NewsArticleSchema = z.object({
    title: z.string(),
    url: z.string().url(),
    source: z.string(),
});

const FetchNewsInputSchema = z.object({
  category: z.string().describe('The category of news to fetch.'),
});
export type FetchNewsInput = z.infer<typeof FetchNewsInputSchema>;

const FetchNewsOutputSchema = z.object({
  articles: z.array(NewsArticleSchema),
});
export type FetchNewsOutput = z.infer<typeof FetchNewsOutputSchema>;


const fetchNewsFlow = ai.defineFlow(
  {
    name: 'fetchNewsFlow',
    inputSchema: FetchNewsInputSchema,
    outputSchema: FetchNewsOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.MEDIASTACK_API_KEY;
    if (!apiKey) {
      console.error("Mediastack API key not found.");
      // Return an empty array or a specific error message if the key is missing
      return { articles: [{ title: "API Key not configured.", url: "#", source: "System"}] };
    }

    const categories = input.category.toLowerCase().replace(/ /g, '_');
    const url = `http://api.mediastack.com/v1/news?access_key=${apiKey}&categories=${categories}&limit=1&languages=en`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Mediastack API error: ${response.statusText}`);
        return { articles: [] };
      }
      const data = await response.json();
      
      const articles = data.data?.map((article: any) => ({
        title: article.title,
        url: article.url,
        source: article.source,
      })) || [];

      return { articles };

    } catch (error) {
      console.error("Failed to fetch news from Mediastack", error);
      return { articles: [] };
    }
  }
);


export async function fetchNews(input: FetchNewsInput): Promise<FetchNewsOutput> {
    return fetchNewsFlow(input);
}
