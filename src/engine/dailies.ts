import type { DailyQuest } from './types';

// 7-Day Login Rewards
export const LOGIN_REWARDS = [
    { day: 1, type: 'gold', amount: 1000, label: '1,000 Gold' },
    { day: 2, type: 'souls', amount: 50, label: '50 Souls' },
    { day: 3, type: 'gold', amount: 5000, label: '5,000 Gold' },
    { day: 4, type: 'starlight', amount: 1, label: '1 Starlight' },
    { day: 5, type: 'souls', amount: 200, label: '200 Souls' },
    { day: 6, type: 'gold', amount: 25000, label: '25,000 Gold' },
    { day: 7, type: 'starlight', amount: 5, label: '5 Starlight (Grand Prize!)' },
];

export const checkDailyReset = (lastReset: number): boolean => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    return (now - lastReset) > oneDay;
};

export const generateDailyQuests = (_previousQuests: DailyQuest[], _playerLevel: number): DailyQuest[] => {
    // Generate 3 random quests
    // Difficulty scales or static? Static for now.

    const possibleTypes = [
        { type: 'kill', desc: 'Kill Monsters', target: 50, reward: { type: 'gold', amount: 500 } },
        { type: 'mine', desc: 'Mine Rocks', target: 50, reward: { type: 'souls', amount: 10 } },
        { type: 'craft', desc: 'Forge Items', target: 10, reward: { type: 'gold', amount: 1000 } },
        { type: 'gold_earn', desc: 'Earn Gold', target: 10000, reward: { type: 'souls', amount: 20 } },
    ] as const;

    const newQuests: DailyQuest[] = [];

    for (let i = 0; i < 3; i++) {
        const template = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
        newQuests.push({
            id: `daily_${Date.now()}_${i}`,
            description: template.desc,
            target: template.target,
            current: 0,
            type: template.type,
            reward: { type: template.reward.type as any, amount: template.reward.amount },
            claimed: false
        });
    }

    return newQuests;
};

export const getLoginStreak = (lastLogin: number, currentStreak: number): number => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const diff = now - lastLogin;

    if (diff < oneDay) {
        // Less than 24h, streak same (unless new day logic handled elsewhere? 
        // Actually, this function is called ON LOGIN attempt.
        // If login is within same day, no change.
        return currentStreak;
    } else if (diff < 2 * oneDay) {
        // Within 24-48h window, increment
        return Math.min(7, currentStreak + 1);
    } else {
        // More than 48h, reset
        return 1;
    }
};
