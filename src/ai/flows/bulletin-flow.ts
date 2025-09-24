'use server';
/**
 * @fileOverview An AI flow for generating SEO-optimized bulletin content.
 *
 * - generateBulletinContent - A function that takes a topic and generates a title, content, tags, and a cover image.
 * - GenerateBulletinInput - The input type for the generateBulletinContent function.
 * - GenerateBulletinOutput - The return type for the generateBulletinContent function.
 */

import {z} from 'zod';
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


// Helper function to get a random item from an array
const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

export async function generateBulletinContent(input: GenerateBulletinInput): Promise<GenerateBulletinOutput & { coverImage: string }> {
    // Simulate AI generation since Genkit packages are removed.
    console.log(`Simulating bulletin generation for topic: ${input.topic}`);
    
    const randomNews = getRandomItem(simulatedAiNews);

    const output: GenerateBulletinOutput = {
        title: `${input.topic}: ${randomNews.title}`,
        content: randomNews.content,
        tags: input.topic.split(' ').concat(randomNews.title.split(' ').slice(0,2)),
        imageKeywords: randomNews.imageKeywords,
    };
    
    const imageUrl = `https://source.unsplash.com/1200x800/?${encodeURIComponent(output.imageKeywords)}`;

    return {
        ...output,
        coverImage: imageUrl,
    };
}
