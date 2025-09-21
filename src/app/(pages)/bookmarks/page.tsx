
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BookmarkX, Calendar } from 'lucide-react';
import { Post } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { toggleBookmark } from '@/app/actions/user-data-actions';
import { useToast } from '@/hooks/use-toast';

type BookmarkedPost = Pick<Post, 'slug' | 'title' | 'description' | 'coverImage' | 'id'> & {
    bookmarkedAt: string;
};

const BookmarksPage = () => {
  const { user, bookmarks: bookmarksFromAuth, loading: authLoading, setBookmarks, signIn } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const bookmarksArray: BookmarkedPost[] = Object.entries(bookmarksFromAuth).map(([postId, data]) => ({
      id: postId,
      ...data,
  // @ts-ignore
  })).sort((a,b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime());

  const handleRemoveBookmark = async (postId: string, postDetails: any) => {
    if (!user) return;
    
    // Optimistic update
    const newBookmarks = {...bookmarksFromAuth};
    delete newBookmarks[postId];
    setBookmarks(newBookmarks);
    
    toast({ title: 'Bookmark Removed', variant: 'destructive' });

    const result = await toggleBookmark(user.id, postId, true, postDetails);
    if (result.error) {
        // Revert on error
        setBookmarks(bookmarksFromAuth);
        toast({ title: 'Error', description: result.error, variant: 'destructive'});
    }
  };

  if (!isClient || authLoading) {
     return (
          <div className="flex h-screen items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
          My Bookmarks<span className="text-primary">.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Articles you've saved for later. Pick up right where you left off.
        </p>
      </section>

      {!user ? (
         <div className="text-center py-16 glass-card">
            <h2 className="text-2xl font-headline font-bold mb-4">Sign In to View Bookmarks</h2>
            <p className="text-muted-foreground mb-6">
                Log in to see your saved articles across all your devices.
            </p>
            <Button onClick={signIn}>Sign In</Button>
        </div>
      ) : bookmarksArray.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookmarksArray.map((bookmark) => (
             <div key={bookmark.slug} className="glass-card group flex flex-col overflow-hidden transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
                 <Link href={`/posts/${bookmark.slug}`} className="block">
                    <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                        src={bookmark.coverImage}
                        alt={bookmark.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    </div>
                </Link>
                <div className="p-6 flex flex-col flex-grow">
                     <Link href={`/posts/${bookmark.slug}`} className="block">
                        <h3 className="font-headline text-xl font-bold leading-snug mb-2 group-hover:text-primary transition-colors">
                            {bookmark.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 flex-grow">{bookmark.description}</p>
                    </Link>
                    <div className="text-xs text-muted-foreground flex items-center gap-4 mb-4 mt-auto">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Bookmarked: {new Date(bookmark.bookmarkedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleRemoveBookmark(bookmark.id, { slug: bookmark.slug, title: bookmark.title, description: bookmark.description, coverImage: bookmark.coverImage })}>
                        <BookmarkX className="mr-2 h-4 w-4" />
                        Remove Bookmark
                    </Button>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-card">
            <h2 className="text-2xl font-headline font-bold mb-4">No Bookmarks Yet</h2>
            <p className="text-muted-foreground mb-6">
                Click the bookmark icon on any article to save it for later.
            </p>
            <Button asChild>
                <Link href="/posts">Explore Articles</Link>
            </Button>
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;
