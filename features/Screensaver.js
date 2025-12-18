/**
 * Screensaver - Multiple screensaver types
 * Singleton pattern with proper event cleanup
 */

import EventBus, { Events } from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';
import StorageManager from '../core/StorageManager.js';

// Screensaver configurations
const SCREENSAVER_CONFIGS = {
    toasters: {
        items: ['🍞', '🥪', '🐕', '☕', '🎸', '📎'],
        animation: 'toaster-fly',
        count: 10
    },
    starfield: {
        items: ['✦', '✧', '★', '☆', '⋆', '·'],
        animation: 'star-twinkle',
        count: 50
    },
    marquee: {
        text: 'RetrOS 95 - The Nostalgia Machine',
        animation: 'marquee-scroll'
    },
    none: null
};

class ScreensaverClass {
    constructor() {
        this.timeout = null;
        this.delay = 300000; // 5 minutes
        this.isActive = false;
        this.initialized = false;
        this.type = 'toasters';
        this.animationFrame = null;

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

        // Load saved type
        this.type = StorageManager.get('screensaverType') || 'toasters';

        // Load saved delay
        const savedDelay = StateManager.getState('settings.screensaverDelay');
        if (savedDelay) {
            this.delay = savedDelay;
        }

        // Activity listeners - using bound handlers for cleanup capability
        document.addEventListener('mousemove', this.boundReset);
        document.addEventListener('keydown', this.boundReset);
        document.addEventListener('click', this.boundReset);

        // Click/move to dismiss
        screensaver.addEventListener('click', this.boundHide);
        screensaver.addEventListener('mousemove', this.boundHide);

        // Listen for type updates from Display Properties
        EventBus.on('screensaver:update-type', ({ type }) => {
            this.type = type;
        });

        // Listen for delay updates
        EventBus.on('screensaver:update-delay', ({ delay }) => {
            this.delay = delay;
            this.reset();
        });

        // Listen for manual start
        EventBus.on('screensaver:start', () => {
            this.show();
        });

        // Start timer
        this.reset();
        this.initialized = true;

        console.log('[Screensaver] Initialized with type:', this.type);
    }

    /**
     * Cleanup all event listeners (call when destroying)
     */
    destroy() {
        if (!this.initialized) return;

        // Clear timeout
        clearTimeout(this.timeout);
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

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

        // Don't start timer if type is 'none' or delay is very high
        if (this.type === 'none' || this.delay >= 9999999) {
            return;
        }

        this.timeout = setTimeout(() => this.show(), this.delay);
    }

    show() {
        // Don't show if type is none
        if (this.type === 'none') return;

        const screensaver = document.getElementById('screensaver');
        const container = document.getElementById('flyingToasters');
        if (!screensaver || !container) return;

        // Clear previous content
        container.innerHTML = '';

        const config = SCREENSAVER_CONFIGS[this.type];
        if (!config) return;

        // Render based on type
        if (this.type === 'toasters') {
            this.renderToasters(container, config);
        } else if (this.type === 'starfield') {
            this.renderStarfield(container, config);
        } else if (this.type === 'marquee') {
            this.renderMarquee(container, config);
        }

        screensaver.classList.add('active');
        this.isActive = true;
        EventBus.emit(Events.SCREENSAVER_START);
    }

    renderToasters(container, config) {
        for (let i = 0; i < config.count; i++) {
            const toaster = document.createElement('div');
            toaster.className = 'toaster';
            toaster.textContent = config.items[Math.floor(Math.random() * config.items.length)];
            toaster.style.left = Math.random() * 100 + 'vw';
            toaster.style.animationDelay = Math.random() * 5 + 's';
            toaster.style.animationDuration = (8 + Math.random() * 5) + 's';
            container.appendChild(toaster);
        }
    }

    renderStarfield(container, config) {
        // Add starfield CSS class to container
        container.classList.add('starfield-mode');

        for (let i = 0; i < config.count; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.textContent = config.items[Math.floor(Math.random() * config.items.length)];
            star.style.left = Math.random() * 100 + 'vw';
            star.style.top = Math.random() * 100 + 'vh';
            star.style.animationDelay = Math.random() * 3 + 's';
            star.style.animationDuration = (1 + Math.random() * 2) + 's';
            star.style.fontSize = (10 + Math.random() * 20) + 'px';
            container.appendChild(star);
        }
    }

    renderMarquee(container, config) {
        container.classList.add('marquee-mode');

        const marquee = document.createElement('div');
        marquee.className = 'marquee-text';
        marquee.textContent = config.text;
        container.appendChild(marquee);
    }

    hide() {
        if (!this.isActive) return;

        const screensaver = document.getElementById('screensaver');
        const container = document.getElementById('flyingToasters');

        if (screensaver) {
            screensaver.classList.remove('active');
        }

        if (container) {
            container.classList.remove('starfield-mode', 'marquee-mode');
        }

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        this.isActive = false;
        EventBus.emit(Events.SCREENSAVER_END);
    }

    setDelay(ms) {
        this.delay = ms;
        this.reset();
    }

    setType(type) {
        this.type = type;
    }
}

const Screensaver = new ScreensaverClass();
export default Screensaver;
