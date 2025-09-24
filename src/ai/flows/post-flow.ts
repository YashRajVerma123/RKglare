
'use server';
/**
 * @fileOverview An AI flow for generating complete, SEO-optimized blog posts.
 *
 * - generatePostContent - A function that takes a topic and generates a full post.
 * - GeneratePostInput - The input type for the generatePostContent function.
 * - GeneratePostOutput - The return type for the generatePostContent function.
 */

import {z} from 'zod';
import { simulatedAiNews } from '@/lib/data-store';

const GeneratePostInputSchema = z.object({
  topic: z.string().describe('A short topic or headline for the blog post.'),
});
export type GeneratePostInput = z.infer<typeof GeneratePostInputSchema>;

const GeneratePostOutputSchema = z.object({
  title: z.string().describe('An engaging, SEO-friendly title for the blog post.'),
  description: z.string().describe('A concise, meta-description-friendly summary of the post. Around 150-160 characters.'),
  content: z.string().describe('The full content of the blog post, formatted as a single block of well-structured HTML. Use headings (h3), paragraphs (p), and lists (ul, ol, li) to organize the content.'),
  tags: z.array(z.string()).describe('An array of 4-5 relevant SEO keywords or tags.'),
  imageKeywords: z.string().describe('Two or three keywords that visually represent the content, to be used for generating a cover image. For example: "quantum computer circuit"'),
});
export type GeneratePostOutput = z.infer<typeof GeneratePostOutputSchema>;

// Helper function to get a random item from an array
const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];


export async function generatePostContent(input: GeneratePostInput): Promise<GeneratePostOutput & { coverImage: string }> {
  // Simulate AI generation since Genkit packages are removed.
  console.log(`Simulating post generation for topic: ${input.topic}`);
  
  const randomNews = getRandomItem(simulatedAiNews);
  
  const output: GeneratePostOutput = {
    title: `${input.topic}: ${randomNews.title}`,
    description: `A detailed look at ${input.topic}, focusing on the recent breakthrough: ${randomNews.title}. ${randomNews.content}`,
    content: `<h3>The Dawn of a New Era</h3><p>${randomNews.content}</p><p>This development has wide-ranging implications for the industry and consumers alike. Experts are optimistic about the potential for future growth and innovation.</p><h3>What's Next?</h3><p>While the initial results are promising, there is still much work to be done. Researchers will continue to refine the process and explore new applications.</p>`,
    tags: [input.topic, ...randomNews.title.split(' ').slice(0, 3)],
    imageKeywords: randomNews.imageKeywords,
  };

  const imageUrl = `https://source.unsplash.com/1200x800/?${encodeURIComponent(output.imageKeywords)}`;

  return {
      ...output,
      coverImage: imageUrl,
  };
}
