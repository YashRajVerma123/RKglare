
'use server'

import { db } from '@/lib/firebase-server';
import { doc, runTransaction, Timestamp, getDoc } from 'firebase/firestore';
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

            const now = new Date();
            let newExpiryDate: Date;
            
            const isPremium = user.premium?.active === true && user.premium?.expires && new Date(user.premium.expires) > now;

            if (isPremium && user.premium!.expires) {
                newExpiryDate = new Date(user.premium!.expires);
                newExpiryDate.setDate(newExpiryDate.getDate() + option.days);
            } else {
                newExpiryDate = new Date();
                newExpiryDate.setDate(now.getDate() + option.days);
            }

            transaction.update(userRef, {
                points: currentPoints - option.points,
                premium: {
                    active: true,
                    expires: Timestamp.fromDate(newExpiryDate),
                },
            });
        });

        revalidateTag(`author-id:${userId}`);
        revalidateTag('premium_users');

        return { success: true };

    } catch (error) {
        console.error("Subscription purchase failed:", error);
        return { success: false, error: (error as Error).message };
    }
}


export async function manageUserSubscription(
    adminId: string,
    targetUserId: string,
    days: number
): Promise<{ success: boolean; error?: string }> {
    const adminRef = doc(db, 'users', adminId);
    const adminDoc = await getDoc(adminRef);
    if (!adminDoc.exists() || adminDoc.data().email !== 'yashrajverma916@gmail.com') {
        return { success: false, error: 'Unauthorized action.' };
    }

    if (!targetUserId) {
        return { success: false, error: 'Target user ID is required.' };
    }
    
    const userRef = doc(db, 'users', targetUserId).withConverter(authorConverter);

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error('User not found.');
            }

            const user = userDoc.data();
            const now = new Date();
            let newExpiryDate: Date;

            const isPremium = user.premium?.active === true && user.premium?.expires && new Date(user.premium.expires) > now;
            
            if (days > 0) { // Adding days
                if (isPremium && user.premium!.expires) {
                    newExpiryDate = new Date(user.premium!.expires);
                    newExpiryDate.setDate(newExpiryDate.getDate() + days);
                } else {
                    newExpiryDate = new Date();
                    newExpiryDate.setDate(now.getDate() + days);
                }
                transaction.update(userRef, {
                    premium: { active: true, expires: Timestamp.fromDate(newExpiryDate) }
                });
            } else { // Removing subscription
                 transaction.update(userRef, {
                    premium: { active: false, expires: null }
                });
            }
        });
        
        revalidateTag(`author-id:${targetUserId}`);
        revalidateTag('premium_users');
        return { success: true };

    } catch (error) {
        console.error("Subscription management failed:", error);
        return { success: false, error: (error as Error).message };
    }
}
