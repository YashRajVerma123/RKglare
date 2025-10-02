
'use client';

import { Author, isFollowing } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Mail, Users, BadgeCheck, Star, Rss } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { getLevel } from "@/lib/gamification";

interface ProfileCardProps {
    user: Author;
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
};

const ProfileCard = ({ user: initialUser }: ProfileCardProps) => {
    const { mainAuthor } = useAuth();
    
    // Use mainAuthor from context if it's the main author, otherwise use the prop
    const author = initialUser.email === 'yashrajverma916@gmail.com' && mainAuthor ? mainAuthor : initialUser;

    const {level} = useMemo(() => {
        const points = author?.points || 0;
        const level = getLevel(points);
        return { level };
    }, [author]);

    const isPremium = author?.premium?.active;
    const isVerifiedAuthor = author?.email === 'yashrajverma916@gmail.com';

    if (!author) {
        return null; // Or a loading skeleton
    }
    
    return (
        <div className="glass-card rounded-lg overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500"></div>
            <div className="p-6 pt-0 flex flex-col items-center -mt-14">
                <Avatar className={cn(
                  "h-28 w-28 mb-4 border-4",
                  isPremium ? "border-yellow-400" : "border-background"
                )}>
                    <AvatarImage src={author.avatar} alt={author.name} />
                    <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
                </Avatar>

                <h2 className="text-2xl font-bold font-headline">{author.name}</h2>
                <p className="text-sm text-muted-foreground">{author.username}</p>

                <div className="flex flex-wrap justify-center gap-2 my-4">
                    {isVerifiedAuthor && (
                        <Badge variant="default" className={cn("flex items-center gap-1.5 border-blue-500/50 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20", "badge-shine")}>
                            <BadgeCheck className="h-4 w-4" />
                            Verified Author
                        </Badge>
                    )}
                     {isPremium && (
                        <Badge variant="default" className={cn("flex items-center gap-1.5 border-yellow-500/50 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20", "badge-shine")}>
                            <Star className="h-3 w-3" />
                            Glare+
                        </Badge>
                     )}
                     <Badge variant="secondary" className="flex items-center gap-1.5" style={{ color: level.color, backgroundColor: `${level.color}1A` }}>
                        <level.icon className="h-4 w-4" />
                        {level.name}
                     </Badge>
                </div>
                
                <p className="text-sm text-center text-muted-foreground max-w-xs">
                    {author.bio || "A reader of Glare. No bio provided."}
                </p>

                <div className="flex items-center gap-6 my-4 text-sm text-center">
                    <div>
                        <p className="font-bold text-lg">{author.followers || 0}</p>
                        <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div>
                        <p className="font-bold text-lg">{author.following || 0}</p>
                        <p className="text-xs text-muted-foreground">Following</p>
                    </div>
                     <div>
                        <p className="font-bold text-lg">{(author.points || 0).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Points</p>
                    </div>
                </div>
                
                {author.showEmail && author.email && (
                    <div className="text-xs flex items-center gap-2 text-muted-foreground bg-muted p-2 rounded-md">
                        <Mail className="h-3 w-3" />
                        <span>{author.email}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileCard;
