
// THIS FILE IS FOR SERVER-SIDE USE ONLY
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy, where, limit } from "firebase/firestore";
import { unstable_cache } from 'next/cache';
import { Post, postConverter, Author } from './data';

// This is the server-side configuration. It directly uses environment variables.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase for SERVER-SIDE usage only
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const filterPremiumContent = (posts: Post[], user?: Author | null): Post[] => {
    const isPremium = user?.premium?.active === true;
    const now = new Date();

    return posts.filter(post => {
        if (!post.premiumOnly && !post.earlyAccess) return true;
        if (isPremium) return true;
        if (post.premiumOnly) return false;
        if (post.earlyAccess) {
            const publishedAt = new Date(post.publishedAt);
            const hoursSincePublished = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);
            return hoursSincePublished >= 24;
        }
        return false;
    });
};

export const getPostsServer = unstable_cache(async (
    includeContent: boolean = true, 
    currentUser?: Author | null,
    searchQuery?: string
): Promise<Post[]> => {
    
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('publishedAt', 'desc'));
    const snapshot = await getDocs(q.withConverter(postConverter));
    
    let allPosts = snapshot.docs.map(doc => doc.data());
    
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        allPosts = allPosts.filter(post => 
            post.title.toLowerCase().includes(lowercasedQuery) ||
            post.description.toLowerCase().includes(lowercasedQuery) ||
            post.tags.some(tag => tag.toLowerCase().includes(lowercasedQuery))
        );
    }

    if (currentUser?.email === 'yashrajverma916@gmail.com') {
        return allPosts;
    }

    return filterPremiumContent(allPosts, currentUser);
}, ['posts'], { revalidate: 60, tags: ['posts'] });


export const getFeaturedPosts = unstable_cache(async (): Promise<Post[]> => {
    const allPosts = await getPostsServer(false);
    return allPosts
        .filter(p => p.featured)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 4);
}, ['featured_posts'], { revalidate: 3600, tags: ['posts', 'featured'] });


export const getRecentPosts = unstable_cache(async (count: number): Promise<Post[]> => {
    const allPosts = await getPostsServer(false);
    return allPosts
        .filter(p => !p.featured)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, count);
}, ['recent_posts'], { revalidate: 3600, tags: ['posts'] });


export const getTrendingPosts = unstable_cache(async (): Promise<Post[]> => {
    const postsCollection = collection(db, 'posts').withConverter(postConverter);
    
    const q = query(
        postsCollection, 
        where('trending', '==', true),
        where('trendingPosition', '!=', null),
        orderBy('trendingPosition', 'asc')
    );
    const snapshot = await getDocs(q);
    
    const now = new Date();
    const posts = snapshot.docs.map(doc => doc.data()).filter(post => {
        if (!post.trendingUntil) return false;
        try {
            return new Date(post.trendingUntil) > now;
        } catch (e) {
            return false;
        }
    });

    return posts.slice(0, 10);
}, ['trending_posts'], { revalidate: 3600, tags: ['posts', 'trending'] });


export { db, app, firebaseConfig };
