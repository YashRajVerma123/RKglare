
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { thoughts } from '@/lib/thoughts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

const ThoughtOfTheDay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [thought, setThought] = useState<{ quote: string; author: string } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const lastVisit = localStorage.getItem('lastThoughtVisit');
    const today = new Date().toDateString();

    if (lastVisit !== today) {
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).valueOf()) / 86_400_000);
      const thoughtIndex = dayOfYear % thoughts.length;
      setThought(thoughts[thoughtIndex]);
      setIsOpen(true);
      localStorage.setItem('lastThoughtVisit', today);
    }
  }, []);

  if (!thought) {
    return null;
  }

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
            {user ? `Welcome back, ${user.name}!` : 'A Thought for Your Day'}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Here is a little bit of inspiration to start your session.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="text-lg italic text-foreground">
            &ldquo;{thought.quote}&rdquo;
          </p>
          <p className="text-right text-muted-foreground mt-4">&mdash; {thought.author}</p>
        </div>
        <div className="flex justify-center">
          <Button onClick={() => setIsOpen(false)}>Continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThoughtOfTheDay;
