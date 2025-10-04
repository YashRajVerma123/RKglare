
'use client';

import { useState, useEffect } from 'react';
import { Post, getPosts } from '@/lib/data';
import RecentPostCard from './recent-post-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getFollowList } from '@/app/actions/follow-actions';
import { Loader2 } from 'lucide-react';

interface FeedTabsProps {
    recentPosts: Post[];
}

const FeedTabs = ({ recentPosts }: FeedTabsProps) => {
    const { user, loading: authLoading } = useAuth();
    const [followingPosts, setFollowingPosts] = useState<Post[]>([]);
    const [loadingFollowing, setLoadingFollowing] = useState(false);
    
    const fetchFollowingPosts = async () => {
        if (!user) return;
        setLoadingFollowing(true);
        const followingAuthors = await getFollowList(user.id, 'following');
        const followingAuthorIds = followingAuthors.map(a => a.id);
        
        if (followingAuthorIds.length > 0) {
            const allPosts = await getPosts();
            const filtered = allPosts
                .filter(p => followingAuthorIds.includes(p.author.id))
                .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                .slice(0, 10);
            setFollowingPosts(filtered);
        } else {
            setFollowingPosts([]);
        }
        setLoadingFollowing(false);
    };

    return (
        <Tabs defaultValue="recent" className="w-full">
            <div className="flex justify-center mb-8">
                <TabsList>
                    <TabsTrigger value="recent">Recent News</TabsTrigger>
                    <TabsTrigger value="following" onClick={fetchFollowingPosts} disabled={authLoading || !user}>
                        For You
                    </TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="recent">
                 <div className="grid grid-cols-1 gap-6">
                    {recentPosts.map((post) => (
                        <RecentPostCard key={post.slug} post={post} />
                    ))}
                </div>
                <div className="text-center mt-12">
                    <Button asChild variant="outline">
                        <Link href="/posts">View All Posts</Link>
                    </Button>
                </div>
            </TabsContent>
            <TabsContent value="following">
                {authLoading || loadingFollowing ? (
                    <div className="flex justify-center items-center h-40">
                       <div className="loader-dots">
                          <div className="loader-dot"></div>
                          <div className="loader-dot"></div>
                          <div className="loader-dot"></div>
                        </div>
                    </div>
                ) : user ? (
                    followingPosts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {followingPosts.map((post) => (
                                <RecentPostCard key={post.slug} post={post} />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-16 glass-card">
                            <h2 className="text-2xl font-headline font-bold mb-4">Your Feed is Empty</h2>
                            <p className="text-muted-foreground mb-6">
                                Follow authors to see their latest posts here.
                            </p>
                            <Button asChild>
                                <Link href="/posts">Explore Articles</Link>
                            </Button>
                        </div>
                    )
                ) : (
                    <div className="text-center py-16 glass-card">
                        <h2 className="text-2xl font-headline font-bold mb-4">Sign In for a Personalized Feed</h2>
                        <p className="text-muted-foreground mb-6">
                           Log in to see the latest posts from authors you follow.
                        </p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    )
};

export default FeedTabs;
