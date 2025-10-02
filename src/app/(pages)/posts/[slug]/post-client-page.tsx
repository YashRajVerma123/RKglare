
'use client';

import { Post, Comment as CommentType } from '@/lib/data';
import PostActions from '@/components/post-actions';
import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Flame, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import BlogPostCard from '@/components/blog-post-card';
import CommentSection from '@/components/comment-section';
import AboutTheAuthor from '@/components/about-the-author';
import { useAuth } from '@/hooks/use-auth';
import { updateReadingProgress } from '@/app/actions/user-data-actions';
import ReadingProgressBar from '@/components/reading-progress-bar';
import { useDynamicTheme } from '@/contexts/dynamic-theme-context';
import ReaderMode from '@/components/reader-mode';
import ReadingTimer from '@/components/reading-timer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useEmblaCarousel, { EmblaCarouselType } from 'embla-carousel-react';


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
  const [isReaderOpen, setReaderOpen] = useState(false);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const isBookmarked = post ? bookmarks[post.id] : false;
  
  const isPremium = user?.premium?.active === true;
  const now = new Date();
  const isEarlyAccessActive = post.earlyAccess && post.publishedAt && new Date(post.publishedAt).getTime() + (24 * 60 * 60 * 1000) > now.getTime();
  
  const canViewContent = isPreview || !post.premiumOnly && !isEarlyAccessActive || (isPremium ?? false);

  const fontClass = 'font-content';

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);


  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);


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
             { (post.premiumOnly || (post.earlyAccess && isEarlyAccessActive)) && (
                <div className="mb-6">
                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20 text-sm badge-shine">
                        <Star className="h-4 w-4 mr-2" />
                        {post.premiumOnly ? "Glare+ Exclusive" : "Early Access"}
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

          { canViewContent ? (
             <div 
                id="article-content"
                className={cn(
                    "prose dark:prose-invert prose-xl max-w-none prose-headings:font-headline prose-a:text-primary hover:prose-a:underline prose-img:rounded-lg font-light animate-fade-in-up",
                     fontClass
                )}
                style={{ animationDelay: '0.4s' }}
                dangerouslySetInnerHTML={{ __html: post.content }}
             />
          ) : (
             <div className="text-center glass-card p-12 my-12">
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-headline font-bold">This is a Glare+ Exclusive</h2>
                <p className="text-muted-foreground mt-2 mb-6">
                    {post.earlyAccess ? "Get instant access to this article and more by becoming a Glare+ supporter." : "To continue reading, please subscribe to Glare+."}
                </p>
                <Button asChild>
                    <Link href="/glare-plus">Explore Glare+</Link>
                </Button>
            </div>
          )}
          
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
                  <section className="animate-fade-in-up w-full relative" style={{animationDelay: '1s'}}>
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-3xl font-headline font-bold">Continue Reading</h2>
                    </div>
                     <div className="embla overflow-hidden" ref={emblaRef}>
                        <div className="embla__container">
                          {relatedPosts.map((relatedPost, index) => (
                            <div
                              key={relatedPost.id}
                              className={cn(
                                "embla__slide transition-all duration-500 ease-in-out",
                                index === selectedIndex ? 'opacity-100 scale-100' : 'opacity-50 scale-80 grayscale'
                              )}
                            >
                              <div className="p-2 h-full">
                                <BlogPostCard post={relatedPost} />
                              </div>
                            </div>
                          ))}
                        </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 z-10 hidden md:inline-flex"
                      onClick={() => emblaApi?.scrollPrev()}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 z-10 hidden md:inline-flex"
                      onClick={() => emblaApi?.scrollNext()}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </section>
                </>
              )}
           </>
         )}
        </article>
      </div>
      {!isPreview && (
        <>
          <PostActions post={post} onReaderModeToggle={() => setReaderOpen(prev => !prev)} />
          <ReaderMode
              isOpen={isReaderOpen}
              onClose={() => setReaderOpen(false)}
              title={post.title}
              content={post.content}
          />
           <ReadingTimer postId={post.id} />
        </>
      )}
    </>
  );
};
