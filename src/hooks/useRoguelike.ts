import { useState } from 'react';
import { 
    RoguelikeClass, RoguelikeRunState, RoguelikeNode, RoguelikeUpgrade, 
    ROGUELIKE_UPGRADES, RELICS_POOL, generateRoguelikeNodes, getStartingHero, 
    getRandomRelic, getEnemyForNode, EVENTS_POOL, RoguelikeRelic 
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
        status: 'none'
    });

    const startRoguelikeRun = (classType: RoguelikeClass) => {
        const hero = getStartingHero(classType, roguelikeUpgrades);
        const nodes = generateRoguelikeNodes();
        setRoguelikeRun({
            hero,
            nodes,
            currentNodeIndex: -1,
            gold: 10,
            relics: [],
            combatState: null,
            eventState: null,
            status: 'exploring'
        });
    };

    const selectNode = (index: number) => {
        if (roguelikeRun.status !== 'exploring') return;
        if (index !== roguelikeRun.currentNodeIndex + 1) return;

        const nextNode = roguelikeRun.nodes[index];
        if (!nextNode) return;

        let nextStatus = roguelikeRun.status;
        let combatState = null;
        let eventState = null;
        let updatedHero = roguelikeRun.hero ? { ...roguelikeRun.hero } : null;
        let updatedRelics = [...roguelikeRun.relics];
        let updatedGold = roguelikeRun.gold;

        if (nextNode.type === 'combat' || nextNode.type === 'elite' || nextNode.type === 'boss') {
            nextStatus = 'combat';
            const enemy = getEnemyForNode(nextNode.type, index);
            combatState = {
                enemy,
                playerTurn: true,
                shield: 0,
                enemyShield: 0,
                log: [`Você encontrou um ${enemy.name}! Que a batalha comece.`]
            };
        } else if (nextNode.type === 'event') {
            nextStatus = 'event';
            const randomEvent = EVENTS_POOL[Math.floor(Math.random() * EVENTS_POOL.length)];
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
        let enemyShield = combatState.enemyShield;
        const newLog = [...combatState.log];

        // Apply Relic Bonuses to Attack / Defense / Magic
        let atkBonus = relics.some(r => r.id === 'rusty_sword') ? 3 : 0;
        let defBonus = relics.some(r => r.id === 'iron_shield') ? 3 : 0;
        let magBonus = relics.some(r => r.id === 'magic_wand') ? 4 : 0;

        const effectiveAttack = hero.attack + atkBonus;
        const effectiveDefense = hero.defense + defBonus;
        const effectiveMagic = hero.magic + magBonus;

        // Player turn
        if (action === 'attack') {
            const rawDmg = effectiveAttack;
            const finalDmg = Math.max(1, rawDmg - combatState.enemy.defense);
            enemyHp = Math.max(0, enemyHp - finalDmg);
            newLog.push(`Você atacou o ${combatState.enemy.name} causando ${finalDmg} de dano.`);
        } else if (action === 'defend') {
            const shieldGain = Math.floor(effectiveDefense * 2.0);
            playerShield += shieldGain;
            newLog.push(`Você ergueu sua defesa e ganhou ${shieldGain} de Escudo.`);
        } else if (action === 'skill') {
            if (hero.classType === 'mage') {
                if (playerMp >= 12) {
                    playerMp -= 12;
                    const finalDmg = Math.max(5, Math.floor(effectiveMagic * 2.2));
                    enemyHp = Math.max(0, enemyHp - finalDmg);
                    newLog.push(`Você lançou Bola de Fogo causando ${finalDmg} de dano elemental (-12 MP).`);
                } else {
                    newLog.push(`Mana insuficiente para lançar magia!`);
                    return;
                }
            } else if (hero.classType === 'warrior') {
                if (playerMp >= 8) {
                    playerMp -= 8;
                    const finalDmg = Math.max(3, Math.floor(effectiveAttack * 1.6));
                    enemyHp = Math.max(0, enemyHp - finalDmg);
                    newLog.push(`Você usou Golpe Trespassante causando ${finalDmg} de dano (-8 MP).`);
                } else {
                    newLog.push(`Falta de foco (MP insuficiente) para técnica!`);
                    return;
                }
            } else if (hero.classType === 'ranger') {
                if (playerMp >= 10) {
                    playerMp -= 10;
                    const finalDmg = Math.max(2, Math.floor(effectiveAttack * 1.3));
                    playerShield += Math.floor(hero.speed * 0.8);
                    enemyHp = Math.max(0, enemyHp - finalDmg);
                    newLog.push(`Você usou Disparo Rápido causando ${finalDmg} de dano e ganhou escudo (-10 MP).`);
                } else {
                    newLog.push(`Foco insuficiente (MP) para disparo!`);
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

        // Enemy turn
        const rawEnemyDmg = combatState.enemy.attack;
        let finalEnemyDmg = Math.max(1, rawEnemyDmg - effectiveDefense);
        
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

        // Regenerate small amount of MP
        playerMp = Math.min(hero.maxMp, playerMp + 2);

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

        let updatedHero = { ...hero };
        let updatedRelics = [...relics];
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
            status: 'none'
        });
    };

    return {
        emberFragments,
        setEmberFragments,
        roguelikeUpgrades,
        setRoguelikeUpgrades,
        roguelikeRun,
        startRoguelikeRun,
        selectNode,
        performCombatAction,
        resolveRest,
        resolveEventOption,
        buyRoguelikeUpgrade,
        abandonRoguelikeRun
    };
}
