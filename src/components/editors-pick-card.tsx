
import Image from 'next/image';
import Link from 'next/link';
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
      <div className="glass-card flex flex-col h-full overflow-hidden rounded-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
        <div
          className={cn('relative w-full overflow-hidden', {
            'aspect-video': layout !== 'large',
            'aspect-square': layout === 'large',
          })}
        >
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        </div>
        <div className="p-4 flex flex-col flex-grow">
          {post.tags[0] && <Badge variant="secondary" className="mb-2 self-start">{post.tags[0]}</Badge>}
          <h3
            className={cn(
              'font-headline font-bold group-hover:text-primary transition-colors duration-300',
              {
                'text-2xl leading-tight': layout === 'large',
                'text-xl leading-tight': layout === 'medium',
                'text-lg leading-tight': layout === 'small',
              }
            )}
          >
            {post.title}
          </h3>
          {layout === 'large' && (
            <p className="mt-2 text-muted-foreground line-clamp-2 text-sm flex-grow">
              {post.description}
            </p>
          )}
          <div className="mt-auto pt-2 text-xs text-muted-foreground">
            <span>{post.author.name}</span>
            <span className="mx-1.5">&bull;</span>
            <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EditorsPickCard;
