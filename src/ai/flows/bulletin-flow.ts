'use server';
/**
 * @fileOverview An AI flow for generating SEO-optimized bulletin content.
 *
 * - generateBulletinContent - A function that takes a topic and generates a title, content, tags, and a cover image.
 * - GenerateBulletinInput - The input type for the generateBulletinContent function.
 * - GenerateBulletinOutput - The return type for the generateBulletinContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { simulatedAiNews } from '@/lib/data-store';

const GenerateBulletinInputSchema = z.object({
  topic: z.string().describe('A short topic or headline for the bulletin.'),
});
export type GenerateBulletinInput = z.infer<typeof GenerateBulletinInputSchema>;

const GenerateBulletinOutputSchema = z.object({
  title: z.string().describe('An engaging, SEO-friendly title for the bulletin.'),
  content: z.string().describe('A concise, informative paragraph expanding on the title. Around 2-3 sentences.'),
  tags: z.array(z.string()).describe('An array of 3-4 relevant SEO keywords or tags.'),
  imageKeywords: z.string().describe('Two keywords that visually represent the content, to be used for generating an image. For example: "galaxy stars"'),
});
export type GenerateBulletinOutput = z.infer<typeof GenerateBulletinOutputSchema>;


export async function generateBulletinContent(input: GenerateBulletinInput): Promise<GenerateBulletinOutput> {
  return generateBulletinFlow(input);
}

// Helper function to get a random item from an array
const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

const generateBulletinFlow = ai.defineFlow(
  {
    name: 'generateBulletinFlow',
    inputSchema: GenerateBulletinInputSchema,
    outputSchema: GenerateBulletinOutputSchema,
  },
  async (input) => {
    // Instead of calling a real model, we simulate the output.
    // This avoids needing an API key for this demo.
    const randomNews = getRandomItem(simulatedAiNews);

    const output: GenerateBulletinOutput = {
        title: `${input.topic}: ${randomNews.title}`,
        content: randomNews.content,
        tags: input.topic.split(' ').concat(randomNews.title.split(' ').slice(0,2)),
        imageKeywords: randomNews.imageKeywords,
    };
    
    // In a real scenario, you would call the prompt like this:
    /*
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('AI did not return a valid output.');
    }
    */
   
    const imageUrl = `https://source.unsplash.com/1200x800/?${encodeURIComponent(output.imageKeywords)}`;

    return {
        ...output,
        // We are augmenting the output schema here, which is not ideal.
        // In a real app, the image URL would be part of the schema or handled separately.
        // @ts-ignore
        coverImage: imageUrl,
    };
  }
);


// This prompt would be used in a real implementation.
const prompt = ai.definePrompt({
  name: 'generateBulletinPrompt',
  input: {schema: GenerateBulletinInputSchema},
  output: {schema: GenerateBulletinOutputSchema},
  prompt: `You are an expert content strategist for a news blog.
    Given the topic, generate a compelling, SEO-optimized bulletin.
    The bulletin should have a catchy title, a short paragraph of content, and a few relevant tags.
    Also provide two keywords for generating a cover image.

    Topic: {{{topic}}}`,
});
