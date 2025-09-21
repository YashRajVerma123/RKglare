import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

import type { Post } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

interface BlogPostCardProps {
  post: Post;
  priority?: boolean;
}

const BlogPostCard = ({ post, priority = false }: BlogPostCardProps) => {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return names[0].substring(0, 2);
  };
  
  return (
    <Link href={`/posts/${post.slug}`} className="group block">
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
           <div className="absolute top-3 right-3 flex gap-2">
            {post.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary" className="bg-background/70 backdrop-blur-sm">{tag}</Badge>
            ))}
          </div>
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="font-title text-xl font-light leading-snug mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 flex-grow">{post.description}</p>
          
          <div className="text-xs text-muted-foreground flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{post.readTime} min read</span>
              </div>
          </div>

          <div className="flex justify-between items-center mt-auto">
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

export default BlogPostCard;
