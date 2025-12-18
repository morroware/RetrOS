/**
 * Screensaver - Flying toasters screensaver
 * Singleton pattern with proper event cleanup
 */

import EventBus, { Events } from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';

class ScreensaverClass {
    constructor() {
        this.timeout = null;
        this.delay = 300000; // 5 minutes
        this.isActive = false;
        this.initialized = false;

        // Bound handlers for proper cleanup
        this.boundReset = this.reset.bind(this);
        this.boundHide = this.hide.bind(this);
    }

    initialize() {
        // Prevent double initialization
        if (this.initialized) {
            console.warn('[Screensaver] Already initialized');
            return;
        }

        const screensaver = document.getElementById('screensaver');
        if (!screensaver) return;

        // Activity listeners - using bound handlers for cleanup capability
        document.addEventListener('mousemove', this.boundReset);
        document.addEventListener('keydown', this.boundReset);
        document.addEventListener('click', this.boundReset);

        // Click/move to dismiss
        screensaver.addEventListener('click', this.boundHide);
        screensaver.addEventListener('mousemove', this.boundHide);

        // Start timer
        this.reset();
        this.initialized = true;

        console.log('[Screensaver] Initialized');
    }

    /**
     * Cleanup all event listeners (call when destroying)
     */
    destroy() {
        if (!this.initialized) return;

        // Clear timeout
        clearTimeout(this.timeout);

        // Remove document listeners
        document.removeEventListener('mousemove', this.boundReset);
        document.removeEventListener('keydown', this.boundReset);
        document.removeEventListener('click', this.boundReset);

        // Remove screensaver listeners
        const screensaver = document.getElementById('screensaver');
        if (screensaver) {
            screensaver.removeEventListener('click', this.boundHide);
            screensaver.removeEventListener('mousemove', this.boundHide);
        }

        this.initialized = false;
        console.log('[Screensaver] Destroyed');
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
