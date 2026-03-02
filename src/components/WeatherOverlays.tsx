import React from 'react';
import type { WeatherType } from '../engine/weather';

interface WeatherOverlaysProps {
    weather: WeatherType | null;
}

export const WeatherOverlays: React.FC<WeatherOverlaysProps> = ({ weather }) => {
    if (!weather || weather === 'Clear') return null;

    const getOverlayStyle = (): React.CSSProperties => {
        switch (weather) {
            case 'Rain':
                return { opacity: 0.5 };
            case 'Sandstorm':
                return { opacity: 0.35, backgroundColor: 'rgba(194, 120, 57, 0.1)' };
            case 'Blizzard':
                return { opacity: 0.3 };
            case 'Eclipse':
                return { opacity: 0.2, backgroundColor: 'rgba(0, 0, 0, 0.3)' };
            case 'Aurora':
                return { opacity: 0.25 };
            default:
                return {};
        }
    };

    const getOverlayClass = (): string => {
        switch (weather) {
            case 'Rain': return 'weather-rain';
            case 'Sandstorm': return 'weather-sandstorm';
            case 'Blizzard': return 'bg-blue-100/5';
            default: return '';
        }
    };

    return (
        <div
            className={`fixed inset-0 pointer-events-none z-[100] transition-opacity duration-1000 ${getOverlayClass()}`}
            style={getOverlayStyle()}
        >
            {weather === 'Aurora' && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/10 to-transparent animate-pulse" />
            )}
        </div>
    );
};
