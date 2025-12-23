/**
 * EventEmitterMixin - Provides consistent event emission for all components
 *
 * This mixin enhances event emission with:
 * - Automatic timestamp
 * - Source component identification
 * - Event validation (optional)
 * - Debug logging
 *
 * Usage in an App:
 *   // In onMount or anywhere in the app
 *   this.emitScenarioEvent('notepad:saved', { path, content });
 *
 * Usage in a Feature:
 *   this.emitScenarioEvent('clippy:appeared', { tip });
 *
 * Usage in Core Systems (standalone):
 *   import { emitScenarioEvent } from './EventEmitterMixin.js';
 *   emitScenarioEvent('window:created', { windowId }, 'WindowManager');
 */

import EventBus from '../EventBus.js';
import { isValidEvent } from './SemanticEvents.js';

// Global debug flag for scenario events
let scenarioEventDebug = false;

/**
 * Enable/disable debug logging for all scenario events
 * @param {boolean} enabled - Whether to enable debug mode
 */
export function setScenarioEventDebug(enabled) {
    scenarioEventDebug = enabled;
}

/**
 * Check if scenario event debugging is enabled
 * @returns {boolean}
 */
export function isScenarioEventDebugEnabled() {
    return scenarioEventDebug;
}

/**
 * Emit a scenario event with standard metadata
 * Standalone function for use in core systems
 *
 * @param {string} event - The semantic event name
 * @param {Object} data - Event data payload
 * @param {string} [source='unknown'] - The source component emitting the event
 * @param {Object} [options={}] - Additional options
 * @param {boolean} [options.validate=false] - Whether to validate the event name
 * @param {boolean} [options.silent=false] - Suppress debug logging
 */
export function emitScenarioEvent(event, data = {}, source = 'unknown', options = {}) {
    const { validate = false, silent = false } = options;

    // Optional validation against known events
    if (validate && !isValidEvent(event)) {
        console.warn(`[ScenarioEvent] Unknown event: "${event}" from ${source}`);
    }

    // Enrich event data with metadata
    const enrichedData = {
        ...data,
        _meta: {
            event,
            source,
            timestamp: Date.now(),
            time: new Date().toISOString()
        }
    };

    // Debug logging
    if (scenarioEventDebug && !silent) {
        console.log(`[ScenarioEvent] ${event}`, enrichedData);
    }

    // Emit the event
    EventBus.emit(event, enrichedData);

    return enrichedData;
}

/**
 * EventEmitterMixin - Mix into any class to add scenario event capabilities
 *
 * @param {Class} BaseClass - The class to extend
 * @returns {Class} - Extended class with emitScenarioEvent method
 *
 * Usage:
 *   class MyApp extends EventEmitterMixin(AppBase) {
 *     doSomething() {
 *       this.emitScenarioEvent('myapp:action', { action: 'something' });
 *     }
 *   }
 */
export function EventEmitterMixin(BaseClass) {
    return class extends BaseClass {
        /**
         * Emit a scenario event from this component
         *
         * @param {string} event - The semantic event name
         * @param {Object} data - Event data payload
         * @param {Object} [options={}] - Additional options
         */
        emitScenarioEvent(event, data = {}, options = {}) {
            // Determine source from the component
            const source = this.id || this.config?.id || this.constructor.name;
            return emitScenarioEvent(event, data, source, options);
        }

        /**
         * Subscribe to scenario events with automatic cleanup
         * (Leverages existing cleanup if available)
         *
         * @param {string} event - Event name or pattern
         * @param {Function} handler - Event handler
         * @returns {Function} Unsubscribe function
         */
        onScenarioEvent(event, handler) {
            // If base class has onEvent (AppBase/FeatureBase), use it for auto-cleanup
            if (typeof super.onEvent === 'function') {
                return super.onEvent(event, handler);
            }
            if (typeof super.subscribe === 'function') {
                return super.subscribe(event, handler);
            }
            // Fallback to direct EventBus subscription
            return EventBus.on(event, handler);
        }
    };
}

/**
 * Helper to create an event emitter for a specific component
 * Useful for modules that don't use classes
 *
 * @param {string} componentId - The component identifier
 * @returns {Object} - Object with emit and subscribe methods
 *
 * Usage:
 *   const emitter = createEventEmitter('mymodule');
 *   emitter.emit('mymodule:initialized', { version: '1.0' });
 */
export function createEventEmitter(componentId) {
    return {
        emit(event, data = {}, options = {}) {
            return emitScenarioEvent(event, data, componentId, options);
        },

        on(event, handler) {
            return EventBus.on(event, handler);
        },

        once(event, handler) {
            return EventBus.once(event, handler);
        },

        off(event, handler) {
            return EventBus.off(event, handler);
        }
    };
}

/**
 * Decorator function to automatically emit events for method calls
 * (For future use with more advanced scenarios)
 *
 * @param {string} eventName - Event to emit when method is called
 * @param {Function} [dataExtractor] - Function to extract event data from arguments
 */
export function emitsEvent(eventName, dataExtractor = null) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function (...args) {
            const result = originalMethod.apply(this, args);

            // Extract data for the event
            const data = dataExtractor ? dataExtractor.apply(this, args) : { args };

            // Emit the event
            emitScenarioEvent(
                eventName,
                { ...data, result },
                this.id || this.constructor.name
            );

            return result;
        };

        return descriptor;
    };
}

/**
 * Batch multiple events into a single emission
 * Useful for complex operations that trigger multiple events
 *
 * @param {Array<{event: string, data: Object}>} events - Events to emit
 * @param {string} source - Source component
 */
export function emitBatch(events, source) {
    const timestamp = Date.now();

    events.forEach(({ event, data }) => {
        emitScenarioEvent(event, { ...data, _batchTimestamp: timestamp }, source);
    });
}

export default {
    emitScenarioEvent,
    EventEmitterMixin,
    createEventEmitter,
    emitsEvent,
    emitBatch,
    setScenarioEventDebug,
    isScenarioEventDebugEnabled
};
