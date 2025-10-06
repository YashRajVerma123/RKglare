
import { getDiaryEntries } from '@/lib/data';
import DiaryListClient from './diary-list-client';

const DiaryPage = async () => {
  const diaryEntries = await getDiaryEntries();
  return <DiaryListClient initialEntries={diaryEntries} />;
};

export default DiaryPage;
