import { Achievement } from './types';

export const ACHIEVEMENTS_DATA: Achievement[] = [
    { id: 'a1', name: 'First Blood', description: 'Slay 10 Monsters', isUnlocked: false, condition: { type: 'kills', value: 10 }, rewardType: 'gold', rewardValue: 0.1, rewardText: '+10% Gold' },
    { id: 'a2', name: 'Monster Hunter', description: 'Slay 1,000 Monsters', isUnlocked: false, condition: { type: 'kills', value: 1000 }, rewardType: 'damage', rewardValue: 0.1, rewardText: '+10% Damage' },
    { id: 'a3', name: 'Demon Slayer', description: 'Slay 10,000 Monsters', isUnlocked: false, condition: { type: 'kills', value: 10000 }, rewardType: 'damage', rewardValue: 0.25, rewardText: '+25% Damage' },

    { id: 'b1', name: 'Boss Killer', description: 'Defeat 10 Bosses', isUnlocked: false, condition: { type: 'bossKills', value: 10 }, rewardType: 'bossDamage', rewardValue: 0.1, rewardText: '+10% Boss Dmg' },
    { id: 'b2', name: 'Regicide', description: 'Defeat 100 Bosses', isUnlocked: false, condition: { type: 'bossKills', value: 100 }, rewardType: 'bossDamage', rewardValue: 0.2, rewardText: '+20% Boss Dmg' },

    { id: 'g1', name: 'Novice Hoarder', description: 'Earn 10,000 Gold', isUnlocked: false, condition: { type: 'gold', value: 10000 }, rewardType: 'gold', rewardValue: 0.1, rewardText: '+10% Gold' },
    { id: 'g2', name: 'Merchant Prince', description: 'Earn 1,000,000 Gold', isUnlocked: false, condition: { type: 'gold', value: 1000000 }, rewardType: 'gold', rewardValue: 0.2, rewardText: '+20% Gold' },

    { id: 'c1', name: 'Finger Workout', description: 'Click 1,000 Times', isUnlocked: false, condition: { type: 'clicks', value: 1000 }, rewardType: 'speed', rewardValue: 0.05, rewardText: '-5% Delay' },
];
