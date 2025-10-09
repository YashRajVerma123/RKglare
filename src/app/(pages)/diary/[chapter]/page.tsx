
import { getDiaryEntry } from '@/lib/data';
import { notFound } from 'next/navigation';
import DiaryEntryClient from './diary-entry-client';

type PageProps = {
  params: Promise<{ chapter: string }>;
};

const DiaryEntryPage = async ({ params }: PageProps) => {
  const { chapter: chapterStr } = await params;
  const chapter = parseInt(chapterStr, 10);
  
  if (isNaN(chapter)) {
    notFound();
  }

  const entry = await getDiaryEntry(chapter);

  if (!entry) {
    notFound();
  }

  return <DiaryEntryClient entry={entry} />;
};

export default DiaryEntryPage;
