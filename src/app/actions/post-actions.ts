
'use server';

import { revalidatePath } from 'next/cache';
import { Post, Author } from '@/lib/data';
import { db } from '@/lib/firebase-server'; // Use server db
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, getDocs, limit, getDoc, setDoc } from 'firebase/firestore';
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

    let trendingUntil: string | null = null;
    if (values.trending) {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        trendingUntil = sevenDaysFromNow.toISOString();
    }

    const newPost: Omit<Post, 'id' | 'comments'> = {
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
        publishedAt: new Date().toISOString(),
        readTime: values.readTime,
        summary: values.summary,
    };
    
    const postsCollection = collection(db, 'posts');
    const docRef = await addDoc(postsCollection, {
        ...newPost,
        publishedAt: new Date(newPost.publishedAt),
        trendingUntil: newPost.trendingUntil ? new Date(newPost.trendingUntil) : null,
    });

    revalidatePath('/');
    revalidatePath('/posts');
    revalidatePath('/admin');
    
    return slug;
}

export async function updatePost(postId: string, values: z.infer<typeof formSchema>): Promise<string> {
  const postRef = doc(db, 'posts', postId);
  const oldPostSnap = await getDoc(postRef);
  const oldPostData = oldPostSnap.data();

  const newSlug = values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  const tagsArray = values.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

  let trendingUntil: string | null;
  // If trending is being turned on, or was already on
  if (values.trending) {
      // If it's being turned on *now*, set a new 7-day expiry.
      if (!oldPostData?.trending) {
          const sevenDaysFromNow = new Date();
          sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
          trendingUntil = sevenDaysFromNow.toISOString();
      } else {
          // It was already trending, keep the original expiry date unless it's gone
          trendingUntil = oldPostData?.trendingUntil ? oldPostData.trendingUntil.toDate().toISOString() : null;
      }
  } else {
      // If trending is turned off, nullify the expiry
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
    trendingUntil: trendingUntil ? new Date(trendingUntil) : null,
    readTime: values.readTime,
    summary: values.summary,
  };

  await updateDoc(postRef, updatedData);
  

  revalidatePath('/');
  revalidatePath('/posts');
  if (oldPostData?.slug) revalidatePath(`/posts/${oldPostData.slug}`);
  revalidatePath(`/posts/${newSlug}`);
  revalidatePath('/admin');

  return newSlug;
}


export async function deletePost(postId: string): Promise<{ success: boolean }> {
  const postRef = doc(db, 'posts', postId);
  await deleteDoc(postRef);
  
  revalidatePath('/');
  revalidatePath('/posts');
  revalidatePath('/admin');
  
  return { success: true };
}
