
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase-server';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import sgMail from '@sendgrid/mail';

const emailSchema = z.string().email();

export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; error?: string }> {
  const validation = emailSchema.safeParse(email);
  if (!validation.success) {
    return { success: false, error: 'Please provide a valid email address.' };
  }

  try {
    const subscribersCollection = collection(db, 'subscribers');
    
    // Check if the email is already subscribed
    const q = query(subscribersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { success: false, error: 'This email is already subscribed.' };
    }

    // Add the new subscriber
    await addDoc(subscribersCollection, {
      email: email,
      subscribedAt: Timestamp.now(),
    });

    return { success: true };

  } catch (error) {
    console.error("Newsletter subscription failed:", error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function sendCustomNewsletter(subject: string, htmlContent: string) {
    if (!process.env.SENDGRID_API_KEY) {
        throw new Error("SENDGRID_API_KEY is not configured.");
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    try {
        const subscribersCollection = collection(db, 'subscribers');
        const subscribersSnapshot = await getDocs(subscribersCollection);
        const subscriberEmails = subscribersSnapshot.docs.map(doc => doc.data().email);

        if (subscriberEmails.length === 0) {
            throw new Error("There are no subscribers to send to.");
        }

        const msg = {
            to: subscriberEmails,
            from: 'yashrajverma916@gmail.com', // This MUST be your verified single sender email
            subject: subject,
            html: htmlContent,
        };

        await sgMail.sendMultiple(msg);

        console.log(`Custom newsletter sent to ${subscriberEmails.length} subscribers.`);
        return { success: true };

    } catch (error) {
        console.error("Failed to send custom newsletter:", error);
        throw new Error("Failed to send newsletter.");
    }
}
