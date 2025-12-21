/**
 * AppRegistry - Central registry for all applications
 * Manages app registration, launching, and querying
 *
 * TO ADD A NEW APP:
 * 1. Create your app file extending AppBase (see DEVELOPER_GUIDE.md)
 * 2. Include 'category' in your app's constructor config
 * 3. Import your app below
 * 4. Add to the appropriate section in initialize()
 *
 * Example:
 *   // In your app file:
 *   super({ id: 'myapp', name: 'My App', icon: '📱', category: 'accessories' });
 *
 *   // In initialize():
 *   this.register(new MyApp());  // Category is auto-detected from app config!
 */

import EventBus, { Events } from '../core/EventBus.js';
import { CATEGORIES } from '../core/Constants.js';

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
import ControlPanel from './ControlPanel.js';
import AdminPanel from './AdminPanel.js';
import MyComputer from './MyComputer.js';
import RecycleBin from './RecycleBin.js';
import Winamp from './Winamp.js';
import Defrag from './Defrag.js';
import SkiFree from './SkiFree.js';
import ChatRoom from './ChatRoom.js';
import TaskManager from './TaskManager.js';
import DisplayProperties from './DisplayProperties.js';
import SoundSettings from './SoundSettings.js';
import FindFiles from './FindFiles.js';
import HelpSystem from './HelpSystem.js';
import Calendar from './Calendar.js';
import Clock from './Clock.js';
import FreeCell from './FreeCell.js';
import Zork from './Zork.js';
import HyperCard from './HyperCard.js';
// --- System App Placeholders (Simple implementations for completeness) ---
import AppBase from './AppBase.js';

class SimpleApp extends AppBase {
    constructor(id, name, icon, content, category = 'system', showInMenu = false) {
        super({ id, name, icon, width: 400, height: 300, category, showInMenu });
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
     * Apps can specify category and showInMenu in their constructor config,
     * eliminating the need to pass these as metadata.
     *
     * @param {AppBase} app - App instance
     * @param {Object} meta - Optional additional metadata (overrides app config)
     */
    register(app, meta = {}) {
        if (this.apps.has(app.id)) {
            console.warn(`[AppRegistry] App "${app.id}" already registered`);
            return;
        }

        this.apps.set(app.id, app);

        // Build metadata - app config takes precedence, meta can override
        const appConfig = app.config || {};
        this.metadata.set(app.id, {
            id: app.id,
            name: app.name,
            icon: app.icon,
            // Category: check app.category, then app.config.category, then meta, then default
            category: app.category || appConfig.category || meta.category || CATEGORIES.ACCESSORIES,
            // showInMenu: check app.showInMenu, then app.config.showInMenu, then meta, then default true
            showInMenu: app.showInMenu !== undefined ? app.showInMenu :
                       (appConfig.showInMenu !== undefined ? appConfig.showInMenu :
                       (meta.showInMenu !== undefined ? meta.showInMenu : true)),
            // Include any extra metadata
            ...meta
        });

        console.log(`[AppRegistry] Registered: ${app.name} (${app.id}) [${this.metadata.get(app.id).category}]`);
    }

    /**
     * Batch register multiple apps at once
     * @param {AppBase[]} apps - Array of app instances
     */
    registerAll(apps) {
        apps.forEach(app => this.register(app));
    }

    /**
     * Initialize and register all core apps
     * Apps are grouped by category for organization, but category is
     * determined from the app's own config, not the section it's in.
     */
    initialize() {
        // --- Accessories (Productivity Tools) ---
        this.registerAll([
            new Calculator(),
            new Notepad(),
            new Paint(),
            new Calendar(),
            new Clock(),
            new HyperCard(),
        ]);

        // --- System Tools (Utilities) ---
        this.registerAll([
            new Terminal(),
            new Defrag(),
            new TaskManager(),
        ]);

        // --- Games ---
        this.registerAll([
            new Minesweeper(),
            new Snake(),
            new Asteroids(),
            new Doom(),
            new Solitaire(),
            new FreeCell(),
            new SkiFree(),
            new Zork(),
        ]);

        // --- Multimedia ---
        this.registerAll([
            new MediaPlayer(),
            new Winamp(),
        ]);

        // --- Internet & Communication ---
        this.registerAll([
            new Browser(),
            new ChatRoom(),
        ]);

        // --- System Apps (category and showInMenu set in app config) ---
        this.registerAll([
            new MyComputer(),
            new RecycleBin(),
            new AdminPanel(),
        ]);

        // --- Settings ---
        this.registerAll([
            new ControlPanel(),
            new DisplayProperties(),
            new SoundSettings(),
        ]);

        // --- Hidden System Apps ---
        this.registerAll([
            new FindFiles(),
            new HelpSystem(),
            new SimpleApp('run', 'Run', '▶️', 'Run command dialog.'),
            new SimpleApp('shutdown', 'Shut Down', '⏻', 'It is now safe to turn off your computer.'),
        ]);

        console.log(`[AppRegistry] Initialized with ${this.apps.size} apps`);
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
        const all = this.getAll();
        const filtered = all.filter(m => m.category === category);
        console.log(`[AppRegistry] getByCategory('${category}'):`, filtered);
        return filtered;
    }
}

// Singleton instance
const AppRegistry = new AppRegistryClass();

// NOTE: Do NOT auto-initialize here! This runs outside error handling.
// Initialization is now called explicitly from index.js inside the try-catch block.
// AppRegistry.initialize();

export default AppRegistry;