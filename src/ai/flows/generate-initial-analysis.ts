'use server';
/**
 * @fileOverview An AI flow to generate an initial analysis for a strategic decision.
 *
 * - generateInitialAnalysis - A function that takes a decision question and returns a structured analysis.
 * - GenerateInitialAnalysisInput - The input type for the function.
 * - GenerateInitialAnalysisOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const GenerateInitialAnalysisInputSchema = z.object({
  decisionQuestion: z.string().describe('The core strategic question the user needs help with.'),
  context: z.string().optional().describe('Any additional context, like stakeholders, KPIs, or constraints.'),
});
export type GenerateInitialAnalysisInput = z.infer<typeof GenerateInitialAnalysisInputSchema>;

export const GenerateInitialAnalysisOutputSchema = z.object({
  primaryRecommendation: z.string().describe("The AI's primary recommendation or course of action."),
  executiveSummary: z.string().describe('A concise summary of the analysis, written for a business executive.'),
  keyFactors: z.array(z.object({
      factor: z.string().describe('A key factor, metric, or consideration.'),
      impact: z.number().min(1).max(5).describe('The estimated impact of this factor (1=low, 5=high).'),
      value: z.string().describe('A brief description or value associated with the factor.'),
  })).describe('A list of the most important factors influencing the decision.'),
  risks: z.array(z.object({
      risk: z.string().describe('A potential risk or downside.'),
      mitigation: z.string().describe('A suggested strategy to mitigate this risk.'),
  })).describe('A list of potential risks and mitigation strategies.'),
  confidenceScore: z.number().min(0).max(100).describe('The AI model\'s confidence in its analysis, from 0 to 100.'),
});
export type GenerateInitialAnalysisOutput = z.infer<typeof GenerateInitialAnalysisOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateInitialAnalysisPrompt',
  input: { schema: GenerateInitialAnalysisInputSchema },
  output: { schema: GenerateInitialAnalysisOutputSchema },
  prompt: `You are Pollitago, an unbiased, world-class strategic advisor for enterprise businesses. Your purpose is to transform complex business questions and data into clear, confident, and explainable strategic recommendations.

  A user is asking for an analysis on the following decision:

  Decision Question: {{{decisionQuestion}}}

  {{#if context}}
  Additional Context: {{{context}}}
  {{/if}}

  Based on this, provide a comprehensive initial analysis. Generate a primary recommendation, a concise executive summary, identify the key factors and potential risks with mitigation strategies, and provide a confidence score for your analysis. Structure your response in the requested JSON format.
  `,
});

const generateInitialAnalysisFlow = ai.defineFlow(
  {
    name: 'generateInitialAnalysisFlow',
    inputSchema: GenerateInitialAnalysisInputSchema,
    outputSchema: GenerateInitialAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);


export async function generateInitialAnalysis(input: GenerateInitialAnalysisInput): Promise<GenerateInitialAnalysisOutput> {
    return generateInitialAnalysisFlow(input);
}
