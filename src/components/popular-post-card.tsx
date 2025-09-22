
import Link from 'next/link';
import { Post } from '@/lib/data';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ArrowRight } from 'lucide-react';

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
  return (
    <Link href={`/posts/${post.slug}`} className="group block">
        <div className="glass-card h-full p-6 flex items-start gap-6 transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 relative decorative-border">
            <div className="text-4xl font-extrabold font-headline text-primary/50 transition-colors duration-300 group-hover:text-primary">
                #{String(rank).padStart(2, '0')}
            </div>
            <div className="flex-1">
                <h3 className="font-headline font-semibold text-lg leading-snug mb-2 transition-colors duration-300 group-hover:text-primary">
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
             <ArrowRight className="absolute top-4 right-4 h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary opacity-0 group-hover:opacity-100" />
        </div>
    </Link>
  );
};

export default PopularPostCard;
