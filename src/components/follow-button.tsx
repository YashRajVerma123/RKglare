
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { toggleFollow } from '@/app/actions/follow-actions';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
    authorId: string;
    isFollowing: boolean;
    onToggle: (newFollowState: boolean) => void;
}

const FollowButton = ({ authorId, isFollowing, onToggle }: FollowButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const { user, signIn, updateFollowingCount } = useAuth();
    const { toast } = useToast();

    const handleClick = async () => {
        if (!user) {
            toast({
                title: 'Please sign in',
                description: 'You need to be signed in to follow authors.',
                action: <Button onClick={signIn}>Sign In</Button>
            });
            return;
        }

        setIsLoading(true);
        try {
            const result = await toggleFollow(user.id, authorId, isFollowing);
            if(result.success) {
                onToggle(!isFollowing);
                // Update global state
                updateFollowingCount(isFollowing ? -1 : 1);
            } else {
                throw new Error(result.error || 'An unknown error occurred');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: (error as Error).message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button 
            onClick={handleClick} 
            disabled={isLoading} 
            variant={isFollowing ? 'secondary' : 'default'} 
            className={cn(
                "w-full rounded-full transition-all duration-300",
                 !isFollowing && "purple-animated-border"
            )}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isFollowing ? (
                <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Following
                </>
            ) : (
                <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Follow
                </>
            )}
        </Button>
    );
};

export default FollowButton;
