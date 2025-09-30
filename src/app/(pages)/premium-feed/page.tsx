
import { Suspense } from 'react';
import PostsClient from '../posts/posts-client';
import { getPosts, Post, getAuthorById } from '@/lib/data';
import { headers } from 'next/headers';
import { getAuth } from "firebase-admin/auth";
import { getApp } from "firebase-admin/app";
import { app } from '@/lib/firebase-server';
import BlogPostCard from '@/components/blog-post-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
    if (!currentUser || !currentUser.premium?.active || new Date(currentUser.premium.expires!) < new Date()) {
        return (
             <div className="container mx-auto px-4 py-16 text-center">
                <div className="glass-card p-12 max-w-2xl mx-auto">
                    <h1 className="text-4xl font-headline font-bold mb-4">Access Denied</h1>
                    <p className="text-muted-foreground mb-6">You must be a Glare+ subscriber to view this page.</p>
                    <Button asChild>
                        <Link href="/glare-plus">Explore Glare+</Link>
                    </Button>
                </div>
            </div>
        )
    }
    
  // Fetch all posts, then filter for premium/early access
  const allPosts = await getPosts(true, currentUser); // Pass true to get content
  const now = new Date();

  const premiumPosts = allPosts.filter(post => {
      if (post.premiumOnly) return true;
      if (post.earlyAccess) {
          const publishedAt = new Date(post.publishedAt);
          const hoursSincePublished = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);
          return hoursSincePublished < 24;
      }
      return false;
  }).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

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
