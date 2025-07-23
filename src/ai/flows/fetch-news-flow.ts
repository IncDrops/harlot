
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

        // Handle different RSS/Atom feed structures
        const channel = result.rss?.channel || result.feed;
        if (!channel) {
            console.error("Could not find channel or feed in RSS from " + feedUrl);
            return { articles: [] };
        }

        // Find the title of the feed itself to use as the source
        const feedTitle = channel.title?._text || channel.title?._cdata || new URL(feedUrl).hostname;
        
        const items = Array.isArray(channel.item) ? channel.item : Array.isArray(channel.entry) ? channel.entry : [channel.item || channel.entry];
        
        if (!items || items.length === 0 || !items[0]) return { articles: [] };
        
        // We only care about the most recent item for the live feed display.
        const item = items[0];

        // Handle variations in item structure (_cdata vs _text, link href)
        const title = item.title?._cdata || item.title?._text || 'Untitled';
        const url = item.link?._text || item.link?._attributes?.href || feedUrl;

        const article = {
            title,
            url,
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
