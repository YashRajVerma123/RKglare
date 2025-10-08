
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Bookmark,
  Home,
  Newspaper,
  PanelRightOpen,
  Bell,
  Trophy,
  Star,
  MessageSquare,
  Zap,
  X,
  Loader2,
  BookHeart,
  Music,
  LogIn,
  User as UserIcon,
  LogOut,
  Palette,
  RefreshCw,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import UserNav from '@/components/user-nav';
import NotificationBell from '@/components/notification-bell';
import SearchBar from '@/components/search-bar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAuth } from '@/hooks/use-auth';
import { Progress } from '../ui/progress';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useMusicPlayer } from '@/contexts/music-player-context';

const navLinks = [
  { href: '/', label: 'Home', icon: <Home className="h-4 w-4" /> },
  { href: '/posts', label: 'Posts', icon: <Newspaper className="h-4 w-4" /> },
  { href: '/diary', label: 'Diary', icon: <BookHeart className="h-4 w-4" /> },
  { href: '/bulletin', label: 'Bulletin', icon: <PanelRightOpen className="h-4 w-4" /> },
  { href: '/bookmarks', label: 'Bookmarks', icon: <Bookmark className="h-4 w-4" /> },
];

const premiumLinks = [
    { href: '/premium-feed', label: 'Premium Feed', icon: <Star className="h-4 w-4" /> },
    { href: '/premium-chat', label: 'Premium Chat', icon: <MessageSquare className="h-4 w-4" /> },
];

const ChallengeTracker = () => {
    const { user, quitChallenge } = useAuth();
    const { toast } = useToast();
    const [isQuitting, setIsQuitting] = useState(false);
    const [isAlertOpen, setAlertOpen] = useState(false);

    if (!user?.challenge || user.challenge.completed) {
        return null;
    }

    const { description, progress, target } = user.challenge;

    const handleQuit = async () => {
        setIsQuitting(true);
        const result = await quitChallenge();
        if (!result.success) {
            toast({
                title: 'Error',
                description: result.error || 'Failed to quit challenge.',
                variant: 'destructive',
            });
        } else {
             toast({
                title: 'Challenge Abandoned',
                description: 'Your daily challenge has been removed.',
                variant: 'destructive',
            });
        }
        setIsQuitting(false);
        setAlertOpen(false);
    }

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                        </span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="center" className="w-80">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h4 className="font-medium leading-none">Daily Challenge</h4>
                            <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                        <div className="space-y-2">
                           <Progress value={(progress / target) * 100} className="h-2" />
                           <p className="text-xs text-muted-foreground text-right">{progress} / {target}</p>
                        </div>
                        <Button variant="destructive" size="sm" className="w-full" onClick={() => setAlertOpen(true)} disabled={isQuitting}>
                            {isQuitting ? <Loader2 className="h-4 w-4 animate-spin"/> : <><X className="mr-2 h-4 w-4" /> Quit Challenge</>}
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
             <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            If you quit, you will forfeit any progress and will not be able to get a new challenge until your next streak milestone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleQuit} className="bg-destructive hover:bg-destructive/90">
                            {isQuitting ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Quit'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

const Header = () => {
  const [isNavOpen, setNavOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const { isMinimized, toggleMinimize } = useMusicPlayer();
  const isPremium = user?.premium?.active;


  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
      )}
    >
      <div className="container mx-auto px-4 mt-4">
        <div className="flex items-center justify-center">
            <div className="flex items-center justify-between p-2 rounded-full bg-background/30 backdrop-blur-xl border border-white/10 shadow-lg w-full max-w-lg">
                <div className="flex items-center">
                    <Popover open={isNavOpen} onOpenChange={setNavOpen}>
                        <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-48 p-1 font-body">
                        <div className="p-1">
                          {navLinks.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent',
                                    pathname === link.href ? 'text-primary' : 'text-foreground/80'
                                )}
                                >
                                {link.icon}
                                <span>{link.label}</span>
                                </Link>
                          ))}
                        </div>
                         {isPremium && (
                            <>
                                <div className="my-1 h-px bg-muted" />
                                <div className="p-1">
                                    <div className="px-2 py-1.5 text-sm font-semibold">Glare+</div>
                                    {premiumLinks.map((link) => (
                                         <Link
                                            key={link.href}
                                            href={link.href}
                                            className={cn(
                                                'flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent',
                                                pathname === link.href ? 'text-yellow-500' : 'text-foreground/80'
                                            )}
                                            >
                                            {link.icon}
                                            <span>{link.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </>
                         )}
                        </PopoverContent>
                    </Popover>
                    <NotificationBell />
                </div>
                
                <div className="flex items-center gap-2">
                    <ChallengeTracker />
                     {isMinimized && (
                        <Button variant="ghost" size="icon" onClick={toggleMinimize}>
                            <Music className="h-5 w-5 text-primary animate-pulse" />
                        </Button>
                    )}
                    <Logo />
                </div>

                <div className="flex items-center">
                    <SearchBar />
                    <UserNav />
                </div>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
