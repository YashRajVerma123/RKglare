
import { db } from '@/lib/firebase-server'; // <-- IMPORTANT: Use server DB
import { 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    query, 
    orderBy,
    limit,
    Timestamp,
    where,
    startAfter,
} from 'firebase/firestore';
import { unstable_cache } from 'next/cache';


export type Author = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bannerImage?: string;
  email: string;
  bio?: string;
  instagramUrl?: string;
  signature?: string;
  showEmail?: boolean;
  followers?: number;
  following?: number;
  points?: number;
  streak?: UserStreak;
  challenge?: DailyChallenge;
  premium?: {
    active: boolean;
    expires: string | null; // ISO Date string
  };
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
  premiumOnly?: boolean;
  earlyAccess?: boolean;
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
            premiumOnly: data.premiumOnly || false,
            earlyAccess: data.earlyAccess || false,
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
  premiumOnly?: boolean;
  earlyAccess?: boolean;
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
        const { id, read, ...rest } = notification as any;
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
            premiumOnly: data.premiumOnly || false,
            earlyAccess: data.earlyAccess || false,
        };
    },
    toFirestore: (bulletin: Omit<Bulletin, 'id' | 'publishedAt'> & { publishedAt?: any}) => {
        const { id, ...rest } = bulletin as any;
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
            username: data.username,
            avatar: data.avatar,
            bannerImage: data.bannerImage,
            email: data.email,
            bio: data.bio,
            instagramUrl: data.instagramUrl,
            signature: data.signature,
            showEmail: data.showEmail || false,
            followers: data.followers || 0,
            following: data.following || 0,
            points: data.points || 0,
            streak: data.streak,
            challenge: data.challenge,
            premium: data.premium ? { ...data.premium, expires: safeToISOString(data.premium.expires) } : { active: false, expires: null },
        };
    },
    toFirestore: (author: Omit<Author, 'id'>) => {
        const data: {[key: string]: any} = {...author};
        if (author.streak?.lastLoginDate) {
            data.streak.lastLoginDate = Timestamp.fromDate(new Date(author.streak.lastLoginDate));
        }
        if (author.challenge?.assignedAt) {
            data.challenge.assignedAt = Timestamp.fromDate(new Date(author.challenge.assignedAt));
        }
        if (author.premium?.expires) {
            data.premium.expires = Timestamp.fromDate(new Date(author.premium.expires));
        }
        return data;
    }
};

export type ChatMessage = {
  id: string;
  text: string;
  image?: string;
  author: Pick<Author, 'id' | 'name' | 'avatar' | 'username'>;
  createdAt: string; // ISO string
  isEdited?: boolean;
  updatedAt?: string | null; // ISO string
  reactions?: { [emoji: string]: string[] }; // emoji: ['userId1', 'userId2']
  replyTo?: {
    messageId: string;
    authorName: string;
    text: string;
  } | null;
}

export const messageConverter = {
    fromFirestore: (snapshot: any, options: any): ChatMessage => {
        const data = snapshot.data(options);
        return {
            id: snapshot.id,
            text: data.text,
            image: data.image,
            author: data.author,
            createdAt: safeToISOString(data.createdAt)!,
            isEdited: data.isEdited,
            updatedAt: safeToISOString(data.updatedAt),
            reactions: data.reactions,
            replyTo: data.replyTo,
        };
    },
    toFirestore: (message: Omit<ChatMessage, 'id' | 'createdAt'> & { createdAt?: any }) => {
        return {
            ...message,
            createdAt: message.createdAt ? Timestamp.fromDate(new Date(message.createdAt)) : Timestamp.now(),
        };
    }
};

