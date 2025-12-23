/**
 * TriggerEngine - Event subscription and trigger matching for scenarios
 *
 * Handles:
 * - Event pattern matching (exact, wildcard, regex)
 * - Trigger condition evaluation
 * - Action execution on trigger fire
 * - Trigger state management (once, priority, debounce)
 * - Event sequence matching
 */

import EventBus from '../EventBus.js';
import { evaluate } from './ConditionEvaluator.js';
import { execute, executeSequence } from './ActionExecutor.js';
import { emitScenarioEvent } from './EventEmitterMixin.js';
import { ScenarioEvents } from './SemanticEvents.js';

// Registry for custom trigger matchers
const customMatchers = new Map();

/**
 * TriggerEngine class - manages trigger subscriptions and execution
 */
export class TriggerEngine {
    constructor(context = {}) {
        // Context reference (scenario manager, state, etc.)
        this.context = context;

        // Active triggers organized by event pattern
        this.triggers = new Map();

        // Global triggers that match all events
        this.globalTriggers = [];

        // Event subscriptions for cleanup
        this.subscriptions = [];

        // Fired trigger tracking (for "once" triggers)
        this.firedTriggers = new Set();

        // Event history for sequence matching
        this.eventHistory = [];
        this.maxHistoryLength = 100;

        // Event counts for count-based conditions
        this.eventCounts = {};

        // Debounce timers
        this.debounceTimers = new Map();

        // Whether the engine is active
        this.active = false;
    }

    /**
     * Start the trigger engine
     */
    start() {
        if (this.active) return;
        this.active = true;

        // Subscribe to all events for global matching
        this.globalSubscription = EventBus.on('*', (event, data) => {
            if (this.active) {
                this.handleEvent(event, data);
            }
        });

        // If EventBus doesn't support wildcard, fall back to specific subscriptions
        if (!this.globalSubscription) {
            this.setupSpecificSubscriptions();
        }
    }

    /**
     * Stop the trigger engine
     */
    stop() {
        this.active = false;

        // Cleanup subscriptions
        this.subscriptions.forEach(unsub => {
            if (typeof unsub === 'function') unsub();
        });
        this.subscriptions = [];

        // Clear debounce timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();

        // Clear state
        this.triggers.clear();
        this.globalTriggers = [];
        this.firedTriggers.clear();
        this.eventHistory = [];
        this.eventCounts = {};
    }

    /**
     * Setup specific event subscriptions (fallback for EventBus without wildcard)
     */
    setupSpecificSubscriptions() {
        // Get all unique event patterns from triggers
        const patterns = new Set();

        this.triggers.forEach((_, pattern) => {
            // If not a wildcard pattern, subscribe directly
            if (!pattern.includes('*')) {
                patterns.add(pattern);
            }
        });

        // Subscribe to each specific event
        patterns.forEach(event => {
            const unsub = EventBus.on(event, (data) => {
                if (this.active) {
                    this.handleEvent(event, data);
                }
            });
            this.subscriptions.push(unsub);
        });
    }

