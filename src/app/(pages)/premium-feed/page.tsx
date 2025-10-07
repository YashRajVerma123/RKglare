
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getPostsServer, Post } from '@/lib/data';
import BlogPostCard from '@/components/blog-post-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Star } from 'lucide-react';

const PremiumFeedPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    const isPremium = user?.premium?.active === true && user.premium.expires && new Date(user.premium.expires) > new Date();

    useEffect(() => {
        if (!authLoading && isPremium) {
            const fetchPremiumPosts = async () => {
                setLoadingPosts(true);
                const allPosts = await getPostsServer(false, user); // Pass user to get correct permissions
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

                setPosts(premiumPosts);
                setLoadingPosts(false);
            };

            fetchPremiumPosts();
        } else if (!authLoading && !isPremium) {
            setLoadingPosts(false);
        }
    }, [user, isPremium, authLoading]);
    
    if (authLoading) {
         return (
             <div className="flex h-[calc(100vh-80px)] items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }
    
    if (!isPremium) {
        return (
             <div className="container mx-auto px-4 py-16 text-center">
                <div className="glass-card p-12 max-w-2xl mx-auto">
                     <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h1 className="text-3xl font-headline font-bold mb-4">Access Denied</h1>
                    <p className="text-muted-foreground mb-6">You must be a Glare+ subscriber to view this private feed.</p>
                    <Button asChild>
                        <Link href="/glare-plus">Explore Glare+</Link>
                    </Button>
                </div>
            </div>
        );
    }

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

            {loadingPosts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="glass-card h-full flex flex-col overflow-hidden">
                        <div className="relative aspect-[16/9] bg-muted animate-pulse"></div>
                        <div className="p-6 flex flex-col flex-grow">
                            <div className="h-6 w-full bg-muted animate-pulse rounded-md mb-2"></div>
                            <div className="h-6 w-3/4 bg-muted animate-pulse rounded-md mb-4"></div>
                            <div className="h-10 w-full bg-muted animate-pulse rounded-md mt-auto"></div>
                        </div>
                    </div>
                ))}
                </div>
            ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                    <BlogPostCard key={post.slug} post={post} priority={index < 3} />
                ))}
                </div>
            ) : (
                <div className="text-center glass-card py-16">
                    <h2 className="text-2xl font-headline font-bold mb-4">The Feed is Quiet... For Now</h2>
                    <p className="text-muted-foreground">
                        There are currently no new exclusive or early-access articles. Check back soon!
                    </p>
                </div>
            )}
        </div>
    );
};

export default PremiumFeedPage;
