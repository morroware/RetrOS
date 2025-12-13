/**
 * AppBase - Base class for all applications
 * Provides common functionality and lifecycle methods
 * 
 * Apps extend this class and implement:
 *   - onOpen(): Return HTML content
 *   - onClose(): Cleanup (optional)
 *   - onFocus(): Handle focus (optional)
 *   - onBlur(): Handle blur (optional)
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
        this.openWindows = new Map(); // windowId -> { boundHandlers }
        this.instanceCounter = 0;
        
        // Legacy support for single-window apps
        this.windowId = null;
        this.isOpen = false;
        this.boundHandlers = new Map(); // Track bound handlers for cleanup
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
     * Called when app closes - cleanup resources
     */
    onClose() {
        // Override for cleanup
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
     * Called after window is created and in DOM
     * Use for initializing canvas, adding event listeners, etc.
     */
    onMount() {
        // Override for post-render initialization
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

        // Track this window instance
        this.openWindows.set(windowId, {
            boundHandlers: new Map()
        });
        
        // Legacy support
        this.windowId = windowId;
        this.isOpen = true;

        // Setup focus/blur tracking for this window
        this.setupFocusTracking(windowId);

        // Call mount hook after slight delay (let DOM render)
        // Store windowId in closure for mount
        const currentWindowId = windowId;
        setTimeout(() => this.onMount(currentWindowId), 50);
    }

    /**
     * Close the application (closes the most recent window, or specific windowId)
     * @param {string} [windowId] - Optional specific window to close
     */
    close(windowId) {
        if (windowId) {
            WindowManager.close(windowId);
        } else if (this.windowId) {
            WindowManager.close(this.windowId);
        }
    }

    /**
     * Close all windows of this app
     */
    closeAll() {
        for (const windowId of this.openWindows.keys()) {
            WindowManager.close(windowId);
        }
    }

    /**
     * Handle window close (called by WindowManager)
     * @param {string} windowId - The window ID being closed
     */
    handleClose(windowId) {
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
        
        // Remove from tracked windows
        this.openWindows.delete(windowId);
        
        // Call subclass cleanup
        this.onClose(windowId);

        // Update legacy properties
        if (this.openWindows.size === 0) {
            this.isOpen = false;
            this.windowId = null;
        } else {
            // Set windowId to another open window
            this.windowId = this.openWindows.keys().next().value;
        }
    }

    // ===== HELPER METHODS =====

    /**
     * Get the window element
     * @param {string} [windowId] - Optional window ID (defaults to most recent)
     * @returns {HTMLElement|null}
     */
    getWindow(windowId) {
        const id = windowId || this.windowId;
        return id ? document.getElementById(`window-${id}`) : null;
    }

    /**
     * Get element within window by selector, or the window content if no selector
     * @param {string} [selector] - CSS selector (optional)
     * @param {string} [windowId] - Optional window ID
     * @returns {HTMLElement|null}
     */
    getElement(selector, windowId) {
        const window = this.getWindow(windowId);
        if (!window) return null;
        
        // If no selector, return the window content element
        if (!selector) {
            return window.querySelector('.window-content');
        }
        
        return window.querySelector(selector);
    }

    /**
     * Get all elements within window by selector
     * @param {string} selector - CSS selector
     * @param {string} [windowId] - Optional window ID
     * @returns {NodeList}
     */
    getElements(selector, windowId) {
        const window = this.getWindow(windowId);
        return window ? window.querySelectorAll(selector) : [];
    }

    /**
     * Update window content
     * @param {string} html - New HTML content
     * @param {string} [windowId] - Optional window ID
     */
    setContent(html, windowId) {
        const window = this.getWindow(windowId);
        const content = window?.querySelector('.window-content');
        if (content) {
            content.innerHTML = html;
            this.onMount(windowId); // Re-run mount for new content
        }
    }

    /**
     * Add event listener with automatic cleanup
     * @param {HTMLElement|Document|Window} target - Event target
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    addHandler(target, event, handler, options = {}) {
        const boundHandler = handler.bind(this);
        target.addEventListener(event, boundHandler, options);
        
        // Track for cleanup
        if (!this.boundHandlers.has(target)) {
            this.boundHandlers.set(target, []);
        }
        this.boundHandlers.get(target).push({ event, handler: boundHandler, options });
    }

    /**
     * Remove all tracked event handlers
     */
    cleanupHandlers() {
        this.boundHandlers.forEach((handlers, target) => {
            handlers.forEach(({ event, handler, options }) => {
                target.removeEventListener(event, handler, options);
            });
        });
        this.boundHandlers.clear();
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
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @returns {Function} Unsubscribe function
     */
    on(event, handler) {
        return EventBus.on(event, handler);
    }

    /**
     * Get state value
     * @param {string} path - State path
     * @returns {*}
     */
    getState(path) {
        return StateManager.getState(path);
    }

    /**
     * Set state value
     * @param {string} path - State path
     * @param {*} value - New value
     * @param {boolean} persist - Persist to storage
     */
    setState(path, value, persist = false) {
        StateManager.setState(path, value, persist);
    }

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
            // Check if this window or any of our windows got focus
            if (id === windowId) {
                this.onFocus(windowId);
            } else if (this.openWindows.has(windowId)) {
                this.onBlur(windowId);
            }
        };

        EventBus.on('window:focus', checkFocus);
        
        // Store the unsubscribe function for this specific window
        const instanceData = this.openWindows.get(windowId);
        if (instanceData) {
            if (!instanceData.eventUnsubscribers) {
                instanceData.eventUnsubscribers = [];
            }
            instanceData.eventUnsubscribers.push(() => {
                EventBus.off('window:focus', checkFocus);
            });
        }
    }
}

export default AppBase;
