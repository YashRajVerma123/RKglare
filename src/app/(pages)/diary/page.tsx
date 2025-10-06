import { Book, Feather, Leaf, Moon, Folder, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export const diaryEntries = [
  {
    chapter: 1,
    title: 'The Unspoken Beginning',
    date: 'July 2024',
    feeling: 'Contemplative',
    icon: <Book className="h-8 w-8 text-primary" />,
    content: "Every journey has a beginning, but not all beginnings are loud. Some start with a quiet observation, a silent promise to oneself. This diary is one such beginning. A space to pour out the unfiltered thoughts, the raw emotions, and the silent battles that shape us. It's not for an audience, but for the self. A mirror to reflect, a canvas to paint the inner world.",
    count: 1,
    countType: 'chapter' as const,
  },
  {
    chapter: 2,
    title: 'Seeds of Growth',
    date: 'August 2024',
    feeling: 'Hopeful',
    icon: <Folder className="h-8 w-8 text-primary" />,
    content: "Today, I planted a small seed, both in a pot on my windowsill and in my mind. The seed of an idea. It's fragile, uncertain, yet full of potential. I find myself watering it with curiosity and hope. There's a strange beauty in nurturing something, in believing in its potential to grow into something magnificent, even when there's no guarantee. It teaches patience, it teaches faith.",
    count: 5,
    countType: 'entries' as const,
  },
  {
    chapter: 3,
    title: 'Whispers of the Night',
    date: 'September 2024',
    feeling: 'Reflective',
    icon: <PlayCircle className="h-8 w-8 text-primary" />,
    content: "The world sleeps, but my mind is wide awake. The night has a way of stripping away the noise, leaving only the essential. It's in these quiet hours that I confront my deepest fears and my grandest dreams. The moon, a silent confidante, listens without judgment. It's a time for reflection, for understanding the 'why' behind the 'what'.",
    count: 1,
    countType: 'video' as const,
  },
  {
    chapter: 4,
    title: 'A Feather-light Realization',
    date: 'October 2024',
    feeling: 'Liberated',
    icon: <Feather className="h-8 w-8 text-primary" />,
    content: "I realized today that I've been carrying burdens that were never mine to begin with. Expectations, opinions, judgments... I decided to let them go. It felt like releasing a feather into the wind. There's a lightness in my chest, a newfound freedom. The path ahead seems clearer now, defined not by others, but by my own aspirations.",
    count: 3,
    countType: 'thoughts' as const,
  },
];

const DiaryPage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight mb-4">
          Yash's Diary<span className="text-primary">.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-signature">
          Chapters of a life in progress...
        </p>
      </section>

      <div className="max-w-2xl mx-auto space-y-4">
        {diaryEntries.map((entry) => (
          <Link
            href={`/diary/${entry.chapter}`}
            key={entry.chapter}
            className="group block"
          >
            <div className="glass-card p-4 flex items-center gap-6 hover:border-primary/50 transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex-shrink-0 h-20 w-20 flex items-center justify-center bg-primary/5 rounded-lg">
                {entry.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">{entry.title}</h2>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    {entry.countType === 'entries' && <Folder className="h-3 w-3" />}
                    {entry.countType === 'video' && <PlayCircle className="h-3 w-3" />}
                    <span>{String(entry.count).padStart(2, '0')}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DiaryPage;
