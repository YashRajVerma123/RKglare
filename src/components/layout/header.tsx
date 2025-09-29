
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
} from 'lucide-react';

import { cn } from '@/lib/utils';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import UserNav from '@/components/user-nav';
import NotificationBell from '@/components/notification-bell';
import SearchBar from '@/components/search-bar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navLinks = [
  { href: '/', label: 'Home', icon: <Home className="h-4 w-4" /> },
  { href: '/posts', label: 'Posts', icon: <Newspaper className="h-4 w-4" /> },
  { href: '/bulletin', label: 'Bulletin', icon: <PanelRightOpen className="h-4 w-4" /> },
  { href: '/bookmarks', label: 'Bookmarks', icon: <Bookmark className="h-4 w-4" /> },
];

const Header = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
        'py-3 bg-background/80 backdrop-blur-lg border-b border-border/10'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-1 md:flex-1">
          {/* Universal Nav Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="font-content w-48">
              {navLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link
                      href={link.href}
                      className={cn(
                        'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                        pathname === link.href ? 'text-primary' : 'text-foreground/80'
                      )}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <NotificationBell />
        </div>

        {/* Center Section (Logo) */}
        <div className="absolute left-1/2 -translate-x-1/2">
            <Logo />
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-end flex-1">
            <SearchBar />
            <div className="flex items-center gap-1">
              <UserNav />
            </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
