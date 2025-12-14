/**
 * AppRegistry - Central registry for all applications
 * Manages app registration, launching, and querying
 */

import EventBus, { Events } from '../core/EventBus.js';

// --- App Imports ---
import Calculator from './Calculator.js';
import Notepad from './Notepad.js';
import Terminal from './Terminal.js';
import Paint from './Paint.js';
import Minesweeper from './Minesweeper.js';
import Snake from './Snake.js';
import Asteroids from './Asteroids.js';
import Doom from './Doom.js';
import Solitaire from './Solitaire.js';
import MediaPlayer from './MediaPlayer.js';
import Browser from './Browser.js';
// --- System App Placeholders (Simple implementations for completeness) ---
import AppBase from './AppBase.js';

class SimpleApp extends AppBase {
    constructor(id, name, icon, content) {
        super({ id, name, icon, width: 400, height: 300 });
        this.content = content;
    }
    onOpen() {
        return `<div style="padding:20px;">${this.content || 'Coming soon...'}</div>`;
    }
}

class AppRegistryClass {
    constructor() {
        this.apps = new Map();
        this.metadata = new Map();
    }

    /**
     * Register an application
     * @param {AppBase} app - App instance
     * @param {Object} meta - Additional metadata
     */
    register(app, meta = {}) {
        if (this.apps.has(app.id)) {
            console.warn(`[AppRegistry] App "${app.id}" already registered`);
            return;
        }

        this.apps.set(app.id, app);
        
        this.metadata.set(app.id, {
            id: app.id,
            name: app.name,
            icon: app.icon,
            category: app.category || meta.category || 'accessories',
            showInMenu: app.showInMenu !== undefined ? app.showInMenu : (meta.showInMenu !== false),
            ...meta
        });

        console.log(`[AppRegistry] Registered: ${app.name} (${app.id})`);
    }

    /**
     * Initialize and register all core apps
     */
    initialize() {
        // --- Core Apps ---
        this.register(new Calculator());
        this.register(new Notepad());
        this.register(new Terminal());
        this.register(new Paint());
        
        // --- Games ---
        this.register(new Minesweeper(), { category: 'games' });
        this.register(new Snake(), { category: 'games' });
        this.register(new Asteroids(), { category: 'games' });
        this.register(new Doom(), { category: 'games' });
        this.register(new Solitaire(), { category: 'games', showInMenu: true });

        // --- Internet ---
        this.register(new Browser(), { category: 'internet' });

        // --- Multimedia ---
        this.register(new MediaPlayer(), { category: 'multimedia' });

        // --- System Utilities (Placeholders) ---
        this.register(new SimpleApp('taskmgr', 'Task Manager', '📊', 'Task Manager is under construction.'), { category: 'system' });
        
        this.register(new SimpleApp('controlpanel', 'Control Panel', '⚙️', 'Control Panel settings coming soon.'), { category: 'settings' });
        this.register(new SimpleApp('display', 'Display Properties', '🖥️', 'Display settings coming soon.'), { category: 'settings' });
        this.register(new SimpleApp('sounds', 'Sound Settings', '🔊', 'Sound settings coming soon.'), { category: 'settings' });
        
        this.register(new SimpleApp('find', 'Find Files', '🔍', 'Search functionality is disabled.'), { showInMenu: false });
        this.register(new SimpleApp('help', 'Help', '❓', 'No help is coming. You are on your own.'), { showInMenu: false });
        this.register(new SimpleApp('run', 'Run', '▶️', 'Run command dialog.'), { showInMenu: false });
        this.register(new SimpleApp('shutdown', 'Shut Down', '⏻', 'It is now safe to turn off your computer.'), { showInMenu: false });
    }

    /**
     * Launch an application
     */
    launch(appId, params = {}) {
        const app = this.apps.get(appId);
        
        if (!app) {
            console.error(`[AppRegistry] Unknown app: ${appId}`);
            EventBus.emit('dialog:alert', { 
                message: `Cannot find application: ${appId}` 
            });
            return false;
        }

        try {
            if (params && app.setParams) {
                app.setParams(params);
            }

            app.launch();
            EventBus.emit('app:open', { id: appId, name: app.name });
            return true;
        } catch (error) {
            console.error(`[AppRegistry] Failed to launch ${appId}:`, error);
            EventBus.emit('dialog:alert', { 
                message: `Failed to open ${app.name}: ${error.message}` 
            });
            return false;
        }
    }

    /**
     * Close an application
     */
    close(appId) {
        const app = this.apps.get(appId);
        if (app) {
            app.close();
            EventBus.emit('app:close', { id: appId });
        }
    }

    /**
     * Get all registered app metadata
     */
    getAll() {
        return Array.from(this.metadata.values());
    }

    /**
     * Get apps by category
     */
    getByCategory(category) {
        return this.getAll().filter(m => m.category === category);
    }
}

// Singleton instance
const AppRegistry = new AppRegistryClass();

// Auto-initialize when imported
AppRegistry.initialize();

export default AppRegistry;