import React from 'react';
import type { Hero, Boss } from '../engine/types';

interface BattleSceneProps {
    hero: Hero;
    boss: Boss;
    isPlayerTurn: boolean;
}

export const BattleScene: React.FC<BattleSceneProps> = ({ hero, boss, isPlayerTurn }) => {
    return (
        <div className="battle-scene pixel-border" style={{
            width: '100%',
            height: '300px',
            position: 'relative',
            backgroundColor: '#222',
            backgroundImage: 'linear-gradient(to bottom, #111, #333)', // Placeholder BG
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 50px',
            overflow: 'hidden'
        }}>
            {/* Hero Sprite Placeholder */}
            <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'cyan',
                border: '4px solid white',
                transform: isPlayerTurn ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.2s',
                position: 'relative'
            }}>
                <div style={{ position: 'absolute', top: -30, left: 0, color: 'white' }}>{hero.name}</div>
            </div>

            {/* VS / Turn Indicator */}
            <div style={{ color: '#555', fontSize: '2rem' }}>VS</div>

            {/* Boss Sprite Placeholder */}
            <div style={{
                width: '128px',
                height: '128px',
                backgroundColor: 'red',
                border: '4px solid white',
                transform: !isPlayerTurn ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.2s',
                opacity: boss.isDead ? 0.5 : 1,
                position: 'relative'
            }}>
                <div style={{ position: 'absolute', top: -30, right: 0, color: 'red' }}>BOSS</div>
            </div>
        </div>
    );
};
