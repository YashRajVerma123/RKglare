

'use server';

import { db } from '@/lib/firebase-server'; // Use server db
import { doc, runTransaction, increment, collection, getDocs, where, query } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { Author, authorConverter } from '@/lib/data';

export async function toggleFollow(followerId: string, authorId: string, isCurrentlyFollowing: boolean): Promise<{ success: boolean, error?: string }> {
    if (!followerId) {
        return { success: false, error: 'You must be logged in to follow authors.' };
    }
    if (followerId === authorId) {
        return { success: false, error: "You cannot follow yourself." };
    }

    const followerRef = doc(db, 'users', followerId);
    const authorRef = doc(db, 'users', authorId);
    const followDocRef = doc(followerRef, 'following', authorId);
    const followerDocRef = doc(authorRef, 'followers', followerId);


    try {
        await runTransaction(db, async (transaction) => {
            if (isCurrentlyFollowing) {
                // Unfollow logic
                transaction.delete(followDocRef);
                transaction.delete(followerDocRef);
                transaction.update(authorRef, { followers: increment(-1) });
                transaction.update(followerRef, { following: increment(-1) });
            } else {
                // Follow logic
                const followData = { followedAt: new Date(), id: authorId };
                const followerData = { followedAt: new Date(), id: followerId };
                transaction.set(followDocRef, followData);
                transaction.set(followerDocRef, followerData);
                transaction.update(authorRef, { followers: increment(1) });
                transaction.update(followerRef, { following: increment(1) });
            }
        });

        // Revalidate relevant paths
        revalidatePath('/posts/.*', 'page');
        revalidatePath('/about');
        
        return { success: true };
    } catch (error) {
        console.error("Follow/unfollow transaction failed: ", error);
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function removeFollower(userId: string, followerId: string): Promise<{ success: boolean, error?: string }> {
    if (!userId || !followerId) {
        return { success: false, error: 'Invalid user or follower ID.' };
    }

    const userRef = doc(db, 'users', userId);
    const followerRef = doc(db, 'users', followerId);
    const followerDocRef = doc(userRef, 'followers', followerId);
    const followingDocRef = doc(followerRef, 'following', userId);

    try {
         await runTransaction(db, async (transaction) => {
            transaction.delete(followerDocRef);
            transaction.delete(followingDocRef);
            transaction.update(userRef, { followers: increment(-1) });
            transaction.update(followerRef, { following: increment(-1) });
        });
        return { success: true };
    } catch (error) {
        console.error("Remove follower transaction failed:", error);
        return { success: false, error: 'Failed to remove follower.' };
    }
}


export async function getFollowList(userId: string, type: 'followers' | 'following'): Promise<Author[]> {
    if (!userId) return [];
    
    const listCollectionRef = collection(db, 'users', userId, type);
    const listSnapshot = await getDocs(listCollectionRef);
    const userIds = listSnapshot.docs.map(d => d.id);
    
    if (userIds.length === 0) return [];
    
    const usersCollectionRef = collection(db, 'users').withConverter(authorConverter);
    // Firestore 'in' queries are limited to 30 items. For a more scalable solution,
    // you would fetch users individually or in batches. For this app's scale, this is okay.
    const q = query(usersCollectionRef, where('__name__', 'in', userIds));
    
    const usersSnapshot = await getDocs(q);
    
    return usersSnapshot.docs.map(d => d.data());
}

