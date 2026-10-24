import { describe, it, expect } from 'vitest';
import {
    generateAriaMission,
    updateAriaMissionsProgress,
    claimAriaMission,
    type AriaMission,
    type AriaMissionConfig
} from '../../engine/ariaMissions';

describe('Procedural Aria Missions Engine (Aria Advisor + Dailies)', () => {
    const mockConfig: AriaMissionConfig = {
        stage: 'mid',
        highestFloor: 50,
        unlockedFeatures: { town: true, backrooms_manager: true }
    };

    describe('generateAriaMission', () => {
        it('should generate a mission with scaled requirements and rewards (Happy Path)', () => {
            // Arrange
            const mockRng = () => 0.0;

            // Act
            const mission = generateAriaMission(mockConfig, 'boss_hunt', 'normal', mockRng);

            // Assert
            expect(mission.id).toBeDefined();
            expect(mission.title).toContain('Expurgo de Anomalia Alfa');
            expect(mission.category).toBe('boss_hunt');
            expect(mission.difficulty).toBe('normal');
            expect(mission.objective.required).toBe(3);
            expect(mission.rewards.gold).toBe(50000); // 1000 * 1.0 * 50
            expect(mission.rewards.starlight).toBe(10);
            expect(mission.completed).toBe(false);
            expect(mission.claimed).toBe(false);
        });

        it('should add Mythic lore fragment and souls for endgame/advanced mythic missions (Edge Case)', () => {
            // Arrange
            const advancedConfig: AriaMissionConfig = {
                stage: 'advanced',
                highestFloor: 150,
                unlockedFeatures: {}
            };
            const mockRng = () => 0.5;

            // Act
            const mythicMission = generateAriaMission(advancedConfig, 'backrooms_recon', 'mythic', mockRng);

            // Assert
            expect(mythicMission.difficulty).toBe('mythic');
            expect(mythicMission.rewards.loreFragmentTitle).toBeDefined();
            expect(mythicMission.rewards.souls).toBeGreaterThan(0);
            expect(mythicMission.rewards.chaosMarks).toBeGreaterThan(0);
        });
    });

    describe('updateAriaMissionsProgress', () => {
        it('should advance progress on matching category and mark completed when target reached (Happy Path)', () => {
            // Arrange
            const mission = generateAriaMission(mockConfig, 'industry_quota', 'normal', () => 0.0);
            const missionsList = [mission];

            // Act
            const updated = updateAriaMissionsProgress(missionsList, 'industry_quota', 50);

            // Assert
            expect(updated[0].objective.current).toBe(50);
            expect(updated[0].objective.completed).toBe(true);
            expect(updated[0].completed).toBe(true);
        });

        it('should ignore non-matching categories or zero/negative progress (Edge Cases)', () => {
            // Arrange
            const mission = generateAriaMission(mockConfig, 'industry_quota', 'normal', () => 0.0);
            const missionsList = [mission];

            // Act
            const noProgressCategory = updateAriaMissionsProgress(missionsList, 'boss_hunt', 10);
            const noProgressNegative = updateAriaMissionsProgress(missionsList, 'industry_quota', -5);
            const noProgressZero = updateAriaMissionsProgress(missionsList, 'industry_quota', 0);

            // Assert
            expect(noProgressCategory[0].objective.current).toBe(0);
            expect(noProgressNegative[0].objective.current).toBe(0);
            expect(noProgressZero[0].objective.current).toBe(0);
        });
    });

    describe('claimAriaMission', () => {
        it('should successfully claim rewards on completed mission (Happy Path)', () => {
            // Arrange
            const completedMission: AriaMission = {
                ...generateAriaMission(mockConfig, 'cosmic_trade', 'normal', () => 0.0),
                completed: true,
                claimed: false
            };

            // Act
            const { updatedMission, rewardsClaimed } = claimAriaMission(completedMission);

            // Assert
            expect(updatedMission.claimed).toBe(true);
            expect(rewardsClaimed.gold).toBeGreaterThan(0);
        });

        it('should throw error when attempting to claim incomplete or already claimed mission (Exception Handling)', () => {
            // Arrange
            const incompleteMission: AriaMission = {
                ...generateAriaMission(mockConfig, 'cosmic_trade', 'normal', () => 0.0),
                completed: false,
                claimed: false
            };
            const alreadyClaimedMission: AriaMission = {
                ...incompleteMission,
                completed: true,
                claimed: true
            };

            // Act & Assert
            expect(() => claimAriaMission(incompleteMission)).toThrow('Cannot claim an incomplete mission');
            expect(() => claimAriaMission(alreadyClaimedMission)).toThrow('rewards have already been claimed');
        });
    });
});
