
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import type { Post } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

interface FeaturedPostCardProps {
  post: Post;
  priority?: boolean;
}

const FeaturedPostCard = ({ post, priority = false }: FeaturedPostCardProps) => {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return names[0].substring(0, 2);
  };
  
  return (
     <Link href={`/posts/${post.slug}`} className="group block h-full">
      <div className="glass-card h-full flex flex-col overflow-hidden transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            data-ai-hint="blog post cover"
          />
        </div>
        <div className="p-6 flex flex-col flex-grow">
           <div className="flex flex-wrap gap-2 mb-2">
            {post.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          <h3 className="font-title text-xl font-light leading-snug mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <div className="flex-grow"></div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/10">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{post.author.name}</span>
            </div>
             <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeaturedPostCard;
