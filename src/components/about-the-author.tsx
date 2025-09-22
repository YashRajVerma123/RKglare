

'use client'

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from 'next/link';
import { Instagram, Users, BadgeCheck, Code } from "lucide-react";
import { isFollowing } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import FollowButton from "./follow-button";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";

const AboutTheAuthor = () => {
  const { user, mainAuthor, updateMainAuthorFollowerCount } = useAuth();
  const [isFollowingState, setIsFollowingState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (user && mainAuthor) {
        setIsLoading(true);
        const following = await isFollowing(user.id, mainAuthor.id);
        setIsFollowingState(following);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    checkFollowingStatus();
  }, [user, mainAuthor]);

  const handleFollowToggle = (newFollowState: boolean) => {
    setIsFollowingState(newFollowState);
    // Optimistically update follower count using context
    updateMainAuthorFollowerCount(newFollowState ? 1 : -1);
  }

  // Provide default fallback values in case the author data is not yet available
  const authorAvatar = mainAuthor?.avatar || "https://i.ibb.co/TChNTL8/pfp.png";
  const authorName = mainAuthor?.name || "Yash Raj Verma";
  const authorBio = mainAuthor?.bio || "Hi, I'm Yash Raj Verma. Welcome to Glare, my personal blog where I explore the rapidly evolving worlds of technology, AI, space, and breaking news. I break down complex topics into clear, engaging insights. Thanks for reading.";
  const developerBio = "Hi there, I'm Yash Raj Verma, the developer behind Glare. This project is my personal playground for blending cutting-edge web technologies with a passion for clean, readable content. I built Glare from the ground up using Next.js, Firebase, and AI to create a fast, modern, and engaging user experience. Thanks for visiting!";
  const instagramUrl = mainAuthor?.instagramUrl || "https://instagram.com/v.yash.raj";
  const signature = mainAuthor?.signature || "V.Yash.Raj";
  const followerCount = mainAuthor?.followers || 0;
  const isMainAuthor = mainAuthor?.email === 'yashrajverma916@gmail.com';
  
  const componentContent = (
      <div className="p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="relative group shrink-0">
                <div className="relative profile-image-hover purple-animated-border rounded-full p-1">
                    <Avatar className="h-32 w-32 border-2 border-transparent">
                        <AvatarImage src={authorAvatar} alt={authorName} />
                        <AvatarFallback>YV</AvatarFallback>
                    </Avatar>
                </div>
                 <div className="absolute bottom-1 right-1 bg-gray-800 p-1.5 rounded-full border-2 border-background">
                    <Code className="h-4 w-4 text-green-400" />
                </div>
            </div>
            <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <h3 className="text-2xl font-headline font-bold">{authorName}</h3>
                    {isMainAuthor && (
                        <Badge variant="default" className={cn("flex items-center gap-1.5 border-blue-500/50 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20", "badge-shine")}>
                            <BadgeCheck className="h-4 w-4" />
                            Verified Author
                        </Badge>
                    )}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-4 my-2 text-sm text-muted-foreground">
                    {!isHomePage && (
                        <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{followerCount} Followers</span>
                        </div>
                    )}
                </div>
                <p className="text-muted-foreground mt-2 mb-4">
                  {isHomePage ? developerBio : authorBio}
                </p>
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    {mainAuthor && user && user.id !== mainAuthor.id && !isLoading && !isHomePage && (
                        <FollowButton
                            authorId={mainAuthor.id}
                            isFollowing={isFollowingState}
                            onToggle={handleFollowToggle}
                        />
                    )}
                     <Button asChild variant="outline" className="insta-button-outline group/button">
                        <Link href={instagramUrl} target="_blank" rel="noopener noreferrer">
                            <Instagram className="h-4 w-4 mr-2 text-white group-hover/button:instagram-gradient transition-colors" />
                            <span className="text-white group-hover/button:instagram-gradient transition-colors">Follow on Instagram</span>
                        </Link>
                     </Button>
                </div>
            </div>
             <div className="self-end mt-4 md:mt-0">
                <p className="font-signature text-4xl bg-gradient-to-r from-foreground/80 to-foreground/50 bg-clip-text text-transparent drop-shadow-sm">~{signature}</p>
             </div>
        </div>
  )
  
  if (isHomePage) {
      return componentContent;
  }
  
  return (
    <section>
        <h2 className="text-3xl font-headline font-bold mb-8 text-center">About the Author</h2>
        <div className="aurora-border rounded-2xl">
            {componentContent}
        </div>
    </section>
  );
};

export default AboutTheAuthor;
