

import { getDiaryEntry } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import DiaryEntryClient from './diary-entry-client';

// This is the correct type definition for the props of a Next.js page component.
const DiaryEntryPage = async ({ params }: { params: { chapter: string } }) => {
  const chapter = parseInt(params.chapter, 10);
  const entry = await getDiaryEntry(chapter);

  if (!entry) {
    notFound();
  }

  return <DiaryEntryClient entry={entry} />;
};

export default DiaryEntryPage;

    