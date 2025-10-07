
import Image from 'next/image';
import Link from 'next/link';
import { Post } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface HoverDetailsCardProps {
  post: Post;
  priority?: boolean;
}

const HoverDetailsCard = ({ post, priority = false }: HoverDetailsCardProps) => {
  return (
    <Link href={`/posts/${post.slug}`} className="group block h-full w-full">
      <div className="glass-card relative flex flex-col h-[500px] overflow-hidden rounded-xl transition-all duration-300 hover:border-primary/50">
        <div className="relative w-full h-full">
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
        <div className={cn(
            "absolute inset-0 flex flex-col justify-end transition-all duration-500 ease-in-out",
            // On devices that support hover, the content is hidden by default and translates up on group-hover
            "[@media(hover:hover)]:translate-y-full [@media(hover:hover)]:group-hover:translate-y-0",
             // On touch devices, the content is always visible
            "[@media(hover:none)]:translate-y-0"
        )}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-100"></div>
            <div className="relative p-6 text-white">
                {post.tags[0] && <Badge variant="secondary" className="mb-2 self-start">{post.tags[0]}</Badge>}
                <h3 className='font-headline font-bold text-3xl leading-tight'>
                    {post.title}
                </h3>
                <p className="mt-2 text-white/80 line-clamp-2 text-base flex-grow">
                  {post.description}
                </p>
                <div className="mt-4 pt-4 text-sm text-white/80 border-t border-white/20">
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

export default HoverDetailsCard;
