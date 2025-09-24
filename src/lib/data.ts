
import { db } from '@/lib/firebase-server'; // <-- IMPORTANT: Use server DB
import { 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    query, 
    orderBy,
    limit,
    writeBatch,
    Timestamp,
    collectionGroup,
    where,
    addDoc,
    deleteDoc,
    updateDoc,
    startAfter,
    runTransaction,
    increment,
} from 'firebase/firestore';
import { unstable_cache } from 'next/cache';


export type Author = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  bio?: string;
  instagramUrl?: string;
  signature?: string;
  showEmail?: boolean;
  followers?: number;
  following?: number;
};

export type Comment = {
  id: string;
  content: string;
  author: Author;
  createdAt: string; // Should be ISO string
  likes: number;
  highlighted?: boolean;
  pinned?: boolean;
  parentId: string | null;
  // replies are now a subcollection, so not stored directly on the comment object
};

export type Post = {
  id: string; // The firestore document ID
  slug: string;
  title: string;
  description: string;
  content: string;
  coverImage: string;
  author: Author;
  publishedAt: string; // Should be ISO string
  tags: string[];
  readTime: number; 
  featured?: boolean;
  trending?: boolean;
  trendingPosition?: number | null;
  trendingUntil?: string | null; // ISO String
  likes?: number;
  summary?: string;
};

const safeToISOString = (date: any): string | null => {
    if (!date) return null;
    // Check if it's a Firestore Timestamp
    if (typeof date.toDate === 'function') {
        return date.toDate().toISOString();
    }
    // If it's already an ISO string, return it
    if (typeof date === 'string' && new Date(date).toISOString() === date) {
        return date;
    }
    // Try to parse other formats, like a Date object
    try {
        return new Date(date).toISOString();
    } catch (e) {
        console.error("Could not convert date to ISO string:", date);
        return null; // Return null if conversion fails
    }
}


// Firestore data converters
const postConverter = {
    fromFirestore: (snapshot: any, options: any): Post => {
        const data = snapshot.data(options);

        // The 'content' field might be excluded in list views for performance.
        const content = data.content || '';

        return {
            id: snapshot.id,
            slug: data.slug,
            title: data.title,
            description: data.description,
            content: content,
            coverImage: data.coverImage,
            author: data.author,
            publishedAt: safeToISOString(data.publishedAt)!,
            tags: data.tags,
            readTime: data.readTime,
            featured: data.featured,
            trending: data.trending,
            trendingPosition: data.trendingPosition,
            trendingUntil: safeToISOString(data.trendingUntil),
            likes: data.likes || 0,
            summary: data.summary,
        };
    },
    toFirestore: (post: Omit<Post, 'id'>) => {
        const data: {[key: string]: any} = {
            ...post,
            publishedAt: Timestamp.fromDate(new Date(post.publishedAt)),
        };
        if (post.trendingUntil) {
            data.trendingUntil = Timestamp.fromDate(new Date(post.trendingUntil));
        }
        return data;
    }
}

export type Notification = {
  id: string;
  title: string;
  description: string;
  createdAt: string; // ISO String
  read: boolean;
  image?: string;
};

export type Bulletin = {
  id: string;
  title: string;
  content: string;
  coverImage: string;
  publishedAt: string; // ISO String
};


const notificationConverter = {
    fromFirestore: (snapshot: any, options: any): Notification => {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            title: data.title,
            description: data.description,
            createdAt: safeToISOString(data.createdAt)!,
            read: false, // read status is managed client-side
            image: data.image,
        };
    },
    toFirestore: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'> & {createdAt?: any}) => {
        const { id, read, ...rest } = notification;
        const data: any = rest;
        if(rest.createdAt) {
            data.createdAt = Timestamp.fromDate(new Date(rest.createdAt));
        }
        return data;
    }
};

const bulletinConverter = {
    fromFirestore: (snapshot: any, options: any): Bulletin => {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            title: data.title,
            content: data.content,
            coverImage: data.coverImage,
            publishedAt: safeToISOString(data.publishedAt)!,
        };
    },
    toFirestore: (bulletin: Omit<Bulletin, 'id' | 'publishedAt'> & { publishedAt?: any}) => {
        const { id, ...rest } = bulletin;
        const data: any = rest;
        if(rest.publishedAt) {
            data.publishedAt = Timestamp.fromDate(new Date(rest.publishedAt));
        }
        return data;
    }
};


