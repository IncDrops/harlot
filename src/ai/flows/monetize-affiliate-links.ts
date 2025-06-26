'use server';
/**
 * @fileOverview A flow that automatically includes affiliate links targeted to match the content being polled to monetize posts where the creator did not add an affiliate link, in a way that is useful to end users, without compromising user trust.
 *
 * - monetizeAffiliateLinks - A function that handles the process of adding affiliate links to poll options.
 * - MonetizeAffiliateLinksInput - The input type for the monetizeAffiliateLinks function.
 * - MonetizeAffiliateLinksOutput - The return type for the monetizeAffiliateLinks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MonetizeAffiliateLinksInputSchema = z.object({
  pollQuestion: z.string().describe('The question of the poll.'),
  options: z.array(z.string()).describe('The options for the poll.'),
});
export type MonetizeAffiliateLinksInput = z.infer<typeof MonetizeAffiliateLinksInputSchema>;

const MonetizeAffiliateLinksOutputSchema = z.object({
  monetizedOptions: z.array(z.string()).describe('The poll options with added affiliate links.'),
});
export type MonetizeAffiliateLinksOutput = z.infer<typeof MonetizeAffiliateLinksOutputSchema>;

export async function monetizeAffiliateLinks(input: MonetizeAffiliateLinksInput): Promise<MonetizeAffiliateLinksOutput> {
  return monetizeAffiliateLinksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'monetizeAffiliateLinksPrompt',
  input: {schema: MonetizeAffiliateLinksInputSchema},
  output: {schema: MonetizeAffiliateLinksOutputSchema},
  prompt: `You are an expert in identifying relevant affiliate links for poll options.

  Given the poll question and options below, you will add affiliate links to each option in a way that is useful to end users, without compromising user trust. Only add affiliate links where they are highly relevant. Do not add affiliate links that are not relevant to the poll option.
  You must return the options with affiliate links added as part of a JSON object. Return the exact same options if you don't find any relevant affiliate links to include.

  Poll Question: {{{pollQuestion}}}
  Options: {{{options}}}
  `,
});

const monetizeAffiliateLinksFlow = ai.defineFlow(
  {
    name: 'monetizeAffiliateLinksFlow',
    inputSchema: MonetizeAffiliateLinksInputSchema,
    outputSchema: MonetizeAffiliateLinksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
