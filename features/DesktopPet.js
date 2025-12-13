/**
 * DesktopPet - Animated desktop companion
 * Singleton pattern
 */

import EventBus, { Events } from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';

const PETS = ['🐕', '🐈', '🦆', '🐢', '🐰', '🦊', '🐸', '🐧'];
const FORTUNES = [
    "You will find happiness in a retro OS.",
    "A mysterious paperclip brings wisdom.",
    "Your lucky numbers are 640, 95, 1998.",
    "Today is good for defragmentation.",
];

class DesktopPetClass {
    constructor() {
        this.clickCount = 0;
    }

    initialize() {
        const pet = document.getElementById('desktopPet');
        if (!pet) return;

        // Load saved state
        const enabled = StateManager.getState('settings.pet.enabled');
        const type = StateManager.getState('settings.pet.type') || '🐕';

        pet.textContent = type;
        if (enabled) pet.classList.add('active');

        pet.addEventListener('click', () => this.handleClick());

        // Listen for toggle events
        EventBus.on(Events.PET_TOGGLE, ({ enabled }) => {
            this.toggle(enabled);
        });

        EventBus.on(Events.PET_CHANGE, ({ type }) => {
            this.change(type);
        });

        console.log('[DesktopPet] Initialized');
    }

    handleClick() {
        this.clickCount++;
        if (this.clickCount >= 5) {
            this.clickCount = 0;
            this.showFortune();
        }
    }

    showFortune() {
        const fortune = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
        const type = StateManager.getState('settings.pet.type') || '🐕';
        
        // Create alert dialog
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay active';
        overlay.innerHTML = `
            <div class="dialog-box">
                <div class="dialog-icon">🔮</div>
                <div class="dialog-text">${type} says:<br><br>"${fortune}"</div>
                <div class="dialog-buttons">
                    <button class="btn btn-primary">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('button').onclick = () => overlay.remove();

        StateManager.unlockAchievement('fortune_teller');
    }

    toggle(enabled) {
        const pet = document.getElementById('desktopPet');
        if (!pet) return;

        if (enabled) {
            pet.classList.add('active');
        } else {
            pet.classList.remove('active');
        }
        StateManager.setState('settings.pet.enabled', enabled, true);
    }

    change(type) {
        const pet = document.getElementById('desktopPet');
        if (pet) pet.textContent = type;
        StateManager.setState('settings.pet.type', type, true);
    }

    getAvailablePets() {
        return PETS;
    }
}

const DesktopPet = new DesktopPetClass();
export default DesktopPet;
