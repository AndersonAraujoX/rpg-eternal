import type { Hero, Boss, Gambit, LogEntry } from './types';

export const evaluateGambit = (hero: Hero, gambit: Gambit, enemies: Boss[], allies: Hero[]): boolean => {
    switch (gambit.condition) {
        case 'always':
            return true;
        case 'hp<50':
            return (hero.stats.hp / hero.stats.maxHp) < 0.5;
        case 'hp<30':
            return (hero.stats.hp / hero.stats.maxHp) < 0.3;
        case 'mp<50':
            return (hero.stats.mp / hero.stats.maxMp) < 0.5;
        case 'ally_hp<50':
            return allies.some(a => !a.isDead && (a.stats.hp / a.stats.maxHp) < 0.5);
        case 'ally_dead':
            return allies.some(a => a.isDead);
        case 'enemy_boss':
            return enemies.some(e => e.type === 'boss');
        case 'enemy_count>2':
            return enemies.length > 2;
        default:
            return false;
    }
};

export const executeGambit = (hero: Hero, gambit: Gambit, enemies: Boss[], allies: Hero[], addLog: (msg: string, type: LogEntry['type']) => void): void => {
    // Basic implementation - this would integrate deeply with the combat loop
    // For now, we'll just log the action and perform a simple state change if manageable
    // In a real loop, this would return a CombatAction object to be processed

    const targetEnemy = enemies[0]; // Simplified targeting
    const weakAlly = allies.find(a => !a.isDead && (a.stats.hp / a.stats.maxHp) < 0.5) || hero;
    const deadAlly = allies.find(a => a.isDead);

    switch (gambit.action) {
        case 'heal': {
            // Simple heal logic
            const healAmount = hero.stats.magic * 2;
            weakAlly.stats.hp = Math.min(weakAlly.stats.maxHp, weakAlly.stats.hp + healAmount);
            addLog(`${hero.name} heals ${weakAlly.name} for ${Math.floor(healAmount)} (Gambit: ${gambit.condition})`, 'heal');
            break;
        }

        case 'strong_attack':
            if (targetEnemy && hero.stats.mp >= 10) {
                // const dmg = hero.stats.attack * 1.5;
                // We can't easily modify enemy hp here without referencing the state setter or context
                // This function might need to return a 'DamageInst' or similar
                // For this refactor, we will rely on the main loop calling this and handling the result
                addLog(`${hero.name} uses Strong Attack! (Gambit)`, 'damage');
            }
            break;

        case 'use_potion':
            addLog(`${hero.name} uses a Potion!`, 'heal');
            break;

        case 'revive':
            if (deadAlly) {
                addLog(`${hero.name} revives ${deadAlly.name}!`, 'heal');
                // Logic to actually revive handled in main loop?
            }
            break;

        default:
            // Default attack handled by main loop
            break;
    }
};
