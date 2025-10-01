
'use server';

import { db } from '@/lib/firebase-server';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { Author, authorConverter, DailyChallenge } from '@/lib/data';
import { assignNewChallenge } from '@/lib/challenges';

// IST is UTC+5:30
const IST_OFFSET = 5.5 * 60 * 60 * 1000;

function getCurrentDateInIST() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const ist = new Date(utc + IST_OFFSET);
    return ist.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getYesterdayDateInIST() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const ist = new Date(utc + IST_OFFSET);
    ist.setDate(ist.getDate() - 1);
    return ist.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getStartOfNextDayIST(): string {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const ist = new Date(utc + IST_OFFSET);
    ist.setDate(ist.getDate() + 1);
    ist.setHours(0, 0, 0, 0);
    const nextDayUTC = new Date(ist.getTime() - IST_OFFSET);
    return nextDayUTC.toISOString();
}


export async function checkAndUpdateStreak(userId: string): Promise<{
    thought: { quote: string; author: string };
    streak: number;
    pointsAwarded: number;
    challenge: DailyChallenge | null;
    nextRewardTime?: string;
}> {
    const userRef = doc(db, 'users', userId).withConverter(authorConverter);
    const batch = writeBatch(db);
    
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
        throw new Error('User not found');
    }
    
    const user = userSnap.data();
    const todayStr = getCurrentDateInIST();
    const yesterdayStr = getYesterdayDateInIST();

    let currentStreak = user.streak?.currentStreak || 0;
    const lastLoginDate = user.streak?.lastLoginDate || '';
    
    let pointsAwarded = 0;
    let newChallenge: DailyChallenge | null = user.challenge || null;

    if (lastLoginDate === todayStr) {
        // Already logged in today, do nothing
        return {
            thought: { quote: "You've already claimed your daily reward!", author: "Glare" },
            streak: currentStreak,
            pointsAwarded: 0,
            challenge: user.challenge || null,
            nextRewardTime: getStartOfNextDayIST(),
        };
    }

    if (lastLoginDate === yesterdayStr) {
        // Consecutive day
        currentStreak++;
    } else {
        // Missed a day or first login
        currentStreak = 1;
    }
    
    pointsAwarded = currentStreak; // +1 for day 1, +2 for day 2, etc.

    // Assign a new challenge on multiples of 5
    if (currentStreak > 0 && currentStreak % 5 === 0) {
        newChallenge = assignNewChallenge();
    } else if (newChallenge?.id !== todayStr) {
        // If it's a new day and not a challenge day, clear the old challenge
        newChallenge = null;
    }


    batch.update(userRef, {
        points: (user.points || 0) + pointsAwarded,
        'streak.currentStreak': currentStreak,
        'streak.lastLoginDate': todayStr,
        'challenge': newChallenge ? { ...newChallenge } : null,
    });
    
    await batch.commit();

    return {
        // A thought should still be returned, but let's have the client handle that.
        // For now, return a default one.
        thought: { quote: `You're on a ${currentStreak}-day streak!`, author: "Keep it up!" },
        streak: currentStreak,
        pointsAwarded,
        challenge: newChallenge,
    };
}
