
import { getPaginatedBulletins } from '@/lib/data';
import BulletinClient from './bulletin-client';
import { Suspense } from 'react';

// Revalidate this page every 60 seconds
export const revalidate = 60;

const BulletinPage = async () => {
  // Fetch initial data on the server
  const { bulletins, lastDocId } = await getPaginatedBulletins(3);

  return (
      <Suspense fallback={
          <div className="flex h-screen items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
      }>
        <BulletinClient initialBulletins={bulletins} initialLastDocId={lastDocId} />
      </Suspense>
  );
}

export default BulletinPage;
