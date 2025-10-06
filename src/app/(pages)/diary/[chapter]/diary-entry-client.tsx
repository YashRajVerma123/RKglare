
'use client';
import { DiaryEntry } from '@/lib/data';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

const DiaryEntryClient = ({ entry }: { entry: DiaryEntry }) => {
  const { user, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="glass-card p-12 max-w-2xl mx-auto">
          <h1 className="text-3xl font-headline font-bold mb-4">Access Restricted</h1>
          <p className="text-muted-foreground mb-6">
            You must be signed in to read the diary.
          </p>
          <Button onClick={signIn}>Sign In</Button>
        </div>
      </div>
    );
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

        <div
          className="prose dark:prose-invert prose-lg max-w-none font-reader animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
          dangerouslySetInnerHTML={{ __html: entry.content }}
        ></div>
      </div>
    </div>
  );
};

export default DiaryEntryClient;
