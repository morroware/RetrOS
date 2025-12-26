/**
 * SemanticEventBus - Enhanced event bus with semantic events, validation, and middleware
 *
 * Extends the basic EventBus with:
 * - Event schema validation
 * - Event metadata (timestamp, source, etc.)
 * - Middleware support
 * - Pattern matching (e.g., 'window:*')
 * - Event logging and debugging
 * - Backward compatibility with old EventBus
 *
 * Usage:
 *   SemanticEventBus.emit('window:open', { id: 'window-1', appId: 'notepad' })
 *   SemanticEventBus.on('window:*', handler)  // Listen to all window events
 *   SemanticEventBus.use((event, next) => { console.log(event); next(); })
 */

import EventSchema from './EventSchema.js';

class SemanticEventBusClass {
    constructor() {
        // Map of event names to Sets of listener functions
        this.listeners = new Map();

        // Pattern listeners (for wildcard subscriptions)
        this.patternListeners = new Map();

        // Middleware functions
        this.middleware = [];

        // Event log for debugging
        this.eventLog = [];
        this.maxLogSize = 100;

        // Configuration
        this.config = {
            validation: true,      // Validate payloads against schema
            logging: false,        // Log events to console
            timestamps: true,      // Add timestamps to events
            trackHistory: true,    // Keep event history
            warnUnknown: true     // Warn about unknown events
        };

        // Debug mode (legacy support)
        this.debug = false;

        // Statistics
        this.stats = {
            emitted: 0,
            validated: 0,
            validationErrors: 0,
            middlewareErrors: 0
        };
    }

    /**
     * Configure the event bus
     * @param {object} options - Configuration options
     */
    configure(options) {
        Object.assign(this.config, options);
        if (options.debug !== undefined) {
            this.debug = options.debug;
            this.config.logging = options.debug;
        }
    }

    /**
     * Subscribe to an event
     * @param {string} eventName - Event name (can include wildcards like 'window:*')
     * @param {Function} callback - Handler function
     * @returns {Function} Unsubscribe function
     */
    on(eventName, callback) {
        // Check for pattern (wildcard)
        if (eventName.includes('*')) {
            return this._onPattern(eventName, callback);
        }

        // Regular subscription
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName).add(callback);

