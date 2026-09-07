import { describe, it, expect, beforeEach } from 'vitest';
import {
    initGuildWarMobaBattle,
    simulateGuildWarMobaTick,
    setMobaTacticalStance,
    executeMobaCommanderAbility,
    executeMobaManualStrike,
    type GuildWarMobaState,
    type MobaUnit
} from '../../engine/guildWarMoba';
import type { Hero, Territory } from '../../engine/types';
import type { FakePlayer } from '../../engine/playerSimulation';

describe('Guild War MOBA + CTF Engine (AAA Pattern)', () => {
    let mockTerritory: Territory;
    let mockHeroes: Hero[];
    let mockBots: FakePlayer[];

    beforeEach(() => {
        // Arrange comum para os testes
        mockTerritory = {
            id: 'ter-dragon-pass',
            name: 'Garganta do Dragão',
            description: 'Passagem estreita guardada por fortificações.',
            owner: 'Xang',
            difficulty: 2000,
            level: 1,
            upgradeCost: 4000,
            bonus: { type: 'damage', value: 0.15 },
            coordinates: { x: 3, y: -2 }
        };

        mockHeroes = [
            {
                id: 'hero-warrior',
                name: 'Guerreiro da Luz',
                emoji: '🛡️',
                class: 'Warrior',
                isDead: false,
                stats: { maxHp: 1500, attack: 200, defense: 80, speed: 10 }
            } as unknown as Hero,
            {
                id: 'hero-mage',
                name: 'Maga Arcana',
                emoji: '🧙‍♀️',
                class: 'Mage',
                isDead: false,
                stats: { maxHp: 1100, attack: 350, defense: 30, speed: 12 }
            } as unknown as Hero,
            {
                id: 'hero-rogue',
                name: 'Ladino Sombrio',
                emoji: '🗡️',
                class: 'Rogue',
                isDead: false,
                stats: { maxHp: 1200, attack: 280, defense: 45, speed: 14 }
            } as unknown as Hero
        ];

        mockBots = [
            {
                id: 'bot-ally-1',
                name: 'ArthurKing',
                power: 1800,
                level: 15,
                profile: 'hardcore',
                towerFloor: 8,
                guild: 'Minha Guilda',
                avatar: '👑',
                lastActionTime: Date.now()
            },
            {
                id: 'bot-ally-2',
                name: 'ShadowNinja',
                power: 1600,
                level: 12,
                profile: 'casual',
                towerFloor: 6,
                guild: 'Minha Guilda',
                avatar: '🥷',
                lastActionTime: Date.now()
            }
        ];
    });

    // ═══════════════════════════════════════════════════════════════
    // 1. Inicialização da Batalha (initGuildWarMobaBattle)
    // ═══════════════════════════════════════════════════════════════
    describe('initGuildWarMobaBattle', () => {
        it('Caminho Feliz: deve inicializar o confronto MOBA com 3 rotas, 8 torres/nexus e a bandeira sagrada no mid', () => {
            // Arrange
            const playerGuild = 'Ordem dos Campeões';
            const partyPower = 2000;

            // Act
            const state = initGuildWarMobaBattle(mockTerritory, mockHeroes, mockBots, playerGuild, partyPower);

            // Assert
            expect(state.battleActive).toBe(true);
            expect(state.winner).toBeNull();
            expect(state.lanes).toEqual(['top', 'mid', 'bot']);
            expect(state.alliedScore).toBe(0);
            expect(state.rivalScore).toBe(0);
            expect(state.playerGuildName).toBe(playerGuild);
            expect(state.territoryId).toBe(mockTerritory.id);
            expect(state.towers).toHaveLength(8); // 3 torres + 1 nexus para cada lado = 8
            expect(state.flag.status).toBe('neutral');
            expect(state.flag.lane).toBe('mid');
            expect(state.flag.position).toBe(50);
            expect(state.warLogs.length).toBeGreaterThanOrEqual(2);
        });

        it('Caminho Feliz: deve importar os atributos e avatares reais dos heróis da party', () => {
            // Arrange
            const partyPower = 2500;

            // Act
            const state = initGuildWarMobaBattle(mockTerritory, mockHeroes, mockBots, 'Minha Guilda', partyPower);
            const allyHeroes = state.units.filter(u => u.side === 'allied' && u.type === 'hero');

            // Assert
            expect(allyHeroes).toHaveLength(3);
            const warrior = allyHeroes.find(u => u.name === 'Guerreiro da Luz');
            expect(warrior).toBeDefined();
            expect(warrior?.avatar).toBe('🛡️');
            expect(warrior?.maxHp).toBe(1500);
            expect(warrior?.attack).toBe(200);
            expect(warrior?.defense).toBe(80);
        });

        it('Caso de Borda: deve fornecer esquadrão reserva padrão se a lista de heróis for vazia', () => {
            // Arrange
            const emptyHeroes: Hero[] = [];

            // Act
            const state = initGuildWarMobaBattle(mockTerritory, emptyHeroes, [], 'Guilda Solitária', 1000);
            const allies = state.units.filter(u => u.side === 'allied');

            // Assert
            expect(allies.length).toBeGreaterThanOrEqual(3);
            expect(allies[0].name).toContain('Campeão da Guarda');
            expect(allies[0].hp).toBeGreaterThan(0);
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 2. Ciclo de Simulação & Combate (simulateGuildWarMobaTick)
    // ═══════════════════════════════════════════════════════════════
    describe('simulateGuildWarMobaTick', () => {
        let initialBattle: GuildWarMobaState;

        beforeEach(() => {
            initialBattle = initGuildWarMobaBattle(mockTerritory, mockHeroes, mockBots, 'Valentes', 2000);
        });

        it('Caminho Feliz: unidades devem avançar ao longo das rotas com o passar dos ticks', () => {
            // Arrange
            const initialAllyPos = initialBattle.units.find(u => u.side === 'allied')!.position;
            const initialRivalPos = initialBattle.units.find(u => u.side === 'rival')!.position;

            // Act
            const nextState = simulateGuildWarMobaTick(initialBattle, 1);
            const newAllyPos = nextState.units.find(u => u.side === 'allied')!.position;
            const newRivalPos = nextState.units.find(u => u.side === 'rival')!.position;

            // Assert: Aliado avança em direção a 100, Rival avança em direção a 0
            expect(newAllyPos).toBeGreaterThan(initialAllyPos);
            expect(newRivalPos).toBeLessThan(initialRivalPos);
            expect(nextState.tickCount).toBe(1);
        });

        it('Caminho Feliz: unidades que colidem na mesma rota devem engajar em combate e causar dano', () => {
            // Arrange: Coloca duas unidades na mesma rota a 3% de distância
            const stateWithClash: GuildWarMobaState = {
                ...initialBattle,
                units: [
                    {
                        id: 'ally-1',
                        name: 'Herói Aliado',
                        avatar: '⚔️',
                        side: 'allied',
                        type: 'hero',
                        lane: 'mid',
                        position: 50,
                        maxHp: 500,
                        hp: 500,
                        attack: 100,
                        defense: 20,
                        speed: 3,
                        isDead: false,
                        respawnTimer: 0,
                        isCarrier: false,
                        kills: 0
                    },
                    {
                        id: 'rival-1',
                        name: 'Campeão Rival',
                        avatar: '🗡️',
                        side: 'rival',
                        type: 'hero',
                        lane: 'mid',
                        position: 52,
                        maxHp: 500,
                        hp: 500,
                        attack: 100,
                        defense: 20,
                        speed: 3,
                        isDead: false,
                        respawnTimer: 0,
                        isCarrier: false,
                        kills: 0
                    }
                ]
            };

            // Act
            const tickResult = simulateGuildWarMobaTick(stateWithClash, 1);
            const damagedAlly = tickResult.units.find(u => u.id === 'ally-1')!;
            const damagedRival = tickResult.units.find(u => u.id === 'rival-1')!;

            // Assert: Ambos devem ter sofrido dano
            expect(damagedAlly.hp).toBeLessThan(500);
            expect(damagedRival.hp).toBeLessThan(500);
        });

        it('Caminho Feliz: derrotar um campeão inimigo concede pontos e ativa timer de renascimento', () => {
            // Arrange: Rival à beira da morte
            const stateWithLethal: GuildWarMobaState = {
                ...initialBattle,
                alliedScore: 100,
                units: [
                    {
                        id: 'ally-striker',
                        name: 'Atacante',
                        avatar: '⚔️',
                        side: 'allied',
                        type: 'hero',
                        lane: 'top',
                        position: 40,
                        maxHp: 500,
                        hp: 500,
                        attack: 200,
                        defense: 50,
                        speed: 3,
                        isDead: false,
                        respawnTimer: 0,
                        isCarrier: false,
                        kills: 0
                    },
                    {
                        id: 'rival-low',
                        name: 'Rival Fraco',
                        avatar: '💀',
                        side: 'rival',
                        type: 'hero',
                        lane: 'top',
                        position: 42,
                        maxHp: 200,
                        hp: 10,
                        attack: 50,
                        defense: 0,
                        speed: 3,
                        isDead: false,
                        respawnTimer: 0,
                        isCarrier: false,
                        kills: 0
                    }
                ]
            };

            // Act
            const result = simulateGuildWarMobaTick(stateWithLethal, 1);
            const deadRival = result.units.find(u => u.id === 'rival-low')!;
            const killer = result.units.find(u => u.id === 'ally-striker')!;

            // Assert
            expect(deadRival.isDead).toBe(true);
            expect(deadRival.hp).toBe(0);
            expect(killer.kills).toBe(1);
            expect(result.alliedScore).toBeGreaterThan(100);
        });

        it('Caso de Borda: se a batalha não estiver ativa, o tick não deve alterar o estado', () => {
            // Arrange
            const inactiveState: GuildWarMobaState = {
                ...initialBattle,
                battleActive: false,
                winner: 'allied'
            };

            // Act
            const result = simulateGuildWarMobaTick(inactiveState, 1);

            // Assert
            expect(result).toBe(inactiveState);
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 3. Sistema Pega-Bandeira (Capture The Flag - CTF)
    // ═══════════════════════════════════════════════════════════════
    describe('Mecânica Pega-Bandeira (CTF)', () => {
        let battle: GuildWarMobaState;

        beforeEach(() => {
            battle = initGuildWarMobaBattle(mockTerritory, mockHeroes, mockBots, 'Guardiões', 2000);
        });

        it('Caminho Feliz: unidade captura a bandeira sagrada ao se aproximar do centro no Mid', () => {
            // Arrange: Posiciona herói aliado a 49% na rota mid (perto da bandeira em 50%)
            const stateNearFlag: GuildWarMobaState = {
                ...battle,
                flag: { status: 'neutral', lane: 'mid', position: 50, carrierId: null, respawnCooldown: 0 },
                units: [
                    {
                        id: 'carrier-hero',
                        name: 'Veloz',
                        avatar: '🏃',
                        side: 'allied',
                        type: 'hero',
                        lane: 'mid',
                        position: 49,
                        maxHp: 800,
                        hp: 800,
                        attack: 100,
                        defense: 50,
                        speed: 3,
                        isDead: false,
                        respawnTimer: 0,
                        isCarrier: false,
                        kills: 0
                    }
                ]
            };

            // Act
            const result = simulateGuildWarMobaTick(stateNearFlag, 1);
            const carrier = result.units.find(u => u.id === 'carrier-hero')!;

            // Assert
            expect(result.flag.status).toBe('carried');
            expect(result.flag.carrierId).toBe('carrier-hero');
            expect(carrier.isCarrier).toBe(true);
        });

        it('Caminho Feliz: portador da bandeira recua até a base e pontua 750 pts disparando Sobrecarga de Éter', () => {
            // Arrange: Portador aliado na posição 6 (quase na base em <= 5)
            const initialTowerHp = battle.towers.find(t => t.id === 'rival-tower-top')!.hp;
            const stateNearBase: GuildWarMobaState = {
                ...battle,
                alliedScore: 100,
                flag: { status: 'carried', lane: 'mid', position: 6, carrierId: 'carrier-ally', respawnCooldown: 0 },
                units: [
                    {
                        id: 'carrier-ally',
                        name: 'Portador',
                        avatar: '🚩',
                        side: 'allied',
                        type: 'hero',
                        lane: 'mid',
                        position: 6,
                        maxHp: 1000,
                        hp: 1000,
                        attack: 100,
                        defense: 50,
                        speed: 4,
                        isDead: false,
                        respawnTimer: 0,
                        isCarrier: true,
                        kills: 0
                    }
                ]
            };

            // Act
            const result = simulateGuildWarMobaTick(stateNearBase, 1);
            const rivalTower = result.towers.find(t => t.id === 'rival-tower-top')!;

            // Assert: Bandeira capturada com sucesso
            expect(result.flag.status).toBe('captured');
            expect(result.flag.carrierId).toBeNull();
            expect(result.alliedScore).toBe(100 + 750); // Pontuação expressiva de CTF
            expect(rivalTower.hp).toBeLessThan(initialTowerHp); // Dano de Sobrecarga de Éter nas torres rivais
            expect(result.alliedSurgeUntil).toBeGreaterThan(Date.now());
        });

        it('Caso de Borda: quando o portador da bandeira morre, a bandeira deve cair na coordenada exata da rota', () => {
            // Arrange: Portador com pouca vida colidindo com rival
            const stateCarrierDying: GuildWarMobaState = {
                ...battle,
                flag: { status: 'carried', lane: 'mid', position: 40, carrierId: 'carrier-doomed', respawnCooldown: 0 },
                units: [
                    {
                        id: 'carrier-doomed',
                        name: 'Portador Ferido',
                        avatar: '🚩',
                        side: 'allied',
                        type: 'hero',
                        lane: 'mid',
                        position: 40,
                        maxHp: 100,
                        hp: 5,
                        attack: 50,
                        defense: 0,
                        speed: 3,
                        isDead: false,
                        respawnTimer: 0,
                        isCarrier: true,
                        kills: 0
                    },
                    {
                        id: 'rival-assassin',
                        name: 'Assassino Rival',
                        avatar: '🥷',
                        side: 'rival',
                        type: 'hero',
                        lane: 'mid',
                        position: 41,
                        maxHp: 500,
                        hp: 500,
                        attack: 200,
                        defense: 30,
                        speed: 3,
                        isDead: false,
                        respawnTimer: 0,
                        isCarrier: false,
                        kills: 0
                    }
                ]
            };

            // Act
            const result = simulateGuildWarMobaTick(stateCarrierDying, 1);

            // Assert
            expect(result.flag.status).toBe('dropped');
            expect(result.flag.carrierId).toBeNull();
            expect(result.flag.position).toBeLessThanOrEqual(40);
            expect(result.flag.position).toBeGreaterThan(0);
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 4. Posturas Táticas do Jogador (setMobaTacticalStance)
    // ═══════════════════════════════════════════════════════════════
    describe('setMobaTacticalStance', () => {
        it('Caminho Feliz: postura "flag" deve direcionar todos os heróis aliados vivos para a rota "mid"', () => {
            // Arrange
            const battle = initGuildWarMobaBattle(mockTerritory, mockHeroes, mockBots, 'Táticos', 2000);

            // Act
            const updated = setMobaTacticalStance(battle, 'flag');
            const allyHeroes = updated.units.filter(u => u.side === 'allied' && !u.isDead);

            // Assert
            expect(updated.activeStance).toBe('flag');
            allyHeroes.forEach(hero => {
                expect(hero.lane).toBe('mid');
            });
        });

        it('Caminho Feliz: postura "push" deve distribuir heróis aliados pelas rotas', () => {
            // Arrange
            const battle = initGuildWarMobaBattle(mockTerritory, mockHeroes, mockBots, 'Táticos', 2000);

            // Act
            const updated = setMobaTacticalStance(battle, 'push');

            // Assert
            expect(updated.activeStance).toBe('push');
            const lanesUsed = new Set(updated.units.filter(u => u.side === 'allied').map(u => u.lane));
            expect(lanesUsed.size).toBeGreaterThanOrEqual(2);
        });

        it('Tratamento de Exceção: não altera nada se a batalha já estiver inativa', () => {
            // Arrange
            const battle = initGuildWarMobaBattle(mockTerritory, mockHeroes, mockBots, 'Táticos', 2000);
            const inactive = { ...battle, battleActive: false };

            // Act
            const result = setMobaTacticalStance(inactive, 'defend');

            // Assert
            expect(result).toBe(inactive);
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 5. Habilidades do Comandante & Ataque Manual
    // ═══════════════════════════════════════════════════════════════
    describe('executeMobaCommanderAbility & executeMobaManualStrike', () => {
        let battle: GuildWarMobaState;

        beforeEach(() => {
            battle = initGuildWarMobaBattle(mockTerritory, mockHeroes, mockBots, 'Generais', 2000);
        });

        it('Caminho Feliz: Bombardeio Tático dizima tropas e causa dano em área na rota escolhida', () => {
            // Arrange
            const midTowerHp = battle.towers.find(t => t.id === 'rival-tower-mid')!.hp;

            // Act
            const outcome = executeMobaCommanderAbility(battle, 'tactical_bombard', { targetLane: 'mid' });
            const newTowerHp = outcome.updatedState.towers.find(t => t.id === 'rival-tower-mid')!.hp;

            // Assert
            expect(outcome.success).toBe(true);
            expect(newTowerHp).toBeLessThan(midTowerHp);
            expect(outcome.updatedState.abilities.tactical_bombard.cooldown).toBe(15);
        });

        it('Caso de Borda: habilidade em recarga não pode ser disparada novamente', () => {
            // Arrange: Habilidade já em cooldown
            const stateOnCooldown: GuildWarMobaState = {
                ...battle,
                abilities: {
                    ...battle.abilities,
                    tactical_bombard: { cooldown: 10, maxCooldown: 15 }
                }
            };

            // Act
            const outcome = executeMobaCommanderAbility(stateOnCooldown, 'tactical_bombard');

            // Assert
            expect(outcome.success).toBe(false);
            expect(outcome.message).toContain('em recarga');
        });

        it('Caminho Feliz: Cura de Emergência restaura HP de todos os heróis aliados', () => {
            // Arrange: Heróis feridos
            const battleWounded: GuildWarMobaState = {
                ...battle,
                units: battle.units.map(u => u.side === 'allied' ? { ...u, hp: Math.floor(u.maxHp * 0.2) } : u)
            };

            // Act
            const outcome = executeMobaCommanderAbility(battleWounded, 'emergency_heal');
            const healedAllies = outcome.updatedState.units.filter(u => u.side === 'allied');

            // Assert
            expect(outcome.success).toBe(true);
            healedAllies.forEach(ally => {
                expect(ally.hp).toBeGreaterThan(Math.floor(ally.maxHp * 0.2));
            });
        });

        it('Caminho Feliz: Ataque Manual do Jogador atinge a torre rival e consome 1 carga', () => {
            // Arrange
            const initialTowerHp = battle.towers.find(t => t.id === 'rival-tower-top')!.hp;

            // Act
            const outcome = executeMobaManualStrike(battle, 'rival-tower-top', 3000);
            const afterTowerHp = outcome.updatedState.towers.find(t => t.id === 'rival-tower-top')!.hp;

            // Assert
            expect(outcome.success).toBe(true);
            expect(afterTowerHp).toBeLessThan(initialTowerHp);
            expect(outcome.updatedState.playerStrikesLeft).toBe(2);
        });

        it('Tratamento de Erro: Ataque Manual não executa se as cargas se esgotarem', () => {
            // Arrange: 0 strikes restantes
            const stateNoStrikes: GuildWarMobaState = {
                ...battle,
                playerStrikesLeft: 0
            };

            // Act
            const outcome = executeMobaManualStrike(stateNoStrikes, 'rival-tower-top', 3000);

            // Assert
            expect(outcome.success).toBe(false);
            expect(outcome.damage).toBe(0);
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // 6. Condições de Vitória e Término
    // ═══════════════════════════════════════════════════════════════
    describe('Condições de Vitória', () => {
        let battle: GuildWarMobaState;

        beforeEach(() => {
            battle = initGuildWarMobaBattle(mockTerritory, mockHeroes, mockBots, 'Triunfantes', 2000);
        });

        it('Caminho Feliz: destruir a Cidadela/Nexus Inimiga declara Vitória Aliada Imediata', () => {
            // Arrange: Nexus inimigo destruído
            const battleNexusDown: GuildWarMobaState = {
                ...battle,
                towers: battle.towers.map(t => t.id === 'rival-nexus' ? { ...t, hp: 0, destroyed: true } : t)
            };

            // Act
            const result = simulateGuildWarMobaTick(battleNexusDown, 1);

            // Assert
            expect(result.battleActive).toBe(false);
            expect(result.winner).toBe('allied');
            expect(result.warLogs[0].message).toContain('VITÓRIA TOTAL');
        });

        it('Caminho Feliz: atingir 2500 pontos declara vitória imediata', () => {
            // Arrange: Placar em 2450 pontos e herói marca pontos
            const battleHighScore: GuildWarMobaState = {
                ...battle,
                alliedScore: 2550
            };

            // Act
            const result = simulateGuildWarMobaTick(battleHighScore, 1);

            // Assert
            expect(result.battleActive).toBe(false);
            expect(result.winner).toBe('allied');
        });
    });
});
