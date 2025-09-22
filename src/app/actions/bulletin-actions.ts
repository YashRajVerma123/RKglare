
'use server';

import { addBulletin } from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { simulatedAiNews } from '@/lib/data-store';

// Helper function to get a random integer
const getRandomInt = (max: number) => Math.floor(Math.random() * max);

// Helper function to shuffle an array
const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export async function generateAndSaveBulletins(): Promise<{ success: boolean; error?: string }> {
  try {
    // Simulate AI thinking and network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 1. "Research" top news by picking 3 random topics from our simulated list
    const shuffledNews = shuffleArray([...simulatedAiNews]);
    const selectedNews = shuffledNews.slice(0, 3);
    
    // 2. "Generate" images and save bulletins
    for (const newsItem of selectedNews) {
        // 3. "Generate" a suitable image using a placeholder service
        const imageSeed = getRandomInt(1000); // Random seed for a unique image
        const coverImage = `https://picsum.photos/seed/${imageSeed}/1200/800`;
        
        const newBulletin = {
            title: newsItem.title,
            content: newsItem.content,
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
    return { success: false, error: "Failed to generate AI bulletins. Please try again later." };
  }
}
