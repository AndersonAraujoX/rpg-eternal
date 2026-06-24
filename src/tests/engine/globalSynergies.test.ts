import { describe, it, expect } from 'vitest';
import { checkGlobalSynergies, type GlobalSynergyCheckState } from '../../engine/globalSynergies';


describe('Global Synergies Verification Logic', () => {
    const defaultState = (): GlobalSynergyCheckState => ({
        activeSynergies: [],
        unlockedFeatures: {},
        heroes: [],
        backroomsExplorers: [],
        buildings: [],
        riftsActive: false
    });

    it('1. should activate Ignição Laboratorial when reaction_burn is active and alchemy_lab is unlocked', () => {
        const state = defaultState();
        state.activeSynergies = [{ id: 'reaction_burn', name: 'Inferno', description: '', icon: '', isActive: true, type: 'burn', value: 0.05 }];
        state.unlockedFeatures['alchemy_lab'] = true;

        const active = checkGlobalSynergies(state);
        expect(active).toHaveLength(1);
        expect(active[0].id).toBe('global_synergy_ignition');
    });

    it('1. should NOT activate Ignição Laboratorial if alchemy_lab is locked', () => {
        const state = defaultState();
        state.activeSynergies = [{ id: 'reaction_burn', name: 'Inferno', description: '', icon: '', isActive: true, type: 'burn', value: 0.05 }];
        state.unlockedFeatures['alchemy_lab'] = false;

        const active = checkGlobalSynergies(state);
        expect(active).toHaveLength(0);
    });

    it('2. should activate Exploradores Ocultos when backrooms_manager is unlocked, explorers are exploring, and a Dark hero is unlocked', () => {
        const state = defaultState();
        state.unlockedFeatures['backrooms_manager'] = true;
        state.backroomsExplorers = [
            {
                id: 'exp1',
                name: 'Scout',
                classType: 'scout',
                emoji: '',
                hp: 100,
                maxHp: 100,
                sanity: 100,
                maxSanity: 100,
                status: 'exploring',
                assignedLevel: 'lvl1',
                equipment: { flashlight: 0, suit: 0, tracker: 0 }
            }
        ];
        state.heroes = [
            {
                id: 'h1',
                name: 'Dark Assassin',
                class: 'Assassin',
                emoji: '',
                unlocked: true,
                isDead: false,
                element: 'dark',
                assignment: 'none',
                insanity: 0,
                level: 1,
                xp: 0,
                maxXp: 100,
                fatigue: 0,
                maxFatigue: 100,
                statPoints: 0,
                stats: { hp: 100, maxHp: 100, mp: 0, maxMp: 0, attack: 10, defense: 5, speed: 10, magic: 0 },
                skills: []
            }
        ];

        const active = checkGlobalSynergies(state);
        expect(active).toHaveLength(1);
        expect(active[0].id).toBe('global_synergy_explorers');
    });

    it('2. should NOT activate Exploradores Ocultos if no explorers are exploring', () => {
        const state = defaultState();
        state.unlockedFeatures['backrooms_manager'] = true;
        state.backroomsExplorers = [
            {
                id: 'exp1',
                name: 'Scout',
                classType: 'scout',
                emoji: '',
                hp: 100,
                maxHp: 100,
                sanity: 100,
                maxSanity: 100,
                status: 'idle',
                assignedLevel: null,
                equipment: { flashlight: 0, suit: 0, tracker: 0 }
            }
        ];
        state.heroes = [
            {
                id: 'h1',
                name: 'Dark Assassin',
                class: 'Assassin',
                emoji: '',
                unlocked: true,
                isDead: false,
                element: 'dark',
                assignment: 'none',
                insanity: 0,
                level: 1,
                xp: 0,
                maxXp: 100,
                fatigue: 0,
                maxFatigue: 100,
                statPoints: 0,
                stats: { hp: 100, maxHp: 100, mp: 0, maxMp: 0, attack: 10, defense: 5, speed: 10, magic: 0 },
                skills: []
            }
        ];

        const active = checkGlobalSynergies(state);
        expect(active).toHaveLength(0);
    });

    it('3. should activate Linha de Montagem Mecânica when starlight and town features are unlocked and industry level > 0', () => {
        const state = defaultState();
        state.unlockedFeatures['starlight'] = true;
        state.unlockedFeatures['town'] = true;
        state.buildings = [
            {
                id: 'industry',
                name: 'Industry',
                description: '',
                level: 1,
                maxLevel: 10,
                cost: 1000,
                costScaling: 1.5,
                bonus: '',
                effectValue: 0.15,
                currency: 'gold',
                emoji: '',
                width: 2,
                height: 2
            }
        ];

        const active = checkGlobalSynergies(state);
        expect(active).toHaveLength(1);
        expect(active[0].id).toBe('global_synergy_assembly');
    });

    it('4. should activate Mapeamento Estelar when rifts are active and outer_space is unlocked', () => {
        const state = defaultState();
        state.riftsActive = true;
        state.unlockedFeatures['outer_space'] = true;

        const active = checkGlobalSynergies(state);
        expect(active).toHaveLength(1);
        expect(active[0].id).toBe('global_synergy_mapping');
    });
});
