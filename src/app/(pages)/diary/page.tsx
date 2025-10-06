
import Link from 'next/link';
import { getDiaryEntries } from '@/lib/data';
import Image from 'next/image';

const DiaryEntryCard = ({ entry, index }: { entry: any; index: number }) => {
    const isReversed = index % 2 !== 0;

    return (
        <div className="group grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
             <div className="absolute left-1/2 -translate-x-1/2 h-full w-px bg-border/50 hidden md:block"></div>
             <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-primary border-4 border-background hidden md:block"></div>

            <div className={isReversed ? 'md:order-2' : ''}>
                <Link href={`/diary/${entry.chapter}`} className="block">
                    <div className="glass-card p-6 rounded-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                             <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center bg-primary/5 rounded-lg overflow-hidden">
                                <Image src={entry.icon} alt={entry.title} width={64} height={64} className="object-cover" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">{entry.date}</p>
                                <h3 className="text-xl font-headline font-bold mb-1 group-hover:text-primary transition-colors">{entry.title}</h3>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
            <div className={`hidden md:block ${isReversed ? 'md:order-1' : ''}`}></div>
        </div>
    )
}


const DiaryPage = async () => {
  const diaryEntries = await getDiaryEntries();

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

      <div className="max-w-4xl mx-auto space-y-12">
        {diaryEntries.map((entry, index) => (
          <DiaryEntryCard key={entry.chapter} entry={entry} index={index} />
        ))}
      </div>
    </div>
  );
};

export default DiaryPage;
