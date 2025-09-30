
import { DailyChallenge, ChallengeType } from './data';

interface ChallengeTemplate {
    type: ChallengeType;
    description: (target: number) => string;
    target: number;
    points: number;
}

export const challengeTemplates: ChallengeTemplate[] = [
    {
        type: 'READ_X_MINUTES',
        description: (target) => `Read articles for a total of ${target} minutes.`,
        target: 10,
        points: 50,
    },
    {
        type: 'LIKE_X_POSTS',
        description: (target) => `Like ${target} different articles.`,
        target: 3,
        points: 30,
    },
    {
        type: 'COMMENT_X_POSTS',
        description: (target) => `Comment on ${target} different articles.`,
        target: 2,
        points: 40,
    },
];

export function assignNewChallenge(): DailyChallenge {
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];
    
    // Simple logic to pick a challenge, can be made more sophisticated
    const challengeIndex = today.getDate() % challengeTemplates.length;
    const template = challengeTemplates[challengeIndex];

    const newChallenge: DailyChallenge = {
        id: todayISO,
        type: template.type,
        description: template.description(template.target),
        target: template.target,
        progress: 0,
        points: template.points,
        completed: false,
        assignedAt: today.toISOString(),
    };

    return newChallenge;
}
