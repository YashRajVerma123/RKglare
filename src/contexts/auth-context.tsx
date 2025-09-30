
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { db } from '@/lib/firebase-server';
import { Author, UserData, getAuthorByEmail } from '@/lib/data';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getClientFirebaseConfig } from '@/app/actions/config-actions';
import { initializeClientApp } from '@/lib/firebase-client';
import { getUserData } from '@/app/actions/user-data-actions';
import { updateAuthorProfile } from '@/app/actions/user-actions';


interface AuthContextType {
  user: Author | null;
  mainAuthor: Author | null; // New state for the main site author
  firebaseUser: FirebaseUser | null;
  auth: Auth | null;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<Author>) => Promise<void>;
  updateFollowingCount: (change: number) => void;
  updateFollowerCount: (change: number) => void;
  updateMainAuthorFollowerCount: (change: number) => void; // New updater
  loading: boolean;
  likedPosts: { [postId: string]: boolean };
  likedComments: { [commentId: string]: boolean };
  bookmarks: { [postId: string]: any };
  setLikedPosts: React.Dispatch<React.SetStateAction<{ [postId: string]: boolean }>>;
  setLikedComments: React.Dispatch<React.SetStateAction<{ [commentId: string]: boolean }>>;
  setBookmarks: React.Dispatch<React.SetStateAction<{ [postId: string]: any }>>;
  refreshUserData: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const formatUser = (user: FirebaseUser, firestoreData?: any): Author => {
    return {
        id: user.uid,
        name: firestoreData?.name || user.displayName || "No Name",
        email: user.email || "no-email@example.com",
        avatar: firestoreData?.avatar || user.photoURL || `https://i.pravatar.cc/150?u=\${user.uid}`,
        bio: firestoreData?.bio,
        instagramUrl: firestoreData?.instagramUrl,
        signature: firestoreData?.signature,
        showEmail: firestoreData?.showEmail || false,
        followers: firestoreData?.followers || 0,
        following: firestoreData?.following || 0,
        points: firestoreData?.points || 0, // Added for gamification
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
        email: fbUser.email,
        avatar: fbUser.photoURL,
        showEmail: false,
        followers: 0,
        following: 0,
        points: 0, // Initial points
    };
    await setDoc(userRef, newUser, { merge: true });
    return newUser;
  };
  
  const fetchMainAuthor = useCallback(async () => {
    const author = await getAuthorByEmail("yashrajverma916@gmail.com");
    setMainAuthor(author);
  }, []);

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
            if (fbUser) {
              setFirebaseUser(fbUser);
              const [firestoreData, userData] = await Promise.all([
                  fetchUserFromFirestore(fbUser),
                  getUserData(fbUser.uid)
              ]);
              setUser(formatUser(fbUser, firestoreData));
              setLikedPosts(userData.likedPosts);
              setLikedComments(userData.likedComments);
              setBookmarks(userData.bookmarks);
            } else {
              setFirebaseUser(null);
              setUser(null);
              setLikedPosts({});
              setLikedComments({});
              setBookmarks({});
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

    setUser(prev => prev ? { ...prev, ...updates } : null);
    
    if (mainAuthor && auth.currentUser.uid === mainAuthor.id) {
        setMainAuthor(prev => prev ? {...prev, ...updates} : null);
    }

  }, [auth, mainAuthor]);
  
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

  const value = { user, mainAuthor, firebaseUser, auth, isAdmin, signIn, signOut, updateUserProfile, loading, updateFollowingCount, updateFollowerCount, updateMainAuthorFollowerCount, likedPosts, likedComments, bookmarks, setLikedPosts, setLikedComments, setBookmarks, refreshUserData };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