const commentConverter = {
    fromFirestore: (snapshot: any, options: any): Comment => {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            content: data.content,
            author: data.author,
            createdAt: safeToISOString(data.createdAt)!,
            likes: data.likes,
            highlighted: data.highlighted,
            pinned: data.pinned,
            parentId: data.parentId,
        };
    },
    toFirestore: (comment: Omit<Comment, 'id'>) => {
        return {
            ...comment,
            createdAt: Timestamp.fromDate(new Date(comment.createdAt)),
        };
    }
};

export const authorConverter = {
    fromFirestore: (snapshot: any, options: any): Author => {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            name: data.name,
            avatar: data.avatar,
            email: data.email,
            bio: data.bio,
            instagramUrl: data.instagramUrl,
            signature: data.signature,
            showEmail: data.showEmail || false,
            followers: data.followers || 0,
            following: data.following || 0,
        };
    },
    toFirestore: (author: Omit<Author, 'id'>) => {
        return author;
    }
};


const sortComments = (comments: Comment[]): Comment[] => {
    return [...comments].sort((a,b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};

export const getPosts = unstable_cache(async (includeContent: boolean = true): Promise<Post[]> => {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('publishedAt', 'desc'));
    const snapshot = await getDocs(q);

    // Using a new converter to explicitly exclude content for list views
    const lightPostConverter = {
        fromFirestore: (snapshot: any, options: any): Post => {
            const data = snapshot.data(options);
            return {
                id: snapshot.id,
                slug: data.slug,
                title: data.title,
                description: data.description,
                content: includeContent ? data.content : '', // Conditionally include content
                coverImage: data.coverImage,
                author: data.author,
                publishedAt: safeToISOString(data.publishedAt)!,
                tags: data.tags,
                readTime: data.readTime,
                featured: data.featured,
                trending: data.trending,
                trendingPosition: data.trendingPosition,
                trendingUntil: safeToISOString(data.trendingUntil),
                likes: data.likes || 0,
                summary: data.summary,
            };
        }
    };
    
    const allPosts = snapshot.docs.map(doc => lightPostConverter.fromFirestore(doc, {}));
    
    const uniquePosts = Array.from(new Map(allPosts.map(post => [post.id, post])).values());
    
    return uniquePosts;
}, ['posts'], { revalidate: 60 });

export const getFeaturedPosts = unstable_cache(async (): Promise<Post[]> => {
    const postsCollection = collection(db, 'posts').withConverter(postConverter);
    const q = query(postsCollection, where('featured', '==', true));
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => doc.data());
    return posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}, ['featured_posts'], { revalidate: 60 });

export const getRecentPosts = unstable_cache(async (count: number): Promise<Post[]> => {
    const allPosts = await getPosts(); // This will now fetch lightweight posts
    const nonFeatured = allPosts.filter(p => !p.featured);
    return nonFeatured.slice(0, count);
}, ['recent_posts'], { revalidate: 60 });


export const getTrendingPosts = unstable_cache(async (): Promise<Post[]> => {
    const postsCollection = collection(db, 'posts').withConverter(postConverter);
    const now = new Date();
    
    const q = query(
        postsCollection, 
        where('trending', '==', true)
    );
    const snapshot = await getDocs(q);
    
    let posts = snapshot.docs.map(doc => doc.data());

    // Filter expired posts in code instead of in the query
    posts = posts.filter(post => {
        if (!post.trendingUntil) return false;
        return new Date(post.trendingUntil) >= now;
    });
    
    // Manual sort after fetching
    posts = posts.sort((a,b) => (a.trendingPosition || 11) - (b.trendingPosition || 11));

    return posts.slice(0, 10);
}, ['trending_posts'], { revalidate: 60 });


export const getPost = unstable_cache(async (slug: string): Promise<Post | undefined> => {
    const postsCollection = collection(db, 'posts');
    // For single post, we always use the full converter to get the content
    const q = query(postsCollection, where('slug', '==', slug), limit(1)).withConverter(postConverter);
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return undefined;
    }
    
    const post = snapshot.docs[0].data();
    return post;
}, ['post'], { revalidate: 60 });


export const getRelatedPosts = async (currentPost: Post): Promise<Post[]> => {
    const allPosts = await getPosts(); // This will fetch lightweight posts
    let potentialPosts: Post[] = [];

    // Find posts with at least one common tag
    if (currentPost.tags && currentPost.tags.length > 0) {
        const currentPostTags = new Set(currentPost.tags);
        const taggedPosts = allPosts.filter(p => p.tags.some(tag => currentPostTags.has(tag)));
        potentialPosts.push(...taggedPosts);
    }
    
    // Add all posts to ensure we have fallbacks
    potentialPosts.push(...allPosts);

    // Filter out the current post and remove duplicates
    const filteredPosts = potentialPosts.filter(p => p.slug !== currentPost.slug);

    // Remove duplicates based on id
    const uniquePosts = Array.from(new Map(filteredPosts.map(p => [p.id, p])).values());

    return uniquePosts.slice(0, 3);
};

