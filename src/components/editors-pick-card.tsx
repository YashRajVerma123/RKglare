
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
    <Link href={`/posts/${post.slug}`} className="group relative block h-full w-full overflow-hidden rounded-xl">
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
            'font-headline font-bold leading-tight group-hover:text-primary transition-opacity duration-300',
            layout === 'large' && 'text-3xl md:text-4xl',
            layout === 'medium' && 'text-2xl',
            layout === 'small' && 'text-xl',
            'opacity-0 group-hover:opacity-100'
          )}
        >
          {post.title}
        </h3>
        {layout !== 'small' && (
          <p
            className={cn(
              'mt-2 text-white/80',
              layout === 'large' && 'text-sm',
              layout === 'medium' && 'text-xs'
            )}
          >
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
    </Link>
  );
};

export default EditorsPickCard;
