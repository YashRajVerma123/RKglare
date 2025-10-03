
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Post } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface EditorsPickCardProps {
  post: Post;
  layout?: 'large' | 'medium' | 'small';
  priority?: boolean;
}

const EditorsPickCard = ({ post, layout = 'medium', priority = false }: EditorsPickCardProps) => {
  return (
    <Link href={`/posts/${post.slug}`} className="group block h-full w-full">
      {/* Mobile Layout: Image on top, text below */}
      <div className="md:hidden glass-card flex flex-col h-full overflow-hidden rounded-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
        <div className="relative aspect-video">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority={priority}
          />
        </div>
        <div className="p-4 flex flex-col flex-grow">
          {post.tags[0] && <Badge variant="secondary" className="mb-2 self-start">{post.tags[0]}</Badge>}
          <h3 className="font-headline font-bold text-lg leading-tight group-hover:text-primary transition-colors duration-300">
            {post.title}
          </h3>
          <div className="mt-auto pt-2 text-xs text-muted-foreground">
            <span>{post.author.name}</span>
            <span className="mx-1.5">&bull;</span>
            <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Desktop Layout: Text overlay on image */}
      <div className="hidden md:block relative h-full w-full overflow-hidden rounded-xl">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          {post.tags[0] && <Badge variant="secondary" className="mb-2 self-start bg-white/20 text-white backdrop-blur-sm border-0">{post.tags[0]}</Badge>}
          <h3
            className={cn(
              'font-headline font-bold leading-tight group-hover:text-primary transition-colors duration-300',
              layout === 'large' && 'text-4xl',
              layout === 'medium' && 'text-2xl',
              layout === 'small' && 'text-xl'
            )}
          >
            {post.title}
          </h3>
          {layout === 'large' && (
            <p className="mt-2 text-white/80 line-clamp-2 text-sm">
              {post.description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-2 text-xs text-white/80">
            <span>{post.author.name}</span>
            <span>&bull;</span>
            <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
        <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowRight className="h-4 w-4 text-white"/>
        </div>
      </div>
    </Link>
  );
};

export default EditorsPickCard;
