
import { getDiaryEntry } from '@/lib/data';
import { notFound } from 'next/navigation';
import DiaryEntryClient from './diary-entry-client';

// This is the corrected way to type props for a dynamic Next.js page.
type PageProps = {
  params: { chapter: string };
};

const DiaryEntryPage = async ({ params }: PageProps) => {
  const chapter = parseInt(params.chapter, 10);
  
  // Check if chapter is a valid number, if not, it's a page not found.
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
