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
import FileSystemManager from './core/FileSystemManager.js';

// === UI RENDERERS ===
import TaskbarRenderer from './ui/TaskbarRenderer.js';
import DesktopRenderer from './ui/DesktopRenderer.js';
import StartMenuRenderer from './ui/StartMenuRenderer.js';
import ContextMenuRenderer from './ui/ContextMenuRenderer.js';

// === APPLICATIONS ===
import AppRegistry from './apps/AppRegistry.js';

// === FEATURES ===
import SoundSystem from './features/SoundSystem.js';
import AchievementSystem from './features/AchievementSystem.js';
import EasterEggs from './features/EasterEggs.js';
import ClippyAssistant from './features/ClippyAssistant.js';
import DesktopPet from './features/DesktopPet.js';
import Screensaver from './features/Screensaver.js';
import SystemDialogs from './features/SystemDialogs.js';

// Log successful module loading
console.log('[RetrOS] All modules imported successfully');

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
 * Initialize a single component with error handling
 * @param {string} name - Component name for logging
 * @param {Function} initFn - Initialization function
 */
function initComponent(name, initFn) {
    try {
        console.log(`[RetrOS]   - Initializing ${name}...`);
        initFn();
    } catch (error) {
        console.error(`[RetrOS] FAILED to initialize ${name}:`, error);
        throw new Error(`Failed to initialize ${name}: ${error.message}`);
    }
}

/**
 * Initialize all OS components in the correct order
 * @param {Function} onProgress - Callback for progress updates
 */
