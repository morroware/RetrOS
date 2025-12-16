/**
 * SystemDialogs - Windows 95 style system dialogs
 * Run Dialog, Shutdown Dialog, About Dialog, Welcome Tips
 */

import EventBus, { Events } from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';
import WindowManager from '../core/WindowManager.js';
import AppRegistry from '../apps/AppRegistry.js';

class SystemDialogsClass {
    constructor() {
        this.runDialogOpen = false;
        this.shutdownDialogOpen = false;
    }

    /**
     * Initialize system dialogs
     */
    initialize() {
        // Create dialog containers
        this.createDialogContainers();

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Listen for app launches
        EventBus.on('app:open', ({ id }) => {
            if (id === 'run') this.showRunDialog();
            if (id === 'shutdown') this.showShutdownDialog();
            if (id === 'help') this.showAboutDialog();
        });

        // Show welcome on first visit
        EventBus.on(Events.BOOT_COMPLETE, () => {
            setTimeout(() => {
                if (!StateManager.getState('user.seenWelcome')) {
                    this.showWelcomeDialog();
                    StateManager.setState('user.seenWelcome', true, true);
                }
            }, 1000);
        });

        console.log('[SystemDialogs] Initialized');
    }

    /**
     * Create dialog containers in the DOM
     */
    createDialogContainers() {
        // Run Dialog
        const runDialog = document.createElement('div');
        runDialog.id = 'runDialog';
        runDialog.className = 'system-dialog-overlay';
        runDialog.innerHTML = `
            <div class="system-dialog run-dialog">
                <div class="dialog-titlebar">
                    <span class="dialog-title-icon">▶️</span>
                    <span>Run</span>
                    <button class="dialog-close-btn">×</button>
                </div>
                <div class="dialog-body">
                    <div class="run-dialog-content">
                        <div class="run-icon">🖥️</div>
                        <div class="run-text">
                            <p>Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.</p>
                            <div class="run-input-group">
                                <label for="runInput">Open:</label>
                                <input type="text" id="runInput" class="run-input" placeholder="notepad" autocomplete="off">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="dialog-buttons">
                    <button class="btn" id="runOkBtn">OK</button>
                    <button class="btn" id="runCancelBtn">Cancel</button>
                    <button class="btn" id="runBrowseBtn">Browse...</button>
                </div>
            </div>
        `;
        document.body.appendChild(runDialog);

        // Shutdown Dialog
        const shutdownDialog = document.createElement('div');
        shutdownDialog.id = 'shutdownDialog';
        shutdownDialog.className = 'system-dialog-overlay';
        shutdownDialog.innerHTML = `
            <div class="system-dialog shutdown-dialog">
                <div class="dialog-titlebar">
                    <span class="dialog-title-icon">⏻</span>
                    <span>Shut Down Windows</span>
                    <button class="dialog-close-btn">×</button>
                </div>
                <div class="dialog-body">
                    <div class="shutdown-content">
                        <div class="shutdown-icon">💻</div>
                        <div class="shutdown-text">
                            <p>What do you want the computer to do?</p>
                            <div class="shutdown-options">
                                <label class="shutdown-option">
                                    <input type="radio" name="shutdownOption" value="shutdown" checked>
                                    <span class="option-icon">⏻</span>
                                    <span>Shut down</span>
                                </label>
                                <label class="shutdown-option">
                                    <input type="radio" name="shutdownOption" value="restart">
                                    <span class="option-icon">🔄</span>
                                    <span>Restart</span>
                                </label>
                                <label class="shutdown-option">
                                    <input type="radio" name="shutdownOption" value="logoff">
                                    <span class="option-icon">👤</span>
                                    <span>Log off</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="dialog-buttons">
                    <button class="btn btn-primary" id="shutdownOkBtn">OK</button>
                    <button class="btn" id="shutdownCancelBtn">Cancel</button>
                    <button class="btn" id="shutdownHelpBtn">Help</button>
                </div>
            </div>
        `;
        document.body.appendChild(shutdownDialog);

        // About Dialog
        const aboutDialog = document.createElement('div');
        aboutDialog.id = 'aboutDialog';
        aboutDialog.className = 'system-dialog-overlay';
        aboutDialog.innerHTML = `
            <div class="system-dialog about-dialog">
                <div class="dialog-titlebar">
                    <span class="dialog-title-icon">ℹ️</span>
                    <span>About RetrOS</span>
                    <button class="dialog-close-btn">×</button>
                </div>
                <div class="dialog-body">
                    <div class="about-content">
                        <div class="about-logo">
                            <div class="about-logo-text">RetrOS</div>
                            <div class="about-logo-subtitle">Windows 95 Experience</div>
                        </div>
                        <div class="about-info">
                            <p><strong>Seth Morrow OS</strong></p>
                            <p>Version 95.0 Build 1995</p>
                            <p>Copyright © 2024</p>
                            <div class="about-divider"></div>
                            <p class="about-specs">
                                <span>Memory: 640KB (That's all you'll ever need)</span>
                                <span>Disk Space: ∞ (It's just localStorage)</span>
                                <span>Processor: Your Browser</span>
                            </p>
                            <div class="about-divider"></div>
                            <p class="about-credits">
                                Made with nostalgia and JavaScript
                            </p>
                        </div>
                    </div>
                </div>
                <div class="dialog-buttons">
                    <button class="btn btn-primary" id="aboutOkBtn">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(aboutDialog);

        // Welcome Dialog
        const welcomeDialog = document.createElement('div');
        welcomeDialog.id = 'welcomeDialog';
        welcomeDialog.className = 'system-dialog-overlay';
        welcomeDialog.innerHTML = `
            <div class="system-dialog welcome-dialog">
                <div class="dialog-titlebar">
                    <span class="dialog-title-icon">🎉</span>
                    <span>Welcome to RetrOS</span>
                    <button class="dialog-close-btn">×</button>
                </div>
                <div class="dialog-body">
                    <div class="welcome-content">
                        <div class="welcome-banner">
                            <div class="welcome-logo">RetrOS 95</div>
                        </div>
                        <div class="welcome-tips">
                            <h3>💡 Did you know?</h3>
                            <ul class="tips-list">
                                <li>Double-click desktop icons to open applications</li>
                                <li>Right-click anywhere for context menus</li>
                                <li>Try the Konami Code for a surprise! ↑↑↓↓←→←→BA</li>
                                <li>Click the clock 10 times for disco mode!</li>
                                <li>Type "rosebud" to unlock admin access</li>
                                <li>Check out the Terminal for Easter eggs</li>
                            </ul>
                        </div>
                        <div class="welcome-checkbox">
                            <label>
                                <input type="checkbox" id="welcomeShowAgain">
                                Show this dialog at startup
                            </label>
                        </div>
                    </div>
                </div>
                <div class="dialog-buttons">
                    <button class="btn btn-primary" id="welcomeOkBtn">Let's Go!</button>
                </div>
            </div>
        `;
        document.body.appendChild(welcomeDialog);

        // Attach event handlers
        this.attachEventHandlers();
    }

    /**
     * Attach event handlers to dialogs
     */
    attachEventHandlers() {
        // Run Dialog handlers
        const runDialog = document.getElementById('runDialog');
        const runInput = document.getElementById('runInput');
        const runOkBtn = document.getElementById('runOkBtn');
        const runCancelBtn = document.getElementById('runCancelBtn');
        const runBrowseBtn = document.getElementById('runBrowseBtn');

        runOkBtn?.addEventListener('click', () => this.executeRunCommand());
        runCancelBtn?.addEventListener('click', () => this.hideRunDialog());
        runBrowseBtn?.addEventListener('click', () => {
            AppRegistry.launch('mycomputer');
            this.hideRunDialog();
        });
        runInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.executeRunCommand();
            if (e.key === 'Escape') this.hideRunDialog();
        });
        runDialog?.querySelector('.dialog-close-btn')?.addEventListener('click', () => this.hideRunDialog());
        runDialog?.addEventListener('click', (e) => {
            if (e.target === runDialog) this.hideRunDialog();
        });

        // Shutdown Dialog handlers
        const shutdownDialog = document.getElementById('shutdownDialog');
        const shutdownOkBtn = document.getElementById('shutdownOkBtn');
        const shutdownCancelBtn = document.getElementById('shutdownCancelBtn');
        const shutdownHelpBtn = document.getElementById('shutdownHelpBtn');

        shutdownOkBtn?.addEventListener('click', () => this.executeShutdown());
        shutdownCancelBtn?.addEventListener('click', () => this.hideShutdownDialog());
        shutdownHelpBtn?.addEventListener('click', () => {
            this.hideShutdownDialog();
            this.showAboutDialog();
        });
        shutdownDialog?.querySelector('.dialog-close-btn')?.addEventListener('click', () => this.hideShutdownDialog());
        shutdownDialog?.addEventListener('click', (e) => {
            if (e.target === shutdownDialog) this.hideShutdownDialog();
        });

        // About Dialog handlers
        const aboutDialog = document.getElementById('aboutDialog');
        const aboutOkBtn = document.getElementById('aboutOkBtn');

        aboutOkBtn?.addEventListener('click', () => this.hideAboutDialog());
        aboutDialog?.querySelector('.dialog-close-btn')?.addEventListener('click', () => this.hideAboutDialog());
        aboutDialog?.addEventListener('click', (e) => {
            if (e.target === aboutDialog) this.hideAboutDialog();
        });

        // Welcome Dialog handlers
        const welcomeDialog = document.getElementById('welcomeDialog');
        const welcomeOkBtn = document.getElementById('welcomeOkBtn');
        const welcomeShowAgain = document.getElementById('welcomeShowAgain');

        welcomeOkBtn?.addEventListener('click', () => {
            if (!welcomeShowAgain?.checked) {
                StateManager.setState('user.seenWelcome', true, true);
            } else {
                StateManager.setState('user.seenWelcome', false, true);
            }
            this.hideWelcomeDialog();
        });
        welcomeDialog?.querySelector('.dialog-close-btn')?.addEventListener('click', () => this.hideWelcomeDialog());
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Win+R or Ctrl+R = Run dialog
            if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
                e.preventDefault();
                this.showRunDialog();
            }
        });
    }

    /**
     * Show Run dialog
     */
    showRunDialog() {
        const dialog = document.getElementById('runDialog');
        const input = document.getElementById('runInput');
        if (dialog) {
            dialog.classList.add('active');
            this.runDialogOpen = true;
            input?.focus();
            input.value = '';
            EventBus.emit(Events.SOUND_PLAY, { type: 'open' });
        }
    }

    /**
     * Hide Run dialog
     */
    hideRunDialog() {
        const dialog = document.getElementById('runDialog');
        if (dialog) {
            dialog.classList.remove('active');
            this.runDialogOpen = false;
        }
    }

    /**
     * Execute the run command
     */
    executeRunCommand() {
        const input = document.getElementById('runInput');
        const command = input?.value.trim().toLowerCase();

        if (!command) {
            this.hideRunDialog();
            return;
        }

        // Map common commands to apps
        const appMap = {
            'notepad': 'notepad',
            'notepad.exe': 'notepad',
            'calc': 'calculator',
            'calc.exe': 'calculator',
            'calculator': 'calculator',
            'cmd': 'terminal',
            'cmd.exe': 'terminal',
            'terminal': 'terminal',
            'command': 'terminal',
            'paint': 'paint',
            'mspaint': 'paint',
            'mspaint.exe': 'paint',
            'explorer': 'mycomputer',
            'explorer.exe': 'mycomputer',
            'iexplore': 'browser',
            'iexplore.exe': 'browser',
            'internet': 'browser',
            'browser': 'browser',
            'control': 'controlpanel',
            'control.exe': 'controlpanel',
            'minesweeper': 'minesweeper',
            'winmine': 'minesweeper',
            'winmine.exe': 'minesweeper',
            'snake': 'snake',
            'asteroids': 'asteroids',
            'solitaire': 'solitaire',
            'sol': 'solitaire',
            'sol.exe': 'solitaire',
            'doom': 'doom',
            'doom.exe': 'doom',
            'mediaplayer': 'mediaplayer',
            'wmplayer': 'mediaplayer',
            'wmplayer.exe': 'mediaplayer',
            'taskmgr': 'taskmgr',
            'taskmgr.exe': 'taskmgr',
        };

        // Check if it's a URL
        if (command.startsWith('http://') || command.startsWith('https://') || command.includes('.com') || command.includes('.org') || command.includes('.net')) {
            let url = command;
            if (!url.startsWith('http')) {
                url = 'https://' + url;
            }
            AppRegistry.launch('browser', { url: url });
            this.hideRunDialog();
            return;
        }

        // Check for mapped apps
        const appId = appMap[command];
        if (appId) {
            AppRegistry.launch(appId);
            this.hideRunDialog();
            return;
        }

        // Try to launch as-is
        if (AppRegistry.launch(command)) {
            this.hideRunDialog();
            return;
        }

        // Unknown command
        EventBus.emit('dialog:alert', {
            message: `Cannot find '${command}'. Make sure you typed the name correctly, and then try again.`,
            icon: 'error'
        });
        this.hideRunDialog();
    }

    /**
     * Show Shutdown dialog
     */
    showShutdownDialog() {
        const dialog = document.getElementById('shutdownDialog');
        if (dialog) {
            dialog.classList.add('active');
            this.shutdownDialogOpen = true;
            EventBus.emit(Events.SOUND_PLAY, { type: 'open' });
        }
    }

    /**
     * Hide Shutdown dialog
     */
    hideShutdownDialog() {
        const dialog = document.getElementById('shutdownDialog');
        if (dialog) {
            dialog.classList.remove('active');
            this.shutdownDialogOpen = false;
        }
    }

    /**
     * Execute shutdown action
     */
    executeShutdown() {
        const selectedOption = document.querySelector('input[name="shutdownOption"]:checked')?.value;

        this.hideShutdownDialog();

        switch (selectedOption) {
            case 'shutdown':
                this.performShutdown();
                break;
            case 'restart':
                this.performRestart();
                break;
            case 'logoff':
                this.performLogoff();
                break;
        }
    }

    /**
     * Perform shutdown animation
     */
    performShutdown() {
        // Play shutdown sound
        EventBus.emit(Events.SOUND_PLAY, { type: 'shutdown' });

        // Close all windows
        WindowManager.closeAll();

        // Create shutdown screen
        const shutdownScreen = document.createElement('div');
        shutdownScreen.className = 'shutdown-screen';
        shutdownScreen.innerHTML = `
            <div class="shutdown-message">
                <p>It's now safe to turn off your computer.</p>
            </div>
        `;
        document.body.appendChild(shutdownScreen);

        // Fade to shutdown
        setTimeout(() => {
            shutdownScreen.classList.add('active');
        }, 100);

        // Click to restart
        shutdownScreen.addEventListener('click', () => {
            location.reload();
        });
    }

    /**
     * Perform restart
     */
    performRestart() {
        EventBus.emit(Events.SOUND_PLAY, { type: 'shutdown' });

        // Short delay then reload
        setTimeout(() => {
            location.reload();
        }, 500);
    }

    /**
     * Perform log off
     */
    performLogoff() {
        // Clear user state
        StateManager.setState('user.isAdmin', false, true);
        StateManager.setState('user.seenWelcome', false, true);

        // Close all windows
        WindowManager.closeAll();

        // Show welcome again after a short delay
        setTimeout(() => {
            this.showWelcomeDialog();
        }, 500);
    }

    /**
     * Show About dialog
     */
    showAboutDialog() {
        const dialog = document.getElementById('aboutDialog');
        if (dialog) {
            dialog.classList.add('active');
            EventBus.emit(Events.SOUND_PLAY, { type: 'open' });
        }
    }

    /**
     * Hide About dialog
     */
    hideAboutDialog() {
        const dialog = document.getElementById('aboutDialog');
        if (dialog) {
            dialog.classList.remove('active');
        }
    }

    /**
     * Show Welcome dialog
     */
    showWelcomeDialog() {
        const dialog = document.getElementById('welcomeDialog');
        if (dialog) {
            dialog.classList.add('active');
            EventBus.emit(Events.SOUND_PLAY, { type: 'notify' });
        }
    }

    /**
     * Hide Welcome dialog
     */
    hideWelcomeDialog() {
        const dialog = document.getElementById('welcomeDialog');
        if (dialog) {
            dialog.classList.remove('active');
        }
    }
}

// Singleton
const SystemDialogs = new SystemDialogsClass();

export default SystemDialogs;
