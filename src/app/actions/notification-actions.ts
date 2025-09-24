
'use server'

import { z } from 'zod';
import { addNotification, deleteNotification, updateNotification, Notification } from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-server';

const notificationSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  image: z.string().url().optional().or(z.literal('')),
});


export async function addNotificationAction(values: z.infer<typeof notificationSchema>): Promise<Notification> {
    const newNotifId = await addNotification({
        title: values.title,
        description: values.description,
        image: values.image || undefined,
    });
    // Re-fetch to get the full object with server-generated timestamp
    const newNotifDoc = await getDoc(doc(db, 'notifications', newNotifId));
    const newNotification = newNotifDoc.data() as Notification;
    
    revalidatePath('/admin');
    return newNotification;
}

export async function deleteNotificationAction(notificationId: string): Promise<{ deletedNotificationId: string }> {
    await deleteNotification(notificationId);
    revalidatePath('/admin');
    return { deletedNotificationId: notificationId };
}

export async function updateNotificationAction(notificationId: string, values: z.infer<typeof notificationSchema>) {
    await updateNotification(notificationId, {
        title: values.title,
        description: values.description,
        image: values.image || undefined,
    });
    revalidatePath('/admin');
    revalidatePath(`/admin/edit-notification/${notificationId}`);
}
