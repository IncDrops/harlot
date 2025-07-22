
'use server';
/**
 * @fileOverview A flow to fetch live news articles from an RSS feed.
 *
 * - fetchNews - A function that takes an RSS URL and returns a list of news articles.
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
  category: z.string().describe('The a full RSS feed URL.'),
});
export type FetchNewsInput = z.infer<typeof FetchNewsInputSchema>;

const FetchNewsOutputSchema = z.object({
  articles: z.array(NewsArticleSchema),
});
export type FetchNewsOutput = z.infer<typeof FetchNewsOutputSchema>;


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
    // The category must be a valid RSS feed URL.
    return fetchFromRss(input.category);
  }
);


export async function fetchNews(input: FetchNewsInput): Promise<FetchNewsOutput> {
    return fetchNewsFlow(input);
}
