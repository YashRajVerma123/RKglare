
import { getDiaryEntry } from '@/lib/data';
import { notFound } from 'next/navigation';
import DiaryEntryClient from './diary-entry-client';

const DiaryEntryPage = async ({ params }: { params: { chapter: string } }) => {
  const chapter = parseInt(params.chapter, 10);
  
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
