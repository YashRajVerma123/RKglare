
'use server'

import { z } from 'zod';
import { addBulletin, deleteBulletin, updateBulletin } from '@/lib/data';
import { revalidatePath } from 'next/cache';

const bulletinSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(20),
  coverImage: z.string().url().optional().or(z.literal('')),
});


export async function addBulletinAction(values: z.infer<typeof bulletinSchema>) {
    await addBulletin({
        title: values.title,
        content: values.content,
        coverImage: values.coverImage || undefined,
    });
    revalidatePath('/admin');
    revalidatePath('/bulletin');
}

export async function deleteBulletinAction(bulletinId: string) {
    await deleteBulletin(bulletinId);
    revalidatePath('/admin');
    revalidatePath('/bulletin');
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
