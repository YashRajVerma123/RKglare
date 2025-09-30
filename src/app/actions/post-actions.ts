

'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { Post, Author } from '@/lib/data';
import { db } from '@/lib/firebase-server'; // Use server db
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, getDocs, limit, getDoc, setDoc, runTransaction, writeBatch, orderBy } from 'firebase/firestore';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  content: z.string().min(100, 'Content must be at least 100 characters.'),
  coverImage: z.string().min(1, 'Please upload a cover image.'),
  tags: z.string().min(1, 'Please enter at least one tag.'),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  trendingPosition: z.coerce.number().min(1).max(10).optional().nullable(),
  readTime: z.coerce.number().min(1, 'Read time must be at least 1 minute.'),
  summary: z.string().optional(),
  premiumOnly: z.boolean().default(false),
  earlyAccess: z.boolean().default(false),
});

// A mock function to get author details. In a real app this might involve a database lookup.
const getAuthorDetails = async (authorId: string): Promise<Author | null> => {
    // In a real app, you'd have a users collection.
    // Let's get the user from our 'users' collection in firestore
    const userRef = doc(db, 'users', authorId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        id: authorId,
        name: userData.name || 'New User',
        avatar: userData.avatar || `https://i.pravatar.cc/150?u=${authorId}`,
        email: userData.email || 'no-email@example.com'
      }
    }
    
    // Fallback for the initial admin user that might not be in the users collection yet.
    if(authorId === 'yash-raj') {
        const adminAuthor = { id: 'yash-raj', name: 'Yash Raj', avatar: 'https://i.pravatar.cc/150?u=yash-raj', email: 'yashrajverma916@gmail.com'};
        await setDoc(doc(db, "users", "yash-raj"), adminAuthor, { merge: true });
        return adminAuthor;
    }

    return null;
}


export async function addPost(values: z.infer<typeof formSchema>, authorId: string): Promise<string> {
    if (!authorId) {
        throw new Error('You must be logged in to create a post.');
    }

    const author = await getAuthorDetails(authorId);
    if (!author) {
         throw new Error('Author details could not be found.');
    }

    const newSlug = values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    await runTransaction(db, async (transaction) => {
        const tagsArray = values.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        const newDocRef = doc(collection(db, 'posts'));
        
        const newPostData: Omit<Post, 'id'> = {
            slug: newSlug,
            title: values.title,
            description: values.description,
            content: values.content,
            coverImage: values.coverImage,
            tags: tagsArray,
            featured: values.featured,
            trending: values.trending,
            trendingPosition: values.trending ? (values.trendingPosition ?? null) : null,
            trendingUntil: null,
            author,
            publishedAt: new Date().toISOString(),
            readTime: values.readTime,
            summary: values.summary || '',
            likes: 0,
            premiumOnly: values.premiumOnly,
            earlyAccess: values.earlyAccess,
        };

        if (newPostData.trending && newPostData.trendingPosition) {
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            newPostData.trendingUntil = sevenDaysFromNow.toISOString();
            
            const postsCollection = collection(db, 'posts');
            const q = query(postsCollection, where('trending', '==', true), where('trendingPosition', '!=', null));
            const trendingSnapshot = await getDocs(q); // Read outside transaction or accept stale data
            
            const postsToUpdate = trendingSnapshot.docs
                .map(d => ({ id: d.id, ...d.data() as Post }))
                .filter(p => p.trendingPosition && p.trendingPosition >= newPostData.trendingPosition!);

            for (const postToShift of postsToUpdate) {
                const newPosition = (postToShift.trendingPosition || 0) + 1;
                const postRef = doc(db, 'posts', postToShift.id);
                if (newPosition > 10) {
                    transaction.update(postRef, { trending: false, trendingPosition: null, trendingUntil: null });
                } else {
                    transaction.update(postRef, { trendingPosition: newPosition });
                }
            }
        }
        
        transaction.set(newDocRef, newPostData);
    });

    revalidateTag('posts');
    revalidatePath('/');
    revalidatePath('/posts');
    
    return newSlug;
}

