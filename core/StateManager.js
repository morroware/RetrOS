/**
 * StateManager - Centralized state management with reactive subscriptions
 * Single source of truth for all application state
 * 
 * Usage:
 *   StateManager.setState('windows', [...])
 *   StateManager.getState('windows')
 *   StateManager.subscribe('windows', callback)
 */

import EventBus, { Events } from './EventBus.js';
import StorageManager from './StorageManager.js';

// Default desktop icons (used when localStorage is empty)
const DEFAULT_ICONS = [
    // --- COLUMN 1: System Core (x: 20) ---
    { id: 'mycomputer', label: 'My Computer', emoji: '💻', type: 'app', x: 20, y: 20 },
    { id: 'recyclebin', label: 'Recycle Bin', emoji: '🗑️', type: 'app', x: 20, y: 110 },
    { id: 'terminal', label: 'Terminal', emoji: '📟', type: 'app', x: 20, y: 200 },

    // --- COLUMN 2: Productivity & Tools (x: 120) ---
    { id: 'notepad', label: 'Notepad', emoji: '📝', type: 'app', x: 120, y: 20 },
    { id: 'paint', label: 'Paint', emoji: '🖌️', type: 'app', x: 120, y: 110 },
    { id: 'calculator', label: 'Calculator', emoji: '🔢', type: 'app', x: 120, y: 200 },
    { id: 'imagegen', label: 'Image Gen', emoji: '🎨', url: 'https://sethmorrow.com/imagegen', x: 120, y: 290, type: 'link' },
    { id: 'ciphers', label: 'Cipher Decoder', emoji: '🔍', url: 'https://sethmorrow.com/ciphers', x: 120, y: 380, type: 'link' },

    // --- COLUMN 3: Content / "My Documents" (x: 220) ---
    { id: 'music', label: 'Music', emoji: '🎵', url: 'https://sethmorrow.com/music', x: 220, y: 20, type: 'link' },
    { id: 'videos', label: 'Videos', emoji: '📺', url: 'https://sethmorrow.com/videos', x: 220, y: 110, type: 'link' },
    { id: 'books', label: 'Books', emoji: '📚', url: 'https://sethmorrow.com/books', x: 220, y: 200, type: 'link' },
    { id: 'audiobooks', label: 'Audiobooks', emoji: '🎧', url: 'https://sethmorrow.com/audiobooks', x: 220, y: 290, type: 'link' },

    // --- COLUMN 4: Games (x: 320) ---
    { id: 'solitaire', label: 'Solitaire', emoji: '🃏', type: 'app', x: 320, y: 20 },
    { id: 'minesweeper', label: 'Minesweeper', emoji: '💣', type: 'app', x: 320, y: 110 },
    { id: 'snake', label: 'Snake', emoji: '🐍', type: 'app', x: 320, y: 200 },
    { id: 'asteroids', label: 'Asteroids', emoji: '🚀', type: 'app', x: 320, y: 290 },
    { id: 'doom', label: 'DOOM', emoji: '👹', type: 'app', x: 320, y: 380 }
];


class StateManagerClass {
    constructor() {
        // Central state object
        this.state = {
            // Desktop icons
            icons: [],
            // File icon positions (for files on desktop)
            filePositions: {},
            // Open windows
            windows: [],
            // Custom menu items
            menuItems: [],
            // Recycled items
            recycledItems: [],
            // Unlocked achievements
            achievements: [],
            // Settings
            settings: {
                sound: false,
                crtEffect: true,
                pet: {
                    enabled: false,
                    type: '🐕'
                },
                screensaverDelay: 300000
            },
            // User state
            user: {
                isAdmin: false,
                hasVisited: false
            },
            // UI state
            ui: {
                activeWindow: null,
                startMenuOpen: false,
                contextMenuOpen: false,
                clippyVisible: false
            }
        };

        // Subscribers by key path
        this.subscribers = new Map();
        
        // Track highest window z-index
        this.windowZIndex = 1000;
    }