        // Return unsubscribe function
        return () => this.off(eventName, callback);
    }

    /**
     * Subscribe to an event only once
     * @param {string} eventName - Event name
     * @param {Function} callback - Handler function
     */
    once(eventName, callback) {
        const wrapper = (...args) => {
            this.off(eventName, wrapper);
            callback(...args);
        };
        this.on(eventName, wrapper);
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventName - Event name
     * @param {Function} callback - Handler to remove
     */
    off(eventName, callback) {
        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName).delete(callback);
        }

        // Also check pattern listeners
        if (this.patternListeners.has(eventName)) {
            this.patternListeners.get(eventName).delete(callback);
        }
    }

    /**
     * Emit an event with validation and middleware
     * @param {string} eventName - Event name from EventSchema
     * @param {object} payload - Event payload
     * @param {object} options - Emit options (validate, metadata, etc.)
     * @returns {object} Event object that was emitted
     */
    emit(eventName, payload = {}, options = {}) {
        this.stats.emitted++;

        // Handle legacy usage (data as non-object)
        if (payload !== null && typeof payload !== 'object') {
            payload = { data: payload };
        }

        // Merge options with defaults
        const emitOptions = {
            validate: this.config.validation,
            log: this.config.logging || this.debug,
            metadata: {},
            ...options
        };

        // Check if event is known
        if (this.config.warnUnknown && !EventSchema[eventName]) {
            console.warn(`[SemanticEventBus] Unknown event "${eventName}". Consider adding it to EventSchema.`);
        }

        // Validate payload against schema
        if (emitOptions.validate && EventSchema[eventName]) {
            this.stats.validated++;
            const validation = this._validatePayload(eventName, payload);
            if (!validation.valid) {
                this.stats.validationErrors++;
                console.error(`[SemanticEventBus] Validation failed for "${eventName}":`, validation.errors);
                // Continue anyway for backward compatibility
            }
        }

        // Create event object with metadata
        const event = {
            name: eventName,
            payload: payload,
            metadata: {
                timestamp: this.config.timestamps ? Date.now() : undefined,
                source: emitOptions.metadata.source || 'unknown',
                validated: emitOptions.validate && EventSchema[eventName],
                ...emitOptions.metadata
            }
        };

        // Log event
        if (emitOptions.log) {
            console.log(`[SemanticEventBus] ${eventName}`, payload, event.metadata);
        }

        // Track in history
        if (this.config.trackHistory) {
            this._addToLog(event);
        }

        // Run through middleware chain, then emit to listeners
        this._runMiddleware(event, () => {
            this._emitToListeners(event);
        });

        return event;
    }

    /**
     * Emit to all matching listeners
     * @private
     */
    _emitToListeners(event) {
        const { name, payload, metadata } = event;

        // Direct listeners
        if (this.listeners.has(name)) {
            const callbacks = [...this.listeners.get(name)];
            callbacks.forEach(callback => {
                try {
                    callback(payload, metadata);
                } catch (error) {
                    console.error(`[SemanticEventBus] Error in listener for "${name}":`, error);
                }
            });
        }

        // Pattern listeners (e.g., 'window:*' matches 'window:open')
        this.patternListeners.forEach((callbacks, pattern) => {
            const regex = this._patternToRegex(pattern);
            if (regex.test(name)) {
                callbacks.forEach(callback => {
                    try {
                        callback(payload, metadata);
                    } catch (error) {
                        console.error(`[SemanticEventBus] Error in pattern listener "${pattern}" for "${name}":`, error);
                    }
                });
            }
        });
    }

    /**
     * Add middleware function
     * Middleware receives (event, next) and must call next() to continue
     * @param {Function} fn - Middleware function
     */
    use(fn) {
        this.middleware.push(fn);
    }

    /**
     * Remove middleware function
     * @param {Function} fn - Middleware function to remove
     */
    removeMiddleware(fn) {
        const index = this.middleware.indexOf(fn);
        if (index > -1) {
            this.middleware.splice(index, 1);
        }
    }

    /**
     * Run middleware chain
     * @private
     */
    _runMiddleware(event, done) {
        let index = 0;

        const next = () => {
            if (index >= this.middleware.length) {
                done();
                return;
            }

            const middleware = this.middleware[index++];
            try {
                middleware(event, next);
            } catch (error) {
                this.stats.middlewareErrors++;
                console.error('[SemanticEventBus] Middleware error:', error);
                next(); // Continue despite error
            }
        };

        next();
    }

    /**
     * Subscribe to events matching a pattern
     * @private
     */
    _onPattern(pattern, callback) {
        if (!this.patternListeners.has(pattern)) {
            this.patternListeners.set(pattern, new Set());
        }
        this.patternListeners.get(pattern).add(callback);

        // Return unsubscribe function
        return () => {
            if (this.patternListeners.has(pattern)) {
                this.patternListeners.get(pattern).delete(callback);
            }
        };
    }

    /**
     * Convert glob pattern to regex
     * @private
     */
    _patternToRegex(pattern) {
        const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
        const regex = escaped.replace(/\*/g, '.*');
        return new RegExp(`^${regex}$`);
    }

    /**
     * Validate payload against event schema
     * @private
     */
    _validatePayload(eventName, payload) {
        const schema = EventSchema[eventName];
        if (!schema || !schema.payload) {
            return { valid: true, errors: [] };
        }

        const errors = [];

        for (const [key, type] of Object.entries(schema.payload)) {
            const isOptional = type.endsWith('?');
            const baseType = isOptional ? type.slice(0, -1) : type;
            const value = payload[key];

            // Check required fields
            if (!isOptional && value === undefined) {
                errors.push(`Missing required field "${key}"`);
                continue;
            }

            // Check type if value exists
            if (value !== undefined && !this._checkType(value, baseType)) {
                errors.push(`Invalid type for "${key}": expected ${baseType}, got ${typeof value}`);
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Check if value matches expected type
     * @private
     */
    _checkType(value, type) {
        if (type === 'any') return true;
        if (type === 'array') return Array.isArray(value);
        if (type === 'object') return typeof value === 'object' && !Array.isArray(value) && value !== null;
        if (type === 'HTMLElement') return value instanceof HTMLElement;
        return typeof value === type;
    }

    /**
     * Add event to log
     * @private
     */
    _addToLog(event) {
        this.eventLog.push(event);
        if (this.eventLog.length > this.maxLogSize) {
            this.eventLog.shift();
        }
    }

    /**
     * Remove all listeners for an event (or all events)
     * @param {string} [event] - Optional event name
     */
    clear(event = null) {
        if (event) {
            this.listeners.delete(event);
            this.patternListeners.delete(event);
        } else {
            this.listeners.clear();
            this.patternListeners.clear();
        }
    }

    /**
     * Get count of listeners for an event
     * @param {string} event - Event name
     * @returns {number} Listener count
     */
    listenerCount(event) {
        const direct = this.listeners.has(event) ? this.listeners.get(event).size : 0;
        const pattern = this.patternListeners.has(event) ? this.patternListeners.get(event).size : 0;
        return direct + pattern;
    }

    // ==========================================
    // DEBUGGING & INTROSPECTION
    // ==========================================

    /**
     * Get event log history
     * @param {number} limit - Max events to return
     * @returns {Array} Event log
     */
    getEventLog(limit = this.maxLogSize) {
        return this.eventLog.slice(-limit);
    }

    /**
     * Clear event log
     */
    clearEventLog() {
        this.eventLog = [];
    }

    /**
     * Get all registered events from schema
     * @returns {string[]} Array of event names
     */
    getRegisteredEvents() {
        return Object.keys(EventSchema);
    }

    /**
     * Get event schema for an event
     * @param {string} eventName - Event name
     * @returns {object|null} Event schema
     */
    getEventSchema(eventName) {
        return EventSchema[eventName] || null;
    }

    /**
     * Get events by namespace
     * @param {string} namespace - Namespace (e.g., 'window', 'app')
     * @returns {string[]} Array of event names
     */
    getEventsByNamespace(namespace) {
        return Object.keys(EventSchema).filter(
            name => EventSchema[name].namespace === namespace
        );
    }

    /**
     * Get statistics
     * @returns {object} Statistics object
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            emitted: 0,
            validated: 0,
            validationErrors: 0,
            middlewareErrors: 0
        };
    }

    /**
     * Get all active listeners (for debugging)
     * @returns {object} Map of event names to listener counts
     */
    getActiveListeners() {
        const result = {};

        // Direct listeners
        this.listeners.forEach((callbacks, event) => {
            if (callbacks.size > 0) {
                result[event] = callbacks.size;
            }
        });

        // Pattern listeners
        const patterns = {};
        this.patternListeners.forEach((callbacks, pattern) => {
            if (callbacks.size > 0) {
                patterns[pattern] = callbacks.size;
            }
        });

        if (Object.keys(patterns).length > 0) {
            result._patterns = patterns;
        }

        return result;
    }
}

// Create singleton instance
const SemanticEventBus = new SemanticEventBusClass();

// Export event constants for backward compatibility
export const Events = {
    // Window events
    WINDOW_OPEN: 'window:open',
    WINDOW_CLOSE: 'window:close',
    WINDOW_FOCUS: 'window:focus',
    WINDOW_MINIMIZE: 'window:minimize',
    WINDOW_MAXIMIZE: 'window:maximize',
    WINDOW_RESTORE: 'window:restore',
    WINDOW_RESIZE: 'window:resize',

    // Taskbar events
    TASKBAR_UPDATE: 'ui:taskbar:update',

    // Icon events
    ICON_CLICK: 'icon:click',
    ICON_DBLCLICK: 'icon:dblclick',
    ICON_MOVE: 'icon:move',
    ICON_DELETE: 'icon:delete',

    // App events
    APP_LAUNCH: 'app:launch',
    APP_OPEN: 'app:open',
    APP_CLOSE: 'app:close',

    // Menu events
    START_MENU_TOGGLE: 'ui:menu:start:toggle',
    CONTEXT_MENU_SHOW: 'ui:menu:context:show',
    CONTEXT_MENU_HIDE: 'ui:menu:context:hide',

    // System events
    BOOT_COMPLETE: 'system:ready',
    SHUTDOWN: 'system:shutdown',
    SCREENSAVER_START: 'system:screensaver:start',
    SCREENSAVER_END: 'system:screensaver:end',

    // Achievement events
    ACHIEVEMENT_UNLOCK: 'achievement:unlock',

    // Sound events
    SOUND_PLAY: 'sound:play',
    VOLUME_CHANGE: 'sound:volume',

    // Audio playback events
    AUDIO_PLAY: 'audio:play',
    AUDIO_STOP: 'audio:stop',
    AUDIO_STOP_ALL: 'audio:stopall',
    AUDIO_PAUSE: 'audio:pause',
    AUDIO_RESUME: 'audio:resume',
    AUDIO_ENDED: 'audio:ended',
    AUDIO_ERROR: 'audio:error',
    AUDIO_LOADED: 'audio:loaded',
    AUDIO_TIME_UPDATE: 'audio:timeupdate',

    // State events
    STATE_CHANGE: 'state:change',

    // Drag events
    DRAG_START: 'drag:start',
    DRAG_MOVE: 'drag:move',
    DRAG_END: 'drag:end',

    // Menu action events
    MENU_ACTION: 'ui:menu:action',

    // App registration
    APP_REGISTERED: 'app:registered',

    // Pet events
    PET_TOGGLE: 'feature:pet:toggle',
    PET_CHANGE: 'feature:pet:change',

    // Setting events
    SETTING_CHANGED: 'setting:changed',

    // Desktop events
    DESKTOP_RENDER: 'desktop:render',
    DESKTOP_REFRESH: 'desktop:refresh'
};

// Add global debug helpers (in development)
if (typeof window !== 'undefined') {
    window.__ILLUMINATOS_DEBUG = {
        eventBus: SemanticEventBus,

        // Enable/disable event logging
        enableLog: () => SemanticEventBus.configure({ logging: true }),
        disableLog: () => SemanticEventBus.configure({ logging: false }),

        // View event log
        showEventLog: (limit = 20) => {
            console.table(SemanticEventBus.getEventLog(limit));
        },

        // List all registered events
        listEvents: () => {
            console.log('Registered Events:', SemanticEventBus.getRegisteredEvents());
        },

        // List events by namespace
        listNamespace: (namespace) => {
            console.log(`Events in "${namespace}":`, SemanticEventBus.getEventsByNamespace(namespace));
        },

        // Show event schema
        describeEvent: (eventName) => {
            const schema = SemanticEventBus.getEventSchema(eventName);
            if (schema) {
                console.log(`Event: ${eventName}`);
                console.log('Description:', schema.description);
                console.log('Payload:', schema.payload);
                console.log('Example:', schema.example);
            } else {
                console.warn(`Event "${eventName}" not found in schema`);
            }
        },

        // Show statistics
        showStats: () => {
            console.log('Event Bus Statistics:', SemanticEventBus.getStats());
        },

        // Show active listeners
        showListeners: () => {
            console.log('Active Listeners:', SemanticEventBus.getActiveListeners());
        },

        // Reset stats
        resetStats: () => SemanticEventBus.resetStats()
    };
}

export { SemanticEventBus };
export default SemanticEventBus;
