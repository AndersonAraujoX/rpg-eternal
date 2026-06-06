import { useState, useEffect, useCallback, useRef } from 'react';
import type { LogEntry } from '../engine/types';

export const useVoidGuardian = (
    partyPower: number,
    addLog: (msg: string, type?: LogEntry['type']) => void,
    onFinish: (damage: number) => void
) => {
    const [challengeActive, setChallengeActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [accumulatedDamage, setAccumulatedDamage] = useState(0);

    const stateRef = useRef({ partyPower, onFinish, accumulatedDamage });
    useEffect(() => {
        stateRef.current = { partyPower, onFinish, accumulatedDamage };
    });

    const startChallenge = useCallback(() => {
        setChallengeActive(prev => {
            if (prev) return prev;
            setTimeLeft(60);
            setAccumulatedDamage(0);
            addLog("O Desafio do Guardião do Vazio começou! 60 segundos para causar o máximo de dano!", "danger");
            return true;
        });
    }, [addLog]);

    useEffect(() => {
        if (!challengeActive) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setChallengeActive(false);
                    const finalDamage = stateRef.current.accumulatedDamage + stateRef.current.partyPower;
                    stateRef.current.onFinish(finalDamage);
                    addLog(`Desafio Concluído! Dano Total: ${finalDamage.toLocaleString()}`, "achievement");
                    return 0;
                }
                setAccumulatedDamage(d => d + stateRef.current.partyPower);
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [challengeActive, addLog]);

    return {
        challengeActive,
        timeLeft,
        accumulatedDamage,
        startChallenge
    };
};