    /**
     * Initialize state from storage
     */
    initialize() {
        // Load persisted state
        const savedIcons = StorageManager.get('desktopIcons');
        const savedFilePositions = StorageManager.get('filePositions');
        const savedMenu = StorageManager.get('menuItems');
        const savedRecycled = StorageManager.get('recycledItems');
        const savedAchievements = StorageManager.get('achievements');
        const savedSound = StorageManager.get('soundEnabled');
        const savedCRT = StorageManager.get('crtEnabled');
        const savedPet = StorageManager.get('petEnabled');
        const savedPetType = StorageManager.get('currentPet');
        const hasVisited = StorageManager.get('hasVisited');

        // Apply saved state OR use defaults
        this.state.icons = savedIcons || [...DEFAULT_ICONS];
        if (savedFilePositions) this.state.filePositions = savedFilePositions;
        if (savedMenu) this.state.menuItems = savedMenu;
        if (savedRecycled) this.state.recycledItems = savedRecycled;
        if (savedAchievements) this.state.achievements = savedAchievements;
        if (savedSound !== null) this.state.settings.sound = savedSound === true || savedSound === 'true';
        if (savedCRT !== null) this.state.settings.crtEffect = savedCRT === true || savedCRT === 'true';
        if (savedPet !== null) this.state.settings.pet.enabled = savedPet === true || savedPet === 'true';
        if (savedPetType) this.state.settings.pet.type = savedPetType;
        if (hasVisited) this.state.user.hasVisited = true;

        console.log('[StateManager] Initialized with', this.state.icons.length, 'icons');
    }

    /**
     * Get state value by path
     * @param {string} path - Dot-notation path (e.g., 'settings.sound')
     * @returns {*} State value
     */
    getState(path) {
        if (!path) return this.state;
        
        return path.split('.').reduce((obj, key) => {
            return obj && obj[key] !== undefined ? obj[key] : undefined;
        }, this.state);
    }

    /**
     * Set state value and notify subscribers
     * @param {string} path - Dot-notation path
     * @param {*} value - New value
     * @param {boolean} persist - Whether to save to storage
     */
    setState(path, value, persist = false) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        
        // Navigate to parent object
        let obj = this.state;
        for (const key of keys) {
            if (!obj[key]) obj[key] = {};
            obj = obj[key];
        }
        
        const oldValue = obj[lastKey];
        obj[lastKey] = value;

        // Emit state change event
        EventBus.emit(Events.STATE_CHANGE, { path, value, oldValue });

        // Notify subscribers for this path and parent paths
        this.notifySubscribers(path, value);
        
