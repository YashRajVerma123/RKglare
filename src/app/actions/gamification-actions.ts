
'use server';

import { db } from '@/lib/firebase-server';
import { doc, increment, writeBatch } from 'firebase/firestore';
import { PointEvent, pointValues } from '@/lib/gamification';

// This is a set to prevent awarding points for the same reading session multiple times.
// In a real production app, this should be stored in a more persistent cache like Redis
// or in a subcollection in Firestore to handle server restarts.
const userPostReadTracker = new Set<string>();

export async function awardPoints(userId: string, event: PointEvent, contextId?: string) {
  if (!userId) {
    console.warn('Attempted to award points to a non-logged-in user.');
    return { success: false, error: 'User not authenticated.' };
  }

  // Prevent duplicate points for reading the same post in the same session
  if (event === 'READ_POST') {
    if (!contextId) {
      return { success: false, error: 'Post context ID is required for reading points.' };
    }
    const readKey = `${userId}:${contextId}`;
    if (userPostReadTracker.has(readKey)) {
      return { success: false, error: 'Points already awarded for reading this post.' };
    }
    userPostReadTracker.add(readKey);
  }
  
  const points = pointValues[event];
  if (!points) {
    console.error(`Invalid point event: ${event}`);
    return { success: false, error: 'Invalid point event.' };
  }

  const userRef = doc(db, 'users', userId);
  
  try {
    const batch = writeBatch(db);
    batch.update(userRef, {
      points: increment(points),
    });
    
    // In a more advanced system, we could check for level-ups here
    // and create a notification for the user.

    await batch.commit();

    return { success: true, pointsAwarded: points };

  } catch (error) {
    console.error(`Failed to award points to user ${userId} for event ${event}:`, error);
    return { success: false, error: 'Failed to update points.' };
  }
}
