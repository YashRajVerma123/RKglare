

'use client';

import { Author, isFollowing } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Mail, Users, BadgeCheck } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import FollowButton from "./follow-button";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";


interface ProfileCardProps {
    user: Author;
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
};

const ProfileCard = ({ user: initialUser }: ProfileCardProps) => {
    const { user: loggedInUser, mainAuthor, updateMainAuthorFollowerCount } = useAuth();
    const [isFollowingState, setIsFollowingState] = useState(false);
    const [isLoadingFollow, setIsLoadingFollow] = useState(true);
    
    // Determine if the user prop is the main author
    const isMainSiteAuthor = initialUser.email === 'yashrajverma916@gmail.com';
    
    // Use mainAuthor from context if it's the main author, otherwise use the prop
    const author = isMainSiteAuthor ? mainAuthor : initialUser;

    useEffect(() => {
        const checkFollowing = async () => {
            if (loggedInUser && author && loggedInUser.id !== author.id) {
                setIsLoadingFollow(true);
                const following = await isFollowing(loggedInUser.id, author.id);
                setIsFollowingState(following);
                setIsLoadingFollow(false);
            } else {
                setIsLoadingFollow(false);
            }
        };
        checkFollowing();
    }, [loggedInUser, author]);

    const handleFollowToggle = (newFollowState: boolean) => {
        setIsFollowingState(newFollowState);
        if (isMainSiteAuthor) {
            updateMainAuthorFollowerCount(newFollowState ? 1 : -1);
        }
        // If not the main author, we can't easily update a global state,
        // so for now we just show the button state change. A more complex app
        // might have a global store for all users.
    };

    if (!author) {
        return null; // Or a loading skeleton
    }
    
    const cardContent = (
         <div className="relative flex flex-col items-center p-6 w-full overflow-hidden">
            <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="relative z-10 flex flex-col items-center w-full">
              <Avatar className={cn(
                "h-24 w-24 mb-4",
                isMainSiteAuthor && "border-2 border-blue-500"
              )}>
                  <AvatarImage src={author.avatar} alt={author.name} />
                  <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center text-center gap-2">
                  <h2 className="text-2xl font-bold font-headline">{author.name}</h2>
                  {isMainSiteAuthor && (
                      <Badge variant="default" className={cn("flex items-center gap-1.5 border-blue-500/50 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20", "badge-shine")}>
                          <BadgeCheck className="h-4 w-4" />
                          Verified Author
                      </Badge>
                  )}
              </div>

              <div className="flex flex-col items-center gap-1 my-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{author.followers || 0} Followers</span>
                  </div>
                  {author.showEmail && author.email && (
                      <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{author.email}</span>
                      </div>
                  )}
              </div>

              <div className="mt-4 text-center text-muted-foreground px-4">
                  <p className="text-sm italic">
                      {author.bio || "This user hasn't written a bio yet."}
                  </p>
              </div>

              {isMainSiteAuthor && author.signature && (
                  <p className="font-signature text-3xl mt-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">~{author.signature}</p>
              )}
              
              {!isLoadingFollow && loggedInUser && loggedInUser.id !== author.id && (
                  <div className="mt-6 w-full max-w-[150px]">
                      <FollowButton
                          authorId={author.id}
                          isFollowing={isFollowingState}
                          onToggle={handleFollowToggle}
                      />
                  </div>
              )}
            </div>
        </div>
    );
    
    return (
        <div className="aurora-border rounded-lg">
            {cardContent}
        </div>
    );
};

export default ProfileCard;
