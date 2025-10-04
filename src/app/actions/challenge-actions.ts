
'use server';

import { db } from '@/lib/firebase-server';
import { doc, updateDoc } from 'firebase/firestore';
import { revalidateTag } from 'next/cache';

export async function quitChallengeAction(userId: string): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      challenge: null,
    });

    revalidateTag(`author-id:${userId}`);
    return { success: true };
  } catch (error) {
    console.error('Error quitting challenge:', error);
    return { success: false, error: 'Failed to quit the challenge.' };
  }
}
