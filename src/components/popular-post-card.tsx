import Link from 'next/link';
import { Post } from '@/lib/data';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PopularPostCardProps {
  post: Post;
  rank: number;
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return name.substring(0, 2);
};

const PopularPostCard = ({ post, rank }: PopularPostCardProps) => {

  const rankStyles = {
    1: 'from-yellow-400 to-amber-600 text-white', // Gold
    2: 'from-slate-400 to-gray-500 text-white',  // Silver
    3: 'from-orange-500 to-amber-800 text-white',// Bronze
  };
  
  // @ts-ignore
  const rankClass = rankStyles[rank] || 'text-primary/50 group-hover:text-primary';

  return (
    <Link href={`/posts/${post.slug}`} className="group block">
        <div className={cn(
          "glass-card h-full p-6 flex items-start gap-6 transition-all duration-300 hover:-translate-y-1 relative decorative-border",
          rank === 1 && "hover:border-yellow-500/50",
          rank === 2 && "hover:border-slate-400/50",
          rank === 3 && "hover:border-orange-700/50",
          rank > 3 && "hover:border-primary/50",
        )}>
            <div className={cn(
              "text-4xl font-extrabold font-headline transition-colors duration-300",
               // @ts-ignore
              rankStyles[rank] ? `bg-gradient-to-br ${rankClass} bg-clip-text text-transparent` : rankClass
            )}>
                #{String(rank).padStart(2, '0')}
            </div>
            <div className="flex-1">
                <h3 className={cn(
                  "font-headline font-semibold text-lg leading-snug mb-2 transition-colors duration-300",
                  rank === 1 && "group-hover:text-yellow-500",
                  rank === 2 && "group-hover:text-slate-400",
                  rank === 3 && "group-hover:text-orange-600",
                  rank > 3 && "group-hover:text-primary",
                )}>
                    {post.title}
                </h3>
                <div className="flex items-center gap-2 mt-4">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                        <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{post.author.name}</span>
                </div>
            </div>
             <ArrowRight className={cn(
               "absolute top-4 right-4 h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 opacity-0 group-hover:opacity-100",
                rank === 1 && "group-hover:text-yellow-500",
                rank === 2 && "group-hover:text-slate-400",
                rank === 3 && "group-hover:text-orange-600",
                rank > 3 && "group-hover:text-primary",
             )} />
        </div>
    </Link>
  );
};

export default PopularPostCard;