export async function updatePost(postId: string, values: z.infer<typeof formSchema>): Promise<string> {
  const newSlug = values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  let oldPostData: Post;

  await runTransaction(db, async (transaction) => {
    const postRef = doc(db, 'posts', postId);
    const oldPostSnap = await transaction.get(postRef);
    if (!oldPostSnap.exists()) {
      throw new Error("Post not found");
    }
    oldPostData = oldPostSnap.data() as Post;

    const tagsArray = values.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const updates: Partial<Post> = {
      slug: newSlug,
      title: values.title,
      description: values.description,
      content: values.content,
      coverImage: values.coverImage,
      tags: tagsArray,
      featured: values.featured,
      readTime: values.readTime,
      summary: values.summary || '',
      trending: values.trending,
      trendingPosition: values.trending ? (values.trendingPosition ?? null) : null,
      trendingUntil: oldPostData.trendingUntil,
      premiumOnly: values.premiumOnly,
      earlyAccess: values.earlyAccess,
    };
    
    if (values.trending && !oldPostData.trending) {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        updates.trendingUntil = sevenDaysFromNow.toISOString();
    } else if (!values.trending) {
        updates.trendingPosition = null;
        updates.trendingUntil = null;
    }

    // --- Start of rewritten trending logic ---
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, where('trending', '==', true), where('trendingPosition', '!=', null));
    const trendingSnapshot = await getDocs(q); // Cannot use transaction.get for collection queries
    let currentTrendingPosts = trendingSnapshot.docs.map(p => ({ id: p.id, ...p.data() as Post }));

    // Remove the current post from the list to handle its position change
    currentTrendingPosts = currentTrendingPosts.filter(p => p.id !== postId);

    // If the post is now trending, add it to the list at its new position
    if (updates.trending && updates.trendingPosition) {
        const updatedPostForList = { ...oldPostData, ...updates, id: postId };
        currentTrendingPosts.splice(updates.trendingPosition - 1, 0, updatedPostForList);
    }

    // Re-assign positions to all posts in the list
    for (let i = 0; i < currentTrendingPosts.length; i++) {
        const postToUpdate = currentTrendingPosts[i];
        const newPos = i + 1;
        const pRef = doc(db, 'posts', postToUpdate.id);

        if (postToUpdate.id === postId) continue; // Skip updating the main post here, we do it at the end

        if (newPos > 10) {
            // Demote post if it's beyond the top 10
             transaction.update(pRef, { trending: false, trendingPosition: null, trendingUntil: null });
        } else if (postToUpdate.trendingPosition !== newPos) {
            // Update position if it has changed
            transaction.update(pRef, { trendingPosition: newPos });
        }
    }
    // --- End of rewritten trending logic ---
    
    // Finally, update the target post itself with all its changes
    transaction.update(postRef, updates);
  });

  revalidateTag('posts');
  if (values.featured !== oldPostData!.featured) {
    revalidateTag('featured');
  }
  if (values.trending !== oldPostData!.trending) {
      revalidateTag('trending');
  }
  revalidatePath(`/posts/${newSlug}`);
  if (oldPostData!.slug !== newSlug) {
    revalidatePath(`/posts/${oldPostData!.slug}`);
  }

  return newSlug;
}


export async function deletePost(postId: string): Promise<{ success: boolean, error?: string }> {
  if (!postId) {
    return { success: false, error: 'Post ID is required.' };
  }

  const postRef = doc(db, 'posts', postId);
  
  try {
    // The transaction logic for re-ordering trending posts can be simplified
    // for deletion. Or, for simplicity and robustness, we can just delete the post.
    // The logic to re-order can be handled separately if needed, or considered
    // a non-critical side effect that can be handled by a background job.
    await deleteDoc(postRef);

    revalidateTag('posts');
    return { success: true };
  } catch (e) {
    console.error("Error deleting post: ", e);
    return { success: false, error: "A server error occurred while deleting the post." };
  }
}
