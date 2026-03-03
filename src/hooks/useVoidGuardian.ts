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
    const timerRef = useRef<any>(null);

    const startChallenge = useCallback(() => {
        if (challengeActive) return;
        setChallengeActive(true);
        setTimeLeft(60);
        setAccumulatedDamage(0);
        addLog("O Desafio do Guardião do Vazio começou! 60 segundos para causar o máximo de dano!", "danger");
    }, [challengeActive, addLog]);

    useEffect(() => {
        if (challengeActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
                // In a time trial, we accumulate party power as damage over time
                setAccumulatedDamage(prev => prev + partyPower);
            }, 1000);
        } else if (timeLeft <= 0 && challengeActive) {
            setChallengeActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            onFinish(accumulatedDamage);
            addLog(`Desafio Concluído! Dano Total: ${accumulatedDamage.toLocaleString()}`, "achievement");
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [challengeActive, timeLeft, partyPower, accumulatedDamage, addLog, onFinish]);

    return {
        challengeActive,
        timeLeft,
        accumulatedDamage,
        startChallenge
    };
};
