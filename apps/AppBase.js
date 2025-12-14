/**
 * AppBase - Base class for all applications
 * Provides common functionality and lifecycle methods
 *
 * MULTI-INSTANCE SUPPORT:
 * All helper methods automatically scope to the current window context.
 * Apps don't need to track windowIds - just use this.getElement(), this.setState(), etc.
 *
 * Apps extend this class and implement:
 *   - onOpen(): Return HTML content
 *   - onClose(): Cleanup (optional)
 *   - onFocus(): Handle focus (optional)
 *   - onBlur(): Handle blur (optional)
 *   - onMount(): Post-render initialization (optional)
 */

import EventBus from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';
import WindowManager from '../core/WindowManager.js';

class AppBase {
    /**
     * Create an app instance
     * @param {Object} config - App configuration
     */
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.icon = config.icon || '📄';
        this.width = config.width || 500;
        this.height = config.height || 'auto';
        this.resizable = config.resizable !== false;
        this.singleton = config.singleton === true; // Default: allow multiple instances

        // Menu/category properties (used by AppRegistry for Start Menu)
        this.category = config.category || 'accessories';
        this.showInMenu = config.showInMenu !== false;

        // Runtime state - track all open instances
        this.openWindows = new Map(); // windowId -> { state, boundHandlers, eventUnsubscribers }
        this.instanceCounter = 0;

        // Current window context - automatically set before lifecycle calls
        // This allows getElement(), instanceState(), etc. to work without passing windowId
        this._currentWindowId = null;