export const getComments = async (postId: string): Promise<Comment[]> => {
    if (!postId) return [];
    
    const commentsCollection = collection(db, 'posts', postId, 'comments').withConverter(commentConverter);
    const q = query(commentsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    let comments = snapshot.docs.map(doc => doc.data());
    
    return sortComments(comments);
};

export const getNotifications = async (): Promise<Notification[]> => {
    const notificationsCollection = collection(db, 'notifications').withConverter(notificationConverter);
    const q = query(notificationsCollection, orderBy('createdAt', 'desc'), limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
};

export async function addNotification(notification: { title: string; description: string, image?: string }): Promise<string> {
  const notificationsCollection = collection(db, 'notifications');
  const newDocRef = await addDoc(notificationsCollection, {
    ...notification,
    createdAt: Timestamp.now(),
  });
  return newDocRef.id;
}

export async function deleteNotification(notificationId: string): Promise<void> {
    const notifRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notifRef);
}

export async function updateNotification(notificationId: string, updates: { title: string; description: string, image?: string }) {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, updates);
}

export const getNotification = async (id: string): Promise<Notification | null> => {
    const notifRef = doc(db, 'notifications', id).withConverter(notificationConverter);
    const snapshot = await getDoc(notifRef);
    if (snapshot.exists()) {
        return snapshot.data();
    }
    return null;
}


// New Bulletin Functions

export const getBulletins = async (
    pageSize: number = 3,
    startAfterDocId?: string
): Promise<{ bulletins: Bulletin[]; lastDocId?: string }> => {
    let lastDoc;
    if (startAfterDocId) {
        lastDoc = await getDoc(doc(db, "bulletins", startAfterDocId));
    }

    const bulletinsCollection = collection(db, 'bulletins').withConverter(bulletinConverter);
    const constraints = [
        orderBy('publishedAt', 'desc'),
        limit(pageSize)
    ];

    if (lastDoc) {
        constraints.push(startAfter(lastDoc));
    }
    
    const q = query(bulletinsCollection, ...constraints);
    const snapshot = await getDocs(q);
    
    const bulletins = snapshot.docs.map(doc => doc.data());
    const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
    
    return {
        bulletins,
        lastDocId: lastVisibleDoc?.id
    };
};

export async function addBulletin(bulletin: { title: string; content: string; coverImage?: string }): Promise<string> {
  const bulletinsCollection = collection(db, 'bulletins');
  const newDocRef = await addDoc(bulletinsCollection, {
    ...bulletin,
    publishedAt: Timestamp.now(),
  });
  return newDocRef.id;
}

export async function deleteBulletin(bulletinId: string) {
    const bulletinRef = doc(db, 'bulletins', bulletinId);
    await deleteDoc(bulletinRef);
}

export async function updateBulletin(bulletinId: string, updates: { title: string; content: string, coverImage?: string }) {
    const bulletinRef = doc(db, 'bulletins', bulletinId);
    await updateDoc(bulletinRef, updates);
}

export const getBulletin = async (id: string): Promise<Bulletin | null> => {
    const bulletinRef = doc(db, 'bulletins', id).withConverter(bulletinConverter);
    const snapshot = await getDoc(bulletinRef);
    if (snapshot.exists()) {
        return snapshot.data();
    }
    return null;
};

export const getAuthorByEmail = async (email: string): Promise<Author | null> => {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('email', '==', email), limit(1)).withConverter(authorConverter);
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }
    return snapshot.docs[0].data();
};


export const getAuthorById = async (id: string): Promise<Author | null> => {
  const userRef = doc(db, 'users', id).withConverter(authorConverter);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data();
};

export async function isFollowing(followerId: string, authorId: string): Promise<boolean> {
  if (!followerId || !authorId) return false;
  if (followerId === authorId) return false;
  const followDocRef = doc(db, 'users', followerId, 'following', authorId);
  const docSnap = await getDoc(followDocRef);
  return docSnap.exists();
}

// User-specific data (likes, bookmarks)
export type UserData = {
    likedPosts: { [postId: string]: boolean };
    likedComments: { [commentId: string]: boolean };
    bookmarks: { [postId: string]: { bookmarkedAt: string, scrollPosition?: number } };
}

    
