import type { Skill, ElementType, Stats, SkillTreeNode, Hero } from './types';

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
    ],
    Bard: [
        active('ba1', 'Song of Rest', 'Heal Party 10%', 2, 8, 0.1, 'party', 'neutral', 'heal'),
        passive('ba2', 'Charisma', '+10 Magic', 5, { magic: 10 }),
        active('ba3', 'Discord', '120% Damage', 8, 6, 1.2, 'enemy'),
        passive('ba4', 'Traveler', '+20 Speed', 12, { speed: 20 }),
        active('ba5', 'Hymn of Valor', 'Buff Party Atk (Simulated)', 15, 20, 1.1, 'party', 'light', 'buff'),
        passive('ba6', 'Inspiration', '+20 Magic', 20, { magic: 20 }),
        active('ba7', 'Cacophony', '250% Damage', 25, 15, 2.5, 'enemy'),
        passive('ba8', 'Legend', '+30 Magic', 30, { magic: 30 }),
        passive('ba9', 'Ballad', '+50 MP', 40, { mp: 50, maxMp: 50 }),
        passive('ba10', 'Virtuoso', '+50 Speed', 50, { speed: 50 }),
    ],
    Monk: [
        active('mo1', 'Palm Strike', '150% Damage', 2, 4, 1.5, 'enemy'),
        passive('mo2', 'Discipline', '+10 Attack', 5, { attack: 10 }),
        active('mo3', 'Cyclone Kick', '180% Damage', 8, 8, 1.8, 'enemy'),
        passive('mo4', 'Iron Body', '+20 Defense', 12, { defense: 20 }),
        active('mo5', 'Meditation', 'Heal Self 40%', 15, 15, 0.4, 'self', 'neutral', 'heal'),
        passive('mo6', 'Flow', '+20 Speed', 20, { speed: 20 }),
        active('mo7', 'Seven Sided Strike', '350% Damage', 25, 20, 3.5, 'enemy'),
        passive('mo8', 'Enlightened', '+30 Attack', 30, { attack: 30 }),
        passive('mo9', 'Karma', '+100 HP', 40, { hp: 100, maxHp: 100 }),
        passive('mo10', 'Grandmaster', '+50 Attack', 50, { attack: 50 }),
    ],
    Ranger: [
        active('ra1', 'Aimed Shot', '160% Damage', 2, 5, 1.6, 'enemy'),
        passive('ra2', 'Eagle Eye', '+10 Attack', 5, { attack: 10 }),
        active('ra3', 'Volley', '140% Damage', 8, 8, 1.4, 'enemy'),
        passive('ra4', 'Light Step', '+20 Speed', 12, { speed: 20 }),
        active('ra5', 'Trap', '200% Damage', 15, 12, 2.0, 'enemy'),
        passive('ra6', 'Hunter', '+15 Attack', 20, { attack: 15 }),
        active('ra7', 'Headshot', '350% Damage', 25, 18, 3.5, 'enemy'),
        passive('ra8', 'Sniper', '+30 Attack', 30, { attack: 30 }),
        passive('ra9', 'Survivalist', '+50 HP', 40, { hp: 50, maxHp: 50 }),
        passive('ra10', 'Deadeye', '+50 Attack', 50, { attack: 50 }),
    ],
    Druid: [
        active('dr1', 'Thorn Whip', '140% Nature Damage', 2, 5, 1.4, 'enemy', 'nature'),
        passive('dr2', 'Naturalist', '+10 Magic', 5, { magic: 10 }),
        active('dr3', 'Regrowth', 'Heal 20%', 8, 10, 0.2, 'lowest_hp', 'nature', 'heal'),
        passive('dr4', 'Barkskin', '+20 Defense', 12, { defense: 20 }),
        active('dr5', 'Wrath of Nature', '220% Nature Damage', 15, 15, 2.2, 'enemy', 'nature'),
        passive('dr6', 'Balance', '+20 Magic', 20, { magic: 20 }),
        active('dr7', 'Hurricane', '300% Damage', 25, 20, 3.0, 'enemy', 'nature'),
        passive('dr8', 'Elder Tree', '+40 HP', 30, { hp: 40, maxHp: 40 }),
        passive('dr9', 'Wild Shape', '+30 Attack', 40, { attack: 30 }),
        passive('dr10', 'Archdruid', '+50 Magic', 50, { magic: 50 }),
    ],
    Berserker: [
        active('be1', 'Rage', 'Buff Atk (Simulated simple hit 150%)', 2, 5, 1.5, 'enemy'),
        passive('be2', 'Anger', '+15 Attack', 5, { attack: 15 }),
        active('be3', 'Slam', '180% Damage', 8, 8, 1.8, 'enemy'),
        passive('be4', 'Reckless', '-10 Def, +20 Atk', 12, { attack: 20, defense: -10 }),
        active('be5', 'Bloodlust', 'Heal Self 50%', 15, 20, 0.5, 'self', 'neutral', 'heal'),
        passive('be6', 'Frenzy', '+20 Speed', 20, { speed: 20 }),
        active('be7', 'Decapitate', '400% Damage', 25, 25, 4.0, 'enemy'),
        passive('be8', 'Savage', '+40 Attack', 30, { attack: 40 }),
        passive('be9', 'Undying', '+150 HP', 40, { hp: 150, maxHp: 150 }),
        passive('be10', 'Avatar', '+60 Attack', 50, { attack: 60 }),
    ],
    Sorcerer: [
        active('so1', 'Arcane Bolt', '160% Magic Damage', 2, 4, 1.6, 'enemy'),
        passive('so2', 'Mana Pool', '+20 MP', 5, { mp: 20, maxMp: 20 }),
        active('so3', 'Scorch', '180% Fire Damage', 8, 8, 1.8, 'enemy', 'fire'),
        passive('so4', 'Potency', '+15 Magic', 12, { magic: 15 }),
        active('so5', 'Teleport', 'Buff Evasion (Simulated heal 10%)', 15, 15, 0.1, 'self', 'neutral', 'heal'),
        passive('so6', 'Focus', '+25 Magic', 20, { magic: 25 }),
        active('so7', 'Chaos Bolt', '350% Random Dmg', 25, 20, 3.5, 'enemy'),
        passive('so8', 'Overload', '+35 Magic', 30, { magic: 35 }),
        passive('so9', 'Deep Magic', '+100 MP', 40, { mp: 100, maxMp: 100 }),
        passive('so10', 'Archmage', '+60 Magic', 50, { magic: 60 }),
    ],
    Templar: [
        active('te1', 'Smash', '140% Damage', 2, 6, 1.4, 'enemy'),
        passive('te2', 'Shielding', '+20 Defense', 5, { defense: 20 }),
        active('te3', 'Consecrate', '150% Light Damage', 8, 10, 1.5, 'enemy', 'light'),
        passive('te4', 'Fortitude', '+50 HP', 12, { hp: 50, maxHp: 50 }),
        active('te5', 'Divine Storm', '200% Damage', 15, 15, 2.0, 'enemy', 'light'),
        passive('te6', 'Resolve', '+30 Defense', 20, { defense: 30 }),
        active('te7', 'Judgment', '350% Light Damage', 25, 25, 3.5, 'enemy', 'light'),
        passive('te8', 'Guardian', '+40 Defense', 30, { defense: 40 }),
        passive('te9', 'Saint', '+100 HP', 40, { hp: 100, maxHp: 100 }),
        passive('te10', 'Champion', '+50 Attack', 50, { attack: 50 }),
    ],
    Assassin: [
        active('as1', 'Stab', '160% Damage', 2, 4, 1.6, 'enemy'),
        passive('as2', 'Shadows', '+10 Speed', 5, { speed: 10 }),
        active('as3', 'Poison', '140% Nature Dmg', 8, 8, 1.4, 'enemy', 'nature'),
        passive('as4', 'Deadly', '+20 Attack', 12, { attack: 20 }),
        active('as5', 'Eviscerate', '220% Damage', 15, 12, 2.2, 'enemy'),
        passive('as6', 'Precision', '+15 Crit (Simulated Atk)', 20, { attack: 15 }),
        active('as7', 'Death Blow', '450% Damage', 25, 30, 4.5, 'enemy'),
        passive('as8', 'Killer', '+30 Attack', 30, { attack: 30 }),
        passive('as9', 'Vanish', '+30 Speed', 40, { speed: 30 }),
        passive('as10', 'Master', '+60 Attack', 50, { attack: 60 }),
    ],
    Engineer: [
        active('en1', 'Wrench', '150% Damage', 2, 5, 1.5, 'enemy'),
        passive('en2', 'Tech', '+10 Defense', 5, { defense: 10 }),
        active('en3', 'Turret', '150% Damage', 8, 10, 1.5, 'enemy'),
        passive('en4', 'Optimization', '+20 Attack', 12, { attack: 20 }),
        active('en5', 'Grenade', '200% Fire Damage', 15, 12, 2.0, 'enemy', 'fire'),
        passive('en6', 'Upgrades', '+30 Defense', 20, { defense: 30 }),
        active('en7', 'Laser', '350% Damage', 25, 20, 3.5, 'enemy'),
        passive('en8', 'Mechanic', '+50 HP', 30, { hp: 50, maxHp: 50 }),
        passive('en9', 'Overclock', '+20 Speed', 40, { speed: 20 }),
        passive('en10', 'Genius', '+50 Magic', 50, { magic: 50 }),
    ],
    Alchemist: [
        active('al1', 'Acid Flask', '150% Nature Dmg', 2, 5, 1.5, 'enemy', 'nature'),
        passive('al2', 'Chemistry', '+15 Magic', 5, { magic: 15 }),
        active('al3', 'Healing Potion', 'Heal 25%', 8, 10, 0.25, 'lowest_hp', 'neutral', 'heal'),
        passive('al4', 'Transmute', '+10 Gold (Simulated Atk)', 12, { attack: 10 }),
        active('al5', 'Explosion', '220% Fire Damage', 15, 15, 2.2, 'enemy', 'fire'),
        passive('al6', 'Potency', '+25 Magic', 20, { magic: 25 }),
        active('al7', 'Elixir', 'Heal Party 30%', 25, 25, 0.3, 'party', 'neutral', 'heal'),
        passive('al8', 'Mixologist', '+35 Magic', 30, { magic: 35 }),
        passive('al9', 'Philosopher', '+100 HP', 40, { hp: 100, maxHp: 100 }),
        passive('al10', 'Goldmaker', '+50 Magic', 50, { magic: 50 }),
    ],
    Illusionist: [
        active('il1', 'Mind Blast', '150% Magic Dmg', 2, 5, 1.5, 'enemy'),
        passive('il2', 'Mirage', '+15 Speed', 5, { speed: 15 }),
        active('il3', 'Phantasm', '180% Damage', 8, 8, 1.8, 'enemy'),
        passive('il4', 'Trickster', '+20 Magic', 12, { magic: 20 }),
        active('il5', 'Invisibility', 'Buff Def (Simulated)', 15, 15, 0.1, 'self', 'neutral', 'buff'),
        passive('il6', 'Deception', '+20 Speed', 20, { speed: 20 }),
        active('il7', 'Nightmare', '350% Damage', 25, 20, 3.5, 'enemy'),
        passive('il8', 'Mastermind', '+30 Magic', 30, { magic: 30 }),
        passive('il9', 'Ethereal', '+40 Defense', 40, { defense: 40 }),
        passive('il10', 'Grand Illusion', '+60 Magic', 50, { magic: 60 }),
    ],
    Samurai: [
        active('sa1', 'Katana Slash', '150% Damage', 2, 4, 1.5, 'enemy'),
        passive('sa2', 'Bushido', '+15 Attack', 5, { attack: 15 }),
        active('sa3', 'Quick Draw', '180% Damage', 8, 6, 1.8, 'enemy'),
        passive('sa4', 'Honor', '+20 HP', 12, { hp: 20, maxHp: 20 }),
        active('sa5', 'Dragon Slash', '250% Fire Damage', 15, 15, 2.5, 'enemy', 'fire'),
        passive('sa6', 'Focus', '+20 Speed', 20, { speed: 20 }),
        active('sa7', 'Blade Dance', '350% Damage', 25, 20, 3.5, 'enemy'),
        passive('sa8', 'Keen Edge', '+30 Attack', 30, { attack: 30 }),
        passive('sa9', 'Spirit', '+50 MP', 40, { mp: 50, maxMp: 50 }),
        passive('sa10', 'Shogun', '+50 Attack', 50, { attack: 50 }),
    ],
    Viking: [
        active('vi1', 'Axe Throw', '160% Damage', 2, 6, 1.6, 'enemy'),
        passive('vi2', 'Strength', '+20 Attack', 5, { attack: 20 }),
        active('vi3', 'Shield Bash', '140% Damage', 8, 8, 1.4, 'enemy'),
        passive('vi4', 'Toughness', '+40 HP', 12, { hp: 40, maxHp: 40 }),
        active('vi5', 'War Cry', 'Buff Atk (Simulated)', 15, 20, 1.1, 'party', 'neutral', 'buff'),
        passive('vi6', 'Raider', '+20 Attack', 20, { attack: 20 }),
        active('vi7', 'Ragnarok', '400% Fire Damage', 25, 30, 4.0, 'enemy', 'fire'),
        passive('vi8', 'Warlord', '+30 Defense', 30, { defense: 30 }),
        passive('vi9', 'Odin\'s Blood', '+100 HP', 40, { hp: 100, maxHp: 100 }),
        passive('vi10', 'Valhalla', '+50 Attack', 50, { attack: 50 }),
    ],
    Ninja: [
        active('ni1', 'Shuriken', '150% Damage', 2, 3, 1.5, 'enemy'),
        passive('ni2', 'Stealth', '+15 Speed', 5, { speed: 15 }),
        active('ni3', 'Shadow Strike', '180% Damage', 8, 8, 1.8, 'enemy'),
        passive('ni4', 'Agility', '+20 Speed', 12, { speed: 20 }),
        active('ni5', 'Smoke Bomb', 'Buff Evasion (Simulated)', 15, 15, 0.1, 'self', 'neutral', 'buff'),
        passive('ni6', 'Assassin', '+20 Attack', 20, { attack: 20 }),
        active('ni7', 'Flicker', '400% Damage', 25, 25, 4.0, 'enemy'),
        passive('ni8', 'Shinobi', '+30 Attack', 30, { attack: 30 }),
        passive('ni9', 'Shadow', '+30 Speed', 40, { speed: 30 }),
        passive('ni10', 'Master', '+50 Attack', 50, { attack: 50 }),
    ],
    Pirate: [
        active('pi1', 'Pistol Shot', '160% Damage', 2, 6, 1.6, 'enemy'),
        passive('pi2', 'Greed', '+10 Gold (Simulated Atk)', 5, { attack: 10 }),
        active('pi3', 'Cutlass', '150% Damage', 8, 8, 1.5, 'enemy'),
        passive('pi4', 'Luck', '+15 Crit (Simulated Atk)', 12, { attack: 15 }),
        active('pi5', 'Cannonball', '250% Fire Damage', 15, 15, 2.5, 'enemy', 'fire'),
        passive('pi6', 'Plunder', '+20 Attack', 20, { attack: 20 }),
        active('pi7', 'Broadside', '350% Damage', 25, 25, 3.5, 'enemy'),
        passive('pi8', 'Captain', '+10 Speed', 30, { speed: 10 }),
        passive('pi9', 'Rum', '+100 HP', 40, { hp: 100, maxHp: 100 }),
        passive('pi10', 'King', '+50 Attack', 50, { attack: 50 }),
    ],
    Fisherman: [
        active('fi1', 'Hook', '150% Damage', 2, 4, 1.5, 'enemy'),
        passive('fi2', 'Patience', '+15 Defense', 5, { defense: 15 }),
        active('fi3', 'Net Throw', '140% Damage + Slow (Simulated)', 8, 8, 1.4, 'enemy', 'water'),
        passive('fi4', 'Sea Legs', '+20 Speed', 12, { speed: 20 }),
        active('fi5', 'Harpoon', '200% Damage', 15, 12, 2.0, 'enemy'),
        passive('fi6', 'Angler', '+15 Gold (Simulated Atk)', 20, { attack: 15 }),
        active('fi7', 'Tsunami', '350% Water Damage', 25, 20, 3.5, 'enemy', 'water'),
        passive('fi8', 'Navigator', '+50 HP', 30, { hp: 50, maxHp: 50 }),
        passive('fi9', 'Big Catch', '+30 Attack', 40, { attack: 30 }),
        passive('fi10', 'Poseidon', '+50 Magic', 50, { magic: 50 }),
    ],
};

