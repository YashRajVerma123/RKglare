
'use server'

import { db } from '@/lib/firebase-server';
import { doc, runTransaction, Timestamp } from 'firebase/firestore';
import { Author, authorConverter } from '@/lib/data';
import { revalidateTag } from 'next/cache';

const subscriptionOptions = {
    '7_days': { points: 300, days: 7 },
    '30_days': { points: 1000, days: 30 },
};

export async function purchaseSubscription(
    userId: string, 
    plan: keyof typeof subscriptionOptions
): Promise<{ success: boolean; error?: string }> {
    if (!userId) {
        return { success: false, error: 'User not authenticated.' };
    }

    const option = subscriptionOptions[plan];
    if (!option) {
        return { success: false, error: 'Invalid subscription plan.' };
    }

    const userRef = doc(db, 'users', userId).withConverter(authorConverter);

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error('User not found.');
            }

            const user = userDoc.data();
            const currentPoints = user.points || 0;

            if (currentPoints < option.points) {
                throw new Error('Not enough points to purchase this subscription.');
            }

            // Calculate new expiration date
            const now = new Date();
            let newExpiryDate: Date;
            
            const isPremium = user.premium?.active === true && user.premium?.expires && new Date(user.premium.expires) > now;

            if (isPremium && user.premium!.expires) {
                // If user is already premium, extend their subscription
                newExpiryDate = new Date(user.premium!.expires);
                newExpiryDate.setDate(newExpiryDate.getDate() + option.days);
            } else {
                // If not premium or subscription expired, start new subscription from today
                newExpiryDate = new Date();
                newExpiryDate.setDate(now.getDate() + option.days);
            }

            // Deduct points and update premium status
            transaction.update(userRef, {
                points: currentPoints - option.points,
                premium: {
                    active: true,
                    expires: Timestamp.fromDate(newExpiryDate),
                },
            });
        });

        // Revalidate user-related data
        revalidateTag(`author-id:${userId}`);
        revalidateTag('premium_users');

        return { success: true };

    } catch (error) {
        console.error("Subscription purchase failed:", error);
        return { success: false, error: (error as Error).message };
    }
}
