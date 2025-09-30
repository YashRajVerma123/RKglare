'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Bookmark,
  Home,
  Newspaper,
  Info,
  Send,
  PanelRightOpen,
  Mail,
  Bell,
  Settings,
  Trophy,
  Star,
  MessageSquare,
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

const navLinks = [
  { href: '/', label: 'Home', icon: <Home className="h-4 w-4" /> },
  { href: '/posts', label: 'Posts', icon: <Newspaper className="h-4 w-4" /> },
  { href: '/bulletin', label: 'Bulletin', icon: <PanelRightOpen className="h-4 w-4" /> },
  { href: '/leaderboard', label: 'Leaderboard', icon: <Trophy className="h-4 w-4" /> },
  { href: '/bookmarks', label: 'Bookmarks', icon: <Bookmark className="h-4 w-4" /> },
];

const premiumLinks = [
    { href: '/premium-feed', label: 'Premium Feed', icon: <Star className="h-4 w-4" /> },
    { href: '/premium-chat', label: 'Premium Chat', icon: <MessageSquare className="h-4 w-4" /> },
];

const Header = () => {
  const [isNavOpen, setNavOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
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
                        <PopoverContent align="start" className="w-48 p-1 font-content">
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
                
                <div className="flex-1 text-center">
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
