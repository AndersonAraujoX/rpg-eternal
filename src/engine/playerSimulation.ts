import type { LogEntry } from './types';

export interface FakePlayer {
    id: string;
    name: string;
    profile: 'hardcore' | 'casual' | 'lucky';
    power: number;
    level: number;
    towerFloor: number;
    guild: string;
    avatar: string;
    lastActionTime: number;
}

const BOT_NAMES = [
    'SoloLeveler', 'GamerPro', 'ShadowNinja', 'Valkyrie', 'Ragnar', 
    'PandaMaster', 'SwordArt', 'ManaBurn', 'VoidSeeker', 'Glitch', 
    'Speedrunner', 'NoobDestroyer', 'EpicLoot', 'AlphaFighter', 'OmegaMage', 
    'PhoenixRise', 'StarForge', 'ChronoQuest', 'LokiGamer', 'ThorGod', 
    'OdinRuler', 'FreyaHeal', 'KratosRage', 'ArthurKing', 'MerlinSpell', 
    'GandalfGrey', 'BilboRing', 'FrodoBaggins', 'LegolasBow', 'GimliAxe'
];

const BOT_GUILDS = [
    'Taverna dos Lendários', 'Cavaleiros Especiais', 'Ordem de Elite', 
    'Vanguard', 'Eclipse Syndicate', 'Sol Invictus', 'Void Walkers', 
    'Asgardian Guard', 'Fênix de Fogo', 'Alquimistas Unidos'
];

const BOT_AVATARS = ['🧙‍♂️', '🥷', '🛡️', '🏹', '🗡️', '🔥', '⚡', '🐉', '💀', '👽', '👑', '🐺', '🦊', '🦁', '🐻'];

