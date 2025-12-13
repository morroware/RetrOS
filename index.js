/**
 * RetrOS - Main Entry Point
 * Seth Morrow OS - Windows 95 Style Desktop Environment
 *
 * This file initializes all core systems, UI renderers, and features
 * in the correct order to boot the operating system.
 */

// === CORE SYSTEMS ===
import StorageManager from './core/StorageManager.js';
import StateManager from './core/StateManager.js';
import EventBus, { Events } from './core/EventBus.js';
import WindowManager from './core/WindowManager.js';

// === UI RENDERERS ===
import TaskbarRenderer from './ui/TaskbarRenderer.js';
import DesktopRenderer from './ui/DesktopRenderer.js';
import StartMenuRenderer from './ui/StartMenuRenderer.js';
import ContextMenuRenderer from './ui/ContextMenuRenderer.js';

// === APPLICATIONS ===
// AppRegistry auto-initializes on import
import AppRegistry from './apps/AppRegistry.js';

// === FEATURES ===
import SoundSystem from './features/SoundSystem.js';
import AchievementSystem from './features/AchievementSystem.js';
import EasterEggs from './features/EasterEggs.js';
import ClippyAssistant from './features/ClippyAssistant.js';
import DesktopPet from './features/DesktopPet.js';
import Screensaver from './features/Screensaver.js';

// === BOOT TIPS ===
const BOOT_TIPS = [
    'Loading your personalized experience...',
    'Initializing desktop icons...',
    'Starting Windows Manager...',
    'Loading system tray...',
    'Preparing applications...',
    'Almost ready...'
];

/**
 * Boot sequence - animates the loading screen
 */
class BootSequence {
    constructor() {
        this.bootScreen = document.getElementById('bootScreen');
        this.bootTip = document.getElementById('bootTip');
        this.loadingFill = document.querySelector('.loading-fill');
        this.progress = 0;
        this.tipIndex = 0;
    }

    /**
     * Run the boot animation
     * @returns {Promise} Resolves when boot is complete
     */
    async run() {
        return new Promise((resolve) => {
            // Animate loading bar
            const progressInterval = setInterval(() => {
                this.progress += Math.random() * 15 + 5;
                if (this.progress >= 100) {
                    this.progress = 100;
                    clearInterval(progressInterval);
                    clearInterval(tipInterval);

                    // Finish boot
                    setTimeout(() => {
                        this.complete();
                        resolve();
                    }, 500);
                }

                if (this.loadingFill) {
                    this.loadingFill.style.width = `${this.progress}%`;
                }
            }, 200);

            // Cycle through boot tips
            const tipInterval = setInterval(() => {
                this.tipIndex = (this.tipIndex + 1) % BOOT_TIPS.length;
                if (this.bootTip) {
                    this.bootTip.textContent = BOOT_TIPS[this.tipIndex];
                }
            }, 800);
        });
    }

    /**
     * Complete boot sequence - hide boot screen
     */
    complete() {
        if (this.bootScreen) {
            this.bootScreen.classList.add('fade-out');
            setTimeout(() => {
                this.bootScreen.style.display = 'none';
            }, 500);
        }

        // Emit boot complete event
        EventBus.emit(Events.BOOT_COMPLETE);

        // Play startup sound
        EventBus.emit(Events.SOUND_PLAY, { type: 'startup' });

        console.log('[RetrOS] Boot complete!');
    }
}

/**
 * Initialize all OS components in the correct order
 */
async function initializeOS() {
    console.log('[RetrOS] Starting initialization...');

    // === Phase 1: Core Systems ===
    console.log('[RetrOS] Phase 1: Core Systems');
    StorageManager.initialize();
    StateManager.initialize();
    WindowManager.initialize();

    // === Phase 2: Features ===
    console.log('[RetrOS] Phase 2: Features');
    SoundSystem.initialize();
    AchievementSystem.initialize();
    EasterEggs.initialize();
    ClippyAssistant.initialize();
    DesktopPet.initialize();
    Screensaver.initialize();

    // === Phase 3: UI Renderers ===
    console.log('[RetrOS] Phase 3: UI Renderers');
    TaskbarRenderer.initialize();
    DesktopRenderer.initialize();
    StartMenuRenderer.initialize();
    ContextMenuRenderer.initialize();

    // === Phase 4: Apply saved settings ===
    console.log('[RetrOS] Phase 4: Applying settings');
    applySettings();

    // === Phase 5: Setup global handlers ===
    console.log('[RetrOS] Phase 5: Global handlers');
    setupGlobalHandlers();

    // Mark as visited
    if (!StateManager.getState('user.hasVisited')) {
        StateManager.setState('user.hasVisited', true, true);
    }

    console.log('[RetrOS] Initialization complete');
}

