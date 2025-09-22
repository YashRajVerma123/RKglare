
'use server';

import { db } from '@/lib/firebase-server';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { z } from 'zod';
import { Resend } from 'resend';

const emailSchema = z.string().email('Please enter a valid email address.');
const newsletterSchema = z.object({
    title: z.string().min(10),
    content: z.string().min(100),
});

// Initialize Resend with the API key from your .env file
const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Send a welcome email
    try {
        await resend.emails.send({
            from: 'newsletter@glare.ac', // IMPORTANT: This must be a verified domain on Resend
            to: email,
            subject: 'Welcome to the Glare Newsletter!',
            html: `<h1>Welcome!</h1><p>You've successfully subscribed to the Glare newsletter. We're excited to have you.</p>`,
        });
    } catch (error) {
        console.warn('Welcome email failed to send:', error);
        // We don't block the subscription if the welcome email fails
    }

    return { success: true };
}

export async function sendNewsletterAction(values: z.infer<typeof newsletterSchema>) {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('Resend API key is not configured. Please add RESEND_API_KEY to your .env file.');
    }
    
    const subscribersSnapshot = await getDocs(collection(db, 'subscribers'));
    const subscribers = subscribersSnapshot.docs.map(doc => doc.data().email as string);

    if (subscribers.length === 0) {
        throw new Error('There are no subscribers to send this newsletter to.');
    }
    
    try {
        const { data, error } = await resend.emails.send({
            from: 'newsletter@glare.ac', // IMPORTANT: This must be a verified domain on Resend
            to: subscribers, // Resend can handle arrays of recipients
            subject: values.title,
            html: values.content,
        });

        if (error) {
            console.error('Resend API Error:', error);
            throw new Error(`Failed to send newsletter: ${error.message}`);
        }

    } catch (error) {
        console.error("Error sending newsletter:", error);
        throw new Error((error as Error).message || 'An unexpected error occurred while sending the newsletter.');
    }

    return { success: true, subscriberCount: subscribers.length };
}
