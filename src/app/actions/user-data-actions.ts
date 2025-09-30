
'use server';

import { db } from '@/lib/firebase-server';
import { collection, doc, getDoc, setDoc, runTransaction, increment, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { awardPoints } from './gamification-actions';

// Unified function to get user-specific data
export async function getUserData(userId: string) {
    if (!userId) {
        return { likedPosts: {}, likedComments: {}, bookmarks: {} };
    }
    const userDataRef = doc(db, 'users', userId, 'userData', 'data');
    const docSnap = await getDoc(userDataRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            likedPosts: data.likedPosts || {},
            likedComments: data.likedComments || {},
            bookmarks: data.bookmarks || {},
        };
    }
    return { likedPosts: {}, likedComments: {}, bookmarks: {} };
}

// Unified function to update user-specific data
async function updateUserData(userId: string, updates: any) {
    if (!userId) return;
    const userDataRef = doc(db, 'users', userId, 'userData', 'data');
    await setDoc(userDataRef, updates, { merge: true });
}

// Action to toggle a post like
export async function togglePostLike(userId: string, postId: string, postSlug: string, isLiked: boolean) {
    if (!userId) return { error: 'User not authenticated' };
    
    const postRef = doc(db, 'posts', postId);

    try {
        await runTransaction(db, async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists()) {
                throw "Post does not exist!";
            }
            // Update the post's like count
            const newLikeCount = increment(isLiked ? -1 : 1);
            transaction.update(postRef, { likes: newLikeCount });

            // Award points for liking, but not for unliking
            if (!isLiked) {
                const userRef = doc(db, 'users', userId);
                transaction.update(userRef, { points: increment(3) });
            }
        });
        
        const newLikedPosts = { [postId]: !isLiked };
        await updateUserData(userId, { likedPosts: newLikedPosts });

        revalidatePath(`/posts/${postSlug}`);
        return { success: true };

    } catch (error) {
        console.error("Like transaction failed: ", error);
        return { error: 'Failed to update like count.' };
    }
}

// Action to toggle a comment like
export async function toggleCommentLike(userId: string, postId: string, commentId: string, isLiked: boolean) {
    if (!userId) return { error: 'User not authenticated' };

    const commentRef = doc(db, 'posts', postId, 'comments', commentId);

    try {
        await runTransaction(db, async (transaction) => {
            const commentDoc = await transaction.get(commentRef);
            if (!commentDoc.exists()) {
                throw "Comment does not exist!";
            }
            transaction.update(commentRef, { likes: increment(isLiked ? -1 : 1) });
        });
        
        const newLikedComments = { [commentId]: !isLiked };
        await updateUserData(userId, { likedComments: newLikedComments });
        
        const postDoc = await getDoc(doc(db, 'posts', postId));
        const postSlug = postDoc.data()?.slug;
        if (postSlug) {
            revalidatePath(`/posts/${postSlug}`);
        }
        
        return { success: true };

    } catch (error) {
        console.error("Like transaction failed: ", error);
        return { error: 'Failed to update like count.' };
    }
}


// Action to toggle a bookmark
export async function toggleBookmark(userId: string, postId: string, isBookmarked: boolean, postDetails: { slug: string, title: string, description: string, coverImage: string }) {
    if (!userId) return { error: 'User not authenticated' };

    const userDataRef = doc(db, 'users', userId, 'userData', 'data');
    const userData = (await getDoc(userDataRef)).data() || {};
    const newBookmarks = { ...(userData.bookmarks || {}) };

    if (isBookmarked) {
        delete newBookmarks[postId];
    } else {
        newBookmarks[postId] = {
            ...postDetails,
            bookmarkedAt: new Date().toISOString()
        };
    }

    await updateUserData(userId, { bookmarks: newBookmarks });
    revalidatePath('/bookmarks');
    return { success: true, newBookmarks };
}

export async function updateReadingProgress(userId: string, postId: string, scrollPosition: number) {
    if (!userId) return;
    const key = `bookmarks.${postId}.scrollPosition`;
    await updateUserData(userId, { [key]: scrollPosition });
}
