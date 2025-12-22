/**
 * TriggerEngine - Event subscription and trigger matching
 * Listens to EventBus and fires triggers when conditions are met
 */

import EventBus from '../EventBus.js';
import ConditionEvaluator from './ConditionEvaluator.js';
import { Events } from './SemanticEvents.js';

class TriggerEngineClass {
    constructor() {
        // Active triggers grouped by event type for efficient lookup
        this.triggersByEvent = new Map();

        // All registered triggers
        this.allTriggers = new Map();

        // Fired one-time triggers (to prevent re-firing)
        this.firedTriggers = new Set();

        // Event subscriptions for cleanup
        this.subscriptions = [];

        // Custom trigger matchers for complex patterns
        this.customMatchers = new Map();

        // Event history for sequence matching
        this.eventHistory = [];
        this.maxHistorySize = 100;

        // Event counts for count-based conditions
        this.eventCounts = new Map();

        // Running state
        this.isRunning = false;
    }

    /**
     * Register a custom trigger matcher
     * @param {string} type - Matcher type name
     * @param {Function} handler - Handler function (trigger, events) => boolean
     */
    registerMatcher(type, handler) {
        this.customMatchers.set(type, handler);
    }

    /**
     * Start listening for events
     * @param {Function} onTriggerFired - Callback when trigger fires
     */
    start(onTriggerFired) {
        if (this.isRunning) return;

        this.isRunning = true;
        this.onTriggerFired = onTriggerFired;

        // Subscribe to all known events
        this.subscribeToAllEvents();
    }

    /**
     * Stop listening for events
     */
    stop() {
        this.isRunning = false;
        this.subscriptions.forEach(unsub => unsub());
        this.subscriptions = [];
    }

    /**
     * Reset trigger state
     */
    reset() {
        this.firedTriggers.clear();
        this.eventHistory = [];
        this.eventCounts.clear();
    }

    /**
     * Subscribe to all event types that have triggers
     */
    subscribeToAllEvents() {
        // Get unique event types from all triggers
        const eventTypes = new Set();
        this.triggersByEvent.forEach((_, eventType) => {
            eventTypes.add(eventType);
        });

        // Also listen to wildcard events
        eventTypes.add('*');

        // Subscribe to each event type
        eventTypes.forEach(eventType => {
            if (eventType === '*') {
                // For wildcards, we'd need to intercept all events
                // This is handled by listening to specific events
                return;
            }

            const unsub = EventBus.on(eventType, (data) => {
                this.handleEvent(eventType, data);
            });
            this.subscriptions.push(unsub);
        });
    }

    /**
     * Handle an incoming event
     * @param {string} eventType - Event type
     * @param {Object} data - Event data
     */
    handleEvent(eventType, data) {
        if (!this.isRunning) return;

        // Update event history
        this.eventHistory.push({ type: eventType, data, timestamp: Date.now() });
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }

        // Update event counts
        const count = this.eventCounts.get(eventType) || 0;
        this.eventCounts.set(eventType, count + 1);

        // Find matching triggers
        const triggers = this.triggersByEvent.get(eventType) || [];
        const wildcardTriggers = this.triggersByEvent.get('*') || [];

