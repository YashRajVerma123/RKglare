
'use server';
/**
 * @fileOverview An AI flow for generating complete, SEO-optimized blog posts.
 *
 * - generatePostContent - A function that takes a topic and generates a full post.
 * - GeneratePostInput - The input type for the generatePostContent function.
 * - GeneratePostOutput - The return type for the generatePostContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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


export async function generatePostContent(input: GeneratePostInput): Promise<GeneratePostOutput> {
  return generatePostFlow(input);
}

const generatePostFlow = ai.defineFlow(
  {
    name: 'generatePostFlow',
    inputSchema: GeneratePostInputSchema,
    outputSchema: GeneratePostOutputSchema,
  },
  async (input) => {
    
    const { output } = await prompt(input);
    if (!output) {
        throw new Error('AI did not return a valid output.');
    }
   
    const imageUrl = `https://source.unsplash.com/1200x800/?${encodeURIComponent(output.imageKeywords)}`;

    return {
        ...output,
        // @ts-ignore
        coverImage: imageUrl,
    };
  }
);


const prompt = ai.definePrompt({
  name: 'generatePostPrompt',
  input: {schema: GeneratePostInputSchema},
  output: {schema: GeneratePostOutputSchema},
  prompt: `You are an expert content creator and SEO strategist for a modern tech and science blog called "Glare".
    Your tone is insightful, clear, and engaging for a tech-savvy audience.

    Given the following topic, generate a complete, SEO-optimized blog post.

    The output must be a single, valid JSON object that adheres to the output schema.

    The 'content' field must be a single string of well-structured HTML. Use elements like <h3> for subheadings, <p> for paragraphs, and lists (<ul>, <ol>, <li>) where appropriate. Do not include <html>, <body>, or <head> tags. Start with an engaging introduction, develop the body of the post with several subheadings, and finish with a strong conclusion.

    The 'description' should be a concise summary suitable for a meta description, around 150 characters.

    The 'tags' should be an array of 4-5 relevant keywords.

    The 'imageKeywords' should be 2-3 words that visually represent the article's core theme for a stock photo search.

    Topic: {{{topic}}}`,
});

    