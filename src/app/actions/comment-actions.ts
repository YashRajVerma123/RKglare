
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { Author, Comment } from '@/lib/data';
import { db } from '@/lib/firebase-server'; // Use server db
import { collection, doc, addDoc, updateDoc, deleteDoc, runTransaction, Timestamp, getDoc, writeBatch, where, query, getDocs, setDoc } from 'firebase/firestore';
import { awardPoints } from './gamification-actions';

export async function addComment(
    postId: string, 
    content: string, 
    author: Author,
    parentId: string | null = null
) {
    if (!postId) {
        return { error: 'Post not found.' };
    }
    if (!author) {
        return { error: 'You must be logged in to comment.' };
    }
    
    // Create a new ref to get an ID
    const newCommentRef = doc(collection(db, 'posts', postId, 'comments'));
    
    const newCommentData = {
        id: newCommentRef.id,
        content,
        author,
        createdAt: Timestamp.now(),
        likes: 0,
        highlighted: false,
        pinned: false,
        parentId,
    };
    
    // Use setDoc to save the comment with the generated ID
    await setDoc(newCommentRef, newCommentData);
    
    // Award points for commenting
    await awardPoints(author.id, 'COMMENT');
    
    const postDoc = await getDoc(doc(db, 'posts', postId));
    const postSlug = postDoc.data()?.slug;

    // The data is already complete, just format the timestamp
    const newComment: Comment = {
        ...newCommentData,
        createdAt: newCommentData.createdAt.toDate().toISOString(),
    };

    if (postSlug) {
      revalidateTag(`comments:${postId}`);
      revalidatePath(`/posts/${postSlug}`);
    }
    
    return { comment: newComment };
}


export async function toggleCommentLike(postId: string, commentId: string, isLiked: boolean) {
    const postRef = doc(db, 'posts', postId);
    const commentRef = doc(postRef, 'comments', commentId);

    try {
        const newLikes = await runTransaction(db, async (transaction) => {
            const commentDoc = await transaction.get(commentRef);
            if (!commentDoc.exists()) {
                throw "Comment does not exist!";
            }
            const currentLikes = commentDoc.data().likes || 0;
            const newLikeCount = isLiked ? currentLikes - 1 : currentLikes + 1;
            transaction.update(commentRef, { likes: newLikeCount < 0 ? 0 : newLikeCount });
            return newLikeCount < 0 ? 0 : newLikeCount;
        });
        
        const postDoc = await getDoc(postRef);
        const postSlug = postDoc.data()?.slug;
        if (postSlug) {
            revalidateTag(`comments:${postId}`);
            revalidatePath(`/posts/${postSlug}`);
        }

        return { success: true, newLikes };

    } catch (error) {
        console.error("Like transaction failed: ", error);
        return { error: 'Failed to update like count.' };
    }
}

export async function updateComment(postId: string, commentId: string, newContent: string, authorId: string, isAdmin: boolean) {
    const postRef = doc(db, 'posts', postId);
    const commentRef = doc(postRef, 'comments', commentId);

    const commentDoc = await getDoc(commentRef);
    if (!commentDoc.exists()) {
       return { error: 'Comment not found.' };
    }

    const commentData = commentDoc.data();
    if (commentData.author.id !== authorId && !isAdmin) {
        return { error: 'You are not authorized to edit this comment.' };
    }

    await updateDoc(commentRef, { content: newContent });
    
    const postDoc = await getDoc(postRef);
    const postSlug = postDoc.data()?.slug;

    const updatedComment = { ...commentData, id: commentId, content: newContent, createdAt: (commentData.createdAt as Timestamp).toDate().toISOString() } as Comment;

    if (postSlug) {
        revalidateTag(`comments:${postId}`);
        revalidatePath(`/posts/${postSlug}`);
    }
    
    return { success: true, updatedComment };
}

export async function deleteComment(postId: string, commentId: string, authorId: string, isAdmin: boolean) {
    const postRef = doc(db, 'posts', postId);
    const commentsCollection = collection(postRef, 'comments');
    const commentRef = doc(commentsCollection, commentId);
    
    const commentDoc = await getDoc(commentRef);
    if (!commentDoc.exists()) {
       return { error: 'Comment not found.' };
    }
    
    const commentData = commentDoc.data();
    if (commentData.author.id !== authorId && !isAdmin) {
        return { error: 'You are not authorized to delete this comment.' };
    }
    
    const batch = writeBatch(db);

    // Find all replies to the comment
    const repliesQuery = query(commentsCollection, where('parentId', '==', commentId));
    const repliesSnapshot = await getDocs(repliesQuery);
    repliesSnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    // Delete the main comment
    batch.delete(commentRef);

    await batch.commit();

    const postDoc = await getDoc(postRef);
    const postSlug = postDoc.data()?.slug;
    if (postSlug) {
        revalidateTag(`comments:${postId}`);
        revalidatePath(`/posts/${postSlug}`);
    }
    return { success: true };
}


export async function toggleCommentHighlight(postId: string, commentId: string, isAdmin: boolean) {
    if (!isAdmin) {
        return { error: "You are not authorized to perform this action." };
    }
    const postRef = doc(db, 'posts', postId);
    const commentRef = doc(postRef, 'comments', commentId);

    const commentDoc = await getDoc(commentRef);
    if (!commentDoc.exists()) {
       return { error: 'Comment not found.' };
    }
    
    const commentData = commentDoc.data();
    const newHighlightedState = !commentData.highlighted;
    await updateDoc(commentRef, { highlighted: newHighlightedState });
    
    const postDoc = await getDoc(postRef);
    const postSlug = postDoc.data()?.slug;

    const updatedComment = { ...commentData, id: commentId, highlighted: newHighlightedState, createdAt: (commentData.createdAt as Timestamp).toDate().toISOString() } as Comment;

    if (postSlug) {
        revalidateTag(`comments:${postId}`);
        revalidatePath(`/posts/${postSlug}`);
    }
    return { success: true, updatedComment };
}

export async function toggleCommentPin(postId: string, commentId: string, isAdmin: boolean) {
     if (!isAdmin) {
        return { error: "You are not authorized to perform this action." };
    }
    const postRef = doc(db, 'posts', postId);
    const commentRef = doc(postRef, 'comments', commentId);

    const commentDoc = await getDoc(commentRef);
    if (!commentDoc.exists()) {
       return { error: 'Comment not found.' };
    }
    
    const commentData = commentDoc.data();
    const newPinnedState = !commentData.pinned;
    await updateDoc(commentRef, { pinned: newPinnedState });
    
    const postDoc = await getDoc(postRef);
    const postSlug = postDoc.data()?.slug;

    const updatedComment = { ...commentData, id: commentId, pinned: newPinnedState, createdAt: (commentData.createdAt as Timestamp).toDate().toISOString() } as Comment;
    
    if (postSlug) {
        revalidateTag(`comments:${postId}`);
        revalidatePath(`/posts/${postSlug}`);
    }
    return { success: true, updatedComment };
}

    