        // Legacy support for single-window apps
        this.windowId = null;
        this.isOpen = false;
    }

    // ===== LIFECYCLE METHODS (Override in subclass) =====

    /**
     * Called when app opens - return HTML content
     * @returns {string} HTML content for window
     */
    onOpen() {
        return '<div>Override onOpen() in your app</div>';
    }

    /**
     * Called after window is created and in DOM
     * Use for initializing canvas, adding event listeners, etc.
     * Note: All helper methods (getElement, addHandler, etc.) automatically
     * target the correct window - no need to track windowId!
     */
    onMount() {
        // Override for post-render initialization
    }

    /**
     * Called when window gains focus
     */
    onFocus() {
        // Override if needed
    }

    /**
     * Called when window loses focus
     */
    onBlur() {
        // Override if needed
    }

    /**
     * Called when window is resized
     * @param {Object} dimensions - New dimensions {width, height}
     */
    onResize(dimensions) {
        // Override if needed
    }

    /**
     * Called when app closes - cleanup resources
     */
    onClose() {
        // Override for cleanup
    }

    // ===== PUBLIC API =====

    /**
     * Launch the application
     */
    launch() {
        // Check singleton - only focus if singleton AND already has open windows
        if (this.singleton && this.openWindows.size > 0) {
            const firstWindowId = this.openWindows.keys().next().value;
            WindowManager.focus(firstWindowId);
            return;
        }

        // Generate unique window ID for this instance
        this.instanceCounter++;
        const windowId = this.singleton ? this.id : `${this.id}-${this.instanceCounter}`;

        // Set context BEFORE calling onOpen so it can use helpers if needed
        this._currentWindowId = windowId;

        // Initialize instance data structure
        this.openWindows.set(windowId, {
            state: {},                    // Per-instance state storage
            boundHandlers: new Map(),     // DOM event handlers for cleanup
            eventUnsubscribers: []        // EventBus subscriptions for cleanup
        });

        // Get content from subclass
        const content = this.onOpen();

        // Create window with unique ID
        const windowEl = WindowManager.create({
            id: windowId,
            title: this.name,
            icon: this.icon,
            content,
            width: this.width,
            height: this.height,
            resizable: this.resizable,
            onClose: () => this.handleClose(windowId)
        });

        // Legacy support
        this.windowId = windowId;
        this.isOpen = true;

        // Setup focus/blur tracking for this window
        this.setupFocusTracking(windowId);

        // Setup resize tracking for this window
        this.setupResizeTracking(windowId);

        // Call mount hook after slight delay (let DOM render)
        setTimeout(() => {
            // Set context before calling onMount
            this._currentWindowId = windowId;
            this.onMount();
        }, 50);
    }

    /**
     * Close the application (closes current context window, or specific windowId)
     * @param {string} [windowId] - Optional specific window to close
     */
    close(windowId) {
        const targetId = windowId || this._currentWindowId || this.windowId;
        if (targetId) {
            WindowManager.close(targetId);
        }
    }

    /**
     * Close all windows of this app
     */
    closeAll() {
        for (const wid of this.openWindows.keys()) {
            WindowManager.close(wid);
        }
    }

    /**
     * Handle window close (called by WindowManager)
     * @param {string} windowId - The window ID being closed
     */
    handleClose(windowId) {
        // Set context for onClose
        this._currentWindowId = windowId;

        // Get instance data
        const instanceData = this.openWindows.get(windowId);

        // Cleanup bound handlers for this specific window
        if (instanceData) {
            // Clean up DOM event handlers
            if (instanceData.boundHandlers) {
                instanceData.boundHandlers.forEach((handlers, target) => {
                    handlers.forEach(({ event, handler, options }) => {
                        target.removeEventListener(event, handler, options);
                    });
                });
            }

            // Clean up EventBus subscriptions
            if (instanceData.eventUnsubscribers) {
                instanceData.eventUnsubscribers.forEach(unsub => unsub());
            }
        }

        // Call subclass cleanup
        this.onClose();

        // Remove from tracked windows
        this.openWindows.delete(windowId);

        // Update legacy properties
        if (this.openWindows.size === 0) {
            this.isOpen = false;
            this.windowId = null;
            this._currentWindowId = null;
        } else {
            // Set windowId to another open window
            this.windowId = this.openWindows.keys().next().value;
            this._currentWindowId = this.windowId;
        }
    }

    // ===== INSTANCE STATE MANAGEMENT =====
    // These methods store state per-window, so multiple instances don't conflict

    /**
     * Get instance-specific state value
     * @param {string} key - State key
     * @param {*} defaultValue - Default if not set
     * @returns {*} The state value
     */
    getInstanceState(key, defaultValue = undefined) {
        const windowId = this._currentWindowId;
        const instanceData = this.openWindows.get(windowId);
        if (!instanceData) return defaultValue;
        return key in instanceData.state ? instanceData.state[key] : defaultValue;
    }

    /**
     * Set instance-specific state value
     * @param {string} key - State key
     * @param {*} value - Value to set
     */
    setInstanceState(key, value) {
        const windowId = this._currentWindowId;
        const instanceData = this.openWindows.get(windowId);
        if (instanceData) {
            instanceData.state[key] = value;
        }
    }

    /**
     * Get all instance state as an object
     * @returns {Object} The instance state object
     */
    getAllInstanceState() {
        const windowId = this._currentWindowId;
        const instanceData = this.openWindows.get(windowId);
        return instanceData ? { ...instanceData.state } : {};
    }

    /**
     * Update multiple instance state values at once
     * @param {Object} updates - Object of key-value pairs to update
     */
    updateInstanceState(updates) {
        const windowId = this._currentWindowId;
        const instanceData = this.openWindows.get(windowId);
        if (instanceData) {
            Object.assign(instanceData.state, updates);
        }
    }

    // ===== DOM HELPER METHODS =====
    // All automatically scoped to current window context

    /**
     * Get the window element for current context
     * @returns {HTMLElement|null}
     */
    getWindow() {
        const id = this._currentWindowId;
        return id ? document.getElementById(`window-${id}`) : null;
    }

    /**
     * Get element within current window by selector
     * @param {string} [selector] - CSS selector (optional, returns content if omitted)
     * @returns {HTMLElement|null}
     */
    getElement(selector) {
        const windowEl = this.getWindow();
        if (!windowEl) return null;

        if (!selector) {
            return windowEl.querySelector('.window-content');
        }

        return windowEl.querySelector(selector);
    }

    /**
     * Get all elements within current window by selector
     * @param {string} selector - CSS selector
     * @returns {NodeList}
     */
    getElements(selector) {
        const windowEl = this.getWindow();
        return windowEl ? windowEl.querySelectorAll(selector) : [];
    }

    /**
     * Update window content
     * @param {string} html - New HTML content
     */
    setContent(html) {
        const windowEl = this.getWindow();
        const content = windowEl?.querySelector('.window-content');
        if (content) {
            content.innerHTML = html;
            this.onMount(); // Re-run mount for new content
        }
    }

    /**
     * Get the current window ID (for advanced use cases)
     * @returns {string|null}
     */
    getCurrentWindowId() {
        return this._currentWindowId;
    }

    // ===== EVENT HANDLING =====

    /**
     * Add event listener with automatic cleanup when window closes
     * @param {HTMLElement|Document|Window} target - Event target
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    addHandler(target, event, handler, options = {}) {
        const windowId = this._currentWindowId;
        const instanceData = this.openWindows.get(windowId);
        if (!instanceData) return;

        // Bind handler to this app instance AND capture windowId in closure
        const capturedWindowId = windowId;
        const boundHandler = (...args) => {
            // Set context before calling handler
            this._currentWindowId = capturedWindowId;
            return handler.call(this, ...args);
        };

        target.addEventListener(event, boundHandler, options);

        // Track for cleanup
        if (!instanceData.boundHandlers.has(target)) {
            instanceData.boundHandlers.set(target, []);
        }
        instanceData.boundHandlers.get(target).push({ event, handler: boundHandler, options });
    }

    /**
     * Subscribe to EventBus event with automatic cleanup
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    onEvent(event, handler) {
        const windowId = this._currentWindowId;
        const instanceData = this.openWindows.get(windowId);
        if (!instanceData) return;

        const capturedWindowId = windowId;
        const boundHandler = (...args) => {
            this._currentWindowId = capturedWindowId;
            return handler.call(this, ...args);
        };

        const unsubscribe = EventBus.on(event, boundHandler);
        instanceData.eventUnsubscribers.push(unsubscribe);
        return unsubscribe;
    }

    /**
     * Emit an event through the event bus
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        EventBus.emit(event, data);
    }

    /**
     * Subscribe to an event (legacy - prefer onEvent for auto-cleanup)
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @returns {Function} Unsubscribe function
     */
    on(event, handler) {
        return EventBus.on(event, handler);
    }

    // ===== GLOBAL STATE (shared across instances) =====

    /**
     * Get global state value
     * @param {string} path - State path
     * @returns {*}
     */
    getState(path) {
        return StateManager.getState(path);
    }

    /**
     * Set global state value
     * @param {string} path - State path
     * @param {*} value - New value
     * @param {boolean} persist - Persist to storage
     */
    setState(path, value, persist = false) {
        StateManager.setState(path, value, persist);
    }

    // ===== UTILITY METHODS =====

    /**
     * Play a sound
     * @param {string} type - Sound type
     */
    playSound(type) {
        EventBus.emit('sound:play', { type });
    }

    /**
     * Show an alert dialog
     * @param {string} message - Alert message
     */
    alert(message) {
        EventBus.emit('dialog:alert', { message });
    }

    /**
     * Unlock an achievement
     * @param {string} id - Achievement ID
     */
    unlockAchievement(id) {
        StateManager.unlockAchievement(id);
    }

    // ===== PRIVATE METHODS =====

    /**
     * Setup focus/blur tracking
     * @param {string} windowId - The window ID to track
     */
    setupFocusTracking(windowId) {
        const checkFocus = ({ id }) => {
            if (id === windowId) {
                this._currentWindowId = windowId;
                this.onFocus();
            } else if (this.openWindows.has(windowId)) {
                // Another window got focus, we lost it
                const prevContext = this._currentWindowId;
                this._currentWindowId = windowId;
                this.onBlur();
                this._currentWindowId = prevContext;
            }
        };

        const unsubscribe = EventBus.on('window:focus', checkFocus);

        const instanceData = this.openWindows.get(windowId);
        if (instanceData) {
            instanceData.eventUnsubscribers.push(unsubscribe);
        }
    }

    /**
     * Setup resize tracking
     * @param {string} windowId - The window ID to track
     */
    setupResizeTracking(windowId) {
        const handleResize = ({ id, width, height }) => {
            if (id === windowId) {
                this._currentWindowId = windowId;
                this.onResize({ width, height });
            }
        };

        const unsubscribe = EventBus.on('window:resize', handleResize);

        const instanceData = this.openWindows.get(windowId);
        if (instanceData) {
            instanceData.eventUnsubscribers.push(unsubscribe);
        }
    }
}

export default AppBase;
