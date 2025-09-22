
'use server';
/**
 * @fileOverview An AI flow for generating news bulletins.
 * 
 * - generateBulletins - A function that generates 3 news bulletins.
 * - BulletinOutput - The output schema for the generated bulletins.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const BulletinSchema = z.object({
  title: z.string().describe('A catchy, news-style title for the bulletin.'),
  summary: z.string().describe('A concise summary of the news topic, between 20 and 40 words.'),
  imageHint: z.string().describe('A two-word hint for a suitable background image (e.g., "financial markets", "space exploration").'),
});

const BulletinOutputSchema = z.object({
  bulletins: z.array(BulletinSchema).describe('An array of 3 generated news bulletins.'),
});
export type BulletinOutput = z.infer<typeof BulletinOutputSchema>;

const bulletinPrompt = ai.definePrompt({
  name: 'bulletinPrompt',
  output: { schema: BulletinOutputSchema },
  config: {
    temperature: 1.0, // Set temperature for more creative/varied responses
  },
  prompt: `
    You are a world-class news analyst AI. Your task is to identify three distinct and significant news topics from the last 24 hours.

    For each topic, provide:
    1. A short, compelling title.
    2. A summary of 20-40 words, written in a clear and easily understandable style.
    3. A two-word hint for a suitable background image.

    The topics should be diverse, covering areas like technology, science, world events, or finance.
    Focus on topics with high search ranking potential and broad interest.
  `,
});

export async function generateBulletins(): Promise<BulletinOutput> {
  const { output } = await bulletinPrompt();
  if (!output) {
    throw new Error("AI failed to return an output for the bulletin prompt.");
  }
  return output;
}
