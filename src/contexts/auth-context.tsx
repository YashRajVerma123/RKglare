
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { db } from '@/lib/firebase-server';
import { Author, UserStreak, DailyChallenge, getAuthorByEmail } from '@/lib/data';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getClientFirebaseConfig } from '@/app/actions/config-actions';
import { initializeClientApp } from '@/lib/firebase-client';
import { getUserData } from '@/app/actions/user-data-actions';
import { updateAuthorProfile } from '@/app/actions/user-actions';
import { quitChallengeAction } from '@/app/actions/challenge-actions';


interface AuthContextType {
  user: Author | null;
  mainAuthor: Author | null;
  firebaseUser: FirebaseUser | null;
  auth: Auth | null;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<Author>) => Promise<void>;
  updateFollowingCount: (change: number) => void;
  updateFollowerCount: (change: number) => void;
  updateMainAuthorFollowerCount: (change: number) => void;
  loading: boolean;
  likedPosts: { [postId: string]: boolean };
  likedComments: { [commentId: string]: boolean };
  bookmarks: { [postId: string]: any };
  setLikedPosts: React.Dispatch<React.SetStateAction<{ [postId: string]: boolean }>>;
  setLikedComments: React.Dispatch<React.SetStateAction<{ [commentId: string]: boolean }>>;
  setBookmarks: React.Dispatch<React.SetStateAction<{ [postId: string]: any }>>;
  refreshUserData: () => void;
  refreshUser: () => Promise<void>; // New function to refresh all user data
  quitChallenge: () => Promise<{ success: boolean; error?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const safeToISOString = (date: any): string | null => {
    if (!date) return null;
    if (typeof date.toDate === 'function') { // Firestore Timestamp
        return date.toDate().toISOString();
    }
    if (typeof date === 'string') { // Already an ISO string
        return date;
    }
    // Try to parse other formats, like a Date object
    try {
        return new Date(date).toISOString();
    } catch (e) {
        return null; // Return null if conversion fails
    }
}

const generateUsername = (name: string): string => {
    if (!name) return `user_${Date.now().toString().slice(-6)}`;
    
    return name
        .toLowerCase()
        .replace(/\s+/g, '.') // replace spaces with dots
        .replace(/[^a-z0-9._]/g, '') // remove invalid characters
        .slice(0, 15); // limit length
}

function hexToHsl(hex: string): string {
    if (!hex) return '';
    hex = hex.replace(/^#/, '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return `${(h * 360).toFixed(0)} ${(s * 100).toFixed(0)}% ${(l * 100).toFixed(0)}%`;
}

const applyUserTheme = (user: Author | null) => {
    const root = document.documentElement;
    if (user?.primaryColor) {
        root.style.setProperty('--primary', hexToHsl(user.primaryColor));
    } else {
        root.style.removeProperty('--primary');
    }

    document.body.classList.forEach(className => {
        if (className.startsWith('font-')) {
            document.body.classList.remove(className);
        }
    });

    if (user?.font) {
        document.body.classList.add(`font-${user.font}`);
    } else {
        document.body.classList.add('font-body'); // Fallback to default
    }
};

const formatUser = (user: FirebaseUser, firestoreData?: any): Author => {
    const premiumData = firestoreData?.premium;
    const expires = premiumData?.expires ? safeToISOString(premiumData.expires) : null;
    
    return {
        id: user.uid,
        name: firestoreData?.name || user.displayName || "New User",
        username: firestoreData?.username || generateUsername(user.displayName || 'user'),
        email: user.email || "no-email@example.com",
        avatar: firestoreData?.avatar || user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
        bannerImage: firestoreData?.bannerImage,
        bio: firestoreData?.bio,
        instagramUrl: firestoreData?.instagramUrl,
        signature: firestoreData?.signature,
        showEmail: firestoreData?.showEmail || false,
        followers: firestoreData?.followers || 0,
        following: firestoreData?.following || 0,
        points: firestoreData?.points || 0,
        streak: firestoreData?.streak,
        challenge: firestoreData?.challenge,
        primaryColor: firestoreData?.primaryColor,
        font: firestoreData?.font,
        premium: {
            active: !!(premiumData?.active && expires && new Date(expires) > new Date()),
            expires: expires,
        },
    };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Author | null>(null);
  const [mainAuthor, setMainAuthor] = useState<Author | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [likedPosts, setLikedPosts] = useState<{ [postId: string]: boolean }>({});
  const [likedComments, setLikedComments] = useState<{ [commentId: string]: boolean }>({});
  const [bookmarks, setBookmarks] = useState<{ [postId: string]: any }>({});

  const fetchUserFromFirestore = async (fbUser: FirebaseUser) => {
    const userRef = doc(db, 'users', fbUser.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }
    const newUser = {
        name: fbUser.displayName,
        username: generateUsername(fbUser.displayName || 'user'),
        email: fbUser.email,
        avatar: fbUser.photoURL,
        showEmail: false,
        followers: 0,
        following: 0,
        points: 0,
        streak: { currentStreak: 0, lastLoginDate: '' },
        premium: { active: false, expires: null },
    };
    await setDoc(userRef, newUser, { merge: true });
    return newUser;
  };
  
  const fetchMainAuthor = useCallback(async () => {
    const author = await getAuthorByEmail("yashrajverma916@gmail.com");
    setMainAuthor(author);
  }, []);

  const refreshUser = useCallback(async () => {
      if (firebaseUser) {
        setLoading(true);
        const firestoreData = await fetchUserFromFirestore(firebaseUser);
        const userData = await getUserData(firebaseUser.uid);
        const formattedUser = formatUser(firebaseUser, firestoreData);
        setUser(formattedUser);
        setLikedPosts(userData.likedPosts);
        setLikedComments(userData.likedComments);
        setBookmarks(userData.bookmarks);
        applyUserTheme(formattedUser);
        setLoading(false);
      }
  }, [firebaseUser]);


  useEffect(() => {
    fetchMainAuthor();
  }, [fetchMainAuthor]);


  const fetchAndSetUserData = useCallback(async (userId: string) => {
      const data = await getUserData(userId);
      setLikedPosts(data.likedPosts);
      setLikedComments(data.likedComments);
      setBookmarks(data.bookmarks);
  }, []);

  const refreshUserData = useCallback(() => {
    if (firebaseUser) {
        fetchAndSetUserData(firebaseUser.uid);
    }
  }, [firebaseUser, fetchAndSetUserData]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const initializeAuth = async () => {
      try {
        const clientConfig = await getClientFirebaseConfig();
        if (clientConfig && clientConfig.projectId) {
          const { auth: authInstance } = initializeClientApp(clientConfig);
          setAuth(authInstance);

          unsubscribe = onAuthStateChanged(authInstance, async (fbUser) => {
            setLoading(true);
            if (fbUser) {
              setFirebaseUser(fbUser);
              const [firestoreData, userData] = await Promise.all([
                  fetchUserFromFirestore(fbUser),
                  getUserData(fbUser.uid)
              ]);
              const formattedUser = formatUser(fbUser, firestoreData);
              setUser(formattedUser);
              setLikedPosts(userData.likedPosts);
              setLikedComments(userData.likedComments);
              setBookmarks(userData.bookmarks);
              applyUserTheme(formattedUser);
              if (formattedUser.premium?.active) {
                document.body.classList.add('premium-user');
              } else {
                document.body.classList.remove('premium-user');
              }
            } else {
              setFirebaseUser(null);
              setUser(null);
              setLikedPosts({});
              setLikedComments({});
              setBookmarks({});
              applyUserTheme(null);
              document.body.classList.remove('premium-user');
            }
            setLoading(false);
          });
        } else {
            setLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setLoading(false);
      }
    };
    
    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signIn = useCallback(async () => {
    if (!auth) {
      console.error("Client auth not initialized or initialization failed.");
      throw new Error("Authentication service is not available. Please try again in a moment.");
    }
    const provider = new GoogleAuthProvider();
    try {
        await setPersistence(auth, browserLocalPersistence);
        await signInWithPopup(auth, provider);
    } catch (error) {
        if ((error as any).code !== 'auth/popup-closed-by-user' && (error as any).code !== 'auth/cancelled-popup-request') {
            console.error('Sign in failed:', error);
            throw error;
        }
    }
  }, [auth]);

  const signOut = useCallback(async () => {
    if (!auth) return;
    await firebaseSignOut(auth);
    setFirebaseUser(null);
    setUser(null);
  }, [auth]);

  const updateUserProfile = useCallback(async (updates: Partial<Author>) => {
    if (!auth?.currentUser) throw new Error("Not authenticated");

    const newUserData = (prev: Author | null) => (prev ? { ...prev, ...updates } : null);
    setUser(newUserData);
    if (user?.premium?.active) {
        document.body.classList.add('premium-user');
    } else {
        document.body.classList.remove('premium-user');
    }
    applyUserTheme(newUserData(user));
    
    if (mainAuthor && auth.currentUser.uid === mainAuthor.id) {
        setMainAuthor(prev => prev ? {...prev, ...updates} : null);
    }

  }, [auth, mainAuthor, user]);

  const quitChallenge = useCallback(async () => {
    if (!user) return { success: false, error: 'User not authenticated.' };

    const result = await quitChallengeAction(user.id);
    if (result.success) {
      setUser(currentUser => currentUser ? { ...currentUser, challenge: undefined } : null);
    }
    return result;
  }, [user]);
  
  const updateFollowingCount = (change: number) => {
      setUser(currentUser => {
          if (!currentUser) return null;
          return {
              ...currentUser,
              following: (currentUser.following || 0) + change
          }
      })
  }
  const updateFollowerCount = (change: number) => {
      setUser(currentUser => {
          if (!currentUser) return null;
          return {
              ...currentUser,
              followers: (currentUser.followers || 0) + change
          }
      })
  }
  
  const updateMainAuthorFollowerCount = (change: number) => {
    setMainAuthor(currentAuthor => {
        if (!currentAuthor) return null;
        return {
            ...currentAuthor,
            followers: (currentAuthor.followers || 0) + change
        }
    })
  }

  const isAdmin = user?.email === 'yashrajverma916@gmail.com';

  const value = { user, mainAuthor, firebaseUser, auth, isAdmin, signIn, signOut, updateUserProfile, loading, updateFollowingCount, updateFollowerCount, updateMainAuthorFollowerCount, likedPosts, likedComments, bookmarks, setLikedPosts, setLikedComments, setBookmarks, refreshUserData, refreshUser, quitChallenge };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
