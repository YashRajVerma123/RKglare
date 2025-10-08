
import { getDiaryEntry } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import DiaryEntryClient from './diary-entry-client';

type PageProps = {
  params: {
    chapter: string;
  };
};

const DiaryEntryPage = async ({ params }: PageProps) => {
  const chapter = parseInt(params.chapter, 10);
  const entry = await getDiaryEntry(chapter);

  if (!entry) {
    notFound();
  }

  return <DiaryEntryClient entry={entry} />;
};

export default DiaryEntryPage;
