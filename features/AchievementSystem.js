/**
 * AchievementSystem - Tracks and displays achievements
 * Singleton pattern
 */

import EventBus, { Events } from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';

const ALL_ACHIEVEMENTS = [
    { id: 'first_boot', name: 'First Boot', desc: 'Welcome!', icon: '👋' },
    { id: 'konami_master', name: 'Konami Master', desc: 'Entered the code', icon: '🎮' },
    { id: 'disco_fever', name: 'Disco Fever', desc: 'Clicked clock 10x', icon: '🕺' },
    { id: 'multitasker', name: 'Multitasker', desc: '10+ windows', icon: '🪟' },
    { id: 'clippy_hater', name: 'Clippy Hater', desc: 'Dismissed 5x', icon: '😠' },
    { id: 'clippy_terminator', name: 'Clippy Terminator', desc: 'Dismissed 10x', icon: '🔫' },
    { id: 'matrix_mode', name: 'Neo', desc: 'Entered Matrix', icon: '🌧️' },
];

class AchievementSystemClass {
    initialize() {
        EventBus.on(Events.ACHIEVEMENT_UNLOCK, ({ id }) => {
            this.showToast(id);
        });

        // First boot achievement
        if (!StateManager.getState('user.hasVisited')) {
            setTimeout(() => {
                StateManager.unlockAchievement('first_boot');
            }, 4000);
        }

        console.log('[AchievementSystem] Initialized');
    }

    showToast(id) {
        const achievement = ALL_ACHIEVEMENTS.find(a => a.id === id) || {
            name: id, desc: 'Achievement unlocked!', icon: '🏆'
        };

        const toast = document.createElement('div');
        toast.className = 'achievement-toast active';
        toast.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-title">Achievement Unlocked!</div>
            <div class="achievement-desc">${achievement.name}</div>
        `;
        document.body.appendChild(toast);

        EventBus.emit(Events.SOUND_PLAY, { type: 'achievement' });

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    getAll() {
        return ALL_ACHIEVEMENTS;
    }

    getUnlocked() {
        return StateManager.getState('achievements') || [];
    }
}

const AchievementSystem = new AchievementSystemClass();
export default AchievementSystem;