// ─────────────────────────────────────────────
// SKILL UTILITY FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Checks if a skill is unlocked at the given hero level.
 */
export const isSkillUnlocked = (skill: Skill, heroLevel: number): boolean => {
    return heroLevel >= skill.unlockLevel;
};

/**
 * Returns all skills (active + passive) for a class that are unlocked at the given level.
 */
export const getSkillsForHero = (heroClass: string, heroLevel: number): Skill[] => {
    const all = CLASS_SKILLS[heroClass] ?? [];
    return all.filter(s => isSkillUnlocked(s, heroLevel));
};

/**
 * Returns only ACTIVE skills from a list that are unlocked at the given level.
 */
export const getActiveSkills = (skills: Skill[], heroLevel: number): Skill[] => {
    return skills.filter(s => s.type === 'active' && isSkillUnlocked(s, heroLevel));
};

/**
 * Sums all stat bonuses from PASSIVE skills in the given list that are unlocked at the given level.
 */
export const getPassiveStatBonus = (skills: Skill[], heroLevel: number): Partial<Stats> => {
    const total: Partial<Stats> = {};
    skills
        .filter(s => s.type === 'passive' && isSkillUnlocked(s, heroLevel) && s.statBonus)
        .forEach(s => {
            (Object.keys(s.statBonus!) as Array<keyof Stats>).forEach(stat => {
                const val = s.statBonus![stat] ?? 0;
                total[stat] = (total[stat] ?? 0) + val;
            });
        });
    return total;
};

