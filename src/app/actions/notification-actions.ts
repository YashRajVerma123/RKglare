
'use server'

import { z } from 'zod';
import { addNotification, deleteNotification, updateNotification } from '@/lib/data';
import { revalidatePath } from 'next/cache';

const notificationSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  image: z.string().url().optional().or(z.literal('')),
});


export async function addNotificationAction(values: z.infer<typeof notificationSchema>) {
    await addNotification({
        title: values.title,
        description: values.description,
        image: values.image || undefined,
    });
    // This won't trigger a re-render on its own in other clients,
    // but it's good practice for data consistency on the current client
    // if we were showing notifications on the admin page.
    revalidatePath('/admin');
}

export async function deleteNotificationAction(notificationId: string) {
    await deleteNotification(notificationId);
    revalidatePath('/admin');
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
