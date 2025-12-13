/**
 * ClippyAssistant - The beloved/hated paperclip assistant
 * Singleton pattern
 */

import EventBus, { Events } from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';

const MESSAGES = [
    "It looks like you're browsing. Need help?",
    "Try the Konami code! ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️",
    "Did you know you can right-click?",
    "Type 'matrix' in Terminal for a surprise!",
];

const RAGE_MESSAGES = [
    "Oh, dismissing me AGAIN?",
    "Fine, I'll just wait here...",
    "You know what? I don't need you either!",
    "THAT'S IT! I'M OUT!",
    "*comes back* Just kidding 😢"
];

class ClippyAssistantClass {
    constructor() {
        this.dismissCount = 0;
        this.isVisible = false;
    }

    initialize() {
        const clippy = document.getElementById('clippy');
        if (!clippy) return;

        // Listen for show events from other modules (e.g., Terminal 'clippy' command)
        EventBus.on('clippy:show', () => this.show());

        // Random appearance
        if (Math.random() > 0.5 && !localStorage.getItem('clippyDismissed')) {
            setTimeout(() => this.show(), 5000);
        }

        console.log('[ClippyAssistant] Initialized');
    }

    show() {
        const clippy = document.getElementById('clippy');
        if (!clippy) return;

        this.isVisible = true;
        clippy.classList.add('active');
        
        // Show the speech bubble
        const bubble = clippy.querySelector('.clippy-bubble');
        if (bubble) bubble.classList.add('active');
        
        this.speak();

        // Setup handlers
        const character = clippy.querySelector('.clippy-character');
        const closeBtn = clippy.querySelector('.clippy-close');
        const yesBtn = clippy.querySelector('.clippy-btn:first-child');
        const noBtn = clippy.querySelector('.clippy-btn:last-child');

        if (character) character.onclick = () => this.speak();
        if (closeBtn) closeBtn.onclick = () => this.dismiss();
        if (yesBtn) yesBtn.onclick = () => this.respond('yes');
        if (noBtn) noBtn.onclick = () => this.respond('no');
    }

    hide() {
        const clippy = document.getElementById('clippy');
        if (clippy) {
            clippy.classList.remove('active');
            // Also hide the speech bubble
            const bubble = clippy.querySelector('.clippy-bubble');
            if (bubble) bubble.classList.remove('active');
            this.isVisible = false;
        }
    }

    speak() {
        const text = document.getElementById('clippyText');
        if (text) {
            text.textContent = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
        }
    }

    respond(response) {
        const text = document.getElementById('clippyText');
        if (response === 'no') {
            if (text) text.textContent = "Fine, I'll just sit here... 👀";
            setTimeout(() => this.dismiss(), 2000);
        } else {
            if (text) text.textContent = "Great! Click any icon to explore! 🎉";
            setTimeout(() => this.speak(), 5000);
        }
    }

    dismiss() {
        this.dismissCount++;
        
        if (this.dismissCount >= 3 && this.dismissCount < RAGE_MESSAGES.length + 3) {
            const text = document.getElementById('clippyText');
            if (text) {
                text.textContent = RAGE_MESSAGES[Math.min(this.dismissCount - 3, RAGE_MESSAGES.length - 1)];
            }
            
            if (this.dismissCount === 5) {
                StateManager.unlockAchievement('clippy_hater');
            }
            
            setTimeout(() => this.hide(), 3000);
            return;
        }

        this.hide();
        localStorage.setItem('clippyDismissed', 'true');
    }
}

const ClippyAssistant = new ClippyAssistantClass();
export default ClippyAssistant;
