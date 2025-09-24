
'use server'

import { z } from 'zod';
import { addBulletin, deleteBulletin, updateBulletin, Bulletin } from '@/lib/data';
import { revalidatePath } from 'next/cache';
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


    revalidatePath('/admin');
    revalidatePath('/bulletin');
    return newBulletin;
}

export async function deleteBulletinAction(bulletinId: string): Promise<{ deletedBulletinId: string }> {
    await deleteBulletin(bulletinId);
    revalidatePath('/admin');
    revalidatePath('/bulletin');
    return { deletedBulletinId: bulletinId };
}

export async function updateBulletinAction(bulletinId: string, values: z.infer<typeof bulletinSchema>) {
    await updateBulletin(bulletinId, {
        title: values.title,
        content: values.content,
        coverImage: values.coverImage || undefined,
    });
    revalidatePath('/admin');
    revalidatePath('/bulletin');
    revalidatePath(`/admin/edit-bulletin/${bulletinId}`);
}
