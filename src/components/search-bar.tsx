
'use client';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { File, Search, Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Post, getPosts } from '@/lib/data';
import Link from 'next/link';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const SearchBar = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim() === '') {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const posts = await getPosts();
    const filteredPosts = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setResults(filteredPosts.slice(0, 5));
    setIsLoading(false);
  }, []);
  
  useEffect(() => {
    if (!isDialogOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isDialogOpen]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query) {
        performSearch(query);
      } else {
        setResults([]);
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [query, performSearch]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/posts?q=${encodeURIComponent(query.trim())}`);
      setIsDialogOpen(false);
    }
  };
  
  // Focus input when dialog opens
   useEffect(() => {
    if (isDialogOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isDialogOpen]);

  const handleResultClick = () => {
    setIsDialogOpen(false);
  };


  return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
              </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl p-0 glass-card">
              <DialogHeader className="p-6 pb-0">
                  <DialogTitle className="sr-only">Search</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSearchSubmit}>
                  <div className="relative border-b border-border/10 px-6">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                          ref={searchInputRef}
                          type="search"
                          placeholder="Search for articles, tags, or topics..."
                          className="pl-10 h-16 w-full bg-transparent border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                      />
                  </div>
              </form>
              <div className="p-6 pt-4 max-h-[60vh] overflow-y-auto">
                  {isLoading && (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {!isLoading && query && results.length > 0 && (
                      <ul className="space-y-2">
                          {results.map((post) => (
                              <li key={post.slug}>
                                  <Link
                                      href={`/posts/${post.slug}`}
                                      onClick={handleResultClick}
                                      className="flex flex-col gap-1 rounded-lg px-4 py-3 text-sm hover:bg-primary/10 transition-colors"
                                  >
                                      <span className="font-semibold">{post.title}</span>
                                      <p className="text-muted-foreground line-clamp-1">{post.description}</p>
                                  </Link>
                              </li>
                          ))}
                           {results.length > 0 && (
                                <div className="pt-2">
                                    <Button
                                        variant="link"
                                        onClick={() => {
                                            router.push(`/posts?q=${encodeURIComponent(query.trim())}`);
                                            setIsDialogOpen(false);
                                        }}
                                        className="w-full text-center text-sm text-primary"
                                    >
                                        View all {results.length}+ results
                                    </Button>
                                </div>
                            )}
                      </ul>
                  )}
                   {!isLoading && query && results.length === 0 && (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                          <p>No results found for &quot;{query}&quot;</p>
                      </div>
                  )}
                   {!isLoading && !query && (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                          <p>Start typing to search for articles.</p>
                      </div>
                  )}
              </div>
          </DialogContent>
      </Dialog>
  );
};

export default SearchBar;
