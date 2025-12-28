import type { Skill, ElementType, Stats } from './types';

// Helper to create Active Skills
const active = (id: string, name: string, desc: string, level: number, cd: number, val: number, target: Skill['target'], el?: ElementType, effect: Skill['effectType'] = 'damage'): Skill => ({
    id, name, description: desc, unlockLevel: level, cooldown: cd, currentCooldown: 0,
    type: 'active', effectType: effect, target, value: val, element: el
});

// Helper to create Passive Skills
const passive = (id: string, name: string, desc: string, level: number, stats: Partial<Stats>): Skill => ({
    id, name, description: desc, unlockLevel: level, cooldown: 0, currentCooldown: 0,
    type: 'passive', effectType: 'passive', target: 'self', value: 0, statBonus: stats
});

export const CLASS_SKILLS: Record<string, Skill[]> = {
    Warrior: [
        active('w1', 'Heavy Strike', '150% Damage', 2, 5, 1.5, 'enemy'),
        passive('w2', 'Iron Skin', '+15 Defense', 5, { defense: 15 }),
        active('w3', 'Cleave', '120% Damage to all (simulated)', 8, 8, 1.2, 'enemy'), // Simulated AoE by just high single target for now or need logic
        passive('w4', 'Veteran Vitality', '+50 HP', 12, { hp: 50, maxHp: 50 }),
        active('w5', 'Shield Bash', '200% Damage', 15, 12, 2.0, 'enemy'),
        passive('w6', 'Aggression', '+10 Attack', 20, { attack: 10 }),
        active('w7', 'Execute', '300% Damage', 25, 20, 3.0, 'enemy'),
        passive('w8', 'Fortress', '+30 Defense', 30, { defense: 30 }),
        passive('w9', 'Titan Blood', '+100 HP', 40, { hp: 100, maxHp: 100 }),
        passive('w10', 'Warlord', '+20 Attack', 50, { attack: 20 }),
    ],
    Mage: [
        active('m1', 'Fireball', '160% Fire Damage', 2, 6, 1.6, 'enemy', 'fire'),
        passive('m2', 'Arcane Mind', '+10 Magic', 5, { magic: 10 }),
        active('m3', 'Frost Nova', '130% Water Damage', 8, 10, 1.3, 'enemy', 'water'),
        passive('m4', 'Mana Flow', '+30 MP', 12, { mp: 30, maxMp: 30 }),
        active('m5', 'Thunderbolt', '220% Damage', 15, 12, 2.2, 'enemy', 'nature'),
        passive('m6', 'Glass Cannon', '+20 Magic', 20, { magic: 20 }),
        active('m7', 'Meteor', '350% Fire Damage', 25, 25, 3.5, 'enemy', 'fire'),
        passive('m8', 'Wizardry', '+30 Magic', 30, { magic: 30 }),
        passive('m9', 'Deep Mana', '+60 MP', 40, { mp: 60, maxMp: 60 }),
        passive('m10', 'Archmage', '+50 Magic', 50, { magic: 50 }),
    ],
    Healer: [
        active('h1', 'Heal', 'Heals 30% HP', 2, 8, 0.3, 'lowest_hp', 'light', 'heal'),
        passive('h2', 'Faith', '+10 Magic', 5, { magic: 10 }),
        active('h3', 'Smite', '150% Light Damage', 8, 10, 1.5, 'enemy', 'light'),
        passive('h4', 'Blessing', '+20 HP', 12, { hp: 20, maxHp: 20 }),
        active('h5', 'Group Heal', 'Heals Party 20% (simulated as self 20% for now)', 15, 15, 0.2, 'party', 'light', 'heal'),
        passive('h6', 'Divine Protection', '+10 Defense', 20, { defense: 10 }),
        active('h7', 'Resurrection', 'Heals 50% HP', 25, 30, 0.5, 'lowest_hp', 'light', 'heal'),
        passive('h8', 'Sanctuary', '+20 Defense', 30, { defense: 20 }),
        passive('h9', 'Angel Heart', '+50 MP', 40, { mp: 50, maxMp: 50 }),
        passive('h10', 'Divinity', '+30 Magic', 50, { magic: 30 }),
    ],
    Rogue: [
        active('r1', 'Backstab', '180% Damage', 2, 5, 1.8, 'enemy'),
        passive('r2', 'Agility', '+5 Speed', 5, { speed: 5 }),
        active('r3', 'Poison Blade', '140% Nature Damage', 8, 8, 1.4, 'enemy', 'nature'),
        passive('r4', 'Lethality', '+15 Attack', 12, { attack: 15 }),
        active('r5', 'Fan of Knives', '150% Damage', 15, 10, 1.5, 'enemy'),
        passive('r6', 'Reflexes', '+10 Speed', 20, { speed: 10 }),
        active('r7', 'Assassinate', '400% Damage', 25, 20, 4.0, 'enemy'),
        passive('r8', 'Shadow Walk', '+20 Speed', 30, { speed: 20 }),
        passive('r9', 'Crit Mastery', '+30 Attack', 40, { attack: 30 }),
        passive('r10', 'Ghost', '+100 HP', 50, { hp: 100, maxHp: 100 }),
    ],
    Paladin: [
        active('p1', 'Holy Strike', '140% Light Damage', 2, 6, 1.4, 'enemy', 'light'),
        passive('p2', 'Armor of Light', '+20 Defense', 5, { defense: 20 }),
        active('p3', 'Shield Wall', 'Buff Def (Not impl yet, just heal)', 8, 15, 0.1, 'self', 'light', 'heal'),
        passive('p4', 'Devotion', '+40 HP', 12, { hp: 40, maxHp: 40 }),
        active('p5', 'Judgment', '200% Light Damage', 15, 12, 2.0, 'enemy', 'light'),
        passive('p6', 'Valor', '+15 Attack', 20, { attack: 15 }),
        active('p7', 'Heaven\'s Wrath', '300% Light Damage', 25, 20, 3.0, 'enemy', 'light'),
        passive('p8', 'Guardian', '+40 Defense', 30, { defense: 40 }),
        passive('p9', 'Saint', '+100 HP', 40, { hp: 100, maxHp: 100 }),
        passive('p10', 'Crusader', '+20 Attack', 50, { attack: 20 }),
    ],
    Warlock: [
        active('wl1', 'Shadow Bolt', '160% Dark Damage', 2, 5, 1.6, 'enemy', 'dark'),
        passive('wl2', 'Dark Pact', '+15 Magic', 5, { magic: 15 }),
        active('wl3', 'Drain Life', '120% Dmg + Heal', 8, 10, 1.2, 'enemy', 'dark'),
        passive('wl4', 'Void Soul', '+30 MP', 12, { mp: 30, maxMp: 30 }),
        active('wl5', 'Curse', '200% Dark Damage', 15, 12, 2.0, 'enemy', 'dark'),
        passive('wl6', 'Forbidden Knowledge', '+25 Magic', 20, { magic: 25 }),
        active('wl7', 'Doom', '350% Dark Damage', 25, 25, 3.5, 'enemy', 'dark'),
        passive('wl8', 'Nightmare', '+35 Magic', 30, { magic: 35 }),
        passive('wl9', 'Abyss', '+60 MP', 40, { mp: 60, maxMp: 60 }),
        passive('wl10', 'Demon Lord', '+50 Magic', 50, { magic: 50 }),
    ],
    Dragoon: [
        active('d1', 'Pierce', '160% Damage', 2, 5, 1.6, 'enemy'),
        passive('d2', 'Dragon Scale', '+15 Defense', 5, { defense: 15 }),
        active('d3', 'Jump', '200% Damage', 8, 12, 2.0, 'enemy'),
        passive('d4', 'Lance Mastery', '+15 Attack', 12, { attack: 15 }),
        active('d5', 'Dragon Breath', '180% Fire Damage', 15, 10, 1.8, 'enemy', 'fire'),
        passive('d6', 'Flight', '+10 Speed', 20, { speed: 10 }),
        active('d7', 'Stardiver', '400% Damage', 25, 25, 4.0, 'enemy'),
        passive('d8', 'Wyrmblood', '+80 HP', 30, { hp: 80, maxHp: 80 }),
        passive('d9', 'Impact', '+30 Attack', 40, { attack: 30 }),
        passive('d10', 'Dragon Knight', '+50 Defense', 50, { defense: 50 }),
    ],
    Sage: [
        active('s1', 'Energy Ball', '150% Magic Damage', 2, 5, 1.5, 'enemy'),
        passive('s2', 'Wisdom', '+20 MP', 5, { mp: 20, maxMp: 20 }),
        active('s3', 'Meditate', 'Heal Self 30%', 8, 15, 0.3, 'self', 'neutral', 'heal'),
        passive('s4', 'Insight', '+15 Magic', 12, { magic: 15 }),
        active('s5', 'Holy Water', '200% Water Damage', 15, 12, 2.0, 'enemy', 'water'),
        passive('s6', 'Clarity', '+30 MP', 20, { mp: 30, maxMp: 30 }),
        active('s7', 'Ultima', '350% Magic Damage', 25, 30, 3.5, 'enemy'),
        passive('s8', 'Prophecy', '+30 Magic', 30, { magic: 30 }),
        passive('s9', 'Elder', '+100 MP', 40, { mp: 100, maxMp: 100 }),
        passive('s10', 'Enlightenment', '+50 Magic', 50, { magic: 50 }),
    ],
    Necromancer: [
        active('n1', 'Bone Spear', '150% Damage', 2, 6, 1.5, 'enemy'),
        passive('n2', 'Death Aura', '+10 Magic', 5, { magic: 10 }),
        active('n3', 'Raise Skeleton', 'Buff Atk +10 (Simulated)', 8, 20, 1.0, 'self', 'dark', 'buff'),
        passive('n4', 'Grave Chill', '+10 Defense', 12, { defense: 10 }),
        active('n5', 'Corpse Explosion', '220% Dark Damage', 15, 12, 2.2, 'enemy', 'dark'),
        passive('n6', 'Lich Form', '+50 HP', 20, { hp: 50, maxHp: 50 }),
        active('n7', 'Death Grip', '300% Dark Damage', 25, 20, 3.0, 'enemy', 'dark'),
        passive('n8', 'Soul Harvest', '+25 Magic', 30, { magic: 25 }),
        passive('n9', 'Commander', '+40 MP', 40, { mp: 40, maxMp: 40 }),
        passive('n10', 'Overlord', '+50 Magic', 50, { magic: 50 }),
    ]
};
