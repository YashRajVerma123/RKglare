
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { awardPoints } from '@/app/actions/gamification-actions';
import { useToast } from '@/hooks/use-toast';
import { Check, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const READING_TIME_SECONDS = 300; // 5 minutes

const ReadingTimer = ({ postId }: { postId: string }) => {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(READING_TIME_SECONDS);
  const [isActive, setIsActive] = useState(false);

  // Check local storage on mount to see if points have been claimed for this post
  useEffect(() => {
    setIsClient(true);
    if (user) {
      const claimedPosts = JSON.parse(localStorage.getItem(`reading_timer_claimed_${user.id}`) || '[]');
      if (claimedPosts.includes(postId)) {
        setHasClaimed(true);
      } else {
        setIsActive(true); // Start timer only if not claimed
      }
    }
  }, [user, postId]);

  // Timer logic
  useEffect(() => {
    if (!isActive || hasClaimed || isClient === false) {
      return;
    }

    if (timeLeft <= 0) {
      if (!isClaiming) {
        handleClaimPoints();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isActive, hasClaimed, isClient, isClaiming]);

  const handleClaimPoints = async () => {
    if (!user || isClaiming || hasClaimed) return;

    setIsClaiming(true);
    const result = await awardPoints(user.id, 'FIVE_MINUTE_READ', `timer_${postId}`);

    if (result.success && result.pointsAwarded) {
      toast({
        title: 'Reward Claimed!',
        description: `You earned ${result.pointsAwarded} points for reading!`,
      });
      setHasClaimed(true);
      refreshUser(); // Refresh user data to show new points in profile dropdown
      
      // Store in local storage
      const claimedPosts = JSON.parse(localStorage.getItem(`reading_timer_claimed_${user.id}`) || '[]');
      claimedPosts.push(postId);
      localStorage.setItem(`reading_timer_claimed_${user.id}`, JSON.stringify(claimedPosts));

    } else if (result.error && !result.error.includes('already awarded')) {
      // Don't show error if points were just already awarded in another tab
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else if(result.error && result.error.includes('already awarded')) {
      // Still mark as claimed if server says so
      setHasClaimed(true);
    }
    
    setIsClaiming(false);
  };

  if (!isClient || !user || authLoading) {
    return null;
  }
  
  const progress = ((READING_TIME_SECONDS - timeLeft) / READING_TIME_SECONDS) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div className="relative h-14 w-14">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                  className="stroke-current text-muted/20"
                  strokeWidth="8"
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                />
                <circle
                  className="stroke-current text-primary transition-all duration-1000 ease-linear"
                  strokeWidth="8"
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - progress / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                 {hasClaimed ? (
                    <Check className="h-7 w-7 text-green-500" />
                 ) : isClaiming ? (
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                 ) : timeLeft > 0 ? (
                    <Clock className="h-7 w-7 text-primary/80" />
                 ) : (
                    <Check className="h-7 w-7 text-green-500" />
                 )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left">
            {hasClaimed ? (
              <p>You've earned the reading reward for this post.</p>
            ) : isClaiming ? (
               <p>Claiming your reward...</p>
            ) : (
              <p>
                Read for {minutes}:{seconds < 10 ? `0${seconds}` : seconds} to earn 20 points.
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ReadingTimer;
