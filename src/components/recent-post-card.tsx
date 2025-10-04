
import Image from 'next/image';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
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
          "h-full flex flex-col md:flex-row items-center gap-4 rounded-xl overflow-hidden border transition-all duration-300 p-4",
          "bg-card text-card-foreground",
          "hover:border-primary/50 hover:-translate-y-1"
      )}>
        <div className="relative w-full md:w-1/3 aspect-video overflow-hidden rounded-lg shrink-0">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            data-ai-hint="article thumbnail"
          />
        </div>
        <div className="flex flex-col flex-grow self-start md:self-center">
           <Badge variant="secondary" className="self-start mb-2">{post.tags[0]}</Badge>
          <h3 className="font-semibold text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
          <div className="flex items-center gap-3 text-sm mt-auto text-muted-foreground">
             <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={post.author.avatar} alt={post.author.name} />
                  <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                </Avatar>
                <p className="font-medium text-xs line-clamp-1">{post.author.name}</p>
             </div>
             <span className="text-muted-foreground/50">•</span>
             <div className="flex items-center gap-1.5 text-xs">
                <Calendar className="h-3 w-3" />
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecentPostCard;
