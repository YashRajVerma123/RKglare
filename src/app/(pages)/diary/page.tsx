import { Book, Feather, Leaf, Moon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ParallaxContainer from '@/components/parallax-container';

const diaryEntries = [
  {
    chapter: 1,
    title: 'The Unspoken Beginning',
    date: 'July 2024',
    feeling: 'Contemplative',
    icon: <Book className="h-6 w-6 text-primary" />,
    content: "Every journey has a beginning, but not all beginnings are loud. Some start with a quiet observation, a silent promise to oneself. This diary is one such beginning. A space to pour out the unfiltered thoughts, the raw emotions, and the silent battles that shape us. It's not for an audience, but for the self. A mirror to reflect, a canvas to paint the inner world.",
  },
  {
    chapter: 2,
    title: 'Seeds of Growth',
    date: 'August 2024',
    feeling: 'Hopeful',
    icon: <Leaf className="h-6 w-6 text-green-500" />,
    content: "Today, I planted a small seed, both in a pot on my windowsill and in my mind. The seed of an idea. It's fragile, uncertain, yet full of potential. I find myself watering it with curiosity and hope. There's a strange beauty in nurturing something, in believing in its potential to grow into something magnificent, even when there's no guarantee. It teaches patience, it teaches faith.",
  },
  {
    chapter: 3,
    title: 'Whispers of the Night',
    date: 'September 2024',
    feeling: 'Reflective',
    icon: <Moon className="h-6 w-6 text-indigo-400" />,
    content: "The world sleeps, but my mind is wide awake. The night has a way of stripping away the noise, leaving only the essential. It's in these quiet hours that I confront my deepest fears and my grandest dreams. The moon, a silent confidante, listens without judgment. It's a time for reflection, for understanding the 'why' behind the 'what'.",
  },
  {
    chapter: 4,
    title: 'A Feather-light Realization',
    date: 'October 2024',
    feeling: 'Liberated',
    icon: <Feather className="h-6 w-6 text-sky-500" />,
    content: "I realized today that I've been carrying burdens that were never mine to begin with. Expectations, opinions, judgments... I decided to let them go. It felt like releasing a feather into the wind. There's a lightness in my chest, a newfound freedom. The path ahead seems clearer now, defined not by others, but by my own aspirations.",
  },
];

const DiaryPage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <ParallaxContainer>
        <section className="text-center mb-24 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
            Yash's Diary<span className="text-primary">.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-signature">
            Chapters of a life in progress...
          </p>
        </section>
      </ParallaxContainer>

      <div className="relative max-w-3xl mx-auto">
        <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-border/50" />
        
        {diaryEntries.map((entry, index) => (
          <div key={entry.chapter} className="relative mb-16">
            <div className="absolute left-1/2 -translate-x-1/2 top-1 h-6 w-6 rounded-full bg-primary border-4 border-background flex items-center justify-center font-bold text-xs text-primary-foreground">
              {entry.chapter}
            </div>
            <div className={`flex items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} w-full`}>
                <div className="hidden md:block w-5/12"></div>
                <div className="hidden md:block w-2/12"></div>
                <div className="w-full md:w-5/12">
                    <div className="glass-card p-6 rounded-xl shadow-lg hover:-translate-y-1 transition-transform">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {entry.icon}
                                <h2 className="text-2xl font-headline font-semibold">{entry.title}</h2>
                            </div>
                            <Badge variant="secondary">{entry.feeling}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 font-content">{entry.date}</p>
                        <p className="text-muted-foreground leading-relaxed">
                            {entry.content}
                        </p>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiaryPage;
