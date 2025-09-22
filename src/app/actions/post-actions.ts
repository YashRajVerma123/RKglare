
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

    const slug = values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const tagsArray = values.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    let trendingUntil: Date | null = null;
    if (values.trending) {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        trendingUntil = sevenDaysFromNow;
    }

    const newPostData = {
        slug,
        title: values.title,
        description: values.description,
        content: values.content,
        coverImage: values.coverImage,
        tags: tagsArray,
        featured: values.featured,
        trending: values.trending,
        trendingPosition: values.trendingPosition || null,
        trendingUntil: trendingUntil,
        author,
        publishedAt: new Date(),
        readTime: values.readTime,
        summary: values.summary || '',
        likes: 0,
    };
    
    const postsCollection = collection(db, 'posts');
    
    await runTransaction(db, async (transaction) => {
        if (newPostData.trending && newPostData.trendingPosition) {
            const position = newPostData.trendingPosition;
            
            const trendingQuery = query(
                postsCollection,
                where('trending', '==', true),
                where('trendingPosition', '>=', position),
                orderBy('trendingPosition', 'asc')
            );
            const trendingSnapshot = await getDocs(trendingQuery);
            
            for (const postDoc of trendingSnapshot.docs) {
                const postData = postDoc.data();
                const newPosition = (postData.trendingPosition || 0) + 1;
                
                if (newPosition > 10) {
                    transaction.update(postDoc.ref, {
                        trending: false,
                        trendingPosition: null,
                        trendingUntil: null
                    });
                } else {
                    transaction.update(postDoc.ref, { trendingPosition: newPosition });
                }
            }
        }
        
        const newDocRef = doc(collection(db, 'posts'));
        transaction.set(newDocRef, newPostData);
    });

    revalidatePath('/');
    revalidatePath('/posts');
    revalidatePath('/admin');
    
    return slug;
}

export async function updatePost(postId: string, values: z.infer<typeof formSchema>): Promise<string> {
  const postRef = doc(db, 'posts', postId);

  await runTransaction(db, async (transaction) => {
    const oldPostSnap = await transaction.get(postRef);
    if (!oldPostSnap.exists()) {
      throw new Error("Post not found");
    }
    const oldPostData = oldPostSnap.data();

    const newSlug = values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const tagsArray = values.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    let trendingUntil: Date | null;
    if (values.trending) {
        if (!oldPostData?.trending) {
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            trendingUntil = sevenDaysFromNow;
        } else {
            trendingUntil = oldPostData?.trendingUntil ? oldPostData.trendingUntil.toDate() : null;
        }
    } else {
        trendingUntil = null;
    }

    const updatedData: { [key: string]: any } = {
      slug: newSlug,
      title: values.title,
      description: values.description,
      content: values.content,
      coverImage: values.coverImage,
      tags: tagsArray,
      featured: values.featured,
      trending: values.trending,
      trendingPosition: values.trendingPosition || null,
      trendingUntil: trendingUntil,
      readTime: values.readTime,
      summary: values.summary || '',
    };
    
    // Handle position shifting if trending status or position changes
    const newPosition = updatedData.trendingPosition;
    const oldPosition = oldPostData.trendingPosition;
    const isNowTrending = updatedData.trending;
    const wasTrending = oldPostData.trending;

    const postsCollection = collection(db, 'posts');

    // Case 1: Post is becoming trending or changing position
    if (isNowTrending && newPosition && (newPosition !== oldPosition || !wasTrending)) {
        const trendingQuery = query(
            postsCollection,
            where('trending', '==', true),
            where('trendingPosition', '>=', newPosition),
            orderBy('trendingPosition', 'asc')
        );
        const snapshot = await getDocs(trendingQuery);
        
        for (const postDoc of snapshot.docs) {
            // Don't shift the post we are currently editing
            if (postDoc.id === postId) continue;

            const postData = postDoc.data();
            const shiftedPosition = (postData.trendingPosition || 0) + 1;

            if (shiftedPosition > 10) {
                 transaction.update(postDoc.ref, {
                    trending: false,
                    trendingPosition: null,
                    trendingUntil: null
                });
            } else {
                transaction.update(postDoc.ref, { trendingPosition: shiftedPosition });
            }
        }
    }
    
    // Case 2: Post is becoming non-trending, so we need to shift others up
    if (!isNowTrending && wasTrending && oldPosition) {
        const trendingQuery = query(
            postsCollection,
            where('trending', '==', true),
            where('trendingPosition', '>', oldPosition),
            orderBy('trendingPosition', 'asc')
        );
        const snapshot = await getDocs(trendingQuery);

        for (const postDoc of snapshot.docs) {
            const postData = postDoc.data();
            transaction.update(postDoc.ref, { trendingPosition: (postData.trendingPosition || 1) - 1 });
        }
    }
    
    transaction.update(postRef, updatedData);
  });
  
  const finalPostSnap = await getDoc(postRef);
  const finalPostData = finalPostSnap.data();

  revalidatePath('/');
  revalidatePath('/posts');
  if (finalPostData?.slug) revalidatePath(`/posts/${finalPostData.slug}`);
  if (finalPostData?.slug !== newSlug) revalidatePath(`/posts/${newSlug}`);
  revalidatePath('/admin');

  return newSlug;
}


export async function deletePost(postId: string): Promise<{ success: boolean }> {
  const postRef = doc(db, 'posts', postId);
  
  await runTransaction(db, async (transaction) => {
    const postSnap = await transaction.get(postRef);
    if (!postSnap.exists()) return;
    
    const postData = postSnap.data();
    
    // If the deleted post was trending, shift subsequent posts up
    if (postData.trending && postData.trendingPosition) {
        const position = postData.trendingPosition;
        const postsCollection = collection(db, 'posts');
        const q = query(
            postsCollection,
            where('trending', '==', true),
            where('trendingPosition', '>', position),
            orderBy('trendingPosition', 'asc')
        );
        const snapshot = await getDocs(q);
        
        for (const docToShift of snapshot.docs) {
            const data = docToShift.data();
            transaction.update(docToShift.ref, { trendingPosition: (data.trendingPosition || 1) - 1 });
        }
    }
    
    transaction.delete(postRef);
  });

  revalidatePath('/');
  revalidatePath('/posts');
  revalidatePath('/admin');
  
  return { success: true };
}
