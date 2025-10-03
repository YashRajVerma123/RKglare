
'use server'

import { z } from 'zod';
import { revalidateTag, revalidatePath } from 'next/cache';
import { doc, getDoc, addDoc, collection, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-server';
import { Bulletin } from '@/lib/data';

const bulletinSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(20),
  coverImage: z.string().url().optional().or(z.literal('')),
});


export async function addBulletinAction(values: z.infer<typeof bulletinSchema>): Promise<Bulletin> {
    const collectionRef = collection(db, 'bulletins');
    const docRef = await addDoc(collectionRef, {
        title: values.title,
        content: values.content,
        coverImage: values.coverImage || undefined,
        publishedAt: Timestamp.now(),
    });
    
    // To return the full object, we need to fetch it after creation
    const newBulletinDoc = await getDoc(doc(db, 'bulletins', docRef.id));
    const newBulletin = newBulletinDoc.data() as Bulletin;


    revalidateTag('bulletins');
    revalidatePath('/bulletin');
    return newBulletin;
}

export async function deleteBulletinAction(bulletinId: string): Promise<{ success: boolean, error?: string }> {
    if (!bulletinId) {
        return { success: false, error: 'Bulletin ID is required.' };
    }
    try {
        await deleteDoc(doc(db, 'bulletins', bulletinId));
        revalidateTag('bulletins');
        return { success: true };
    } catch (e) {
        console.error("Error deleting bulletin: ", e);
        return { success: false, error: "A server error occurred while deleting the bulletin." };
    }
}
