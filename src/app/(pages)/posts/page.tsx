
import { Suspense } from 'react';
import PostsClient from './posts-client';
import { getPosts } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

// Instruct Next.js to revalidate this page every hour
export const revalidate = 3600;

interface PostsPageProps {
  searchParams: { q?: string };
}

const PostsPage = async ({ searchParams }: PostsPageProps) => {
  // Fetch initial posts based on search query on the server
  const posts = await getPosts(false, null, searchParams.q);

  return (
    <Suspense fallback={
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-16">
                <Skeleton className="h-10 w-1/2 mx-auto mb-4" />
                <Skeleton className="h-6 w-2/3 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card h-full flex flex-col overflow-hidden">
                    <Skeleton className="relative aspect-[16/9]" />
                    <div className="p-6 flex flex-col flex-grow">
                        <Skeleton className="h-6 w-full mb-2" />
                        <Skeleton className="h-6 w-3/4 mb-4" />
                        <div className="flex-grow" />
                        <Skeleton className="h-10 w-full mt-4" />
                    </div>
                </div>
            ))}
            </div>
        </div>
    }>
      <PostsClient initialPosts={posts} />
    </Suspense>
  );
};

export default PostsPage;
