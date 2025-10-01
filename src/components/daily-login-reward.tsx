
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Award, Flame, Lightbulb, Zap } from 'lucide-react';
import { checkAndUpdateStreak } from '@/app/actions/streak-actions';
import { DailyChallenge, UserStreak } from '@/lib/data';
import { thoughts } from '@/lib/thoughts';
import { Progress } from './ui/progress';

const Countdown = ({ to }: { to: string }) => {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const future = new Date(to);
            const diff = future.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft({ hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [to]);

    return (
        <span>
            {String(timeLeft.hours).padStart(2, '0')}:
            {String(timeLeft.minutes).padStart(2, '0')}:
            {String(timeLeft.seconds).padStart(2, '0')}
        </span>
    );
};


const DailyLoginReward = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    thought: { quote: string; author: string };
    streak: number;
    pointsAwarded: number;
    challenge: DailyChallenge | null;
    nextRewardTime?: string;
  } | null>(null);

  const { user, refreshUser } = useAuth();

  useEffect(() => {
    if (!user) return;

    const lastCheck = localStorage.getItem('lastStreakCheck');
    const today = new Date().toDateString();

    if (lastCheck !== today) {
      setIsLoading(true);
      setIsOpen(true);
      checkAndUpdateStreak(user.id)
        .then(response => {
            const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).valueOf()) / 86_400_000);
            const thoughtIndex = dayOfYear % thoughts.length;
            const thought = thoughts[thoughtIndex];
            
            setData({ ...response, thought });
            
            if (response.pointsAwarded > 0) {
                refreshUser(); // Refresh user data to show new points
            }

            localStorage.setItem('lastStreakCheck', today);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [user, refreshUser]);

  if (!user || !data) {
    return null;
  }

  const alreadyClaimed = data.pointsAwarded === 0 && data.nextRewardTime;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="glass-card sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-headline">
            {`Welcome Back, ${user.name}!`}
          </DialogTitle>
           <DialogDescription className="text-center pt-2">
            Here's your daily summary and a thought for the day.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
            <div className="flex justify-center items-center h-48">
                 <div className="loader-dots">
                    <div className="loader-dot"></div>
                    <div className="loader-dot"></div>
                    <div className="loader-dot"></div>
                </div>
            </div>
        ) : (
            <div className="space-y-6 py-4">
                {alreadyClaimed ? (
                    <div className="text-center bg-muted/50 p-4 rounded-lg">
                        <p className="text-lg font-bold">Daily Reward Claimed!</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Claim again in:
                        </p>
                        <p className="text-lg font-mono font-bold text-primary mt-1">
                          <Countdown to={data.nextRewardTime!} />
                        </p>
                    </div>
                ) : (
                    <div className="text-center bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center justify-center gap-2">
                            <Flame className="h-6 w-6 text-orange-500"/>
                            <p className="text-lg font-bold text-orange-500">Day {data.streak} Streak!</p>
                        </div>
                        <p className="text-sm text-muted-foreground">You earned <span className="font-bold text-primary">{data.pointsAwarded}</span> points for your daily visit.</p>
                    </div>
                )}


                {data.challenge && (
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                             <p className="text-sm font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-500" /> Daily Challenge</p>
                             <p className="text-xs font-bold text-yellow-500">+{data.challenge.points} PTS</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{data.challenge.description}</p>
                        <Progress value={(data.challenge.progress / data.challenge.target) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground text-right">{data.challenge.progress} / {data.challenge.target}</p>
                    </div>
                )}
                
                <div className="border-t border-border/50 pt-6">
                    <p className="text-base italic text-foreground text-center">
                        &ldquo;{data.thought.quote}&rdquo;
                    </p>
                    <p className="text-right text-muted-foreground mt-4">&mdash; {data.thought.author}</p>
                </div>
            </div>
        )}

        <div className="flex justify-center">
          <Button onClick={() => setIsOpen(false)}>Continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailyLoginReward;
