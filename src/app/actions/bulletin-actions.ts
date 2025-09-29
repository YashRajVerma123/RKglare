
'use server'

import { z } from 'zod';
import { addBulletin, deleteBulletin, updateBulletin, Bulletin } from '@/lib/data';
import { revalidatePath, revalidateTag } from 'next/cache';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-server';

const bulletinSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(20),
  coverImage: z.string().url().optional().or(z.literal('')),
});


export async function addBulletinAction(values: z.infer<typeof bulletinSchema>): Promise<Bulletin> {
    const newBulletinId = await addBulletin({
        title: values.title,
        content: values.content,
        coverImage: values.coverImage || undefined,
    });
    
    // To return the full object, we need to fetch it after creation
    const newBulletinDoc = await getDoc(doc(db, 'bulletins', newBulletinId));
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
        await deleteBulletin(bulletinId);
        revalidateTag('bulletins');
        return { success: true };
    } catch (e) {
        console.error("Error deleting bulletin: ", e);
        return { success: false, error: "A server error occurred while deleting the bulletin." };
    }
}

export async function updateBulletinAction(bulletinId: string, values: z.infer<typeof bulletinSchema>) {
    await updateBulletin(bulletinId, {
        title: values.title,
        content: values.content,
        coverImage: values.coverImage || undefined,
    });
    revalidateTag('bulletins');
    revalidatePath(`/admin/edit-bulletin/${bulletinId}`);
}

    