        [...triggers, ...wildcardTriggers].forEach(trigger => {
            this.evaluateTrigger(trigger, eventType, data);
        });
    }

    /**
     * Evaluate if a trigger should fire
     * @param {Object} trigger - Trigger definition
     * @param {string} eventType - Event type that occurred
     * @param {Object} eventData - Event data
     */
    evaluateTrigger(trigger, eventType, eventData) {
        // Check if one-time trigger already fired
        if (trigger.once && this.firedTriggers.has(trigger.id)) {
            return;
        }

        // Build evaluation context
        const context = {
            event: eventData,
            eventType,
            eventHistory: this.eventHistory,
            eventCounts: Object.fromEntries(this.eventCounts),
            scenario: trigger._scenarioContext
        };

        // Check custom matchers first
        if (trigger.matcher && this.customMatchers.has(trigger.matcher)) {
            const matcher = this.customMatchers.get(trigger.matcher);
            if (!matcher(trigger, this.eventHistory)) {
                return;
            }
        }

        // Evaluate conditions
        if (trigger.conditions) {
            const conditionsMet = ConditionEvaluator.evaluate(trigger.conditions, context);
            if (!conditionsMet) {
                return;
            }
        }

        // Trigger fires!
        this.fireTrigger(trigger, context);
    }

    /**
     * Fire a trigger
     * @param {Object} trigger - Trigger that fired
     * @param {Object} context - Evaluation context
     */
    fireTrigger(trigger, context) {
        // Mark as fired if one-time
        if (trigger.once) {
            this.firedTriggers.add(trigger.id);
        }

        // Emit trigger fired event
        EventBus.emit(Events.SCENARIO_TRIGGER_FIRED, {
            triggerId: trigger.id,
            event: context.eventType,
            data: context.event
        });

        // Call the callback with trigger and context
        if (this.onTriggerFired) {
            this.onTriggerFired(trigger, context);
        }
    }

    /**
     * Register triggers from a scenario stage
     * @param {Array} triggers - Array of trigger definitions
     * @param {Object} scenarioContext - Scenario context for conditions
     */
    registerTriggers(triggers, scenarioContext = {}) {
        if (!triggers) return;

        triggers.forEach(trigger => {
            this.registerTrigger(trigger, scenarioContext);
        });
    }

    /**
     * Register a single trigger
     * @param {Object} trigger - Trigger definition
     * @param {Object} scenarioContext - Scenario context
     */
    registerTrigger(trigger, scenarioContext = {}) {
        // Ensure trigger has an ID
        const triggerId = trigger.id || `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const normalizedTrigger = {
            ...trigger,
            id: triggerId,
            _scenarioContext: scenarioContext
        };

        // Store in all triggers map
        this.allTriggers.set(triggerId, normalizedTrigger);

        // Index by event type for efficient lookup
        const eventType = trigger.event || '*';
        if (!this.triggersByEvent.has(eventType)) {
            this.triggersByEvent.set(eventType, []);

            // Subscribe to this new event type if running
            if (this.isRunning && eventType !== '*') {
                const unsub = EventBus.on(eventType, (data) => {
                    this.handleEvent(eventType, data);
                });
                this.subscriptions.push(unsub);
            }
        }
        this.triggersByEvent.get(eventType).push(normalizedTrigger);
    }

    /**
     * Unregister a trigger
     * @param {string} triggerId - Trigger ID to remove
     */
    unregisterTrigger(triggerId) {
        const trigger = this.allTriggers.get(triggerId);
        if (!trigger) return;

        this.allTriggers.delete(triggerId);

        const eventType = trigger.event || '*';
        const triggers = this.triggersByEvent.get(eventType);
        if (triggers) {
            const index = triggers.findIndex(t => t.id === triggerId);
            if (index >= 0) {
                triggers.splice(index, 1);
            }
        }

        this.firedTriggers.delete(triggerId);
    }

    /**
     * Unregister all triggers for a stage
     * @param {string} stageId - Stage ID
     */
    unregisterStage(stageId) {
        const triggersToRemove = [];

        this.allTriggers.forEach((trigger, id) => {
            if (trigger._scenarioContext?.stageId === stageId) {
                triggersToRemove.push(id);
            }
        });

        triggersToRemove.forEach(id => this.unregisterTrigger(id));
    }

    /**
     * Clear all triggers
     */
    clearAllTriggers() {
        this.triggersByEvent.clear();
        this.allTriggers.clear();
        this.firedTriggers.clear();
    }

    /**
     * Get event counts for condition evaluation
     * @returns {Object} Event counts
     */
    getEventCounts() {
        return Object.fromEntries(this.eventCounts);
    }

    /**
     * Check if a trigger has fired
     * @param {string} triggerId - Trigger ID
     * @returns {boolean}
     */
    hasFired(triggerId) {
        return this.firedTriggers.has(triggerId);
    }

    /**
     * Manually mark a trigger as fired (for save/load)
     * @param {string} triggerId - Trigger ID
     */
    markFired(triggerId) {
        this.firedTriggers.add(triggerId);
    }

    /**
     * Get serializable state for save/load
     * @returns {Object}
     */
    getState() {
        return {
            firedTriggers: Array.from(this.firedTriggers),
            eventCounts: Object.fromEntries(this.eventCounts)
        };
    }

    /**
     * Restore state from save
     * @param {Object} state - Saved state
     */
    restoreState(state) {
        if (state.firedTriggers) {
            this.firedTriggers = new Set(state.firedTriggers);
        }
        if (state.eventCounts) {
            this.eventCounts = new Map(Object.entries(state.eventCounts));
        }
    }
}

const TriggerEngine = new TriggerEngineClass();
export default TriggerEngine;