/**
 * Apply saved user settings
 */
function applySettings() {
    // Apply CRT effect
    const crtEnabled = StateManager.getState('settings.crtEffect');
    const crtOverlay = document.getElementById('crtOverlay');
    if (crtOverlay) {
        crtOverlay.style.display = crtEnabled ? 'block' : 'none';
    }

    // Apply desktop background color if saved
    const savedBg = StorageManager.get('desktopBg');
    if (savedBg) {
        const desktop = document.getElementById('desktop');
        if (desktop) {
            desktop.style.backgroundColor = savedBg;
        }
    }

    // Subscribe to CRT setting changes
    StateManager.subscribe('settings.crtEffect', (enabled) => {
        const overlay = document.getElementById('crtOverlay');
        if (overlay) {
            overlay.style.display = enabled ? 'block' : 'none';
        }
    });
}

/**
 * Setup global event handlers
 */
function setupGlobalHandlers() {
    // Handle dialog alerts
    EventBus.on('dialog:alert', ({ message, icon }) => {
        showDialog(message, icon);
    });

    // Handle BSOD (Blue Screen of Death)
    EventBus.on('bsod:trigger', () => {
        showBSOD();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+T = Terminal
        if (e.ctrlKey && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            AppRegistry.launch('terminal');
        }

        // Escape closes context menu and start menu
        if (e.key === 'Escape') {
            EventBus.emit(Events.CONTEXT_MENU_HIDE);
            const startMenu = document.getElementById('startMenu');
            if (startMenu && startMenu.classList.contains('active')) {
                EventBus.emit(Events.START_MENU_TOGGLE, { open: false });
            }
        }
    });

    // Prevent default context menu on body (except inputs)
    document.body.addEventListener('contextmenu', (e) => {
        if (!e.target.closest('input, textarea')) {
            e.preventDefault();
        }
    });
}

/**
 * Show a dialog box
 */
function showDialog(message, icon = 'info') {
    const overlay = document.getElementById('dialogOverlay');
    const dialogIcon = document.getElementById('dialogIcon');
    const dialogText = document.getElementById('dialogText');
    const dialogOk = document.getElementById('dialogOk');

    if (!overlay || !dialogText) return;

    const icons = {
        'info': 'i',
        'warning': '!',
        'error': 'X',
        'question': '?'
    };

    if (dialogIcon) {
        dialogIcon.textContent = icons[icon] || icons.info;
    }
    dialogText.textContent = message;
    overlay.classList.add('active');

    const closeDialog = () => {
        overlay.classList.remove('active');
        dialogOk.removeEventListener('click', closeDialog);
    };

    dialogOk.addEventListener('click', closeDialog);

    // Close on escape
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeDialog();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

/**
 * Show Blue Screen of Death
 */
function showBSOD() {
    const bsod = document.getElementById('bsod');
    if (bsod) {
        bsod.classList.add('active');

        // Any key to dismiss
        const dismissHandler = () => {
            bsod.classList.remove('active');
            document.removeEventListener('keydown', dismissHandler);
            document.removeEventListener('click', dismissHandler);
        };

        setTimeout(() => {
            document.addEventListener('keydown', dismissHandler);
            document.addEventListener('click', dismissHandler);
        }, 1000);
    }
}

// === MAIN EXECUTION ===
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[RetrOS] DOM Ready - Starting boot sequence');

    // Create boot sequence
    const boot = new BootSequence();

    // Initialize OS components while boot screen shows
    await initializeOS();

    // Run boot animation (will complete after initialization)
    await boot.run();

    console.log('[RetrOS] System ready!');
});
