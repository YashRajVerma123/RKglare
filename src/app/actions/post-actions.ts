
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
    const tagsArray = values.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    let trendingUntil: Date | null = null;
    if (values.trending) {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        trendingUntil = sevenDaysFromNow;
    }
    
    const newPostData = {
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
        author,
        publishedAt: new Date(),
        readTime: values.readTime,
        summary: values.summary || '',
        likes: 0,
    };
    
    const postsCollection = collection(db, 'posts');
    const batch = writeBatch(db);

    if (newPostData.trending && newPostData.trendingPosition) {
        const position = newPostData.trendingPosition;
        
        // Fetch all current trending posts
        const trendingQuery = query(
            postsCollection,
            where('trending', '==', true)
        );
        const trendingSnapshot = await getDocs(trendingQuery);
        let trendingPosts = trendingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort them by position
        trendingPosts.sort((a, b) => (a.trendingPosition || 11) - (b.trendingPosition || 11));

        // Make space for the new post
        if (trendingPosts.some(p => p.trendingPosition === position)) {
            for (let i = trendingPosts.length - 1; i >= 0; i--) {
                const post = trendingPosts[i];
                if ((post.trendingPosition || 0) >= position) {
                    const newPosition = (post.trendingPosition || 0) + 1;
                    const postRef = doc(db, 'posts', post.id);
                    if (newPosition > 10) {
                        batch.update(postRef, {
                            trending: false,
                            trendingPosition: null,
                            trendingUntil: null,
                        });
                    } else {
                        batch.update(postRef, { trendingPosition: newPosition });
                    }
                }
            }
        }
    }
    
    const newDocRef = doc(collection(db, 'posts'));
    batch.set(newDocRef, newPostData);
    await batch.commit();


    revalidatePath('/');
    revalidatePath('/posts');
    revalidatePath('/admin');
    
    return newSlug;
}

export async function updatePost(postId: string, values: z.infer<typeof formSchema>): Promise<string> {
  const postRef = doc(db, 'posts', postId);
  const newSlug = values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  const oldPostSnap = await getDoc(postRef);
  if (!oldPostSnap.exists()) {
    throw new Error("Post not found");
  }
  const oldPostData = oldPostSnap.data();

  const tagsArray = values.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  const isNowTrending = values.trending;
  let newPosition = values.trendingPosition || null;

  // Fetch all current trending posts
  const postsCollection = collection(db, 'posts');
  const trendingQuery = query(postsCollection, where('trending', '==', true));
  const trendingSnapshot = await getDocs(trendingQuery);
  // Exclude the current post from the initial list, as its status might change
  let trendingPosts = trendingSnapshot.docs
    .map(doc => ({ id: doc.id, ...(doc.data() as Post) }))
    .filter(p => p.id !== postId);

  // If the post is now trending, add it to the list for re-ranking
  if (isNowTrending && newPosition) {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const currentPostForRanking: Post = {
        id: postId,
        ...oldPostData,
        ...values,
        slug: newSlug,
        tags: tagsArray,
        trendingPosition: newPosition,
        trendingUntil: oldPostData.trending && oldPostData.trendingUntil ? oldPostData.trendingUntil.toDate().toISOString() : sevenDaysFromNow.toISOString(),
        publishedAt: oldPostData.publishedAt.toDate().toISOString(),
        likes: oldPostData.likes || 0
    };
    
    // Remove any existing post at the new position
    trendingPosts = trendingPosts.filter(p => p.trendingPosition !== newPosition);
    trendingPosts.push(currentPostForRanking);
  }

  // Sort all posts by their intended position
  trendingPosts.sort((a, b) => (a.trendingPosition || 11) - (b.trendingPosition || 11));

  const batch = writeBatch(db);
  const updatedTrendingIds = new Set<string>();

  // Re-assign positions 1-10
  trendingPosts.forEach((post, index) => {
    const newPos = index + 1;
    if (newPos <= 10) {
      const pRef = doc(db, 'posts', post.id);
      if (post.trendingPosition !== newPos) {
        batch.update(pRef, { trendingPosition: newPos });
      }
      updatedTrendingIds.add(post.id);
    }
  });

  // Any posts that were trending but are no longer in the top 10
  trendingSnapshot.docs.forEach(docSnap => {
    if (!updatedTrendingIds.has(docSnap.id)) {
      batch.update(docSnap.ref, {
        trending: false,
        trendingPosition: null,
        trendingUntil: null,
      });
    }
  });

  // Finally, update the actual post being edited
  const finalUpdateData: { [key: string]: any } = {
    slug: newSlug,
    title: values.title,
    description: values.description,
    content: values.content,
    coverImage: values.coverImage,
    tags: tagsArray,
    featured: values.featured,
    readTime: values.readTime,
    summary: values.summary || '',
    trending: isNowTrending,
    trendingPosition: isNowTrending ? newPosition : null,
  };

  if (isNowTrending && !oldPostData.trending) {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    finalUpdateData.trendingUntil = sevenDaysFromNow;
  } else if (!isNowTrending) {
    finalUpdateData.trendingUntil = null;
  }

  batch.update(postRef, finalUpdateData);

  await batch.commit();

  revalidatePath('/');
  revalidatePath('/posts');
  if (oldPostData?.slug) revalidatePath(`/posts/${oldPostData.slug}`);
  revalidatePath(`/posts/${newSlug}`);
  revalidatePath('/admin');

  return newSlug;
}


export async function deletePost(postId: string): Promise<{ success: boolean }> {
  const postRef = doc(db, 'posts', postId);
  
  await runTransaction(db, async (transaction) => {
    const postSnap = await transaction.get(postRef);
    if (!postSnap.exists()) return;
    
    const postData = postSnap.data();
    
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