        // Persist to storage if requested
        if (persist) {
            this.persistState(path, value);
        }
    }

    /**
     * Subscribe to state changes
     * @param {string} path - State path to watch
     * @param {Function} callback - Handler function
     * @returns {Function} Unsubscribe function
     */
    subscribe(path, callback) {
        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, []);
        }
        this.subscribers.get(path).push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(path);
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        };
    }

    /**
     * Notify all subscribers of a state change
     * @param {string} path - Changed path
     * @param {*} value - New value
     */
    notifySubscribers(path, value) {
        // Notify exact path subscribers
        if (this.subscribers.has(path)) {
            this.subscribers.get(path).forEach(cb => cb(value, path));
        }

        // Notify parent path subscribers
        const parts = path.split('.');
        while (parts.length > 1) {
            parts.pop();
            const parentPath = parts.join('.');
            if (this.subscribers.has(parentPath)) {
                const parentValue = this.getState(parentPath);
                this.subscribers.get(parentPath).forEach(cb => cb(parentValue, path));
            }
        }
    }

    /**
     * Persist specific state to storage
     * @param {string} path - State path
     * @param {*} value - Value to persist
     */
    persistState(path, value) {
        const storageMap = {
            'icons': 'desktopIcons',
            'filePositions': 'filePositions',
            'menuItems': 'menuItems',
            'recycledItems': 'recycledItems',
            'achievements': 'achievements',
            'settings.sound': 'soundEnabled',
            'settings.crtEffect': 'crtEnabled',
            'settings.pet.enabled': 'petEnabled',
            'settings.pet.type': 'currentPet',
            'user.hasVisited': 'hasVisited'
        };

        if (storageMap[path]) {
            StorageManager.set(storageMap[path], value);
        }
    }

    // ===== Window State Helpers =====

    /**
     * Add a window to state
     * @param {Object} windowData - Window configuration
     * @returns {Object} The added window
     */
    addWindow(windowData) {
        const window = {
            ...windowData,
            zIndex: ++this.windowZIndex,
            minimized: false,
            maximized: false
        };
        
        const windows = [...this.state.windows, window];
        this.setState('windows', windows);
        this.setState('ui.activeWindow', window.id);
        
        return window;
    }

    /**
     * Remove a window from state
     * @param {string} windowId - Window ID to remove
     */
    removeWindow(windowId) {
        const windows = this.state.windows.filter(w => w.id !== windowId);
        this.setState('windows', windows);
        
        // Update active window
        if (this.state.ui.activeWindow === windowId) {
            const lastWindow = windows[windows.length - 1];
            this.setState('ui.activeWindow', lastWindow ? lastWindow.id : null);
        }
    }

    /**
     * Get a window by ID
     * @param {string} windowId - Window ID
     * @returns {Object|null} Window data
     */
    getWindow(windowId) {
        return this.state.windows.find(w => w.id === windowId) || null;
    }

    /**
     * Update a window's state
     * @param {string} windowId - Window ID
     * @param {Object} updates - Properties to update
     */
    updateWindow(windowId, updates) {
        const windows = this.state.windows.map(w => 
            w.id === windowId ? { ...w, ...updates } : w
        );
        this.setState('windows', windows);
    }

    /**
     * Focus a window (bring to front)
     * @param {string} windowId - Window ID
     */
    focusWindow(windowId) {
        this.updateWindow(windowId, { 
            zIndex: ++this.windowZIndex,
            minimized: false 
        });
        this.setState('ui.activeWindow', windowId);
    }

    // ===== Icon State Helpers =====

    /**
     * Add an icon
     * @param {Object} iconData - Icon configuration
     */
    addIcon(iconData) {
        const icons = [...this.state.icons, iconData];
        this.setState('icons', icons, true);
    }

    /**
     * Remove an icon (move to recycle bin)
     * @param {string} iconId - Icon ID
     */
    recycleIcon(iconId) {
        const icon = this.state.icons.find(i => i.id === iconId);
        if (!icon) return;

        // Add to recycle bin
        const recycled = [...this.state.recycledItems, icon];
        this.setState('recycledItems', recycled, true);

        // Remove from desktop
        const icons = this.state.icons.filter(i => i.id !== iconId);
        this.setState('icons', icons, true);
    }

    /**
     * Restore icon from recycle bin
     * @param {number} index - Index in recycled items
     */
    restoreIcon(index) {
        const item = this.state.recycledItems[index];
        if (!item) return;

        // Add back to icons
        const icons = [...this.state.icons, item];
        this.setState('icons', icons, true);

        // Remove from recycle bin
        const recycled = this.state.recycledItems.filter((_, i) => i !== index);
        this.setState('recycledItems', recycled, true);
    }

    /**
     * Update icon position
     * @param {string} iconId - Icon ID
     * @param {number} x - New X position
     * @param {number} y - New Y position
     */
    updateIconPosition(iconId, x, y) {
        const icons = this.state.icons.map(icon => 
            icon.id === iconId ? { ...icon, x, y } : icon
        );
        this.setState('icons', icons, true);
    }

    // ===== Achievement Helpers =====

    /**
     * Check if achievement is unlocked
     * @param {string} achievementId - Achievement ID
     * @returns {boolean}
     */
    hasAchievement(achievementId) {
        return this.state.achievements.includes(achievementId);
    }

    /**
     * Unlock an achievement
     * @param {string} achievementId - Achievement ID
     * @returns {boolean} Whether it was newly unlocked
     */
    unlockAchievement(achievementId) {
        if (this.hasAchievement(achievementId)) return false;

        const achievements = [...this.state.achievements, achievementId];
        this.setState('achievements', achievements, true);
        
        EventBus.emit(Events.ACHIEVEMENT_UNLOCK, { id: achievementId });
        return true;
    }

    // ===== Settings Helpers =====

    /**
     * Toggle a boolean setting
     * @param {string} settingPath - Setting path (e.g., 'sound')
     * @returns {boolean} New value
     */
    toggleSetting(settingPath) {
        const fullPath = `settings.${settingPath}`;
        const current = this.getState(fullPath);
        this.setState(fullPath, !current, true);
        return !current;
    }

    /**
     * Export full state for backup
     * @returns {Object} Complete state
     */
    exportState() {
        return {
            icons: this.state.icons,
            menuItems: this.state.menuItems,
            achievements: this.state.achievements,
            settings: this.state.settings,
            bgColor: StorageManager.get('desktopBg'),
            password: StorageManager.get('adminPassword')
        };
    }

    /**
     * Import state from backup
     * @param {Object} data - State data to import
     */
    importState(data) {
        if (data.icons) this.setState('icons', data.icons, true);
        if (data.menuItems) this.setState('menuItems', data.menuItems, true);
        if (data.achievements) this.setState('achievements', data.achievements, true);
        if (data.settings) {
            Object.entries(data.settings).forEach(([key, value]) => {
                if (typeof value === 'object') {
                    Object.entries(value).forEach(([subKey, subValue]) => {
                        this.setState(`settings.${key}.${subKey}`, subValue, true);
                    });
                } else {
                    this.setState(`settings.${key}`, value, true);
                }
            });
        }
        if (data.bgColor) StorageManager.set('desktopBg', data.bgColor);
        if (data.password) StorageManager.set('adminPassword', data.password);
    }

    /**
     * Reset all state to defaults
     */
    reset() {
        StorageManager.clear();
        window.location.reload();
    }
}

// Singleton instance
const StateManager = new StateManagerClass();

export { StateManager };
export default StateManager;
