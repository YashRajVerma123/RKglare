
'use server';

import { db } from '@/lib/firebase-server';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address.');
const newsletterSchema = z.object({
    title: z.string().min(10),
    content: z.string().min(100),
});


export async function subscribeToNewsletter(email: string) {
    const validation = emailSchema.safeParse(email);

    if (!validation.success) {
        return { error: validation.error.errors[0].message };
    }

    const subscribersCollection = collection(db, 'subscribers');
    // Check if email already exists
    const existingSub = await getDocs(collection(db, 'subscribers'));
    const isSubscribed = existingSub.docs.some(doc => doc.data().email === email);

    if (isSubscribed) {
        return { error: 'This email is already subscribed.' };
    }

    await addDoc(subscribersCollection, {
        email: email,
        subscribedAt: new Date(),
    });

    return { success: true };
}

export async function sendNewsletterAction(values: z.infer<typeof newsletterSchema>) {
    const subscribersSnapshot = await getDocs(collection(db, 'subscribers'));
    const subscribers = subscribersSnapshot.docs.map(doc => doc.data().email);

    if (subscribers.length === 0) {
        throw new Error('There are no subscribers to send this newsletter to.');
    }

    // In a real app, you would integrate an email service like Resend, SendGrid, or Mailchimp here.
    // For this prototype, we will just simulate the sending process.
    console.log('--- Sending Newsletter ---');
    console.log('Title:', values.title);
    console.log('Content:', values.content);
    console.log(`Simulating sending to ${subscribers.length} subscribers:`);
    console.log(subscribers.join(', '));
    console.log('--------------------------');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return { success: true, subscriberCount: subscribers.length };
}
