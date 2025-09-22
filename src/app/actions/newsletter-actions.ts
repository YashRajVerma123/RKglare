
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase-server';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';

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
