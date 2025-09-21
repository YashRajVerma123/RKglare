
import { Suspense } from 'react';
import PostsClient from './posts-client';

const PostsPage = () => {
  return (
    <Suspense fallback={
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-16">
                <div className="h-10 w-1/2 bg-muted rounded-md animate-pulse mx-auto mb-4"></div>
                <div className="h-6 w-2/3 bg-muted rounded-md animate-pulse mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
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
        </div>
    }>
      <PostsClient />
    </Suspense>
  );
};

export default PostsPage;
