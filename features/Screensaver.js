/**
 * Screensaver - Flying toasters screensaver
 * Singleton pattern
 */

import EventBus, { Events } from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';

class ScreensaverClass {
    constructor() {
        this.timeout = null;
        this.delay = 300000; // 5 minutes
        this.isActive = false;
    }

    initialize() {
        const screensaver = document.getElementById('screensaver');
        if (!screensaver) return;

        // Activity listeners
        document.addEventListener('mousemove', () => this.reset());
        document.addEventListener('keydown', () => this.reset());
        document.addEventListener('click', () => this.reset());

        // Click/move to dismiss
        screensaver.addEventListener('click', () => this.hide());
        screensaver.addEventListener('mousemove', () => this.hide());

        // Start timer
        this.reset();

        console.log('[Screensaver] Initialized');
    }

    reset() {
        if (this.isActive) {
            this.hide();
        }
        
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.show(), this.delay);
    }

    show() {
        const screensaver = document.getElementById('screensaver');
        const toasters = document.getElementById('flyingToasters');
        if (!screensaver || !toasters) return;

        // Create toasters
        toasters.innerHTML = '';
        const items = ['🍞', '🥪', '🐕', '☕', '🎸', '📎'];
        
        for (let i = 0; i < 10; i++) {
            const toaster = document.createElement('div');
            toaster.className = 'toaster';
            toaster.textContent = items[Math.floor(Math.random() * items.length)];
            toaster.style.left = Math.random() * 100 + 'vw';
            toaster.style.animationDelay = Math.random() * 5 + 's';
            toaster.style.animationDuration = (8 + Math.random() * 5) + 's';
            toasters.appendChild(toaster);
        }

        screensaver.classList.add('active');
        this.isActive = true;
        EventBus.emit(Events.SCREENSAVER_START);
    }

    hide() {
        if (!this.isActive) return;

        const screensaver = document.getElementById('screensaver');
        if (screensaver) {
            screensaver.classList.remove('active');
        }
        
        this.isActive = false;
        EventBus.emit(Events.SCREENSAVER_END);
    }

    setDelay(ms) {
        this.delay = ms;
        this.reset();
    }
}

const Screensaver = new ScreensaverClass();
export default Screensaver;
