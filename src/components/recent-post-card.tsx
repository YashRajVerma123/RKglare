
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import type { Post } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

interface RecentPostCardProps {
  post: Post;
}

const RecentPostCard = ({ post }: RecentPostCardProps) => {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[1]) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return name.substring(0, 2);
  };
  
  return (
    <Link href={`/posts/${post.slug}`} className="group block" prefetch={true}>
      <div className="glass-card relative h-full flex flex-col overflow-hidden transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
        <div className="relative w-full aspect-video md:aspect-[2.5/1] overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            data-ai-hint="article thumbnail"
            priority
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
            <div className='flex justify-between items-end'>
                <div className='max-w-xl'>
                    <Badge variant="secondary" className="mb-2">{post.tags[0]}</Badge>
                    <h3 className="font-headline text-lg sm:text-xl lg:text-3xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm mb-4 flex-grow line-clamp-2 hidden md:block">{post.description}</p>
                </div>
                 <div className="hidden sm:flex items-center gap-3 shrink-0 ml-4">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                        <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-semibold line-clamp-1">{post.author.name}</p>
                        <div className="text-xs text-white/80 flex items-center gap-2">
                            <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
                            <span className="mx-1">&bull;</span>
                            <span>{post.readTime} min read</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </Link>
  );
};

export default RecentPostCard;