async function initializeOS(onProgress = () => {}) {
    console.log('[RetrOS] Starting initialization...');

    // === Phase 0: App Registry (CRITICAL - was running outside error handling!) ===
    console.log('[RetrOS] Phase 0: App Registry');
    onProgress(5, 'Registering applications...');
    initComponent('AppRegistry', () => AppRegistry.initialize());

    // === Phase 1: Core Systems ===
    console.log('[RetrOS] Phase 1: Core Systems');
    onProgress(15, 'Loading core systems...');
    initComponent('StorageManager', () => StorageManager.initialize());
    initComponent('StateManager', () => StateManager.initialize());
    initComponent('WindowManager', () => WindowManager.initialize());

    // === Phase 1.5: Sync Filesystem with Apps and Desktop ===
    console.log('[RetrOS] Phase 1.5: Filesystem Sync');
    onProgress(25, 'Syncing filesystem...');
    initComponent('FilesystemSync', () => {
        // Sync desktop icons from StateManager into filesystem
        const icons = StateManager.getState('icons');
        FileSystemManager.syncDesktopIcons(icons);

        // Sync installed apps into Program Files
        const apps = AppRegistry.getAll();
        FileSystemManager.syncInstalledApps(apps);

        // Save the updated filesystem
        FileSystemManager.saveFileSystem();
    });

    // === Phase 2: Features ===
    console.log('[RetrOS] Phase 2: Features');
    onProgress(35, 'Loading features...');
    initComponent('SoundSystem', () => SoundSystem.initialize());
    initComponent('AchievementSystem', () => AchievementSystem.initialize());
    initComponent('EasterEggs', () => EasterEggs.initialize());
    initComponent('ClippyAssistant', () => ClippyAssistant.initialize());
    initComponent('DesktopPet', () => DesktopPet.initialize());
    initComponent('Screensaver', () => Screensaver.initialize());
    initComponent('SystemDialogs', () => SystemDialogs.initialize());

    // === Phase 3: UI Renderers ===
    console.log('[RetrOS] Phase 3: UI Renderers');
    onProgress(60, 'Rendering desktop...');
    initComponent('TaskbarRenderer', () => TaskbarRenderer.initialize());
    initComponent('DesktopRenderer', () => DesktopRenderer.initialize());
    initComponent('StartMenuRenderer', () => StartMenuRenderer.initialize());
    initComponent('ContextMenuRenderer', () => ContextMenuRenderer.initialize());

    // === Phase 4: Apply saved settings ===
    console.log('[RetrOS] Phase 4: Applying settings');
    onProgress(80, 'Applying settings...');
    initComponent('Settings', () => applySettings());

    // === Phase 5: Setup global handlers ===
    console.log('[RetrOS] Phase 5: Global handlers');
    onProgress(90, 'Setting up handlers...');
    initComponent('GlobalHandlers', () => setupGlobalHandlers());

    // Mark as visited
    if (!StateManager.getState('user.hasVisited')) {
        StateManager.setState('user.hasVisited', true, true);
    }

    onProgress(100, 'Ready!');
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

    // Signal that the real boot sequence has started (stops fallback animation)
    window.bootSequenceStarted = true;

    // Create boot sequence
    const boot = new BootSequence();

    // Track initialization progress
    let initProgress = 0;
    let initTip = 'Starting up...';
    let initComplete = false;
    let initError = null;

    // Start boot animation IMMEDIATELY (don't wait for init)
    // This ensures users see progress even if init has issues
    const bootPromise = new Promise((resolve) => {
        const progressInterval = setInterval(() => {
            // Use actual init progress if available, otherwise animate slowly
            if (initComplete) {
                boot.progress = 100;
            } else if (initError) {
                clearInterval(progressInterval);
                clearInterval(tipInterval);
                resolve();
                return;
            } else {
                // Smoothly animate towards init progress
                const targetProgress = Math.min(initProgress, 95); // Cap at 95% until init completes
                boot.progress = Math.min(boot.progress + 2, targetProgress);
            }

            if (boot.loadingFill) {
                boot.loadingFill.style.width = `${boot.progress}%`;
            }

            if (boot.progress >= 100) {
                clearInterval(progressInterval);
                clearInterval(tipInterval);
                setTimeout(() => {
                    boot.complete();
                    resolve();
                }, 300);
            }
        }, 100);

        // Update tips from init progress
        const tipInterval = setInterval(() => {
            if (boot.bootTip && initTip) {
                boot.bootTip.textContent = initTip;
            }
        }, 200);
    });

    try {
        // Initialize OS with progress callbacks and timeout safety
        const INIT_TIMEOUT = 30000; // 30 seconds max for initialization

        const initPromise = initializeOS((progress, tip) => {
            initProgress = progress;
            initTip = tip;
        });

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Initialization timed out after ${INIT_TIMEOUT/1000} seconds. Last progress: ${initProgress}% - "${initTip}"`));
            }, INIT_TIMEOUT);
        });

        // Race between init completing and timeout
        await Promise.race([initPromise, timeoutPromise]);

        initComplete = true;

        // Wait for boot animation to finish
        await bootPromise;

        console.log('[RetrOS] System ready!');
    } catch (error) {
        console.error('[RetrOS] Boot failed with error:', error);
        initError = error;

        // Show error to user and allow recovery
        const bootScreen = document.getElementById('bootScreen');
        if (bootScreen) {
            bootScreen.innerHTML = `
                <div style="color: white; text-align: center; padding: 20px; font-family: 'Courier New', monospace;">
                    <h2 style="color: #ff6b6b;">⚠️ RetrOS Boot Error</h2>
                    <p style="color: #aaa; margin: 15px 0;">An error occurred during startup:</p>
                    <pre style="background: #1a1a1a; padding: 15px; margin: 15px auto; border-radius: 4px; text-align: left; max-width: 600px; overflow: auto; border: 1px solid #333; color: #ff6b6b; font-size: 12px;">${error.message}</pre>
                    <p style="color: #888; font-size: 12px; margin: 10px 0;">Check browser console (F12) for full details</p>
                    <button onclick="location.reload()" style="padding: 12px 24px; cursor: pointer; margin-top: 15px; background: #4a4a4a; color: white; border: 2px outset #666; font-size: 14px;">
                        🔄 Restart RetrOS
                    </button>
                    <button onclick="localStorage.clear(); location.reload()" style="padding: 12px 24px; cursor: pointer; margin-top: 15px; margin-left: 10px; background: #8b0000; color: white; border: 2px outset #666; font-size: 14px;">
                        🗑️ Reset & Restart
                    </button>
                </div>
            `;
        }
    }
});
