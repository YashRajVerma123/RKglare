import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';

import type { Post } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

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
      <div className="glass-card h-full flex flex-row overflow-hidden transition-all duration-300 hover:border-primary/50 hover-translate-y-1">
        <div className="relative w-2/5 md:w-1/3 aspect-video overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 40vw, 33vw"
            data-ai-hint="article thumbnail"
          />
        </div>
        <div className="p-4 sm:p-6 flex flex-col flex-grow w-3/5 md:w-2/3">
          <h3 className="font-title text-lg sm:text-xl lg:text-2xl font-light leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm mb-4 flex-grow line-clamp-2 md:line-clamp-3">{post.description}</p>
          
          <div className="text-xs text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
              <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
              </div>
              <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{post.readTime} min read</span>
              </div>
          </div>

          <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/10">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium line-clamp-1">{post.author.name}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecentPostCard;