const sortComments = (comments: Comment[]): Comment[] => {
    return [...comments].sort((a,b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};

const filterPremiumContent = (posts: Post[], user?: Author | null): Post[] => {
    const isPremium = user?.premium?.active === true;
    const now = new Date();

    return posts.filter(post => {
        // Public posts are always visible
        if (!post.premiumOnly && !post.earlyAccess) {
            return true;
        }

        // If user is premium, they see everything
        if (isPremium) {
            return true;
        }
        
        // If it's premium only, non-premium users can't see it.
        if (post.premiumOnly) {
            return false;
        }
        
        // If it's early access, non-premium users can only see it after 24 hours
        if (post.earlyAccess) {
            const publishedAt = new Date(post.publishedAt);
            const hoursSincePublished = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);
            return hoursSincePublished >= 24;
        }

        return false;
    });
};

export const getPosts = async (includeContent: boolean = true, currentUser?: Author | null): Promise<Post[]> => {
    // This function can be called from client components (e.g., Admin page),
    // so it should not use unstable_cache.
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('publishedAt', 'desc'));
    const snapshot = await getDocs(q);

    const lightPostConverter = {
        fromFirestore: (snapshot: any, options: any): Post => {
            const data = snapshot.data(options);
            return {
                id: snapshot.id,
                slug: data.slug,
                title: data.title,
                description: data.description,
                content: includeContent ? data.content : '',
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
                premiumOnly: data.premiumOnly || false,
                earlyAccess: data.earlyAccess || false,
            };
        }
    };
    
    const allPosts = snapshot.docs.map(doc => lightPostConverter.fromFirestore(doc, {}));
    
    // Admins see all posts, others see filtered content
    if (currentUser?.email === 'yashrajverma916@gmail.com') {
        return allPosts;
    }

    return filterPremiumContent(allPosts, currentUser);
};

export const getFeaturedPosts = unstable_cache(async (): Promise<Post[]> => {
    const allPosts = await getPosts(false);
    // Note: This needs to be called without a user to cache correctly,
    // so filtering will happen on the client-side for featured posts.
    return allPosts
        .filter(p => p.featured)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}, ['featured_posts'], { revalidate: 3600, tags: ['posts', 'featured'] });


export const getRecentPosts = unstable_cache(async (count: number): Promise<Post[]> => {
    const allPosts = await getPosts(false);
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


export const getPost = (slug: string, currentUser?: Author | null): Promise<Post | undefined> => {
    return unstable_cache(
        async (slug: string) => getPostClient(slug, currentUser),
        ['post', slug], // Key depends on slug
        { revalidate: 3600, tags: ['posts', `post:${slug}`] }
    )(slug);
};

export const getPostClient = async (slug: string, currentUser?: Author | null): Promise<Post | undefined> => {
    if (!slug) {
        return undefined;
    }
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, where('slug', '==', slug), limit(1)).withConverter(postConverter);
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return undefined;
    }
    
    const post = snapshot.docs[0].data();

    // Admin can see everything
    if (currentUser?.email === 'yashrajverma916@gmail.com') {
        return post;
    }

    const isPremium = currentUser?.premium?.active === true;
    if (post.premiumOnly && !isPremium) return undefined;
    if (post.earlyAccess && !isPremium) {
        const now = new Date();
        const publishedAt = new Date(post.publishedAt);
        const hoursSincePublished = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);
        if (hoursSincePublished < 24) {
            return undefined;
        }
    }

    return post;
};


export const getRelatedPosts = unstable_cache(async (currentPost: Post, currentUser?: Author | null): Promise<Post[]> => {
    if (!currentPost) return [];
    
    const allPosts = await getPosts(false, currentUser); // Fetch lightweight posts respecting permissions
    const otherPosts = allPosts.filter(p => p.id !== currentPost.id);

    if (!currentPost.tags || currentPost.tags.length === 0) {
        // Fallback for posts without tags: return most recent
        return otherPosts
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
            .slice(0, 3);
    }
    
    const currentPostTags = new Set(currentPost.tags);

    const scoredPosts = otherPosts.map(post => {
        let score = 0;
        if (post.tags && post.tags.length > 0) {
            for (const tag of post.tags) {
                if (currentPostTags.has(tag)) {
                    score++;
                }
            }
        }
        return { ...post, score };
    });

    scoredPosts.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        // If score is the same, prioritize newer posts
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    return scoredPosts.slice(0, 3);
}, ['related_posts'], { revalidate: 3600, tags: ['posts'] });


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

export const getNotification = (id: string): Promise<Notification | null> => {
    return unstable_cache(
        async (id: string) => getNotificationClient(id),
        ['notification', id],
        { revalidate: 3600, tags: ['notifications', `notification:${id}`] }
    )(id);
};

