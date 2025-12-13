/**
 * EasterEggs - Hidden features and surprises
 * Singleton pattern
 */

import EventBus, { Events } from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';

class EasterEggsClass {
    constructor() {
        this.konamiCode = [];
        this.konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        this.typedChars = [];
    }

    initialize() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        console.log('[EasterEggs] Initialized');
    }

    handleKeydown(e) {
        // Konami code
        this.konamiCode.push(e.key);
        if (this.konamiCode.length > 10) this.konamiCode.shift();
        
        if (this.konamiCode.join(',') === this.konamiSequence.join(',')) {
            this.triggerKonami();
            this.konamiCode = [];
        }

        // Rosebud cheat
        this.typedChars.push(e.key);
        if (this.typedChars.length > 10) this.typedChars.shift();
        
        if (this.typedChars.slice(-7).join('') === 'rosebud') {
            this.triggerRosebud();
            this.typedChars = [];
        }
    }

    triggerKonami() {
        // Celebration
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const emoji = document.createElement('div');
                emoji.className = 'celebration';
                emoji.textContent = ['🎉', '🎀', '⭐', '🌟', '💫', '✨'][Math.floor(Math.random() * 6)];
                emoji.style.left = Math.random() * 100 + 'vw';
                emoji.style.animationDelay = Math.random() * 0.5 + 's';
                document.body.appendChild(emoji);
                setTimeout(() => emoji.remove(), 2000);
            }, i * 50);
        }

        StateManager.unlockAchievement('konami_master');
        EventBus.emit(Events.SOUND_PLAY, { type: 'startup' });

        // Enable pet
        EventBus.emit(Events.PET_TOGGLE, { enabled: true });

        // Show secret message
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay active';
        overlay.innerHTML = `
            <div class="dialog-box" style="max-width:400px;">
                <div style="text-align:center;">
                    <h2>🎮 SECRET UNLOCKED! 🎮</h2>
                    <p>⬆️ ⬆️ ⬇️ ⬇️ ⬅️ ➡️ ⬅️ ➡️ B A</p>
                    <br>
                    <p>You unlocked:</p>
                    <ul style="text-align:left;">
                        <li>🎨 Disco Mode (Terminal)</li>
                        <li>🐕 Desktop Pet</li>
                        <li>🌧️¸ Matrix Mode (Terminal)</li>
                    </ul>
                </div>
                <button class="btn btn-primary" style="width:100%;margin-top:15px;">Awesome!</button>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('button').onclick = () => overlay.remove();
    }

    triggerRosebud() {
        StateManager.setState('user.isAdmin', true);
        StateManager.unlockAchievement('secret_admin');
        
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay active';
        overlay.innerHTML = `
            <div class="dialog-box">
                <div class="dialog-icon">🌹</div>
                <div class="dialog-text">Admin access granted via rosebud cheat!</div>
                <button class="btn btn-primary">OK</button>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('button').onclick = () => overlay.remove();
        
        EventBus.emit(Events.SOUND_PLAY, { type: 'startup' });
    }

    triggerBSOD() {
        const bsod = document.getElementById('bsod');
        if (bsod) {
            bsod.classList.add('active');
            StateManager.unlockAchievement('bsod_master');
        }
    }

    triggerDisco() {
        document.body.classList.add('disco-mode');
        setTimeout(() => document.body.classList.remove('disco-mode'), 10000);
    }
}

const EasterEggs = new EasterEggsClass();
export default EasterEggs;
