
'use server';

import { db } from '@/lib/firebase-server';
import { addDoc, collection, getDocs, deleteDoc, query, where, limit } from 'firebase/firestore';
import { z } from 'zod';
import { awardPoints } from './gamification-actions';
import { revalidatePath } from 'next/cache';

const emailSchema = z.string().email('Please enter a valid email address.');
const newsletterSchema = z.object({
    title: z.string().min(10),
    content: z.string().min(100),
});

export async function checkSubscriptionStatus(email: string): Promise<{ isSubscribed: boolean }> {
    if (!email) return { isSubscribed: false };
    const validation = emailSchema.safeParse(email);
    if (!validation.success) return { isSubscribed: false };

    const subscribersCollection = collection(db, 'subscribers');
    const q = query(subscribersCollection, where('email', '==', email), limit(1));
    const existingSub = await getDocs(q);

    return { isSubscribed: !existingSub.empty };
}

export async function subscribeToNewsletter(email: string, userId?: string) {
    const validation = emailSchema.safeParse(email);

    if (!validation.success) {
        return { error: validation.error.errors[0].message };
    }

    const { isSubscribed } = await checkSubscriptionStatus(email);

    if (isSubscribed) {
        return { error: 'This email is already subscribed.' };
    }

    await addDoc(collection(db, 'subscribers'), {
        email: email,
        subscribedAt: new Date(),
        userId: userId || null,
    });

    if (userId) {
        await awardPoints(userId, 'SUBSCRIBE');
    }
    
    revalidatePath('/newsletter');
    return { success: true };
}


export async function unsubscribeFromNewsletter(email: string) {
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
        return { error: 'Please enter a valid email address.' };
    }
    
    const subscribersCollection = collection(db, 'subscribers');
    const q = query(subscribersCollection, where('email', '==', email), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return { error: 'This email is not subscribed.' };
    }

    const docToDelete = snapshot.docs[0];
    await deleteDoc(docToDelete.ref);

    revalidatePath('/newsletter');
    return { success: true };
}


export async function generateNewsletterMailto(values: z.infer<typeof newsletterSchema>) {
    const validation = newsletterSchema.safeParse(values);
    if (!validation.success) {
        return { error: validation.error.errors[0].message };
    }

    const subscribersSnapshot = await getDocs(collection(db, 'subscribers'));
    const subscribers = subscribersSnapshot.docs.map(doc => doc.data().email as string);

    if (subscribers.length === 0) {
        return { error: 'There are no subscribers to send this newsletter to.' };
    }
    
    const bcc = subscribers.join(',');
    const subject = encodeURIComponent(values.title);
    const body = encodeURIComponent(values.content);
    
    const mailtoLink = `mailto:?bcc=${bcc}&subject=${subject}&body=${body}`;

    return { success: true, mailtoLink, subscriberCount: subscribers.length };
}
