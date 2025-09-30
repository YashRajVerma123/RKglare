
'use client';

import { Post, Comment as CommentType } from '@/lib/data';
import PostActions from '@/components/post-actions';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Flame } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import BlogPostCard from '@/components/blog-post-card';
import CommentSection from '@/components/comment-section';
import AboutTheAuthor from '@/components/about-the-author';
import { useAuth } from '@/hooks/use-auth';
import { updateReadingProgress } from '@/app/actions/user-data-actions';
import ReadingProgressBar from '@/components/reading-progress-bar';
import { useDynamicTheme } from '@/contexts/dynamic-theme-context';
import { useInView } from 'react-intersection-observer';
import { awardPoints } from '@/app/actions/gamification-actions';

interface PostClientPageProps {
  post: Post;
  relatedPosts: Post[];
  initialComments: CommentType[];
  isPreview?: boolean;
}

export default function PostClientPage({ post, relatedPosts, initialComments, isPreview = false }: PostClientPageProps) {
  const { user, bookmarks } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const { setTheme, resetTheme } = useDynamicTheme();
  const [hasAwardedReadPoints, setHasAwardedReadPoints] = useState(false);
  
  const { ref: endOfContentRef, inView: endOfContentInView } = useInView({
    triggerOnce: true,
    threshold: 1.0,
  });
  
  const isBookmarked = post ? bookmarks[post.id] : false;
  
  useEffect(() => {
    if (isPreview) return;
    if (post?.tags && post.tags.length > 0) {
      setTheme(post.tags[0]);
    }
    return () => {
      if (isPreview) return;
      resetTheme();
    };
  }, [post, setTheme, resetTheme, isPreview]);

  useEffect(() => {
    if (isPreview) return;
    if (isBookmarked) {
        const scrollPosition = bookmarks[post!.id]?.scrollPosition;
        if (typeof scrollPosition === 'number') {
            setTimeout(() => window.scrollTo(0, scrollPosition), 100);
        }
    }
  }, [post, isBookmarked, bookmarks, isPreview]);

  useEffect(() => {
    if (isPreview) return;
    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
        if (contentRef.current && user && isBookmarked) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                updateReadingProgress(user.id, post!.id, window.scrollY);
            }, 250);
        }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(timeout);
    };
  }, [post, user, isBookmarked, isPreview]);
  
  // Award points for reading the post
  useEffect(() => {
    if (endOfContentInView && user && !hasAwardedReadPoints && !isPreview) {
        const award = async () => {
            await awardPoints(user.id, 'READ_POST', post.id);
            setHasAwardedReadPoints(true);
        }
        award();
    }
  }, [endOfContentInView, user, post.id, hasAwardedReadPoints, isPreview]);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
  };
  
  return (
    <>
      {!isPreview && <ReadingProgressBar />}
      <div className="container mx-auto px-4 py-10 max-w-4xl" ref={contentRef}>
        <article>
          <header className="mb-8 animate-fade-in-up">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map(tag => (
                    <Link href={`/posts?q=${encodeURIComponent(tag)}`} key={tag}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20">{tag}</Badge>
                    </Link>
                ))}
                </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-title font-light tracking-tight mb-4">{post.title}</h1>
            {post.trending && post.trendingPosition && (
              <div className="mb-6">
                <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20 text-sm badge-shine">
                  <Flame className="h-4 w-4 mr-2" />
                  Trending at #{post.trendingPosition}
                </Badge>
              </div>
            )}
            <p className="text-lg text-muted-foreground mb-6">{post.description}</p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                </Avatar>
                <span>{post.author.name}</span>
              </div>
              <Separator orientation="vertical" className="h-4"/>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.readTime} min read</span>
              </div>
            </div>
          </header>
          
          <div 
            className="relative aspect-video rounded-xl overflow-hidden mb-8 shadow-lg animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              className="object-cover"
              data-ai-hint="blog post header"
            />
          </div>

          <div 
            className="prose dark:prose-invert prose-xl max-w-none prose-headings:font-headline prose-a:text-primary hover:prose-a:underline prose-img:rounded-lg font-content font-light animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <div ref={endOfContentRef} className="h-10" />
          
         {!isPreview && (
           <>
              <Separator className="my-12" />
              
              <div className="animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                <AboutTheAuthor />
              </div>

              <Separator className="my-12" />

              <div className="animate-fade-in-up" style={{animationDelay: '0.8s'}}>
                <CommentSection postId={post.id} initialComments={initialComments} />
              </div>

              {relatedPosts.length > 0 && (
                <>
                  <div className="my-12 h-[2px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                  <section className="animate-fade-in-up" style={{animationDelay: '1s'}}>
                    <h2 className="text-3xl font-headline font-bold mb-8 text-center">Continue Reading</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {relatedPosts.map(relatedPost => (
                        <BlogPostCard key={relatedPost.id} post={relatedPost} />
                      ))}
                    </div>
                  </section>
                </>
              )}
           </>
         )}
        </article>
      </div>
     {!isPreview && <PostActions post={post} />}
    </>
  );
};
