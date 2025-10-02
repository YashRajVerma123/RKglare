
import Image from 'next/image';
import Link from 'next/link';
import { Eye, Calendar } from 'lucide-react';
import type { Post } from '@/lib/data';
import { Badge } from './ui/badge';

interface BlogPostCardProps {
  post: Post;
  priority?: boolean;
}

const BlogPostCard = ({ post, priority = false }: BlogPostCardProps) => {
  const views = post.likes ? post.likes * 5 + 23 : 42; // Estimated views

  return (
    <Link href={`/posts/${post.slug}`} className="group block">
      <div className="h-full flex flex-col bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
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
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 p-6 flex items-center justify-center">
            <h3 className="font-headline text-3xl font-bold text-white text-center leading-tight drop-shadow-md">
              {post.title}
            </h3>
          </div>
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex justify-between items-center text-xs text-zinc-400 mb-4">
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 border-none">{post.tags[0] || 'Article'}</Badge>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Eye className="h-3 w-3" />
                    <span>{views} views</span>
                </div>
            </div>
          </div>
          <h4 className="font-semibold text-lg text-white leading-snug mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h4>
          <p className="text-zinc-400 text-sm flex-grow line-clamp-3">{post.description}</p>
        </div>
      </div>
    </Link>
  );
};

export default BlogPostCard;

    