/**
 * CommandBus - Command execution layer for scripting support
 *
 * Provides a unified interface to execute actions via semantic events.
 * All command:* events are handled here and routed to appropriate handlers.
 *
 * For scripting:
 *   - Commands trigger actions (command:app:launch, command:fs:write, etc.)
 *   - Queries retrieve state (query:windows, query:fs:list, etc.)
 *   - All commands support requestId for async response tracking
 *
 * Usage:
 *   import CommandBus from './CommandBus.js';
 *   CommandBus.initialize();
 *
 *   // Execute command directly
 *   CommandBus.execute('app:launch', { appId: 'notepad' });
 *
 *   // Or via events
 *   EventBus.emit('command:app:launch', { appId: 'notepad', requestId: 'cmd-1' });
 */

import EventBus from './EventBus.js';
import StateManager from './StateManager.js';
import WindowManager from './WindowManager.js';
import FileSystemManager from './FileSystemManager.js';

class CommandBusClass {
    constructor() {
        this.handlers = new Map();
        this.timers = new Map();
        this.macros = new Map();
        this.isRecording = false;
        this.currentMacro = null;
        this.recordedEvents = [];
        this.initialized = false;
    }

    /**
     * Initialize CommandBus - register all command handlers
     */
    initialize() {
        if (this.initialized) return;
        this.initialized = true;

        // Register command handlers
        this._registerAppCommands();
        this._registerWindowCommands();
        this._registerFsCommands();
        this._registerDialogCommands();
        this._registerSystemCommands();
        this._registerQueryHandlers();
        this._registerTimerHandlers();
        this._registerMacroHandlers();

        // Listen for all command:* events
        EventBus.on('command:*', (payload, metadata, event) => {
            const commandName = event.name.replace('command:', '');
            this.execute(commandName, payload);
        });

        console.log('[CommandBus] Initialized with handlers:', [...this.handlers.keys()]);
    }

    /**
     * Register a command handler
     * @param {string} command - Command name (without 'command:' prefix)
     * @param {Function} handler - Handler function (payload, requestId) => result
     */
    register(command, handler) {
        this.handlers.set(command, handler);
    }

