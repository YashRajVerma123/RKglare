
import { diaryEntries } from '../page';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

type PageProps = {
  params: { chapter: string };
};

const DiaryEntryPage = ({ params }: PageProps) => {
  const chapter = parseInt(params.chapter, 10);
  const entry = diaryEntries.find((e) => e.chapter === chapter);

  if (!entry) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12 animate-fade-in-up">
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
            {entry.icon}
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-4">
            {entry.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>{entry.date}</span>
            <span>&bull;</span>
            <Badge variant="secondary">{entry.feeling}</Badge>
          </div>
        </header>

        <div className="prose dark:prose-invert prose-lg max-w-none font-content animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <p>{entry.content}</p>
        </div>
      </div>
    </div>
  );
};

export default DiaryEntryPage;
