export class SoundManager {
    private ctx: AudioContext | null = null;
    private enabled: boolean = false;

    constructor() {
        try {
            // Defer initialization until user interaction if needed, 
            // but provided toggle will handle it.
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch { // Removed unused e
            console.error('AudioContext not supported');
        }
    }

    toggle(on: boolean) {
        this.enabled = on;
        if (on && this.ctx?.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq: number, type: 'square' | 'sine' | 'sawtooth', duration: number) {
        if (!this.enabled || !this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playAttack() { this.playTone(150, 'square', 0.1); }
    playMagic() { this.playTone(400, 'sine', 0.3); }
    playHeal() { this.playTone(600, 'sine', 0.4); }
    playHit() { this.playTone(100, 'sawtooth', 0.2); }
    playLevelUp() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        [440, 554, 659, 880].forEach((f, i) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            osc.type = 'square';
            osc.frequency.value = f;
            gain.gain.value = 0.05;
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.1);
            osc.connect(gain);
            gain.connect(this.ctx!.destination);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.1);
        });
    }
}

export const soundManager = new SoundManager();
