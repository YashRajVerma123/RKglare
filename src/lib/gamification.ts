
import { Award, BookOpen, Bot, BrainCircuit, Star, Zap } from 'lucide-react';

export const levels = [
  { name: 'Newbie Reader', points: 0, icon: BookOpen, color: '#94a3b8' },
  { name: 'Bookworm', points: 100, icon: Award, color: '#f59e0b' },
  { name: 'Content Explorer', points: 300, icon: Star, color: '#10b981' },
  { name: 'Master Subscriber', points: 600, icon: BrainCircuit, color: '#8b5cf6' },
  { name: 'Blog Titan', points: 1000, icon: Zap, color: '#ef4444' },
];

export const getLevel = (points: number) => {
    let currentLevel = levels[0];
    for (const level of levels) {
        if (points >= level.points) {
            currentLevel = level;
        } else {
            break;
        }
    }
    return currentLevel;
};

export const getProgressToNextLevel = (points: number) => {
    const currentLevel = getLevel(points);
    const currentLevelIndex = levels.findIndex(l => l.name === currentLevel.name);
    
    if (currentLevelIndex === levels.length - 1) {
        return { progress: 100, currentPoints: points, requiredPoints: points };
    }
    
    const nextLevel = levels[currentLevelIndex + 1];
    const pointsInCurrentLevel = points - currentLevel.points;
    const pointsForNextLevel = nextLevel.points - currentLevel.points;

    const progress = Math.min(100, Math.floor((pointsInCurrentLevel / pointsForNextLevel) * 100));

    return {
        progress,
        currentPoints: points,
        requiredPoints: nextLevel.points
    };
};

export const pointValues = {
    READ_POST: 10,
    COMMENT: 5,
    LIKE_POST: 3,
    SUBSCRIBE: 20,
    FIVE_MINUTE_READ: 20,
};

export type PointEvent = keyof typeof pointValues;
