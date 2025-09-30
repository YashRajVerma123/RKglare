
'use server';

import { db } from '@/lib/firebase-server';
import { doc, increment, writeBatch, runTransaction } from 'firebase/firestore';
import { PointEvent, pointValues } from '@/lib/gamification';
import { ChallengeType } from '@/lib/data';
import { challengeTemplates } from '@/lib/challenges';

// This is a set to prevent awarding points for the same reading session multiple times.
// In a real production app, this should be stored in a more persistent cache like Redis
// or in a subcollection in Firestore to handle server restarts.
const userPostReadTracker = new Set<string>();

const checkAndCompleteChallenge = async (transaction: any, userRef: any, user: any, event: PointEvent, contextId?: string) => {
    if (!user.challenge || user.challenge.completed) {
        return 0; // No active challenge or already completed
    }
    
    const challenge = user.challenge;
    let progressIncrement = 0;
    
    switch (challenge.type) {
        case 'LIKE_X_POSTS':
            if (event === 'LIKE_POST') progressIncrement = 1;
            break;
        case 'COMMENT_X_POSTS':
            if (event === 'COMMENT') progressIncrement = 1;
            break;
        case 'READ_X_MINUTES':
            // This would be handled differently, likely by a separate action that tracks time.
            // For this implementation, we'll assume another mechanism updates this.
            break;
        default:
            return 0;
    }
    
    if (progressIncrement > 0) {
        const newProgress = (challenge.progress || 0) + progressIncrement;
        if (newProgress >= challenge.target) {
            // Challenge complete!
            transaction.update(userRef, {
                'challenge.progress': newProgress,
                'challenge.completed': true,
                points: increment(challenge.points),
            });
            return challenge.points;
        } else {
            // Update progress
            transaction.update(userRef, {
                'challenge.progress': newProgress,
            });
        }
    }
    
    return 0;
}


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
    const challengePoints = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
            throw "User not found";
        }
        const user = userDoc.data();
        
        // Award base points
        transaction.update(userRef, { points: increment(points) });
        
        // Check and complete challenge
        return await checkAndCompleteChallenge(transaction, userRef, user, event, contextId);
    });

    return { success: true, pointsAwarded: points + challengePoints };

  } catch (error) {
    console.error(`Failed to award points to user ${userId} for event ${event}:`, error);
    return { success: false, error: 'Failed to update points.' };
  }
}
