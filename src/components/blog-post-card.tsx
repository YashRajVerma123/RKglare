
import Image from 'next/image';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import type { Post } from '@/lib/data';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface BlogPostCardProps {
  post: Post;
  priority?: boolean;
}

const BlogPostCard = ({ post, priority = false }: BlogPostCardProps) => {
  return (
    <Link href={`/posts/${post.slug}`} className="group block">
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
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            data-ai-hint="blog post cover"
          />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
            <Badge variant="secondary">{post.tags[0] || 'Article'}</Badge>
            <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
            </div>
          </div>
          <h4 className="font-semibold text-lg text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h4>
          <p className="text-muted-foreground text-sm flex-grow line-clamp-3">{post.description}</p>
        </div>
      </div>
    </Link>
  );
};

export default BlogPostCard;
