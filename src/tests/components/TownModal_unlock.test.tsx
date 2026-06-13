import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TownModal } from '../../components/modals/TownModal';
import type { Building } from '../../engine/types';

describe('TownModal Construction Unlock Verification', () => {
    const mockBuilding = (id: string, name: string, level = 0): Building => ({
        id,
        name,
        description: `${name} description`,
        emoji: '🏢',
        level,
        maxLevel: 10,
        cost: 100,
        costScaling: 1.5,
        currency: 'gold',
        effectValue: 0.1,
        bonus: `+${level * 10}%`,
        width: 1,
        height: 1
    });

    const baseProps = {
        isOpen: true,
        onClose: vi.fn(),
        buildings: [
            mockBuilding('town_hall', 'Prefeitura', 1),
            mockBuilding('backrooms_manager', 'Posto Avançado M.E.G.', 0),
        ],
        gold: 50000,
        upgradeBuilding: vi.fn(),
        tower: { maxFloor: 0, currentFloor: 0 } as any,
        heroes: [],
        monuments: [null, null, null],
        enshrineHero: vi.fn(),
        patronDeity: null,
        deityLevel: 1,
        deityFavor: 0,
        deityEnergy: 0,
        pledgeDeity: vi.fn(),
        offerToDeity: vi.fn(),
        souls: 0,
        divinity: 0,
        invokeWeather: vi.fn(),
        resources: { herbs: 0 } as any,
    };

    it('should show the M.E.G. Outpost as locked if bossLevel is less than 30', () => {
        render(<TownModal {...baseProps} bossLevel={10} />);
        
        // Go to construction tab
        const constructionTab = screen.getByText('🔨 Construção');
        fireEvent.click(constructionTab);

        // Should show "BLOQUEADO" button
        const blockedText = screen.getByText('BLOQUEADO');
        expect(blockedText).toBeDefined();
    });

    it('should show the M.E.G. Outpost as constructable if bossLevel is 30 or greater', () => {
        render(<TownModal {...baseProps} bossLevel={30} />);
        
        // Go to construction tab
        const constructionTab = screen.getByText('🔨 Construção');
        fireEvent.click(constructionTab);

        // Should show "CONSTRUIR" button
        const constructText = screen.getByText(/CONSTRUIR/i);
        expect(constructText).toBeDefined();
    });
});
