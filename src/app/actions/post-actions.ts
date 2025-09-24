
'use server';

import { revalidatePath } from 'next/cache';
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
        
        let newTrendingPosts: (Post & { id: string })[] = [];
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
            trendingPosition: values.trendingPosition || null,
            trendingUntil: null,
            author,
            publishedAt: new Date().toISOString(),
            readTime: values.readTime,
            summary: values.summary || '',
            likes: 0,
        };

        if (values.trending && values.trendingPosition) {
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            newPostData.trendingUntil = sevenDaysFromNow.toISOString();

            const postsCollection = collection(db, 'posts');
            const q = query(postsCollection, where('trending', '==', true));
            const trendingSnapshot = await getDocs(q);
            
            const currentTrendingPosts = trendingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Post }));
            
            let postsToShift = currentTrendingPosts
                .filter(p => p.trendingPosition && p.trendingPosition >= values.trendingPosition!)
                .sort((a, b) => a.trendingPosition! - b.trendingPosition!);
            
            newTrendingPosts = currentTrendingPosts.filter(p => !postsToShift.includes(p) && p.id !== newDocRef.id);
            newTrendingPosts.push({ id: newDocRef.id, ...newPostData });
            
            let currentPos = values.trendingPosition! + 1;
            for (const postToShift of postsToShift) {
                if (currentPos <= 10) {
                    postToShift.trendingPosition = currentPos;
                    newTrendingPosts.push(postToShift);
                    currentPos++;
                } else {
                    const postRef = doc(db, 'posts', postToShift.id);
                    transaction.update(postRef, { trending: false, trendingPosition: null, trendingUntil: null });
                }
            }
        }
        
        transaction.set(newDocRef, newPostData);

        for (const post of newTrendingPosts) {
            const postRef = doc(db, 'posts', post.id);
            transaction.update(postRef, { trendingPosition: post.trendingPosition });
        }
    });

    revalidatePath('/');
    revalidatePath('/posts');
    revalidatePath('/admin');
    
    return newSlug;
}

export async function updatePost(postId: string, values: z.infer<typeof formSchema>): Promise<string> {
  const newSlug = values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  await runTransaction(db, async (transaction) => {
    const postRef = doc(db, 'posts', postId);
    const oldPostSnap = await transaction.get(postRef);
    if (!oldPostSnap.exists()) {
      throw new Error("Post not found");
    }
    const oldPostData = oldPostSnap.data() as Post;

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
      trendingPosition: values.trending ? values.trendingPosition : null,
    };
    
    if (values.trending && !oldPostData.trending) {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        updates.trendingUntil = sevenDaysFromNow.toISOString();
    } else if (!values.trending) {
        updates.trendingUntil = null;
    }

    // First apply the basic updates
    transaction.update(postRef, updates);
    
    const wasTrending = oldPostData.trending;
    const isTrending = values.trending;
    const oldPosition = oldPostData.trendingPosition;
    const newPosition = values.trendingPosition;

    // If trending status or position has changed, re-calculate all positions
    if (isTrending || wasTrending) {
      const postsCollection = collection(db, 'posts');
      const q = query(postsCollection, where('trending', '==', true));
      const snapshot = await getDocs(q); // Use getDocs, not transaction.get for queries in transactions
      let currentTrendingPosts = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Post) }));

      // If the current post is being updated, make sure we have its latest data in our array
      const thisPostInList = currentTrendingPosts.find(p => p.id === postId);
      if (thisPostInList) {
          Object.assign(thisPostInList, updates);
      } else if (isTrending) {
          // If it wasn't trending but now is, add it
          currentTrendingPosts.push({ id: postId, ...oldPostData, ...updates });
      }
      
      // Filter out any posts that should no longer be trending
      let rankedList = currentTrendingPosts.filter(p => p.trending && p.id !== postId);

      if (isTrending && newPosition) {
          // Insert the updated post at its new position
          rankedList.splice(newPosition - 1, 0, { id: postId, ...oldPostData, ...updates });
      }

      // Re-assign positions and identify posts to update or demote
      const batch = writeBatch(db);
      const postsToKeepTrending: string[] = [];

      rankedList.forEach((post, index) => {
          const pos = index + 1;
          if (pos <= 10) {
              const pRef = doc(db, 'posts', post.id);
              // Only update if the position is different
              if (post.trendingPosition !== pos) {
                  batch.update(pRef, { trendingPosition: pos, trending: true });
              }
              postsToKeepTrending.push(post.id);
          }
      });
      
      // Demote any posts that were trending but are no longer in the top 10 or were manually untrended
      for (const post of currentTrendingPosts) {
        if (!postsToKeepTrending.includes(post.id)) {
          const pRef = doc(db, 'posts', post.id);
          batch.update(pRef, { trending: false, trendingPosition: null, trendingUntil: null });
        }
      }
      
      await batch.commit();
    }
  });

  revalidatePath('/');
  revalidatePath('/posts');
  revalidatePath(`/posts/${newSlug}`);
  revalidatePath('/admin');

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

    // No revalidation needed as client will handle UI update.
    return { success: true };
  } catch (e) {
    console.error("Error deleting post: ", e);
    return { success: false, error: "A server error occurred while deleting the post." };
  }
}

    