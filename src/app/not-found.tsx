
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh] text-center">
      <div className="relative">
        <div 
          className="absolute -top-20 -left-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '0s' }}
        ></div>
        <div 
          className="absolute -bottom-20 -right-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        
        <div className="relative glass-card p-12 rounded-2xl">
            <h1 className="text-8xl md:text-9xl font-extrabold font-headline tracking-tighter text-primary animate-fade-in-up">
            404
            </h1>
            <h2 className="text-2xl md:text-3xl font-headline font-semibold mt-4 mb-2 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Page Not Found
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            Oops! The page you are looking for does not exist. It might have been moved or deleted.
            </p>
            <div className="flex justify-center gap-4 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <Button asChild>
                <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
                </Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/posts">
                    <Search className="mr-2 h-4 w-4" />
                    Explore Posts
                </Link>
            </Button>
            </div>
        </div>
      </div>
    </div>
  )
}
