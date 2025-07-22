
'use server';
/**
 * @fileOverview A flow to fetch live news articles from the Mediastack API or an RSS feed.
 *
 * - fetchNews - A function that takes a category or RSS URL and returns a list of news articles.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { xml2js } from 'xml-js';

const NewsArticleSchema = z.object({
    title: z.string(),
    url: z.string().url(),
    source: z.string(),
});

const FetchNewsInputSchema = z.object({
  category: z.string().describe('The category of news to fetch, or a full RSS feed URL.'),
});
export type FetchNewsInput = z.infer<typeof FetchNewsInputSchema>;

const FetchNewsOutputSchema = z.object({
  articles: z.array(NewsArticleSchema),
});
export type FetchNewsOutput = z.infer<typeof FetchNewsOutputSchema>;


async function fetchFromMediastack(category: string): Promise<FetchNewsOutput> {
    const apiKey = process.env.MEDIASTACK_API_KEY;
    if (!apiKey) {
      console.error("Mediastack API key not found.");
      return { articles: [] };
    }

    const categories = category.toLowerCase().replace(/ /g, '_');
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

async function fetchFromRss(feedUrl: string): Promise<FetchNewsOutput> {
    try {
        const response = await fetch(feedUrl, { headers: { 'User-Agent': 'Pollitago/1.0' } });
        if (!response.ok) {
            console.error(`RSS fetch error for ${feedUrl}: ${response.statusText}`);
            return { articles: [] };
        }
        const xmlText = await response.text();
        const result: any = xml2js(xmlText, { compact: true, trim: true });

        const channel = result.rss.channel;
        const feedTitle = channel.title._text;
        const item = Array.isArray(channel.item) ? channel.item[0] : channel.item;

        if (!item) return { articles: [] };

        const article = {
            title: item.title._cdata || item.title._text,
            url: item.link._text,
            source: feedTitle,
        };

        return { articles: [article] };

    } catch (error) {
        console.error(`Failed to parse RSS feed from ${feedUrl}`, error);
        return { articles: [] };
    }
}


const fetchNewsFlow = ai.defineFlow(
  {
    name: 'fetchNewsFlow',
    inputSchema: FetchNewsInputSchema,
    outputSchema: FetchNewsOutputSchema,
  },
  async (input) => {
    // Check if the category is an RSS feed URL
    if (input.category.startsWith('http')) {
        return fetchFromRss(input.category);
    }
    // Otherwise, fetch from Mediastack
    return fetchFromMediastack(input.category);
  }
);


export async function fetchNews(input: FetchNewsInput): Promise<FetchNewsOutput> {
    return fetchNewsFlow(input);
}