export const generateInitialBots = (count: number = 20): FakePlayer[] => {
    const bots: FakePlayer[] = [];
    const usedNames = new Set<string>();

    for (let i = 0; i < count; i++) {
        let name = BOT_NAMES[i % BOT_NAMES.length];
        if (usedNames.has(name) || i >= BOT_NAMES.length) {
            name = `${name}_${Math.floor(Math.random() * 900) + 100}`;
        }
        usedNames.add(name);

        const profiles: ('hardcore' | 'casual' | 'lucky')[] = ['hardcore', 'casual', 'lucky'];
        const profile = profiles[i % profiles.length];

        // Ranks and powers distributed initially
        const level = Math.floor(Math.random() * 15) + (profile === 'hardcore' ? 10 : 1);
        const power = Math.floor(100 * Math.pow(1.18, level)) + (profile === 'hardcore' ? 500 : 50);
        const towerFloor = Math.floor(level / 2) + 1;
        const guild = BOT_GUILDS[Math.floor(Math.random() * BOT_GUILDS.length)];
        const avatar = BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)];

        bots.push({
            id: `bot-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name,
            profile,
            power,
            level,
            towerFloor,
            guild,
            avatar,
            lastActionTime: Date.now()
        });
    }

    return bots;
};

export const tickFakePlayers = (
    bots: FakePlayer[], 
    playerPower: number
): { updatedBots: FakePlayer[], logEntries: { message: string, type: 'info' | 'success' | 'danger' | 'achievement' | 'action' }[] } => {
    const updatedBots = [...bots];
    const logEntries: { message: string, type: 'info' | 'success' | 'danger' | 'achievement' | 'action' }[] = [];
    const now = Date.now();

    updatedBots.forEach((bot, idx) => {
        // Different action cooldowns based on profile
        // hardcore ticks every ~15s (chance), casual ~60s, lucky ~30s
        const cooldown = bot.profile === 'hardcore' ? 15000 : bot.profile === 'lucky' ? 30000 : 60000;
        
        if (now - bot.lastActionTime < cooldown) return;
        
        // Random chance to act
        if (Math.random() > 0.4) {
            // Update time to avoid spamming even if we didn't succeed
            bot.lastActionTime = now;
            return;
        }

        bot.lastActionTime = now;
        
        const actionRoll = Math.random();
        
        // Hardcore and lucky have higher progression rates
        let powerIncrease = Math.floor(bot.power * (0.02 + Math.random() * 0.08));
        if (bot.profile === 'hardcore') {
            powerIncrease = Math.floor(bot.power * (0.05 + Math.random() * 0.12));
        } else if (bot.profile === 'casual') {
            powerIncrease = Math.floor(bot.power * (0.01 + Math.random() * 0.04));
        }

        // Apply caps so bots stay in active competition relative to player's power
        // If they are way behind, give them a boost. If they are way ahead, slow them down.
        const powerRatio = bot.power / (playerPower || 1);
        if (powerRatio < 0.2) {
            powerIncrease = Math.floor(powerIncrease * 2.5);
        } else if (powerRatio > 5.0) {
            powerIncrease = Math.floor(powerIncrease * 0.1);
        }

        bot.power = Math.max(10, bot.power + powerIncrease);

        if (actionRoll < 0.25) {
            // Level Up
            bot.level += 1;
            // Level up also boosts power
            bot.power += Math.floor(bot.power * 0.05) + 5;
        } else if (actionRoll < 0.40) {
            // Climb Tower Floor
            bot.towerFloor += 1;
            
            // Log this achievement sometimes (10% chance)
            if (Math.random() < 0.3) {
                logEntries.push({
                    message: `🏰 [BOT] ${bot.name} acabou de subir para o Andar ${bot.towerFloor} da Torre!`,
                    type: 'info'
                });
            }
        } else if (actionRoll < 0.50) {
            // Log Event: Failed forge upgrade
            if (Math.random() < 0.3) {
                logEntries.push({
                    message: `⚒️ [BOT] ${bot.name} falhou ao tentar aprimorar sua arma na Forja. Que pena!`,
                    type: 'danger'
                });
            }
        } else if (actionRoll < 0.60) {
            // Log Event: Lucky pet breeding (especially for lucky/hardcore profile)
            if (bot.profile === 'lucky' || Math.random() < 0.2) {
                logEntries.push({
                    message: `🧬 [BOT] ${bot.name} conseguiu um Pet Lendário através de cruzamento!`,
                    type: 'achievement'
                });
                bot.power += Math.floor(bot.power * 0.10) + 20; // major power boost
            }
        } else if (actionRoll < 0.70) {
            // Other events like Reforging Mythical Item
            if (Math.random() < 0.2) {
                const rarities = ['Épico', 'Lendário', 'Mítico', 'Divino'];
                const r = rarities[Math.floor(Math.random() * rarities.length)];
                logEntries.push({
                    message: `✨ [BOT] ${bot.name} reforjou um item ${r} na Forja do Vazio!`,
                    type: 'success'
                });
                bot.power += Math.floor(bot.power * 0.08) + 15;
            }
        }
        
        updatedBots[idx] = { ...bot };
    });

    return { updatedBots, logEntries };
};

export const selectArenaOpponents = (
    bots: FakePlayer[], 
    playerPower: number, 
    playerRank: number
): import('./types').ArenaOpponent[] => {
    if (bots.length === 0) return [];
    
    // Sort bots by power to find easy, normal, hard
    const sorted = [...bots].sort((a, b) => a.power - b.power);
    
    // Easy: closest to 0.6 * playerPower
    const easyTarget = playerPower * 0.6;
    let easyBot = sorted[0];
    let minEasyDiff = Math.abs(easyBot.power - easyTarget);
    
    // Normal: closest to 1.0 * playerPower
    const normalTarget = playerPower * 1.0;
    let normalBot = sorted[0];
    let minNormalDiff = Math.abs(normalBot.power - normalTarget);
    
    // Hard: closest to 1.5 * playerPower
    const hardTarget = playerPower * 1.5;
    let hardBot = sorted[0];
    let minHardDiff = Math.abs(hardBot.power - hardTarget);
    
    sorted.forEach(bot => {
        const easyDiff = Math.abs(bot.power - easyTarget);
        if (easyDiff < minEasyDiff) {
            minEasyDiff = easyDiff;
            easyBot = bot;
        }
        
        const normalDiff = Math.abs(bot.power - normalTarget);
        if (normalDiff < minNormalDiff) {
            minNormalDiff = normalDiff;
            normalBot = bot;
        }
        
        const hardDiff = Math.abs(bot.power - hardTarget);
        if (hardDiff < minHardDiff) {
            minHardDiff = hardDiff;
            hardBot = bot;
        }
    });
    
    // Ensure all 3 are distinct if bots length >= 3
    if (bots.length >= 3) {
        const selectedIds = new Set<string>([easyBot.id]);
        
        if (selectedIds.has(normalBot.id)) {
            const candidates = sorted.filter(b => b.id !== easyBot.id);
            normalBot = candidates.reduce((prev, curr) => 
                Math.abs(curr.power - normalTarget) < Math.abs(prev.power - normalTarget) ? curr : prev
            );
        }
        selectedIds.add(normalBot.id);
        
        if (selectedIds.has(hardBot.id)) {
            const candidates = sorted.filter(b => b.id !== easyBot.id && b.id !== normalBot.id);
            hardBot = candidates.reduce((prev, curr) => 
                Math.abs(curr.power - hardTarget) < Math.abs(prev.power - hardTarget) ? curr : prev
            );
        }
    }
    
    // Sort global bots to calculate dynamic leaderboard rank
    const globalSorted = [...bots].sort((a, b) => b.power - a.power);
    const getRank = (botId: string) => globalSorted.findIndex(b => b.id === botId) + 1;
    
    return [
        { id: easyBot.id, name: easyBot.name, avatar: easyBot.avatar, rank: getRank(easyBot.id), power: easyBot.power },
        { id: normalBot.id, name: normalBot.name, avatar: normalBot.avatar, rank: getRank(normalBot.id), power: normalBot.power },
        { id: hardBot.id, name: hardBot.name, avatar: hardBot.avatar, rank: getRank(hardBot.id), power: hardBot.power }
    ];
};
