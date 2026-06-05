import { describe, it, expect } from 'vitest';
import { 
    createRandomExplorer, simulateBackroomsTick, BACKROOMS_LEVELS, BackroomsExplorer, BackroomsOutpost 
} from '../../engine/backrooms';

describe('Backrooms Simulation Engine', () => {
    it('deve criar um explorador com atributos iniciais válidos', () => {
        const explorer = createRandomExplorer();
        expect(explorer.id).toBeDefined();
        expect(explorer.name).toBeDefined();
        expect(['scout', 'soldier', 'scientist']).toContain(explorer.classType);
        expect(explorer.hp).toBe(100);
        expect(explorer.sanity).toBe(100);
        expect(explorer.status).toBe('idle');
    });

    it('deve simular o dreno de sanidade dos exploradores ativos', () => {
        const explorer: BackroomsExplorer = {
            id: 'test_exp',
            name: 'Test Explorer',
            classType: 'scout',
            emoji: '🏃‍♂️',
            hp: 100,
            maxHp: 100,
            sanity: 100,
            maxSanity: 100,
            status: 'exploring',
            assignedLevel: 'lvl_0',
            equipment: { flashlight: 0, suit: 0, tracker: 0 }
        };

        const outpost: BackroomsOutpost = { refinery: 1, quarters: 1, sensors: 1 };
        const resources = { scrap: 0, almondWater: 0, anomalyParts: 0 };

        const { updatedExplorers } = simulateBackroomsTick([explorer], outpost, resources, [], 10);
        
        // Nível 0 tem drain de 0.1 por segundo. Em 10 segundos -> 1.0 de dreno.
        expect(updatedExplorers[0].sanity).toBeLessThan(100);
        expect(updatedExplorers[0].sanity).toBeCloseTo(99, 0);
    });

    it('deve recuperar vida e sanidade dos exploradores descansando', () => {
        const exhaustedExplorer: BackroomsExplorer = {
            id: 'test_exp',
            name: 'Test Explorer',
            classType: 'scout',
            emoji: '🏃‍♂️',
            hp: 30,
            maxHp: 100,
            sanity: 20,
            maxSanity: 100,
            status: 'resting',
            assignedLevel: null,
            equipment: { flashlight: 0, suit: 0, tracker: 0 }
        };

        const outpost: BackroomsOutpost = { refinery: 1, quarters: 1, sensors: 1 };
        const resources = { scrap: 0, almondWater: 0, anomalyParts: 0 };

        const { updatedExplorers } = simulateBackroomsTick([exhaustedExplorer], outpost, resources, [], 10);

        expect(updatedExplorers[0].sanity).toBeGreaterThan(20);
        expect(updatedExplorers[0].hp).toBeGreaterThan(30);
    });

    it('deve carregar níveis da Backroom com perigos e taxas coerentes', () => {
        expect(BACKROOMS_LEVELS.length).toBe(4);
        const lvl37 = BACKROOMS_LEVELS.find(l => l.id === 'lvl_37');
        expect(lvl37?.sanityDrain).toBeLessThan(0); // Poolrooms restaura sanidade
    });
});
