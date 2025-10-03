
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
      <div className="glass-card relative flex flex-col h-full overflow-hidden rounded-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
        <div
          className={cn('relative w-full h-full', {
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
        
        {/* Overlay and Text Content */}
        <div className="absolute inset-0 flex flex-col justify-end">
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <div className="relative p-4 text-white transform transition-transform duration-500 ease-in-out translate-y-full group-hover:translate-y-0">
                {post.tags[0] && <Badge variant="secondary" className="mb-2 self-start">{post.tags[0]}</Badge>}
                <h3
                    className={cn(
                    'font-headline font-bold transition-colors duration-300',
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
                    <p className="mt-2 text-white/80 line-clamp-2 text-sm flex-grow">
                    {post.description}
                    </p>
                )}
                <div className="mt-2 pt-2 text-xs text-white/80 border-t border-white/20">
                    <span>{post.author.name}</span>
                    <span className="mx-1.5">&bull;</span>
                    <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
                </div>
            </div>
        </div>

      </div>
    </Link>
  );
};

export default EditorsPickCard;
