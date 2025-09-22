
'use server';

import { addBulletin } from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { generateBulletins } from '@/ai/flows/bulletin-flow';

export async function generateAndSaveBulletins(): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. "Research" top news by calling the Genkit flow
    const aiResponse = await generateBulletins();
    if (!aiResponse || !aiResponse.bulletins || aiResponse.bulletins.length === 0) {
        return { success: false, error: 'The AI failed to generate any bulletins. Please try again.' };
    }

    // 2. "Generate" images and save bulletins
    for (const newsItem of aiResponse.bulletins) {
        // 3. "Generate" a suitable image using a placeholder service with AI hint
        const imageSeed = encodeURIComponent(newsItem.imageHint.replace(/\s+/g, '-'));
        const coverImage = `https://picsum.photos/seed/${imageSeed}/1200/800`;
        
        const newBulletin = {
            title: newsItem.title,
            content: newsItem.summary,
            coverImage: coverImage,
        };
        
        // 4. Save the new bulletin to the database
        await addBulletin(newBulletin);
    }
    
    // 5. Revalidate path to show the new bulletins on the page
    revalidatePath('/bulletin');
    revalidatePath('/admin');
    
    return { success: true };
  } catch (error) {
    console.error("Error generating and saving bulletins:", error);
    // Provide a more user-friendly error message
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    if (errorMessage.includes('API key')) {
        return { success: false, error: "The AI service API key is not configured. Please set it in your environment variables."}
    }
    return { success: false, error: `Failed to generate AI bulletins: ${errorMessage}` };
  }
}
