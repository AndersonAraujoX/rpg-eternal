import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TownModal } from '../../../components/modals/TownModal';
import type { Building, Hero } from '../../../engine/types';

const mockBuilding = (id: string, name: string, level = 0, emoji = '🏠'): Building => ({
    id,
    name,
    description: `${name} description`,
    emoji,
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
        mockBuilding('town_hall', 'Prefeitura', 1, '🏛️'),
        mockBuilding('guild_hall', 'Guilda', 0, '🏰'),
        mockBuilding('industry', 'Indústria', 0, '🏢'),
        mockBuilding('pantheon', 'Panteão', 1, '🏛️'),
        mockBuilding('altar_deities', 'Altar', 1, '⛪'),
    ],
    gold: 500,
    upgradeBuilding: vi.fn(),
    tower: { maxFloor: 0, currentFloor: 0 } as any,
    openIndustry: vi.fn(),
    openForge: vi.fn(),
    openFishing: vi.fn(),
    openAlchemy: vi.fn(),
    openExpeditions: vi.fn(),
    openGarden: vi.fn(),
    openRunes: vi.fn(),
    heroes: [] as Hero[],
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

describe('TownModal', () => {
    it('renders overview mode without crashing', () => {
        render(<TownModal {...baseProps} />);
        expect(screen.getByText('PREFEITURA')).toBeDefined();
    });

    it('does not render when isOpen is false', () => {
        const { container } = render(<TownModal {...baseProps} isOpen={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('navigates to construction mode and renders buildings', () => {
        render(<TownModal {...baseProps} />);
        const gerenciarBtn = screen.getByText('🔨 Construção');
        fireEvent.click(gerenciarBtn);
        expect(screen.getByText('MODO CONSTRUÇÃO')).toBeDefined();
    });

    it('navigates to deities view and renders deity selection', () => {
        render(<TownModal {...baseProps} />);
        const altarBtn = screen.getByText('⛪ Altar dos Deuses');
        fireEvent.click(altarBtn);
        expect(screen.getByText('ALTAR DOS DEUSES')).toBeDefined();
        expect(screen.getByText('ESCOLHA SEU DEUS PADROEIRO')).toBeDefined();
    });

    it('renders deity detail view when a patron is set', () => {
        render(<TownModal {...baseProps} patronDeity="aurelius" deityLevel={2} deityFavor={500} deityEnergy={50} souls={10000} divinity={200} />);
        fireEvent.click(screen.getByText('⛪ Altar dos Deuses'));
        expect(screen.getByText('TRIBUTOS E OFERENDAS')).toBeDefined();
        expect(screen.getByText('RITUAL DO CLIMA')).toBeDefined();
    });

    it('renders offerings and weather panels when deity is set', () => {
        render(<TownModal {...baseProps} patronDeity="aurelius" deityLevel={1} deityFavor={0} deityEnergy={100} souls={5000} divinity={100} resources={{ herbs: 15 } as any} />);
        fireEvent.click(screen.getByText('⛪ Altar dos Deuses'));
        expect(screen.getByText('Oferecer 5.000 Almas')).toBeDefined();
        expect(screen.getByText('Oferecer 100 Divindade')).toBeDefined();
        expect(screen.getByText('Estação das Chuvas')).toBeDefined();
        expect(screen.getByText('Eclipse Solar')).toBeDefined();
        expect(screen.getByText('Aurora Boreal')).toBeDefined();
    });

    it('supports grid positioning and interaction', () => {
        const setBuildingsMock = vi.fn();
        const buildingsWithUnplaced = [
            { ...mockBuilding('town_hall', 'Prefeitura', 1, '🏛️'), placed: true, x: 2, y: 2 },
            { ...mockBuilding('guild_hall', 'Guilda', 1, '🏰'), placed: false },
        ];
        render(<TownModal {...baseProps} buildings={buildingsWithUnplaced} setBuildings={setBuildingsMock} />);
        
        // Should show the placed town hall emoji on the grid map
        const gridCell = screen.getByText('🏛️');
        expect(gridCell).toBeDefined();

        // Click the unplaced building's "Colocar" button
        const colocarBtn = screen.getByText('Colocar');
        fireEvent.click(colocarBtn);

        // Click the empty slot coords to place it (e.g. at 0, 0)
        const emptyCell = screen.getByText('0,0');
        fireEvent.click(emptyCell);

        expect(setBuildingsMock).toHaveBeenCalled();
    });
});
