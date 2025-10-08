
'use server'

import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { doc, getDoc, addDoc, collection, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-server';
import { Notification } from '@/lib/data';

const notificationSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  image: z.string().url().optional().or(z.literal('')),
});


export async function addNotificationAction(values: z.infer<typeof notificationSchema>): Promise<Notification> {
    const collectionRef = collection(db, 'notifications');
    const docRef = await addDoc(collectionRef, {
        ...values,
        createdAt: Timestamp.now(),
    });
    
    // To return the full object, we need to fetch it after creation
    const newNotifDoc = await getDoc(doc(db, 'notifications', docRef.id));
    const newNotification = newNotifDoc.data() as Notification;


    revalidateTag('notifications');
    return newNotification;
}

export async function deleteNotificationAction(notificationId: string): Promise<{ success: boolean, error?: string }> {
    if (!notificationId) {
        return { success: false, error: 'Notification ID is required.' };
    }
    try {
        await deleteDoc(doc(db, 'notifications', notificationId));
        revalidateTag('notifications');
        return { success: true };
    } catch (e) {
        console.error("Error deleting notification: ", e);
        return { success: false, error: "A server error occurred while deleting the notification." };
    }
}
<<<<<<< HEAD
=======

    

    
>>>>>>> 1531906a49df14b9e1344220031277afad7a8f21
