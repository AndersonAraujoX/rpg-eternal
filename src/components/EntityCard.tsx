import React from 'react';
import type { Entity } from '../engine/types';

interface EntityCardProps {
    entity: Entity;
    isHero?: boolean;
}

export const EntityCard: React.FC<EntityCardProps> = ({ entity, isHero }) => {
    const hpPercent = Math.max(0, (entity.stats.hp / entity.stats.maxHp) * 100);
    const barColor = hpPercent > 50 ? '#00cc44' : hpPercent > 20 ? '#ffcc00' : '#ff3300';

    return (
        <div className={`pixel-border`} style={{
            padding: '10px',
            backgroundColor: '#333',
            width: '250px',
            textAlign: isHero ? 'left' : 'right'
        }}>
            <div style={{ marginBottom: '5px', fontSize: '0.8rem' }}>{entity.name}</div>
            <div style={{
                width: '100%',
                height: '20px',
                backgroundColor: '#111',
                border: '2px solid #fff',
                position: 'relative'
            }}>
                <div style={{
                    width: `${hpPercent}%`,
                    height: '100%',
                    backgroundColor: barColor,
                    transition: 'width 0.2s'
                }} />
            </div>
            <div style={{ fontSize: '0.7rem', marginTop: '5px' }}>
                HP: {entity.stats.hp} / {entity.stats.maxHp}
            </div>
        </div>
    );
};
