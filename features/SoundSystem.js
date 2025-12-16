/**
 * SoundSystem - Centralized audio management
 * Singleton pattern matching other modules
 */

import EventBus, { Events } from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';

class SoundSystemClass {
    constructor() {
        this.audioContext = null;
    }

    initialize() {
        // Listen for sound play requests
        EventBus.on(Events.SOUND_PLAY, ({ type, force }) => {
            this.play(type, force);
        });

        console.log('[SoundSystem] Initialized');
    }

    initContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        return this.audioContext;
    }

    play(type, force = false) {
        const enabled = force || StateManager.getState('settings.sound');
        if (!enabled) return;

        try {
            const ctx = this.initContext();

            switch (type) {
                case 'click': this.playClick(ctx); break;
                case 'open': this.playOpen(ctx); break;
                case 'close': this.playClose(ctx); break;
                case 'error': this.playError(ctx); break;
                case 'startup': this.playStartup(ctx); break;
                case 'achievement': this.playStartup(ctx); break;
                case 'restore': this.playRestore(ctx); break;
                default: this.playClick(ctx);
            }
        } catch (e) {
            console.warn('[SoundSystem] Playback failed:', e);
        }
    }

    playClick(ctx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.1;
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    }

    playOpen(ctx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
        gain.gain.value = 0.1;
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }

    playClose(ctx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.1);
        gain.gain.value = 0.1;
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }

    playError(ctx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.value = 200;
        gain.gain.value = 0.1;
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    }

    playStartup(ctx) {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = freq;
                gain.gain.value = 0.1;
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            }, i * 150);
        });
    }

    playRestore(ctx) {
        // Ascending "pop" sound for item restoration
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.08);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.12);
        gain.gain.value = 0.12;
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    }
}

const SoundSystem = new SoundSystemClass();
export default SoundSystem;
