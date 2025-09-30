
import { Award, BookOpen, BrainCircuit, CheckCircle, Clock, Gift, Heart, MessageSquare, Newspaper, Star, TrendingUp, UserPlus, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { levels } from '@/lib/gamification';

const earningPoints = [
  {
    icon: <Clock className="h-6 w-6 text-primary" />,
    title: '5-Minute Reading Timer',
    points: '+20 Points',
    description: 'Stay on any article for a full 5 minutes to earn a reward for deep reading.',
  },
  {
    icon: <UserPlus className="h-6 w-6 text-primary" />,
    title: 'Subscribe to Newsletter',
    points: '+20 Points',
    description: 'A one-time bonus for joining our community newsletter while logged in.',
  },
   {
    icon: <TrendingUp className="h-6 w-6 text-primary" />,
    title: 'Daily Login Streak',
    points: '+1, +2, +3...',
    description: 'Visit daily to build your streak. You get points equal to your streak day (e.g., Day 5 = 5 points).',
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
    title: 'Leave a Comment',
    points: '+5 Points',
    description: 'Contribute to the discussion on any article by posting a thoughtful comment.',
  },
  {
    icon: <Heart className="h-6 w-6 text-primary" />,
    title: 'Like a Post',
    points: '+3 Points',
    description: 'Show your appreciation for an article by giving it a like.',
  },
  {
    icon: <Gift className="h-6 w-6 text-primary" />,
    title: 'Complete a Daily Challenge',
    points: '+30 to +50 Points',
    description: 'On milestone streak days (5, 10, 15...), you get a special challenge for a big point bonus.',
  },
];


const PointsSystemPage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
          The Points System<span className="text-primary">.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Learn how to earn points, level up, and become a top reader in the Glare community.
        </p>
      </section>

      <section className="mb-24">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">How to Earn Points</h2>
            <p className="text-muted-foreground mt-2">Your engagement is valuable. Here’s how we reward it.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {earningPoints.map((item) => (
            <div key={item.title} className="glass-card flex flex-col p-6 rounded-2xl text-center items-center hover:-translate-y-1 transition-transform">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-headline font-semibold">{item.title}</h3>
              <p className="font-bold text-lg text-primary my-2">{item.points}</p>
              <p className="text-muted-foreground text-sm flex-grow">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
         <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Levels & Badges</h2>
            <p className="text-muted-foreground mt-2">As you earn points, you'll unlock new levels and earn recognition.</p>
        </div>
        <div className="max-w-4xl mx-auto space-y-4">
            {levels.map((level, index) => {
                const nextLevel = levels[index + 1];
                return (
                    <Card key={level.name} className="glass-card flex items-center p-6 gap-6">
                        <div className="p-3 bg-muted rounded-full">
                          <level.icon className="h-8 w-8" style={{ color: level.color }} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold" style={{ color: level.color }}>{level.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                {nextLevel 
                                    ? `${level.points.toLocaleString()} - ${nextLevel.points - 1}` 
                                    : `${level.points.toLocaleString()}+`
                                } Points
                            </p>
                        </div>
                    </Card>
                )
            })}
        </div>
      </section>

    </div>
  );
};

export default PointsSystemPage;
