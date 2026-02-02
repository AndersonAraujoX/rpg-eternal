import type { Hero, Boss, Gambit, LogEntry } from './types';
import type { WeatherType } from './weather';

export const evaluateGambit = (hero: Hero, gambit: Gambit, enemies: Boss[], allies: Hero[], weather?: WeatherType): boolean => {
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
        case 'enemy_fire':
            return enemies.some(e => e.element === 'fire');
        case 'enemy_water':
            return enemies.some(e => e.element === 'water');
        case 'enemy_nature':
            return enemies.some(e => e.element === 'nature');
        case 'enemy_dark':
            return enemies.some(e => e.element === 'dark');
        case 'enemy_light':
            return enemies.some(e => e.element === 'light');
        case 'weather_rain':
            return weather === 'Rain';
        case 'weather_blizzard':
            return weather === 'Blizzard';
        case 'weather_sandstorm':
            return weather === 'Sandstorm';
        case 'weather_eclipse':
            return weather === 'Eclipse';
        case 'weather_aurora':
            return weather === 'Aurora';
        case 'party_full':
            return allies.filter(a => !a.isDead).length >= 4;
        case 'party_low_hp':
            return allies.filter(a => !a.isDead && (a.stats.hp / a.stats.maxHp) < 0.3).length >= 2;
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
            const healAmount = hero.stats.magic * 2;
            weakAlly.stats.hp = Math.min(weakAlly.stats.maxHp, weakAlly.stats.hp + healAmount);
            addLog(`${hero.name} heals ${weakAlly.name} for ${Math.floor(healAmount)}`, 'heal');
            break;
        }

        case 'strong_attack':
            if (targetEnemy && hero.stats.mp >= 10) {
                addLog(`${hero.name} uses Strong Attack!`, 'damage');
            }
            break;
        case 'aoe_attack':
            if (hero.stats.mp >= 20) {
                addLog(`${hero.name} unleashes an AOE attack!`, 'damage');
            }
            break;
        case 'buff_atk':
            addLog(`${hero.name} buffs party attack!`, 'action');
            break;
        case 'buff_def':
            addLog(`${hero.name} buffs party defense!`, 'action');
            break;
        case 'use_potion':
            addLog(`${hero.name} uses a Potion!`, 'heal');
            break;

        case 'revive':
            if (deadAlly) {
                addLog(`${hero.name} revives ${deadAlly.name}!`, 'heal');
            }
            break;

        default:
            break;
    }
};
