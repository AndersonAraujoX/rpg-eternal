import { describe, it, expect } from 'vitest';
import type { Pet } from '../../engine/types';

// ── Simulação da lógica de auto-feeding de pets (useGame.ts linhas 3256-3296) ──
interface AutoFeedResult {
    gold: number;
    souls: number;
    pets: Pet[];
    goldDeducted: boolean;
}

function simulateAutoFeedPets(
    autoFeedPets: boolean,
    currentGold: number,
    currentSouls: number,
    pets: Pet[]
): AutoFeedResult {
    let gold = currentGold;
    let souls = currentSouls;
    let updatedPets = [...pets];
    let goldDeducted = false;

    // Apenas executa se autoFeedPets estiver habilitado e houver pets
    if (autoFeedPets && updatedPets.length > 0) {
        if (gold > 1000) {
            // Encontra o pet de menor nível (e menor XP para desempate)
            let lowestPetIndex = 0;
            for (let i = 1; i < updatedPets.length; i++) {
                const p = updatedPets[i];
                const lowest = updatedPets[lowestPetIndex];
                if (p.level < lowest.level || (p.level === lowest.level && p.xp < lowest.xp)) {
                    lowestPetIndex = i;
                }
            }

            // Deduz 100 de ouro
            gold = Math.max(0, gold - 100);
            goldDeducted = true;

            // Evolui o pet
            const target = updatedPets[lowestPetIndex];
            let newXp = target.xp + 50;
            let newLevel = target.level;
            let newMaxXp = target.maxXp;
            const newStats = target.stats ? { ...target.stats } : { attack: 0, hp: 0, maxHp: 0, mp: 0, maxMp: 0, defense: 0, magic: 0, speed: 0 };

            while (newXp >= newMaxXp) {
                newLevel++;
                newXp -= newMaxXp;
                newMaxXp = Math.floor(newMaxXp * 1.5);
                newStats.attack = (newStats.attack || 0) + 1;
                newStats.maxHp = (newStats.maxHp || 0) + 5;
                newStats.hp = (newStats.hp || 0) + 5;
                newStats.defense = (newStats.defense || 0) + 1;
            }

            updatedPets[lowestPetIndex] = {
                ...target,
                level: newLevel,
                xp: newXp,
                maxXp: newMaxXp,
                stats: newStats
            };
        }
    }

    return { gold, souls, pets: updatedPets, goldDeducted };
}

const mockPets: Pet[] = [
    {
        id: 'p1', name: 'Wolf Pup', type: 'pet', emoji: '🐺', rarity: 'common',
        level: 1, xp: 0, maxXp: 100, bonus: '+5% Attack',
        stats: { hp: 10, maxHp: 10, mp: 0, maxMp: 0, attack: 5, defense: 0, magic: 0, speed: 1 },
        isDead: false, element: 'nature', assignment: 'combat'
    },
    {
        id: 'p2', name: 'Cat Spirit', type: 'pet', emoji: '🐱', rarity: 'common',
        level: 3, xp: 20, maxXp: 225, bonus: '+5% Speed',
        stats: { hp: 10, maxHp: 10, mp: 0, maxMp: 0, attack: 2, defense: 0, magic: 2, speed: 5 },
        isDead: false, element: 'neutral', assignment: 'combat'
    }
];

describe('Auto-Feed Pets Toggle & Execution System', () => {

    describe('Fluxo com Auto-Feed DESLIGADO (padrão)', () => {
        it('NÃO deve gastar ouro mesmo se o jogador tiver muito ouro', () => {
            // Arrange
            const initialGold = 50000;
            const autoFeedEnabled = false;

            // Act
            const result = simulateAutoFeedPets(autoFeedEnabled, initialGold, 0, mockPets);

            // Assert
            expect(result.gold).toBe(initialGold); // Ouro permanece 100% intacto
            expect(result.goldDeducted).toBe(false);
            expect(result.pets[0].xp).toBe(0); // Pet não recebeu XP
        });
    });

    describe('Fluxo com Auto-Feed LIGADO', () => {
        it('deve gastar 100 de ouro e dar +50 XP ao pet mais fraco quando ouro > 1000', () => {
            // Arrange
            const initialGold = 2500;
            const autoFeedEnabled = true;

            // Act
            const result = simulateAutoFeedPets(autoFeedEnabled, initialGold, 0, mockPets);

            // Assert
            expect(result.gold).toBe(2400); // 2500 - 100 = 2400
            expect(result.goldDeducted).toBe(true);
            expect(result.pets[0].xp).toBe(50); // Wolf Pup (Lv 1) recebeu 50 XP
            expect(result.pets[1].xp).toBe(20); // Cat Spirit (Lv 3) não foi alterado
        });

        it('deve subir de nível o pet quando atingir maxXp', () => {
            // Arrange: Wolf Pup com 90 XP (precisa de 10 para level up)
            const pets = [
                { ...mockPets[0], xp: 90, maxXp: 100, level: 1 },
                mockPets[1]
            ];
            const autoFeedEnabled = true;

            // Act
            const result = simulateAutoFeedPets(autoFeedEnabled, 2000, 0, pets);

            // Assert
            expect(result.pets[0].level).toBe(2);
            expect(result.pets[0].xp).toBe(40); // 90 + 50 = 140 -> Lv 2 com 40 XP
            expect(result.pets[0].maxXp).toBe(150);
            expect(result.pets[0].stats?.attack).toBe(6); // +1 attack
        });

        it('NÃO deve gastar ouro se o ouro for <= 1000', () => {
            // Arrange: apenas 800 de ouro
            const initialGold = 800;
            const autoFeedEnabled = true;

            // Act
            const result = simulateAutoFeedPets(autoFeedEnabled, initialGold, 0, mockPets);

            // Assert
            expect(result.gold).toBe(800); // Protegido, não gasta abaixo de 1000
            expect(result.goldDeducted).toBe(false);
            expect(result.pets[0].xp).toBe(0);
        });
    });

    describe('Casos de borda', () => {
        it('não deve fazer nada se a lista de pets estiver vazia', () => {
            // Arrange
            const autoFeedEnabled = true;

            // Act
            const result = simulateAutoFeedPets(autoFeedEnabled, 10000, 0, []);

            // Assert
            expect(result.gold).toBe(10000);
            expect(result.goldDeducted).toBe(false);
            expect(result.pets).toEqual([]);
        });

        it('deve escolher o pet com menor XP se os níveis forem iguais', () => {
            // Arrange: dois pets no nível 1, mas p1 tem 60 XP e p2 tem 10 XP
            const tiePets: Pet[] = [
                { ...mockPets[0], level: 1, xp: 60 },
                { ...mockPets[1], level: 1, xp: 10 }
            ];

            // Act
            const result = simulateAutoFeedPets(true, 5000, 0, tiePets);

            // Assert: deve alimentar o p2 (10 XP)
            expect(result.pets[1].xp).toBe(60); // 10 + 50 = 60
            expect(result.pets[0].xp).toBe(60); // p1 permaneceu 60
        });
    });
});
