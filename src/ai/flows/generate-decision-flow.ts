
'use server';
/**
 * @fileOverview An AI flow to generate firm decisions based on user input.
 *
 * - generateDecision - A function that takes a query, tone, and number of variants and returns structured decisions.
 * - GenerateDecisionInput - The input type for the generateDecision function.
 * - GenerateDecisionOutput - The return type for the generateDecision function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the schema for a single AI-generated response.
const DecisionResponseSchema = z.object({
  title: z.string().describe("A distinct title for this specific option, like 'Option 1 (Firm Decision)' or an empty string if only one response is generated."),
  text: z.string().describe("The full text of the AI's decision or opinion. Should be written in the requested tone and adhere to the character limits for the tier."),
});

// Schema for the input of the generateDecision flow
export const GenerateDecisionInputSchema = z.object({
  query: z.string().describe('The user\'s dilemma or question.'),
  tone: z.enum(['Firm', 'Friendly', 'Professional']).describe('The desired tone for the AI response.'),
  variants: z.number().min(1).max(3).describe('The number of distinct decisions to generate (1, 2, or 3).'),
});
export type GenerateDecisionInput = z.infer<typeof GenerateDecisionInputSchema>;

// Schema for the final output of the flow
export const GenerateDecisionOutputSchema = z.object({
  responses: z.array(DecisionResponseSchema).describe('An array containing the generated decisions, one for each variant requested.'),
});
export type GenerateDecisionOutput = z.infer<typeof GenerateDecisionOutputSchema>;

// Define the prompt for the AI model
const generateDecisionPrompt = ai.definePrompt({
  name: 'generateDecisionPrompt',
  input: { schema: GenerateDecisionInputSchema },
  output: { schema: GenerateDecisionOutputSchema },
  prompt: `You are Pollitago.ai, the world's most objective and clear-thinking AI decision-making entity. Your purpose is to provide firm, actionable second opinions based on the user's query. You must strictly adhere to the user's requested tone and generate the exact number of distinct variants (decisions) they ask for.

  User's Dilemma: {{{query}}}

  Requested Tone: {{{tone}}}
  Number of Decisions to Generate: {{{variants}}}

  Your task:
  1.  Carefully analyze the user's dilemma.
  2.  Generate exactly {{{variants}}} distinct, well-reasoned, and firm decisions. Each decision should offer a unique perspective or a different valid course of action, even if they lead to a similar conclusion.
  3.  Write each decision in a {{{tone}}} tone.
  4.  If generating more than one variant, give each a unique title (e.g., "Option 1 (Firm Decision)", "Option 2 (Firm Decision)"). If generating only one, the title should be an empty string.
  5.  Ensure the response is formatted correctly into the required JSON structure. Bold key phrases in your response text using markdown (e.g., **this is bold**).
  `,
});


const generateDecisionFlow = ai.defineFlow(
  {
    name: 'generateDecisionFlow',
    inputSchema: GenerateDecisionInputSchema,
    outputSchema: GenerateDecisionOutputSchema,
  },
  async (input) => {
    const { output } = await generateDecisionPrompt(input);
    return output!;
  }
);

// Export a wrapper function to be called from the frontend.
export async function generateDecision(input: GenerateDecisionInput): Promise<GenerateDecisionOutput> {
  return generateDecisionFlow(input);
}
