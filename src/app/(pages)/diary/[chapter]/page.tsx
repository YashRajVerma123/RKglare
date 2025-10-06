

import { getDiaryEntry } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

type PageProps = {
  params: { chapter: string };
};

const DiaryEntryPage = async ({ params }: PageProps) => {
  const chapter = parseInt(params.chapter, 10);
  const entry = await getDiaryEntry(chapter);

  if (!entry) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12 animate-fade-in-up">
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-4 overflow-hidden">
            <Image src={entry.icon} alt={entry.title} width={64} height={64} className="rounded-full" />
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-4">
            {entry.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>{entry.date}</span>
          </div>
        </header>

        <div className="prose dark:prose-invert prose-lg max-w-none font-content animate-fade-in-up" style={{animationDelay: '0.3s'}} dangerouslySetInnerHTML={{ __html: entry.content }}>
        </div>
      </div>
    </div>
  );
};

export default DiaryEntryPage;
