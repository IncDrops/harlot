
import { z } from 'zod';

/**
 * @fileOverview Defines the Zod schemas and TypeScript types for AI flows.
 * This file does NOT use 'use server' and can be safely imported into both client and server components.
 */

// Schema for the input of the generateInitialAnalysis flow
export const GenerateInitialAnalysisInputSchema = z.object({
  decisionQuestion: z.string().describe('The core strategic question the user needs help with.'),
  context: z.string().optional().describe('Any additional context, like stakeholders, KPIs, or constraints.'),
});
export type GenerateInitialAnalysisInput = z.infer<typeof GenerateInitialAnalysisInputSchema>;


// Schema for the output of the generateInitialAnalysis flow
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
