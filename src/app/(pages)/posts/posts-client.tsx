
'use client'
import { useSearchParams } from 'next/navigation';
import { Post, getPostsClient } from '@/lib/data';
import BlogPostCard from '@/components/blog-post-card';
import { useEffect, useState } from 'react';
import RecentPostCard from '@/components/recent-post-card';

const PostsClient = ({ initialPosts }: { initialPosts: Post[] }) => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect now primarily handles sorting, as filtering is done server-side
    // for the initial load. For dynamic client-side filtering (if ever needed),
    // this would be the place.
    setLoading(true);
    const sortedPosts = [...initialPosts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    setFilteredPosts(sortedPosts);
    setLoading(false);
  }, [initialPosts]);
  
  useEffect(() => {
      // When search query changes, we refetch from the server.
      // This is more efficient than filtering a large list on the client.
      const fetchFiltered = async () => {
          setLoading(true);
          const posts = await getPostsClient(false, null, searchQuery || undefined);
          const sortedPosts = posts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
          setFilteredPosts(sortedPosts);
          setLoading(false);
      }

      // We only re-fetch if the query is not null. Initial load is handled by server props.
      if (searchQuery !== null) {
          fetchFiltered();
      }

  }, [searchQuery]);

  if (loading) {
    return (
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
    )
  }
  
  const latestPost = filteredPosts[0];
  const otherPosts = filteredPosts.slice(1);

  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-4">
          {searchQuery ? `Results for "${searchQuery}"` : "All Articles"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          {searchQuery ? `${filteredPosts.length} articles found.` : 'Explore our collection of stories, analyses, and insights.'}
        </p>
         {!searchQuery && <div className="mt-4 h-px w-32 mx-auto gradient-underline"></div>}
      </section>

      {filteredPosts.length > 0 ? (
        <div className="space-y-12">
            {latestPost && !searchQuery && (
              <div className="mb-12">
                <RecentPostCard post={latestPost} />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(searchQuery ? filteredPosts : otherPosts).map((post, index) => (
                <BlogPostCard key={post.slug} post={post} priority={index < 3} />
            ))}
            </div>
        </div>
      ) : (
        <div className="text-center glass-card py-16">
            <h2 className="text-2xl font-headline font-bold mb-4">No Results Found</h2>
            <p className="text-muted-foreground">
                We couldn't find any articles matching your search for "{searchQuery}".
            </p>
        </div>
      )}
    </div>
  );
};

export default PostsClient;