/**
 * Convenience: returns total passive stat bonuses for a class at a given level.
 */
export const getTotalPassiveStatBonus = (heroClass: string, heroLevel: number): Partial<Stats> => {
    const skills = CLASS_SKILLS[heroClass] ?? [];
    return getPassiveStatBonus(skills, heroLevel);
};

/**
 * Estimates the raw damage output of an active skill given the hero's base attack.
 * Returns 0 for heal/buff skills.
 */
export const getSkillDamageEstimate = (skill: Skill, baseAttack: number): number => {
    if (skill.effectType !== 'damage') return 0;
    return Math.floor(baseAttack * skill.value);
};

/**
 * Returns the highest-damage active skill available from a list,
 * or null if no damage skills are unlocked.
 */
export const getBestDamageSkill = (skills: Skill[], heroLevel: number): Skill | null => {
    const available = getActiveSkills(skills, heroLevel).filter(s => s.effectType === 'damage');
    if (available.length === 0) return null;
    return available.reduce((best, s) => s.value > best.value ? s : best);
};

export const STATIC_SKILL_TREE_NODES: {
    id: string;
    name: string;
    description: string;
    requiredLevel: number;
    archetype: 'attack' | 'defense' | 'utility';
    tier: number;
    baseValue: number;
    maxLevel: number;
    bonusType: SkillTreeNode['bonusType'];
}[] = [
    // --- ATTACK PATH ---
    { id: 'atk_t1', name: 'Treinamento de Força', description: 'Aumenta o multiplicador de ataque físico.', requiredLevel: 1, archetype: 'attack', tier: 1, baseValue: 0.015, maxLevel: 5, bonusType: 'attackMult' },
    { id: 'atk_t2', name: 'Golpes Precisos', description: 'Melhora o dano crítico.', requiredLevel: 10, archetype: 'attack', tier: 2, baseValue: 0.015, maxLevel: 5, bonusType: 'critDamageBonus' },
    { id: 'atk_t3', name: 'Foco Letal', description: 'Aumenta a chance de acerto crítico.', requiredLevel: 20, archetype: 'attack', tier: 3, baseValue: 0.002, maxLevel: 5, bonusType: 'critChanceBonus' },
    { id: 'atk_t4', name: 'Poder Brutal', description: 'Aumenta o multiplicador de ataque físico.', requiredLevel: 30, archetype: 'attack', tier: 4, baseValue: 0.02, maxLevel: 5, bonusType: 'attackMult' },
    { id: 'atk_t5', name: 'Amplificação Mágica', description: 'Melhora o poder mágico do herói.', requiredLevel: 40, archetype: 'attack', tier: 5, baseValue: 0.015, maxLevel: 5, bonusType: 'magicMult' },
    { id: 'atk_t6', name: 'Precisão Cirúrgica', description: 'Chance extra de causar golpes críticos devastadores.', requiredLevel: 50, archetype: 'attack', tier: 6, baseValue: 0.003, maxLevel: 5, bonusType: 'critChanceBonus' },
    { id: 'atk_t7', name: 'Fúria Destruidora', description: 'Bônus massivo no dano crítico.', requiredLevel: 60, archetype: 'attack', tier: 7, baseValue: 0.02, maxLevel: 5, bonusType: 'critDamageBonus' },
    { id: 'atk_t8', name: 'Canalização Arcana', description: 'Amplifica ainda mais a magia.', requiredLevel: 70, archetype: 'attack', tier: 8, baseValue: 0.02, maxLevel: 5, bonusType: 'magicMult' },
    { id: 'atk_t9', name: 'Ira do Gladiador', description: 'Aumenta o ataque e a força geral.', requiredLevel: 80, archetype: 'attack', tier: 9, baseValue: 0.025, maxLevel: 5, bonusType: 'attackMult' },
    { id: 'atk_t10', name: 'Ascensão Divina', description: 'Amplifica ataque e magia em níveis absurdos.', requiredLevel: 90, archetype: 'attack', tier: 10, baseValue: 0.03, maxLevel: 5, bonusType: 'attackMult' },

    // --- DEFENSE PATH ---
    { id: 'def_t1', name: 'Vitalidade Básica', description: 'Aumenta o multiplicador de vida máxima.', requiredLevel: 1, archetype: 'defense', tier: 1, baseValue: 0.02, maxLevel: 5, bonusType: 'hpMult' },
    { id: 'def_t2', name: 'Couraça de Aço', description: 'Melhora a defesa global do herói.', requiredLevel: 10, archetype: 'defense', tier: 2, baseValue: 0.02, maxLevel: 5, bonusType: 'defenseMult' },
    { id: 'def_t3', name: 'Casca Grossa', description: 'Mitiga o dano recebido em porcentagem.', requiredLevel: 20, archetype: 'defense', tier: 3, baseValue: 0.005, maxLevel: 5, bonusType: 'damageMitigation' },
    { id: 'def_t4', name: 'Resistência Física', description: 'Aumenta a defesa e armadura física.', requiredLevel: 30, archetype: 'defense', tier: 4, baseValue: 0.025, maxLevel: 5, bonusType: 'defenseMult' },
    { id: 'def_t5', name: 'Coração de Ferro', description: 'Concede vida extra de forma massiva.', requiredLevel: 40, archetype: 'defense', tier: 5, baseValue: 0.025, maxLevel: 5, bonusType: 'hpMult' },
    { id: 'def_t6', name: 'Barreira Espiritual', description: 'Mitiga o dano mágico e físico adicional.', requiredLevel: 50, archetype: 'defense', tier: 6, baseValue: 0.006, maxLevel: 5, bonusType: 'damageMitigation' },
    { id: 'def_t7', name: 'Constituição Divina', description: 'Garante mais vida útil para o combate.', requiredLevel: 60, archetype: 'defense', tier: 7, baseValue: 0.03, maxLevel: 5, bonusType: 'hpMult' },
    { id: 'def_t8', name: 'Paredão de Pedra', description: 'Aumenta a defesa e a resiliência física.', requiredLevel: 70, archetype: 'defense', tier: 8, baseValue: 0.03, maxLevel: 5, bonusType: 'defenseMult' },
    { id: 'def_t9', name: 'Escudo do Vazio', description: 'Mitigação de dano de elite.', requiredLevel: 80, archetype: 'defense', tier: 9, baseValue: 0.008, maxLevel: 5, bonusType: 'damageMitigation' },
    { id: 'def_t10', name: 'Baluarte Imortal', description: 'Aumenta a vida de forma colossal.', requiredLevel: 90, archetype: 'defense', tier: 10, baseValue: 0.035, maxLevel: 5, bonusType: 'hpMult' },

    // --- UTILITY PATH ---
    { id: 'utl_t1', name: 'Passo Rápido', description: 'Aumenta a velocidade de movimento e combate.', requiredLevel: 1, archetype: 'utility', tier: 1, baseValue: 0.015, maxLevel: 5, bonusType: 'speedMult' },
    { id: 'utl_t2', name: 'Foco Mental', description: 'Melhora a resistência à insanidade nos Backrooms.', requiredLevel: 10, archetype: 'utility', tier: 2, baseValue: 0.01, maxLevel: 5, bonusType: 'insanityResistance' },
    { id: 'utl_t3', name: 'Explorador Ágil', description: 'Melhora a eficiência em expedições.', requiredLevel: 20, archetype: 'utility', tier: 3, baseValue: 0.01, maxLevel: 5, bonusType: 'expeditionSpeedBonus' },
    { id: 'utl_t4', name: 'Reflexos Rápidos', description: 'Melhora a velocidade do herói.', requiredLevel: 30, archetype: 'utility', tier: 4, baseValue: 0.02, maxLevel: 5, bonusType: 'speedMult' },
    { id: 'utl_t5', name: 'Mente Sã', description: 'Resistência extra contra loucura.', requiredLevel: 40, archetype: 'utility', tier: 5, baseValue: 0.015, maxLevel: 5, bonusType: 'insanityResistance' },
    { id: 'utl_t6', name: 'Logística Avançada', description: 'Melhora o poder e velocidade de expedição.', requiredLevel: 50, archetype: 'utility', tier: 6, baseValue: 0.015, maxLevel: 5, bonusType: 'expeditionSpeedBonus' },
    { id: 'utl_t7', name: 'Velocidade da Luz', description: 'Aumento massivo na velocidade básica.', requiredLevel: 60, archetype: 'utility', tier: 7, baseValue: 0.025, maxLevel: 5, bonusType: 'speedMult' },
    { id: 'utl_t8', name: 'Sanidade Blindada', description: 'Resistência de elite a efeitos mentais.', requiredLevel: 70, archetype: 'utility', tier: 8, baseValue: 0.02, maxLevel: 5, bonusType: 'insanityResistance' },
    { id: 'utl_t9', name: 'Sobrevivente do Labirinto', description: 'Perfeito para expedições perigosas.', requiredLevel: 80, archetype: 'utility', tier: 9, baseValue: 0.02, maxLevel: 5, bonusType: 'expeditionSpeedBonus' },
    { id: 'utl_t10', name: 'Caminhante do Vazio', description: 'Aumenta a velocidade global absurdamente.', requiredLevel: 90, archetype: 'utility', tier: 10, baseValue: 0.03, maxLevel: 5, bonusType: 'speedMult' }
];

