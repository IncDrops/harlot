
'use server';
/**
 * @fileOverview An AI flow to generate an initial analysis for a strategic decision.
 *
 * - generateInitialAnalysis - A function that takes a decision question and returns a structured analysis.
 */

import { ai } from '@/ai/genkit';
import { 
    GenerateInitialAnalysisInputSchema, 
    type GenerateInitialAnalysisInput,
    GenerateInitialAnalysisOutputSchema,
    type GenerateInitialAnalysisOutput,
} from '@/lib/ai-schemas';


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
