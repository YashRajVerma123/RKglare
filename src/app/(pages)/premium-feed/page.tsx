
import { Suspense } from 'react';
import PostsClient from '../posts/posts-client';
import { getPosts, Post } from '@/lib/data';
import { auth } from 'firebase-admin';
import { headers } from 'next/headers';
import { getAuth } from "firebase-admin/auth";
import { getApp } from "firebase-admin/app";
import { app } from '@/lib/firebase-server';
import { getAuthorById } from '@/lib/data';

// This is a server component, so we can check auth state here.
const PremiumFeedPage = async () => {
    
    // Auth check on the server
    const headersList = headers();
    const sessionCookie = headersList.get('session');
    let currentUser = null;
    
    if (sessionCookie) {
        try {
            const decodedToken = await getAuth(app).verifySessionCookie(sessionCookie, true);
            currentUser = await getAuthorById(decodedToken.uid);
        } catch (error) {
            console.warn("Session cookie invalid:", error);
        }
    }
    
    // Redirect if not premium
    if (!currentUser || !currentUser.premium?.active) {
        return (
             <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
                <p className="text-muted-foreground">You must be a Glare+ subscriber to view this page.</p>
            </div>
        )
    }
    
  // Fetch all posts, then filter for premium/early access
  const allPosts = await getPosts(false, currentUser);
  const now = new Date();

  const premiumPosts = allPosts.filter(post => {
      const isEarly = post.earlyAccess && new Date(post.publishedAt).getTime() + (24 * 60 * 60 * 1000) > now.getTime();
      return post.premiumOnly || isEarly;
  });

  return (
     <div className="container mx-auto px-4 py-16">
        <section className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
            Your Premium Feed<span className="text-primary">.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Exclusive content and early access articles, just for Glare+ supporters.
            </p>
        </section>

        {premiumPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {premiumPosts.map((post, index) => (
                <BlogPostCard key={post.slug} post={post} priority={index < 3} />
            ))}
            </div>
        ) : (
            <div className="text-center glass-card py-16">
                <h2 className="text-2xl font-headline font-bold mb-4">Nothing Here Yet</h2>
                <p className="text-muted-foreground">
                    There are currently no exclusive or early-access articles. Check back soon!
                </p>
            </div>
        )}
    </div>
  );
};

export default PremiumFeedPage;