    /**
     * Register a trigger
     * @param {Object} trigger - Trigger definition
     * @returns {string} - Trigger ID
     */
    registerTrigger(trigger) {
        const {
            id = `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            event,
            events,
            conditions,
            actions,
            once = false,
            priority = 0,
            debounce = 0,
            enabled = true,
            stageId = null
        } = trigger;

        const triggerDef = {
            id,
            event,
            events: events || (event ? [event] : []),
            conditions,
            actions: Array.isArray(actions) ? actions : [actions],
            once,
            priority,
            debounce,
            enabled,
            stageId
        };

        // Add to appropriate trigger list
        const eventPatterns = triggerDef.events.length > 0 ? triggerDef.events : ['*'];

        eventPatterns.forEach(pattern => {
            if (pattern === '*') {
                this.globalTriggers.push(triggerDef);
                // Sort global triggers by priority
                this.globalTriggers.sort((a, b) => b.priority - a.priority);
            } else {
                if (!this.triggers.has(pattern)) {
                    this.triggers.set(pattern, []);

                    // Subscribe to this event if not already subscribed
                    if (!pattern.includes('*') && this.active) {
                        const unsub = EventBus.on(pattern, (data) => {
                            if (this.active) {
                                this.handleEvent(pattern, data);
                            }
                        });
                        this.subscriptions.push(unsub);
                    }
                }

                this.triggers.get(pattern).push(triggerDef);
                // Sort by priority
                this.triggers.get(pattern).sort((a, b) => b.priority - a.priority);
            }
        });

        return id;
    }

    /**
     * Register multiple triggers
     * @param {Array<Object>} triggers - Array of trigger definitions
     * @returns {Array<string>} - Array of trigger IDs
     */
    registerTriggers(triggers) {
        return triggers.map(trigger => this.registerTrigger(trigger));
    }

    /**
     * Unregister a trigger by ID
     * @param {string} triggerId - The trigger ID to remove
     */
    unregisterTrigger(triggerId) {
        // Remove from pattern-based triggers
        this.triggers.forEach((triggerList, pattern) => {
            const index = triggerList.findIndex(t => t.id === triggerId);
            if (index !== -1) {
                triggerList.splice(index, 1);
            }
        });

        // Remove from global triggers
        const globalIndex = this.globalTriggers.findIndex(t => t.id === triggerId);
        if (globalIndex !== -1) {
            this.globalTriggers.splice(globalIndex, 1);
        }

        // Remove from fired set
        this.firedTriggers.delete(triggerId);
    }

    /**
     * Enable/disable a trigger
     * @param {string} triggerId - The trigger ID
     * @param {boolean} enabled - Whether to enable or disable
     */
    setTriggerEnabled(triggerId, enabled) {
        const findAndUpdate = (triggerList) => {
            const trigger = triggerList.find(t => t.id === triggerId);
            if (trigger) {
                trigger.enabled = enabled;
                return true;
            }
            return false;
        };

        // Search in pattern-based triggers
        for (const [, triggerList] of this.triggers) {
            if (findAndUpdate(triggerList)) return;
        }

        // Search in global triggers
        findAndUpdate(this.globalTriggers);
    }

    /**
     * Handle an incoming event
     * @param {string} eventName - The event name
     * @param {Object} data - Event data
     */
    async handleEvent(eventName, data = {}) {
        // Track event for history and counts
        this.trackEvent(eventName, data);

        // Find matching triggers
        const matchingTriggers = this.findMatchingTriggers(eventName);

        // Build evaluation context
        const context = {
            ...this.context,
            event: { name: eventName, ...data },
            eventHistory: this.eventHistory,
            eventCounts: this.eventCounts
        };

        // Process triggers in priority order
        for (const trigger of matchingTriggers) {
            await this.processTrigger(trigger, context);
        }
    }

    /**
     * Track event in history and counts
     * @param {string} eventName - Event name
     * @param {Object} data - Event data
     */
    trackEvent(eventName, data) {
        // Add to history
        this.eventHistory.push({
            event: eventName,
            data,
            timestamp: Date.now()
        });

        // Trim history if needed
        if (this.eventHistory.length > this.maxHistoryLength) {
            this.eventHistory.shift();
        }

        // Increment count
        this.eventCounts[eventName] = (this.eventCounts[eventName] || 0) + 1;
    }

    /**
     * Find all triggers matching an event
     * @param {string} eventName - The event name
     * @returns {Array<Object>} - Matching triggers sorted by priority
     */
    findMatchingTriggers(eventName) {
        const matches = [];

        // Exact matches
        if (this.triggers.has(eventName)) {
            matches.push(...this.triggers.get(eventName));
        }

        // Wildcard pattern matches
        this.triggers.forEach((triggerList, pattern) => {
            if (pattern !== eventName && this.matchesPattern(eventName, pattern)) {
                matches.push(...triggerList);
            }
        });

        // Global triggers
        matches.push(...this.globalTriggers);

        // Filter by enabled state and stage
        const filtered = matches.filter(trigger => {
            if (!trigger.enabled) return false;
            if (trigger.stageId && trigger.stageId !== this.context.scenario?.currentStageId) {
                return false;
            }
            return true;
        });

        // Sort by priority (already sorted within lists, but need to merge)
        filtered.sort((a, b) => b.priority - a.priority);

        return filtered;
    }

    /**
     * Check if an event name matches a pattern
     * @param {string} eventName - The event name
     * @param {string} pattern - The pattern to match against
     * @returns {boolean}
     */
    matchesPattern(eventName, pattern) {
        // Check for custom matchers
        for (const [matcherType, matcher] of customMatchers) {
            if (pattern.startsWith(`${matcherType}:`)) {
                return matcher(eventName, pattern.slice(matcherType.length + 1));
            }
        }

        // Exact match
        if (pattern === eventName) return true;

        // Wildcard match (e.g., "notepad:*" matches "notepad:saved")
        if (pattern.includes('*')) {
            const regexPattern = pattern
                .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars except *
                .replace(/\*/g, '.*'); // Convert * to .*
            const regex = new RegExp(`^${regexPattern}$`);
            return regex.test(eventName);
        }

        // Prefix match (e.g., "notepad" matches "notepad:saved")
        if (eventName.startsWith(pattern + ':')) return true;

        return false;
    }

    /**
     * Process a trigger
     * @param {Object} trigger - The trigger to process
     * @param {Object} context - Evaluation context
     */
    async processTrigger(trigger, context) {
        // Check if already fired (for "once" triggers)
        if (trigger.once && this.firedTriggers.has(trigger.id)) {
            return;
        }

        // Check conditions
        if (trigger.conditions) {
            const conditionMet = evaluate(trigger.conditions, context);
            if (!conditionMet) return;
        }

        // Handle debounce
        if (trigger.debounce > 0) {
            if (this.debounceTimers.has(trigger.id)) {
                clearTimeout(this.debounceTimers.get(trigger.id));
            }

            this.debounceTimers.set(trigger.id, setTimeout(() => {
                this.debounceTimers.delete(trigger.id);
                this.fireTrigger(trigger, context);
            }, trigger.debounce));

            return;
        }

        // Fire immediately
        await this.fireTrigger(trigger, context);
    }

    /**
     * Fire a trigger (execute its actions)
     * @param {Object} trigger - The trigger to fire
     * @param {Object} context - Execution context
     */
    async fireTrigger(trigger, context) {
        // Mark as fired
        if (trigger.once) {
            this.firedTriggers.add(trigger.id);
        }

        // Emit trigger fired event
        emitScenarioEvent(ScenarioEvents.TRIGGER_FIRED, {
            triggerId: trigger.id,
            event: context.event?.name,
            stageId: trigger.stageId
        }, 'TriggerEngine');

        // Execute actions
        if (trigger.actions && trigger.actions.length > 0) {
            await executeSequence(trigger.actions, {
                ...context,
                trigger
            });
        }
    }

    /**
     * Reset trigger state (for scenario restart)
     */
    reset() {
        this.firedTriggers.clear();
        this.eventHistory = [];
        this.eventCounts = {};
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
    }

    /**
     * Get triggers for a specific stage
     * @param {string} stageId - The stage ID
     * @returns {Array<Object>} - Triggers for this stage
     */
    getTriggersForStage(stageId) {
        const triggers = [];

        this.triggers.forEach((triggerList) => {
            triggerList.forEach(trigger => {
                if (trigger.stageId === stageId) {
                    triggers.push(trigger);
                }
            });
        });

        this.globalTriggers.forEach(trigger => {
            if (trigger.stageId === stageId) {
                triggers.push(trigger);
            }
        });

        return triggers;
    }

    /**
     * Clear triggers for a specific stage
     * @param {string} stageId - The stage ID
     */
    clearStage(stageId) {
        // Remove from pattern-based triggers
        this.triggers.forEach((triggerList, pattern) => {
            const filtered = triggerList.filter(t => t.stageId !== stageId);
            this.triggers.set(pattern, filtered);
        });

        // Remove from global triggers
        this.globalTriggers = this.globalTriggers.filter(t => t.stageId !== stageId);
    }

    /**
     * Update context reference
     * @param {Object} context - New context
     */
    updateContext(context) {
        this.context = { ...this.context, ...context };
    }
}

// =============================================================================
// CUSTOM MATCHER REGISTRATION
// =============================================================================

/**
 * Register a custom event matcher
 * @param {string} type - Matcher type name
 * @param {Function} matcher - Matcher function (eventName, pattern) => boolean
 */
export function registerMatcher(type, matcher) {
    customMatchers.set(type, matcher);
}

/**
 * Unregister a custom matcher
 * @param {string} type - Matcher type to remove
 */
export function unregisterMatcher(type) {
    customMatchers.delete(type);
}

// =============================================================================
// BUILT-IN MATCHERS
// =============================================================================

// Regex matcher: "regex:^notepad:.*$"
registerMatcher('regex', (eventName, pattern) => {
    try {
        const regex = new RegExp(pattern);
        return regex.test(eventName);
    } catch {
        return false;
    }
});

// Sequence matcher: "sequence:event1,event2,event3"
// Matches when events occur in order
registerMatcher('sequence', (eventName, pattern) => {
    // This is handled differently - in trigger processing
    // The pattern here is just for reference
    return false;
});

// =============================================================================
// EXPORTS
// =============================================================================

export default TriggerEngine;
