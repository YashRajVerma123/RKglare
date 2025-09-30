
'use client'

import { Post } from "@/lib/data";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Button } from "./ui/button";
import { Heart, Share2, Copy, Bookmark, Newspaper, Loader2, MessageSquare, Bot, RefreshCw, BookOpen, FileDown, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { togglePostLike, toggleBookmark } from "@/app/actions/user-data-actions";

const LikeButton = ({ post }: { post: Post }) => {
  const { user, likedPosts, setLikedPosts, signIn } = useAuth();
  const { toast } = useToast();
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [isAnimating, setIsAnimating] = useState(false);

  const isLiked = user ? likedPosts[post.id] === true : false;

  const handleLike = async () => {
    if (!user) {
      toast({ title: 'Please sign in', description: 'You need to be logged in to like posts.', action: <Button onClick={signIn}>Sign In</Button> });
      return;
    }

    if (!isLiked) {
      setIsAnimating(true);
    }
    
    // Optimistic UI updates
    const newLikedState = !isLiked;
    setLikedPosts(prev => ({ ...prev, [post.id]: newLikedState }));
    setLikeCount(prev => prev + (newLikedState ? 1 : -1));

    // Server action
    const result = await togglePostLike(user.id, post.id, post.slug, isLiked);
    if (result.error) {
        // Revert optimistic updates on error
        setLikedPosts(prev => ({ ...prev, [post.id]: isLiked }));
        setLikeCount(prev => prev + (isLiked ? 1 : -1));
        toast({ title: 'Error', description: result.error, variant: 'destructive'});
    }
  };
  
  const particleColors = ["#FFC700", "#FF0000", "#2E3192", "#455E55"];

  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLike}
          className="rounded-full h-auto w-auto p-2 flex flex-row items-center gap-2 md:flex-col"
        >
          <div className="relative">
            <Heart
              className={cn(
                "h-6 w-6 transition-colors duration-300",
                isLiked ? 'fill-red-500 text-red-500' : '',
                isAnimating && 'like-button-burst'
              )}
              onAnimationEnd={() => setIsAnimating(false)}
            />
            {isAnimating && (
              <div className="particle-burst animate">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="particle"
                    style={
                      {
                        '--tx': `${Math.random() * 40 - 20}px`,
                        '--ty': `${Math.random() * 40 - 20}px`,
                        'background': particleColors[i % particleColors.length],
                        'animationDelay': `${Math.random() * 0.1}s`,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            )}
          </div>
          <span className="text-sm font-sans pr-2 md:pr-0">{likeCount}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>Like</p>
      </TooltipContent>
    </Tooltip>
  );
};


export default function PostActions({ post, onReaderModeToggle }: { post: Post; onReaderModeToggle: () => void; }) {
  const { toast } = useToast();
  const { user, bookmarks, setBookmarks, signIn, refreshUserData } = useAuth();
  const [currentUrl, setCurrentUrl] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isSummaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const isPremium = user?.premium?.active;


  const isBookmarked = user ? bookmarks[post.id] !== undefined : false;

  useEffect(() => {
    setIsMounted(true);
    setPortalContainer(document.getElementById('post-actions-container'));
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    toast({ title: 'Link copied to clipboard!' });
  };

  const handleToggleBookmark = async () => {
    if (!user) {
        toast({ title: 'Please sign in', description: 'You need to be logged in to bookmark posts.', action: <Button onClick={signIn}>Sign In</Button> });
        return;
    }
    const newIsBookmarked = !isBookmarked;

    // Optimistic update
    if (newIsBookmarked) {
        setBookmarks(prev => ({...prev, [post.id]: { bookmarkedAt: new Date().toISOString() }}));
        toast({ title: 'Article Bookmarked!', description: 'You can find it in your bookmarks.' });
    } else {
        const newBookmarks = {...bookmarks};
        delete newBookmarks[post.id];
        setBookmarks(newBookmarks);
        toast({ title: 'Bookmark Removed', variant: 'destructive' });
    }

    const postDetails = {
        slug: post.slug,
        title: post.title,
        description: post.description,
        coverImage: post.coverImage,
    };
    const result = await toggleBookmark(user.id, post.id, isBookmarked, postDetails);
    
    if (result.error) {
        // Revert on failure
        refreshUserData();
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };
  
  const handleSummarize = async () => {
    setSummaryDialogOpen(true);
    if (summary || summaryError) return; // Don't re-run if we already have a result

    setIsSummarizing(true);
    setSummary('');
    setSummaryError(null);

    // Simulate AI thinking for 1.5 seconds
    setTimeout(() => {
        if (post.summary) {
            setSummary(post.summary);
        } else {
            setSummaryError("A summary is not available for this article.");
        }
        setIsSummarizing(false);
    }, 1500);
  }

  const handleScrollToComments = () => {
    const commentSection = document.querySelector('#comments');
    if (commentSection) {
        commentSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const handleDownloadPdf = () => {
      toast({
          title: "Coming Soon!",
          description: "The ability to download articles as PDFs is a planned feature."
      })
  }

  if (!isMounted || !portalContainer) {
    return null;
  }
  
  const actions = [
     {
      label: "Reader Mode",
      icon: <BookOpen className="h-5 w-5" />,
      onClick: onReaderModeToggle,
    },
    {
      label: "Summarize",
      icon: <Newspaper className="h-5 w-5" />,
      onClick: handleSummarize,
    },
     {
      label: "Download PDF",
      icon: <FileDown className="h-5 w-5" />,
      onClick: handleDownloadPdf,
      premium: true,
    },
    {
      label: isBookmarked ? "Bookmarked" : "Bookmark",
      icon: <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-primary text-primary")} />,
      onClick: handleToggleBookmark,
    },
    {
      label: "Comments",
      icon: <MessageSquare className="h-5 w-5" />,
      onClick: handleScrollToComments,
    },
    {
      label: "Share",
      icon: <Share2 className="h-5 w-5" />,
      onClick: () => {}, // Click handled by DialogTrigger
      isShare: true,
    }
  ];
  
  const actionBar = (
     <TooltipProvider>
      {/* Mobile Bar */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center justify-center p-1.5 gap-1 rounded-full bg-background/30 backdrop-blur-xl border border-white/20 shadow-2xl">
              <LikeButton post={post} />
              {actions.filter(a => !a.premium || isPremium).map((action, index) => (
                 action.isShare ? (
                    <Dialog key={action.label}>
                      <DialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="rounded-full text-foreground/80 hover:text-foreground hover:bg-white/10">
                            {action.icon}
                            <span className="sr-only">{action.label}</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Share this post</DialogTitle>
                          <DialogDescription>Anyone with this link will be able to view this post.</DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-x-2">
                          <Input defaultValue={currentUrl} readOnly />
                          <Button type="button" size="icon" onClick={handleCopyToClipboard}><Copy className="h-4 w-4" /></Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button key={action.label} variant="ghost" size="icon" onClick={action.onClick} className="rounded-full text-foreground/80 hover:text-foreground hover:bg-white/10">
                      {action.icon}
                    </Button>
                  )
              ))}
          </div>
      </div>
      
      {/* Desktop Vertical Bar */}
      <div className="hidden md:block fixed left-4 top-1/2 -translate-y-1/2 z-50">
         <div className="p-2 bg-card/30 backdrop-blur-xl border border-white/10 rounded-full flex flex-col gap-2 items-center shadow-2xl">
            <LikeButton post={post} />
            {actions.filter(a => !a.premium || isPremium).map((action) => (
              <Tooltip key={action.label} delayDuration={100}>
                <TooltipTrigger asChild>
                  {action.isShare ? (
                    <Dialog>
                      <DialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="rounded-full h-11 w-11">
                            {action.premium ? <Star className="h-5 w-5 text-yellow-500" /> : action.icon}
                            <span className="sr-only">{action.label}</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Share this post</DialogTitle>
                          <DialogDescription>Anyone with this link will be able to view this post.</DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-x-2">
                          <Input defaultValue={currentUrl} readOnly />
                          <Button type="button" size="icon" onClick={handleCopyToClipboard}><Copy className="h-4 w-4" /></Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={action.onClick} className="rounded-full h-11 w-11 relative">
                       {action.premium ? <Star className="h-5 w-5 text-yellow-500" /> : action.icon}
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{action.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
      </div>

      <Dialog open={isSummaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
        <DialogContent className="sm:max-w-lg glass-card font-content">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline">
              <Bot className="text-primary"/>
              AI Summary
            </DialogTitle>
            <DialogDescription>
              Here&apos;s a quick summary of the article, generated by Nova.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 pr-2 max-h-[60vh] overflow-y-auto">
            {isSummarizing ? (
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                <div className="loader-dots">
                  <div className="loader-dot"></div>
                  <div className="loader-dot"></div>
                  <div className="loader-dot"></div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted/50 p-4 rounded-lg">
                  {summary && <p className="text-sm text-foreground">{summary}</p>}
                  {summaryError && (
                    <div className="flex flex-col items-start gap-4">
                        <p className="text-sm text-destructive">{summaryError}</p>
                        <Button variant="outline" size="sm" onClick={handleSummarize}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSummaryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </TooltipProvider>
  );

  return ReactDOM.createPortal(actionBar, portalContainer);
}