export const updateHeroSkills = (hero: Hero): Hero => {
    const level = hero.level || 1;
    
    // 1. Build nodes list
    const nodes: SkillTreeNode[] = STATIC_SKILL_TREE_NODES.map(staticNode => {
        const unlocked = level >= staticNode.requiredLevel;
        const nodeLvl = unlocked ? Math.min(staticNode.maxLevel, Math.floor((level - staticNode.requiredLevel) / 10) + 1) : 0;
        const effectValue = staticNode.baseValue * nodeLvl;
        
        return {
            id: staticNode.id,
            name: staticNode.name,
            description: staticNode.description,
            requiredLevel: staticNode.requiredLevel,
            archetype: staticNode.archetype,
            tier: staticNode.tier,
            unlocked,
            level: nodeLvl,
            maxLevel: staticNode.maxLevel,
            effectValue,
            bonusType: staticNode.bonusType
        };
    });

    // 2. Initialize or update passiveSkillTree
    const passiveTree = hero.passiveSkillTree || {
        level: level,
        pointsSpent: Math.max(0, level - 1),
        offensivePoints: 0,
        defensivePoints: 0,
        utilityPoints: 0,
        modifiers: {
            attackMult: 1.0,
            magicMult: 1.0,
            hpMult: 1.0,
            defenseMult: 1.0,
            speedMult: 1.0,
            critChanceBonus: 0.0,
            critDamageBonus: 0.0,
            damageMitigation: 0.0,
            insanityResistance: 0.0,
            expeditionSpeedBonus: 0.0
        },
        unlockedMilestones: []
    };

    const modifiers = { ...passiveTree.modifiers };

    nodes.forEach(node => {
        if (node.unlocked && node.effectValue > 0) {
            const bt = node.bonusType;
            if (bt.endsWith('Mult')) {
                modifiers[bt] = (modifiers[bt] || 1.0) + node.effectValue;
            } else {
                modifiers[bt] = (modifiers[bt] || 0.0) + node.effectValue;
            }
        }
    });

    return {
        ...hero,
        skillTreeNodes: nodes,
        passiveSkillTree: {
            ...passiveTree,
            modifiers
        }
    };
};