    /**
     * Execute a command
     * @param {string} command - Command name
     * @param {object} payload - Command payload
     * @returns {Promise} Result of the command
     */
    async execute(command, payload = {}) {
        const { requestId } = payload;
        const handler = this.handlers.get(command);

        if (!handler) {
            console.warn(`[CommandBus] Unknown command: ${command}`);
            if (requestId) {
                this._sendResult(requestId, false, null, `Unknown command: ${command}`);
            }
            return { success: false, error: `Unknown command: ${command}` };
        }

        try {
            const result = await handler(payload);
            if (requestId) {
                this._sendResult(requestId, true, result);
            }
            return { success: true, data: result };
        } catch (error) {
            console.error(`[CommandBus] Error executing ${command}:`, error);
            if (requestId) {
                this._sendResult(requestId, false, null, error.message);
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * Execute a command and wait for result (Promise-based)
     * @param {string} command - Command name
     * @param {object} payload - Command payload
     * @param {number} timeout - Timeout in ms
     * @returns {Promise} Result of the command
     */
    async executeAsync(command, payload = {}, timeout = 5000) {
        const requestId = `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        payload.requestId = requestId;

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                unsubscribe();
                reject(new Error(`Command timeout: ${command}`));
            }, timeout);

            const unsubscribe = EventBus.on('action:result', (result) => {
                if (result.requestId === requestId) {
                    clearTimeout(timeoutId);
                    unsubscribe();
                    if (result.success) {
                        resolve(result.data);
                    } else {
                        reject(new Error(result.error));
                    }
                }
            });

            this.execute(command, payload);
        });
    }

    /**
     * Send action result event
     * @private
     */
    _sendResult(requestId, success, data = null, error = null) {
        EventBus.emit('action:result', { requestId, success, data, error });
    }

    // ==========================================
    // APP COMMANDS
    // ==========================================
    _registerAppCommands() {
        this.register('app:launch', async (payload) => {
            const { appId, params } = payload;
            // Dynamic import to avoid circular dependency
            const AppRegistry = (await import('../apps/AppRegistry.js')).default;

            // Use AppRegistry.launch which handles everything
            const success = AppRegistry.launch(appId, params);
            if (!success) {
                throw new Error(`Failed to launch app: ${appId}`);
            }

            // Get the app to find window ID
            const app = AppRegistry.get(appId);
            const windowId = app?._currentWindowId || app?.windowId;

            EventBus.emit('app:launched', { appId, windowId, params });
            return { appId, windowId, success: true };
        });

        this.register('app:close', async (payload) => {
            const { windowId } = payload;
            WindowManager.close(windowId);
            return { windowId };
        });
    }

    // ==========================================
    // WINDOW COMMANDS
    // ==========================================
    _registerWindowCommands() {
        this.register('window:focus', async (payload) => {
            const { windowId } = payload;
            WindowManager.focus(windowId);
            return { windowId };
        });

        this.register('window:minimize', async (payload) => {
            const { windowId } = payload;
            WindowManager.minimize(windowId);
            return { windowId };
        });

        this.register('window:maximize', async (payload) => {
            const { windowId } = payload;
            WindowManager.maximize(windowId);
            return { windowId };
        });

        this.register('window:restore', async (payload) => {
            const { windowId } = payload;
            WindowManager.restore(windowId);
            return { windowId };
        });

        this.register('window:close', async (payload) => {
            const { windowId } = payload;
            WindowManager.close(windowId);
            return { windowId };
        });
    }

    // ==========================================
    // FILESYSTEM COMMANDS
    // ==========================================
    _registerFsCommands() {
        this.register('fs:read', async (payload) => {
            const { path } = payload;
            const content = FileSystemManager.readFile(path);
            return { path, content };
        });

        this.register('fs:write', async (payload) => {
            const { path, content } = payload;
            FileSystemManager.writeFile(path, content);
            EventBus.emit('fs:file:update', { path, content });
            return { path, written: true };
        });

        this.register('fs:delete', async (payload) => {
            const { path } = payload;
            const node = FileSystemManager.getNode(path);
            if (!node) {
                throw new Error(`Path not found: ${path}`);
            }
            if (node.type === 'directory') {
                FileSystemManager.deleteDirectory(path);
            } else {
                FileSystemManager.deleteFile(path);
            }
            EventBus.emit('fs:file:delete', { path });
            return { path, deleted: true };
        });

        this.register('fs:mkdir', async (payload) => {
            const { path } = payload;
            FileSystemManager.createDirectory(path);
            EventBus.emit('fs:directory:create', { path });
            return { path, created: true };
        });

        this.register('fs:copy', async (payload) => {
            const { source, destination } = payload;
            FileSystemManager.copyItem(source, destination);
            return { source, destination, copied: true };
        });

        this.register('fs:move', async (payload) => {
            const { source, destination } = payload;
            FileSystemManager.moveItem(source, destination);
            return { source, destination, moved: true };
        });
    }

    // ==========================================
    // DIALOG COMMANDS
    // ==========================================
    _registerDialogCommands() {
        this.register('dialog:show', async (payload) => {
            const { type, message, title, options } = payload;

            switch (type) {
                case 'alert':
                    EventBus.emit('dialog:alert', { message, title, ...options });
                    return { shown: true };
                case 'confirm':
                    return EventBus.request('dialog:confirm', { message, title, ...options });
                case 'prompt':
                    return EventBus.request('dialog:prompt', { message, title, ...options });
                default:
                    EventBus.emit('dialog:alert', { message, title });
                    return { shown: true };
            }
        });

        this.register('notification:show', async (payload) => {
            EventBus.emit('notification:show', payload);
            return { shown: true };
        });
    }

    // ==========================================
    // SYSTEM COMMANDS
    // ==========================================
    _registerSystemCommands() {
        this.register('sound:play', async (payload) => {
            EventBus.emit('sound:play', payload);
            return { played: true };
        });

        this.register('setting:set', async (payload) => {
            const { key, value } = payload;
            StateManager.setState(`settings.${key}`, value, true);
            EventBus.emit('setting:changed', { key, value });
            return { key, value, set: true };
        });

        this.register('desktop:refresh', async (payload) => {
            EventBus.emit('desktop:refresh');
            return { refreshed: true };
        });

        this.register('achievement:unlock', async (payload) => {
            const { achievementId } = payload;
            StateManager.unlockAchievement(achievementId);
            return { achievementId, unlocked: true };
        });
    }

    // ==========================================
    // QUERY HANDLERS
    // ==========================================
    _registerQueryHandlers() {
        // Listen for query events
        EventBus.on('query:windows', (payload) => {
            const { requestId } = payload;
            const windows = StateManager.getState('windows') || [];
            EventBus.emit('query:windows:response', {
                requestId,
                windows: windows.map(w => ({
                    id: w.id,
                    title: w.title,
                    minimized: w.minimized,
                    maximized: w.maximized
                }))
            });
        });

        EventBus.on('query:apps', async (payload) => {
            const { requestId } = payload;
            const AppRegistry = (await import('../apps/AppRegistry.js')).default;
            const apps = AppRegistry.getAll().map(app => ({
                id: app.id,
                name: app.name,
                icon: app.icon,
                category: app.category
            }));
            EventBus.emit('query:apps:response', { requestId, apps });
        });

        EventBus.on('query:fs:list', (payload) => {
            const { path, requestId } = payload;
            try {
                const items = FileSystemManager.listDirectory(path);
                EventBus.emit('query:fs:list:response', { requestId, path, items });
            } catch (error) {
                EventBus.emit('query:fs:list:response', {
                    requestId, path, items: [], error: error.message
                });
            }
        });

        EventBus.on('query:fs:read', (payload) => {
            const { path, requestId } = payload;
            try {
                const content = FileSystemManager.readFile(path);
                EventBus.emit('query:fs:read:response', { requestId, path, content });
            } catch (error) {
                EventBus.emit('query:fs:read:response', {
                    requestId, path, content: null, error: error.message
                });
            }
        });

        EventBus.on('query:fs:exists', (payload) => {
            const { path, requestId } = payload;
            const node = FileSystemManager.getNode(path);
            EventBus.emit('query:fs:exists:response', {
                requestId,
                path,
                exists: !!node,
                type: node?.type || null
            });
        });

        EventBus.on('query:settings', (payload) => {
            const { key, requestId } = payload;
            let settings;
            if (key) {
                settings = { [key]: StateManager.getState(`settings.${key}`) };
            } else {
                settings = StateManager.getState('settings') || {};
            }
            EventBus.emit('query:settings:response', { requestId, settings });
        });

        EventBus.on('query:state', (payload) => {
            const { path, requestId } = payload;
            const value = StateManager.getState(path);
            EventBus.emit('query:state:response', { requestId, path, value });
        });
    }

    // ==========================================
    // TIMER HANDLERS
    // ==========================================
    _registerTimerHandlers() {
        EventBus.on('timer:set', (payload) => {
            const { timerId, delay, event, payload: eventPayload, repeat } = payload;

            // Clear existing timer with same ID
            if (this.timers.has(timerId)) {
                const existing = this.timers.get(timerId);
                if (existing.intervalId) clearInterval(existing.intervalId);
                if (existing.timeoutId) clearTimeout(existing.timeoutId);
            }

            if (repeat) {
                const intervalId = setInterval(() => {
                    EventBus.emit('timer:fired', { timerId });
                    if (event) {
                        EventBus.emit(event, eventPayload || {});
                    }
                }, delay);
                this.timers.set(timerId, { intervalId, event, repeat: true });
            } else {
                const timeoutId = setTimeout(() => {
                    EventBus.emit('timer:fired', { timerId });
                    if (event) {
                        EventBus.emit(event, eventPayload || {});
                    }
                    this.timers.delete(timerId);
                }, delay);
                this.timers.set(timerId, { timeoutId, event, repeat: false });
            }
        });

        EventBus.on('timer:clear', (payload) => {
            const { timerId } = payload;
            if (this.timers.has(timerId)) {
                const timer = this.timers.get(timerId);
                if (timer.intervalId) clearInterval(timer.intervalId);
                if (timer.timeoutId) clearTimeout(timer.timeoutId);
                this.timers.delete(timerId);
            }
        });
    }

    // ==========================================
    // MACRO HANDLERS
    // ==========================================
    _registerMacroHandlers() {
        EventBus.on('macro:record:start', (payload) => {
            const { macroId } = payload;
            this.isRecording = true;
            this.currentMacro = macroId || `macro_${Date.now()}`;
            this.recordedEvents = [];
            this.recordStartTime = Date.now();

            // Subscribe to recordable events
            this._macroSubscription = EventBus.on('*', (eventPayload, metadata, event) => {
                if (!this.isRecording) return;
                // Only record command events
                if (event.name.startsWith('command:')) {
                    this.recordedEvents.push({
                        event: event.name,
                        payload: eventPayload,
                        delay: Date.now() - this.recordStartTime
                    });
                    this.recordStartTime = Date.now();
                }
            });

            EventBus.emit('macro:recording', { macroId: this.currentMacro, started: true });
        });

        EventBus.on('macro:record:stop', () => {
            if (!this.isRecording) return;

            this.isRecording = false;
            if (this._macroSubscription) {
                this._macroSubscription();
                this._macroSubscription = null;
            }

            // Save the macro
            this.macros.set(this.currentMacro, [...this.recordedEvents]);

            EventBus.emit('macro:recorded', {
                macroId: this.currentMacro,
                eventCount: this.recordedEvents.length
            });

            this.currentMacro = null;
            this.recordedEvents = [];
        });

        EventBus.on('macro:play', async (payload) => {
            const { macroId, speed = 1.0 } = payload;
            const events = this.macros.get(macroId);

            if (!events || events.length === 0) {
                console.warn(`[CommandBus] Macro not found or empty: ${macroId}`);
                return;
            }

            EventBus.emit('macro:playing', { macroId, eventCount: events.length });

            for (const { event, payload: eventPayload, delay } of events) {
                await new Promise(resolve => setTimeout(resolve, delay / speed));
                EventBus.emit(event, eventPayload);
            }

            EventBus.emit('macro:complete', { macroId });
        });

        EventBus.on('macro:save', (payload) => {
            const { macroId, events } = payload;
            this.macros.set(macroId, events);
        });
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    /**
     * Get list of registered commands
     * @returns {string[]} Command names
     */
    getCommands() {
        return [...this.handlers.keys()];
    }

    /**
     * Check if a command is registered
     * @param {string} command - Command name
     * @returns {boolean}
     */
    hasCommand(command) {
        return this.handlers.has(command);
    }

    /**
     * Get list of active timers
     * @returns {string[]} Timer IDs
     */
    getActiveTimers() {
        return [...this.timers.keys()];
    }

    /**
     * Get list of saved macros
     * @returns {string[]} Macro IDs
     */
    getSavedMacros() {
        return [...this.macros.keys()];
    }

    /**
     * Get a macro's recorded events
     * @param {string} macroId - Macro ID
     * @returns {Array|null} Recorded events
     */
    getMacro(macroId) {
        return this.macros.get(macroId) || null;
    }
}

// Create singleton instance
const CommandBus = new CommandBusClass();

// Add to global debug object
if (typeof window !== 'undefined') {
    window.__RETROS_DEBUG = window.__RETROS_DEBUG || {};
    window.__RETROS_DEBUG.commandBus = CommandBus;
}

export default CommandBus;
