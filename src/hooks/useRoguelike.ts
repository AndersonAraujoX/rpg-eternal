import { useState } from 'react';
import type { 
    RoguelikeClass, RoguelikeRunState, RoguelikeNode, RoguelikeUpgrade, RoguelikeRelic,
    PlanetaryBiome, PlanetaryExpedition
} from '../engine/roguelike';
import { 
    ROGUELIKE_UPGRADES, RELICS_POOL, generateRoguelikeNodes, getStartingHero, 
    getRandomRelic, getEnemyForNode, EVENTS_POOL,
    generatePlanetaryNodes, getPlanetaryEnemyForNode, getPlanetaryEvent,
    getGalaxyBonusForRoguelike
} from '../engine/roguelike';

export function useRoguelike() {
    const [emberFragments, setEmberFragments] = useState<number>(0);
    const [roguelikeUpgrades, setRoguelikeUpgrades] = useState<Record<string, number>>({});
    const [roguelikeRun, setRoguelikeRun] = useState<RoguelikeRunState>({
        hero: null,
        nodes: [],
        currentNodeIndex: -1,
        gold: 0,
        relics: [],
        combatState: null,
        eventState: null,
        status: 'none',
        planetaryExpedition: null
    });

    const startRoguelikeRun = (classType: RoguelikeClass, unlockedPerks: string[] = []) => {
        const hero = getStartingHero(classType, roguelikeUpgrades);
        const nodes = generateRoguelikeNodes();
        
        let startGold = 10;
        if (unlockedPerks.includes('rift_perk_gold')) {
            startGold += 20;
        }
        if (unlockedPerks.includes('rift_perk_speed')) {
            hero.speed += 3;
        }
        if (unlockedPerks.includes('rift_perk_shield')) {
            hero.maxHp += 15;
            hero.hp += 15;
        }

        setRoguelikeRun({
            hero,
            nodes,
            currentNodeIndex: -1,
            gold: startGold,
            relics: [],
            combatState: null,
            eventState: null,
            status: 'exploring',
            planetaryExpedition: null
        });
    };

    const startPlanetaryRun = (
        classType: RoguelikeClass,
        sectorId: string,
        sectorName: string,
        biome: PlanetaryBiome,
        sectorLevel: number,
        galaxySectors: { type: string; isOwned: boolean }[],
        unlockedPerks: string[] = []
    ) => {
        const galaxyBonus = getGalaxyBonusForRoguelike(galaxySectors);
        const hero = getStartingHero(classType, roguelikeUpgrades);
        // Apply galaxy bonuses
        hero.maxHp += galaxyBonus.bonusHp;
        hero.hp += galaxyBonus.bonusHp;
        hero.attack += galaxyBonus.bonusAtk;
        hero.magic += galaxyBonus.bonusMag;
        hero.defense += galaxyBonus.bonusDef;

        let startGold = 10;
        if (unlockedPerks.includes('rift_perk_gold')) {
            startGold += 20;
        }
        if (unlockedPerks.includes('rift_perk_speed')) {
            hero.speed += 3;
        }
        if (unlockedPerks.includes('rift_perk_shield')) {
            hero.maxHp += 15;
            hero.hp += 15;
        }

        const nodes = generatePlanetaryNodes(sectorLevel, biome);
        const expedition: PlanetaryExpedition = { sectorId, sectorName, biome, sectorLevel };

        setRoguelikeRun({
            hero,
            nodes,
            currentNodeIndex: -1,
            gold: startGold,
            relics: [],
            combatState: null,
            eventState: null,
            status: 'exploring',
            planetaryExpedition: expedition
        });
    };

    const preparePlanetaryRun = (
        sectorId: string,
        sectorName: string,
        biome: PlanetaryBiome,
        sectorLevel: number
    ) => {
        setRoguelikeRun({
            hero: null,
            nodes: [],
            currentNodeIndex: -1,
            gold: 0,
            relics: [],
            combatState: null,
            eventState: null,
            status: 'none',
            planetaryExpedition: { sectorId, sectorName, biome, sectorLevel }
        });
    };

    const clearPlanetaryExpedition = () => {
        setRoguelikeRun(prev => {
            if (prev.status === 'none') {
                return { ...prev, planetaryExpedition: null };
            }
            return prev;
        });
    };

    const selectNode = (index: number) => {
        if (roguelikeRun.status !== 'exploring') return;
        if (index !== roguelikeRun.currentNodeIndex + 1) return;

        const nextNode = roguelikeRun.nodes[index];
        if (!nextNode) return;

        let nextStatus: RoguelikeRunState['status'] = roguelikeRun.status;
        let combatState = null;
        let eventState = null;
        const updatedHero = roguelikeRun.hero ? { ...roguelikeRun.hero } : null;
        const updatedRelics = [...roguelikeRun.relics];
        const updatedGold = roguelikeRun.gold;

        if (nextNode.type === 'combat' || nextNode.type === 'elite' || nextNode.type === 'boss') {
            nextStatus = 'combat';
            // Use planetary enemies if in a planetary expedition
            const expedition = roguelikeRun.planetaryExpedition;
            const enemy = expedition
                ? getPlanetaryEnemyForNode(nextNode.type, index, expedition.biome, expedition.sectorLevel)
                : getEnemyForNode(nextNode.type, index);
            combatState = {
                enemy,
                playerTurn: true,
                shield: 0,
                enemyShield: 0,
                log: [`Você encontrou um ${enemy.name}! Que a batalha comece.`]
            };
        } else if (nextNode.type === 'event') {
            nextStatus = 'event';
            const expedition = roguelikeRun.planetaryExpedition;
            const randomEvent = expedition
                ? getPlanetaryEvent(expedition.biome)
                : EVENTS_POOL[Math.floor(Math.random() * EVENTS_POOL.length)];
            eventState = {
                title: randomEvent.title,
                description: randomEvent.description,
                options: randomEvent.options
            };
        } else if (nextNode.type === 'rest') {
            nextStatus = 'rest';
        } else if (nextNode.type === 'treasure') {
            nextStatus = 'exploring';
            const relic = getRandomRelic();
            updatedRelics.push(relic);
            // Life ring effect
            if (relic.id === 'life_ring' && updatedHero) {
                updatedHero.maxHp += 15;
                updatedHero.hp += 15;
            }
            // Mark resolved
            const updatedNodes = roguelikeRun.nodes.map((n, idx) => idx === index ? { ...n, resolved: true } : n);
            setRoguelikeRun(prev => ({
                ...prev,
                nodes: updatedNodes,
                currentNodeIndex: index,
                relics: updatedRelics,
                hero: updatedHero,
                status: 'exploring'
            }));
            return;
        }

        setRoguelikeRun(prev => ({
            ...prev,
            currentNodeIndex: index,
            status: nextStatus,
            combatState,
            eventState
        }));
    };

    const performCombatAction = (action: 'attack' | 'skill' | 'defend' | 'flee') => {
        const { hero, combatState, currentNodeIndex, relics, gold } = roguelikeRun;
        if (!hero || !combatState) return;

        if (action === 'flee') {
            setRoguelikeRun(prev => ({
                ...prev,
                status: 'defeat',
                combatState: null
            }));
            return;
        }

        let playerHp = hero.hp;
        let playerMp = hero.mp;
        let playerShield = combatState.shield;
        let enemyHp = combatState.enemy.hp;
        const enemyShield = combatState.enemyShield;
        const newLog = [...combatState.log];

        // Apply Relic Bonuses to Attack / Defense / Magic
        const atkBonus = relics.some(r => r.id === 'rusty_sword') ? 3 : 0;
        const defBonus = relics.some(r => r.id === 'iron_shield') ? 3 : 0;
        const magBonus = relics.some(r => r.id === 'magic_wand') ? 4 : 0;

        const effectiveAttack = hero.attack + atkBonus;
        const effectiveDefense = hero.defense + defBonus;
        const effectiveMagic = hero.magic + magBonus;

        // Calculate Critical Strike Chance
        const critStrikeLvl = roguelikeUpgrades['crit_strike'] || 0;
        let critChance = 0.10 + (critStrikeLvl * 0.05);
        if (relics.some(r => r.id === 'clover')) critChance += 0.15;
        if (hero.classType === 'rogue') critChance += 0.15;

        // Player turn
        if (action === 'attack') {
            const rawDmg = effectiveAttack;
            const isCrit = Math.random() < critChance;
            let finalDmg = Math.max(1, rawDmg - combatState.enemy.defense);
            if (isCrit) {
                finalDmg = Math.floor(finalDmg * 1.5);
            }
            enemyHp = Math.max(0, enemyHp - finalDmg);
            newLog.push(`Você atacou o ${combatState.enemy.name} causando ${finalDmg} de dano.${isCrit ? ' 💥 CRÍTICO!' : ''}`);
        } else if (action === 'defend') {
            const shieldGain = Math.floor(effectiveDefense * 2.0);
            playerShield += shieldGain;
            newLog.push(`Você ergueu sua defesa e ganhou ${shieldGain} de Escudo.`);
        } else if (action === 'skill') {
            if (hero.classType === 'mage') {
                if (playerMp >= 12) {
                    playerMp -= 12;
                    const isCrit = Math.random() < critChance;
                    let finalDmg = Math.max(5, Math.floor(effectiveMagic * 2.2));
                    if (isCrit) finalDmg = Math.floor(finalDmg * 1.5);
                    enemyHp = Math.max(0, enemyHp - finalDmg);
                    newLog.push(`Você lançou Bola de Fogo causando ${finalDmg} de dano elemental (-12 MP).${isCrit ? ' 💥 CRÍTICO!' : ''}`);
                } else {
                    newLog.push(`Mana insuficiente para lançar magia!`);
                    return;
                }
            } else if (hero.classType === 'warrior') {
                if (playerMp >= 8) {
                    playerMp -= 8;
                    const isCrit = Math.random() < critChance;
                    let finalDmg = Math.max(3, Math.floor(effectiveAttack * 1.6));
                    if (isCrit) finalDmg = Math.floor(finalDmg * 1.5);
                    enemyHp = Math.max(0, enemyHp - finalDmg);
                    newLog.push(`Você usou Golpe Trespassante causando ${finalDmg} de dano (-8 MP).${isCrit ? ' 💥 CRÍTICO!' : ''}`);
                } else {
                    newLog.push(`Falta de foco (MP insuficiente) para técnica!`);
                    return;
                }
            } else if (hero.classType === 'ranger') {
                if (playerMp >= 10) {
                    playerMp -= 10;
                    const isCrit = Math.random() < critChance;
                    let finalDmg = Math.max(2, Math.floor(effectiveAttack * 1.3));
                    if (isCrit) finalDmg = Math.floor(finalDmg * 1.5);
                    playerShield += Math.floor(hero.speed * 0.8);
                    enemyHp = Math.max(0, enemyHp - finalDmg);
                    newLog.push(`Você usou Disparo Rápido causando ${finalDmg} de dano e ganhou escudo (-10 MP).${isCrit ? ' 💥 CRÍTICO!' : ''}`);
                } else {
                    newLog.push(`Foco insuficiente (MP) para disparo!`);
                    return;
                }
            } else if (hero.classType === 'rogue') {
                if (playerMp >= 10) {
                    playerMp -= 10;
                    const skillCritChance = critChance + 0.25;
                    const isCrit = Math.random() < skillCritChance;
                    let finalDmg = Math.max(4, Math.floor(effectiveAttack * 1.5));
                    if (isCrit) finalDmg = Math.floor(finalDmg * 1.5);
                    enemyHp = Math.max(0, enemyHp - finalDmg);
                    newLog.push(`Você usou Apunhalada pelas Costas causando ${finalDmg} de dano (-10 MP).${isCrit ? ' 💥 CRÍTICO!' : ''}`);
                } else {
                    newLog.push(`Falta de energia (MP insuficiente) para apunhalar!`);
                    return;
                }
            }
        }

        // Check if enemy dead
        if (enemyHp <= 0) {
            const hasGoldenCoin = relics.some(r => r.id === 'golden_coin');
            const luckyCharmLvl = roguelikeUpgrades['lucky_charm'] || 0;
            const goldMult = 1 + (luckyCharmLvl * 0.2);

            const isElite = roguelikeRun.nodes[currentNodeIndex].type === 'elite';
            const isBoss = roguelikeRun.nodes[currentNodeIndex].type === 'boss';

            const baseGold = isBoss ? 35 : isElite ? 18 : 8;
            const goldGain = Math.floor((baseGold + (hasGoldenCoin ? 2 : 0)) * goldMult);
            
            const fragmentGain = isBoss ? 15 : isElite ? 4 : 1;

            setEmberFragments(prev => prev + fragmentGain);
            
            const nextNodes = roguelikeRun.nodes.map((n, idx) => idx === currentNodeIndex ? { ...n, resolved: true } : n);
            const isLastNode = currentNodeIndex === roguelikeRun.nodes.length - 1;

            setRoguelikeRun(prev => ({
                ...prev,
                hero: prev.hero ? { ...prev.hero, hp: playerHp, mp: playerMp } : null,
                gold: gold + goldGain,
                nodes: nextNodes,
                combatState: null,
                status: isLastNode ? 'victory' : 'exploring'
            }));

            if (isLastNode) {
                // Defeated Boss: extra Fragments
                setEmberFragments(prev => prev + 10);
            }
            return;
        }

        // Calculate Dodge (Esquiva) Chance
        const dodgeChance = Math.min(0.40, (hero.speed / 100)) + (relics.some(r => r.id === 'ninja_hood') ? 0.10 : 0);
        const isDodged = Math.random() < dodgeChance;

        // Enemy turn
        const rawEnemyDmg = combatState.enemy.attack;
        let finalEnemyDmg = Math.max(1, rawEnemyDmg - effectiveDefense);
        
        if (isDodged) {
            newLog.push(`💨 Você esquivou habilidosamente do ataque do ${combatState.enemy.name}! (0 Dano tomado)`);
            finalEnemyDmg = 0;
        } else {
            if (playerShield > 0) {
                if (playerShield >= finalEnemyDmg) {
                    playerShield -= finalEnemyDmg;
                    newLog.push(`O ${combatState.enemy.name} atacou, mas seu Escudo absorveu todo o dano.`);
                    finalEnemyDmg = 0;
                } else {
                    finalEnemyDmg -= playerShield;
                    playerShield = 0;
                    newLog.push(`O ${combatState.enemy.name} atacou, quebrando seu Escudo.`);
                }
            }

            if (finalEnemyDmg > 0) {
                playerHp = Math.max(0, playerHp - finalEnemyDmg);
                newLog.push(`O ${combatState.enemy.name} atacou causando ${finalEnemyDmg} de dano.`);
            }
        }

        // Check if player dead
        if (playerHp <= 0) {
            const hasPhoenix = relics.find(r => r.id === 'phoenix_feather');
            if (hasPhoenix) {
                playerHp = Math.floor(hero.maxHp * 0.3);
                const updatedRelics = relics.filter(r => r.id !== 'phoenix_feather');
                newLog.push(`🔥 A Pena de Fênix brilhou intensamente! Você reviveu com ${playerHp} HP!`);
                setRoguelikeRun(prev => ({
                    ...prev,
                    relics: updatedRelics,
                    hero: prev.hero ? { ...prev.hero, hp: playerHp, mp: playerMp } : null,
                    combatState: {
                        ...combatState,
                        shield: playerShield,
                        enemy: { ...combatState.enemy, hp: enemyHp },
                        log: newLog
                    }
                }));
            } else {
                setRoguelikeRun(prev => ({
                    ...prev,
                    hero: prev.hero ? { ...prev.hero, hp: 0 } : null,
                    combatState: null,
                    status: 'defeat'
                }));
            }
            return;
        }

        // Regenerate small amount of MP (with mana_stone check)
        const hasManaStone = relics.some(r => r.id === 'mana_stone');
        playerMp = Math.min(hero.maxMp, playerMp + 2 + (hasManaStone ? 3 : 0));

        setRoguelikeRun(prev => ({
            ...prev,
            hero: prev.hero ? { ...prev.hero, hp: playerHp, mp: playerMp } : null,
            combatState: {
                ...combatState,
                shield: playerShield,
                enemy: { ...combatState.enemy, hp: enemyHp },
                log: newLog
            }
        }));
    };

    const resolveRest = (action: 'heal' | 'sharpen' | 'meditate') => {
        const { hero, currentNodeIndex } = roguelikeRun;
        if (!hero) return;

        const updatedHero = { ...hero };
        if (action === 'heal') {
            const amount = Math.floor(hero.maxHp * 0.4);
            updatedHero.hp = Math.min(hero.maxHp, hero.hp + amount);
        } else if (action === 'sharpen') {
            updatedHero.attack += 2;
        } else if (action === 'meditate') {
            updatedHero.magic += 2;
            updatedHero.mp = hero.maxMp;
        }

        const nextNodes = roguelikeRun.nodes.map((n, idx) => idx === currentNodeIndex ? { ...n, resolved: true } : n);
        
        setRoguelikeRun(prev => ({
            ...prev,
            hero: updatedHero,
            nodes: nextNodes,
            status: 'exploring'
        }));
    };

    const resolveEventOption = (optionIndex: number) => {
        const { hero, eventState, relics, gold, currentNodeIndex } = roguelikeRun;
        if (!hero || !eventState) return;

        const option = eventState.options[optionIndex];
        if (!option) return;

        const updatedHero = { ...hero };
        const updatedRelics = [...relics];
        let updatedGold = gold;
        let runStatus: RoguelikeRunState['status'] = 'exploring';

        if (option.effect === 'heal') {
            updatedHero.hp = Math.min(hero.maxHp, hero.hp + 20);
        } else if (option.effect === 'gain_relic') {
            updatedRelics.push(getRandomRelic());
        } else if (option.effect === 'lose_hp_gain_relic') {
            updatedHero.hp -= 15;
            if (updatedHero.hp <= 0) {
                runStatus = 'defeat';
            } else {
                updatedRelics.push(getRandomRelic());
            }
        } else if (option.effect === 'gain_gold') {
            updatedGold += 15;
        } else if (option.effect === 'lose_gold_gain_relic') {
            if (updatedGold >= 15) {
                updatedGold -= 15;
                updatedRelics.push(getRandomRelic());
            }
        }

        const nextNodes = roguelikeRun.nodes.map((n, idx) => idx === currentNodeIndex ? { ...n, resolved: true } : n);

        setRoguelikeRun(prev => ({
            ...prev,
            hero: runStatus === 'defeat' ? null : updatedHero,
            relics: updatedRelics,
            gold: updatedGold,
            nodes: nextNodes,
            eventState: null,
            status: runStatus
        }));
    };

    const buyRoguelikeUpgrade = (id: string) => {
        const upgradeDef = ROGUELIKE_UPGRADES.find(u => u.id === id);
        if (!upgradeDef) return;

        const currentLvl = roguelikeUpgrades[id] || 0;
        if (currentLvl >= upgradeDef.maxLevel) return;

        const cost = Math.floor(upgradeDef.baseCost * Math.pow(upgradeDef.costScaling, currentLvl));
        if (emberFragments >= cost) {
            setEmberFragments(prev => prev - cost);
            setRoguelikeUpgrades(prev => ({
                ...prev,
                [id]: currentLvl + 1
            }));
        }
    };

    const abandonRoguelikeRun = () => {
        setRoguelikeRun({
            hero: null,
            nodes: [],
            currentNodeIndex: -1,
            gold: 0,
            relics: [],
            combatState: null,
            eventState: null,
            status: 'none',
            planetaryExpedition: null
        });
    };

    return {
        emberFragments,
        setEmberFragments,
        roguelikeUpgrades,
        setRoguelikeUpgrades,
        roguelikeRun,
        startRoguelikeRun,
        startPlanetaryRun,
        preparePlanetaryRun,
        clearPlanetaryExpedition,
        selectNode,
        performCombatAction,
        resolveRest,
        resolveEventOption,
        buyRoguelikeUpgrade,
        abandonRoguelikeRun
    };
}