export const getNotificationClient = async (id: string): Promise<Notification | null> => {
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
    startAfterDocId?: string,
    currentUser?: Author | null
): Promise<{ bulletins: Bulletin[]; lastDocId?: string }> => {
    // This function is called from a client component with pagination, so it should not be cached.
    let lastDoc;
    if (startAfterDocId) {
        lastDoc = await getDoc(doc(db, "bulletins", startAfterDocId));
    }

    const bulletinsCollection = collection(db, 'bulletins').withConverter(bulletinConverter);
    const constraints: any[] = [
        orderBy('publishedAt', 'desc'),
    ];

    if (lastDoc) {
        constraints.push(startAfter(lastDoc));
    }
    constraints.push(limit(pageSize));
    
    const q = query(bulletinsCollection, ...constraints);
    const snapshot = await getDocs(q);
    
    const allBulletins = snapshot.docs.map(doc => doc.data());
    const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];

    const isPremium = currentUser?.premium?.active === true;
    const now = new Date();

    const filteredBulletins = allBulletins.filter(bulletin => {
        if (!bulletin.premiumOnly && !bulletin.earlyAccess) return true;
        if (isPremium) return true;
        if (bulletin.premiumOnly) return false;
        if (bulletin.earlyAccess) {
             const publishedAt = new Date(bulletin.publishedAt);
             const hoursSincePublished = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);
             return hoursSincePublished >= 24;
        }
        return false;
    });
    
    return {
        bulletins: filteredBulletins,
        lastDocId: lastVisibleDoc?.id
    };
};

export const getBulletin = (id: string): Promise<Bulletin | null> => {
    return unstable_cache(
        async (id: string) => getBulletinClient(id),
        ['bulletin', id],
        { revalidate: 3600, tags: ['bulletins', `bulletin:${id}`] }
    )(id);
};

export const getBulletinClient = async (id: string): Promise<Bulletin | null> => {
    const bulletinRef = doc(db, 'bulletins', id).withConverter(bulletinConverter);
    const snapshot = await getDoc(bulletinRef);
    if (snapshot.exists()) {
        return snapshot.data();
    }
    return null;
};

export const getAuthorByEmail = async (email: string): Promise<Author | null> => {
    // This is called from a client context, so it should not use unstable_cache.
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('email', '==', email), limit(1)).withConverter(authorConverter);
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return null;
    }
    return snapshot.docs[0].data();
};


export const getAuthorById = (id: string): Promise<Author | null> => {
  return unstable_cache(
      async (id: string) => {
        const userRef = doc(db, 'users', id).withConverter(authorConverter);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
            return null;
        }
        return snapshot.data();
      },
      ['author', id], // Key depends on id
      { revalidate: 3600, tags: ['users', `author-id:${id}`] }
  )(id);
};

export async function isFollowing(followerId: string, authorId: string): Promise<boolean> {
  if (!followerId || !authorId) return false;
  if (followerId === authorId) return false;
  const followDocRef = doc(db, 'users', followerId, 'following', authorId);
  const docSnap = await getDoc(followDocRef);
  return docSnap.exists();
}

export const getAuthors = async (): Promise<Author[]> => {
    const usersCollection = collection(db, 'users').withConverter(authorConverter);
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map(doc => doc.data());
};

export const getPremiumUsers = async (): Promise<Author[]> => {
     return unstable_cache(async () => {
        const usersCollection = collection(db, 'users').withConverter(authorConverter);
        const q = query(usersCollection, where('premium.active', '==', true));
        const snapshot = await getDocs(q);

        const now = new Date();
        const premiumUsers: Author[] = [];

        snapshot.docs.forEach(doc => {
            const user = doc.data();
            if (user.premium?.expires && new Date(user.premium.expires) > now) {
                premiumUsers.push(user);
            }
        });
        
        return premiumUsers.sort((a,b) => (b.points || 0) - (a.points || 0));
    }, ['premium_users'], { revalidate: 3600, tags: ['users', 'premium_users'] })();
}


// User-specific data (likes, bookmarks)
export type UserData = {
    likedPosts: { [postId: string]: boolean };
    likedComments: { [commentId: string]: boolean };
    bookmarks: { [postId: string]: { bookmarkedAt: string, scrollPosition?: number } };
}

// Streaks and Challenges
export type UserStreak = {
  currentStreak: number;
  lastLoginDate: string; // ISO String
};

export type ChallengeType = 'READ_X_MINUTES' | 'LIKE_X_POSTS' | 'COMMENT_X_POSTS';

export type DailyChallenge = {
  id: string; // e.g. '2024-07-31'
  type: ChallengeType;
  description: string;
  target: number;
  progress: number;
  points: number;
  completed: boolean;
  assignedAt: string; // ISO string
};


      
