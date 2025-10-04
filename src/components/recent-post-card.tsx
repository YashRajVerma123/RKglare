
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import type { Post } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

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
     <Link href={`/posts/${post.slug}`} className="group block h-full">
      <div className={cn(
          "h-full flex flex-col rounded-xl overflow-hidden border transition-all duration-300",
          "bg-card text-card-foreground",
          "hover:border-primary/50 hover:-translate-y-1"
      )}>
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            data-ai-hint="article thumbnail"
          />
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
             <Badge variant="secondary">{post.tags[0]}</Badge>
            <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
            </div>
          </div>
          <h3 className="font-semibold text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
          <div className="flex-grow"></div>
          <div className="flex items-center gap-3 text-sm mt-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold text-xs line-clamp-1">{post.author.name}</p>
                 <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{post.readTime} min read</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecentPostCard;
