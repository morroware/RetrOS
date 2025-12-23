/**
 * ConditionEvaluator - Evaluates conditions for scenario triggers
 *
 * Supports 20+ condition types including:
 * - State checks (equals, exists, greater, less, contains)
 * - File system checks (exists, contains, equals)
 * - App/Window state (open, focused, locked)
 * - Achievement/Feature state
 * - Time-based conditions
 * - Event data matching
 * - Logical operators (and, or, not)
 * - Probability (random)
 */

import FileSystemManager from '../FileSystemManager.js';
import StateManager from '../StateManager.js';
import WindowManager from '../WindowManager.js';

// Registry for custom condition handlers
const customConditions = new Map();

/**
 * Register a custom condition type
 * @param {string} type - Condition type name
 * @param {Function} handler - Handler function (params, context) => boolean
 */
export function registerCondition(type, handler) {
    if (customConditions.has(type)) {
        console.warn(`[ConditionEvaluator] Overwriting condition type: ${type}`);
    }
    customConditions.set(type, handler);
}

/**
 * Unregister a custom condition type
 * @param {string} type - Condition type to remove
 */
export function unregisterCondition(type) {
    customConditions.delete(type);
}

/**
 * Main condition evaluation function
 * @param {Object} condition - The condition to evaluate
 * @param {Object} context - Evaluation context (scenario state, event data, etc.)
 * @returns {boolean} - Whether the condition is met
 */
export function evaluate(condition, context = {}) {
    if (!condition || typeof condition !== 'object') {
        return true; // No condition means always true
    }

    const { type, ...params } = condition;

    if (!type) {
        // If no type, check if it's a logical condition with implicit AND
        if (condition.conditions) {
            return evaluateAnd({ conditions: condition.conditions }, context);
        }
        return true;
    }

    // Check for custom condition first
    if (customConditions.has(type)) {
        try {
            return customConditions.get(type)(params, context);
        } catch (error) {
            console.error(`[ConditionEvaluator] Custom condition "${type}" error:`, error);
            return false;
        }
    }

    // Built-in condition types
    const evaluator = conditionHandlers[type];
    if (!evaluator) {
        console.warn(`[ConditionEvaluator] Unknown condition type: ${type}`);
        return false;
    }

    try {
        return evaluator(params, context);
    } catch (error) {
        console.error(`[ConditionEvaluator] Condition "${type}" error:`, error);
        return false;
    }
}

/**
 * Batch evaluate multiple conditions
 * @param {Array<Object>} conditions - Array of conditions
 * @param {Object} context - Evaluation context
 * @param {string} mode - 'all' (AND) or 'any' (OR)
 * @returns {boolean}
 */
export function evaluateMultiple(conditions, context, mode = 'all') {
    if (!Array.isArray(conditions) || conditions.length === 0) {
        return true;
    }

    if (mode === 'all') {
        return conditions.every(condition => evaluate(condition, context));
    } else {
        return conditions.some(condition => evaluate(condition, context));
    }
}

// =============================================================================
// CONDITION HANDLERS
// =============================================================================

const conditionHandlers = {
    // -------------------------------------------------------------------------
    // STAGE CONDITIONS
    // -------------------------------------------------------------------------

    /**
     * Check if a specific stage is currently active
     */
    stageActive(params, context) {
        const { stageId } = params;
        return context.scenario?.currentStageId === stageId;
    },

    /**
     * Check if a stage has been completed
     */
    stageCompleted(params, context) {
        const { stageId } = params;
        return context.scenario?.completedStages?.has(stageId) || false;
    },

    // -------------------------------------------------------------------------
    // STATE CONDITIONS
    // -------------------------------------------------------------------------

    /**
     * Check if scenario state equals a value
     */
    stateEquals(params, context) {
        const { path, value } = params;
        const actual = getNestedValue(context.scenario?.state || {}, path);
        return actual === value;
    },

    /**
     * Check if a state path exists (is not undefined)
     */
    stateExists(params, context) {
        const { path } = params;
        const value = getNestedValue(context.scenario?.state || {}, path);
        return value !== undefined;
    },

    /**
     * Check if state value is greater than a threshold
     */
    stateGreater(params, context) {
        const { path, value } = params;
        const actual = getNestedValue(context.scenario?.state || {}, path);
        return typeof actual === 'number' && actual > value;
    },

    /**
     * Check if state value is less than a threshold
     */
    stateLess(params, context) {
        const { path, value } = params;
        const actual = getNestedValue(context.scenario?.state || {}, path);
        return typeof actual === 'number' && actual < value;
    },

    /**
     * Check if state array contains a value
     */
    stateContains(params, context) {
        const { path, value } = params;
        const actual = getNestedValue(context.scenario?.state || {}, path);
        if (Array.isArray(actual)) {
            return actual.includes(value);
        }
        if (typeof actual === 'string') {
            return actual.includes(value);
        }
        return false;
    },

    /**
     * Check if state matches a pattern (regex)
     */
    stateMatches(params, context) {
        const { path, pattern, flags = '' } = params;
        const actual = getNestedValue(context.scenario?.state || {}, path);
        if (typeof actual !== 'string') return false;
        const regex = new RegExp(pattern, flags);
        return regex.test(actual);
    },

    // -------------------------------------------------------------------------
    // FILE SYSTEM CONDITIONS
    // -------------------------------------------------------------------------

    /**
     * Check if a file exists in the virtual file system
     */
    fileExists(params, context) {
        const { path } = params;
        try {
            const exists = FileSystemManager.exists(path);
            return exists;
        } catch {
            return false;
        }
    },

    /**
     * Check if file content contains/matches a pattern
     */
    fileContains(params, context) {
        const { path, pattern, regex = false } = params;
        try {
            const content = FileSystemManager.readFile(path);
            if (content === null) return false;

            if (regex) {
                const re = new RegExp(pattern);
                return re.test(content);
            }
            return content.includes(pattern);
        } catch {
            return false;
        }
    },

    /**
     * Check if file content exactly equals a value
     */
    fileEquals(params, context) {
        const { path, content } = params;
        try {
            const actual = FileSystemManager.readFile(path);
            return actual === content;
        } catch {
            return false;
        }
    },

    // -------------------------------------------------------------------------
    // APP/WINDOW CONDITIONS
    // -------------------------------------------------------------------------

    /**
     * Check if an app is currently open (has windows)
     */
    appOpen(params, context) {
        const { appId } = params;
        const windows = WindowManager.getWindows();
        return windows.some(w => w.appId === appId);
    },

    /**
     * Check if an app has focus
     */
    appFocused(params, context) {
        const { appId } = params;
        const focused = WindowManager.getFocusedWindow();
        return focused?.appId === appId;
    },

    /**
     * Check if an app is locked
     */
    appLocked(params, context) {
        const { appId } = params;
        // Check app registry or state for lock status
        const lockedApps = StateManager.getState('lockedApps') || {};
        return lockedApps[appId] === true;
    },

    /**
     * Check if a specific window exists
     */
    windowExists(params, context) {
        const { windowId } = params;
        return WindowManager.getWindow(windowId) !== null;
    },

    /**
     * Check if a window is minimized
     */
    windowMinimized(params, context) {
        const { windowId } = params;
        const win = WindowManager.getWindow(windowId);
        return win?.minimized === true;
    },

    // -------------------------------------------------------------------------
    // ACHIEVEMENT/FEATURE CONDITIONS
    // -------------------------------------------------------------------------

    /**
     * Check if an achievement is unlocked
     */
    achievementUnlocked(params, context) {
        const { id } = params;
        const achievements = StateManager.getState('achievements') || {};
        return achievements[id]?.unlocked === true;
    },

    /**
     * Check if a feature is enabled
     */
    featureEnabled(params, context) {
        const { featureId } = params;
        const features = StateManager.getState('features') || {};
        return features[featureId]?.enabled !== false;
    },

    // -------------------------------------------------------------------------
    // TIME CONDITIONS
    // -------------------------------------------------------------------------

    /**
     * Check if a duration has elapsed since a timestamp
     */
    timeElapsed(params, context) {
        const { duration, since = 'scenarioStart' } = params;
        let startTime;

        if (since === 'scenarioStart') {
            startTime = context.scenario?.startTime;
        } else if (since === 'stageStart') {
            startTime = context.scenario?.stageStartTime;
        } else if (typeof since === 'number') {
            startTime = since;
        } else {
            // Try to get from scenario state
            startTime = getNestedValue(context.scenario?.state || {}, since);
        }

        if (!startTime) return false;
        return Date.now() - startTime >= duration;
    },

    /**
     * Check if current time is before a specific time
     */
    timeBefore(params, context) {
        const { time } = params;
        const target = typeof time === 'string' ? new Date(time).getTime() : time;
        return Date.now() < target;
    },

    /**
     * Check if current time is after a specific time
     */
    timeAfter(params, context) {
        const { time } = params;
        const target = typeof time === 'string' ? new Date(time).getTime() : time;
        return Date.now() > target;
    },

    // -------------------------------------------------------------------------
    // EVENT DATA CONDITIONS
    // -------------------------------------------------------------------------

    /**
     * Check if event data field matches a value
     */
    eventMatch(params, context) {
        const { field, value, op = 'equals' } = params;
        const actual = getNestedValue(context.event || {}, field);

        switch (op) {
            case 'equals':
                return actual === value;
            case 'notEquals':
                return actual !== value;
            case 'contains':
                return typeof actual === 'string' && actual.includes(value);
            case 'startsWith':
                return typeof actual === 'string' && actual.startsWith(value);
            case 'endsWith':
                return typeof actual === 'string' && actual.endsWith(value);
            case 'greater':
                return actual > value;
            case 'less':
                return actual < value;
            case 'greaterOrEqual':
                return actual >= value;
            case 'lessOrEqual':
                return actual <= value;
            case 'in':
                return Array.isArray(value) && value.includes(actual);
            case 'matches':
                return typeof actual === 'string' && new RegExp(value).test(actual);
            default:
                return actual === value;
        }
    },

    /**
     * Check nested event data
     */
    eventData(params, context) {
        const { path, value, op = 'equals' } = params;
        return conditionHandlers.eventMatch({ field: path, value, op }, context);
    },

    // -------------------------------------------------------------------------
    // PROBABILITY CONDITIONS
    // -------------------------------------------------------------------------

    /**
     * Random probability check
     */
    random(params, context) {
        const { probability } = params;
        return Math.random() < probability;
    },

    // -------------------------------------------------------------------------
    // EVENT COUNT CONDITIONS
    // -------------------------------------------------------------------------

    /**
     * Check if an event has occurred a certain number of times
     */
    count(params, context) {
        const { event, min = 0, max = Infinity, window: timeWindow } = params;
        const counts = context.scenario?.eventCounts || {};
        const count = counts[event] || 0;

        // If time window specified, would need more complex tracking
        // For now, just use total count
        return count >= min && count <= max;
    },

    // -------------------------------------------------------------------------
    // LOGICAL OPERATORS
    // -------------------------------------------------------------------------

    /**
     * AND - All conditions must be true
     */
    and(params, context) {
        const { conditions } = params;
        if (!Array.isArray(conditions)) return true;
        return conditions.every(condition => evaluate(condition, context));
    },

    /**
     * OR - At least one condition must be true
     */
    or(params, context) {
        const { conditions } = params;
        if (!Array.isArray(conditions)) return false;
        return conditions.some(condition => evaluate(condition, context));
    },

    /**
     * NOT - Negate a condition
     */
    not(params, context) {
        const { condition } = params;
        return !evaluate(condition, context);
    },

    // -------------------------------------------------------------------------
    // GLOBAL STATE CONDITIONS
    // -------------------------------------------------------------------------

    /**
     * Check global state (StateManager) value
     */
    globalStateEquals(params, context) {
        const { path, value } = params;
        const actual = StateManager.getState(path);
        return actual === value;
    },

    /**
     * Check if global state path exists
     */
    globalStateExists(params, context) {
        const { path } = params;
        const value = StateManager.getState(path);
        return value !== undefined;
    },

    // -------------------------------------------------------------------------
    // COMPARISON HELPERS
    // -------------------------------------------------------------------------

    /**
     * Compare two values with an operator
     */
    compare(params, context) {
        const { left, op, right, leftPath, rightPath } = params;

        let leftValue = left;
        let rightValue = right;

        // Resolve paths if specified
        if (leftPath) {
            leftValue = getNestedValue(context.scenario?.state || {}, leftPath);
        }
        if (rightPath) {
            rightValue = getNestedValue(context.scenario?.state || {}, rightPath);
        }

        switch (op) {
            case '==':
            case 'equals':
                return leftValue === rightValue;
            case '!=':
            case 'notEquals':
                return leftValue !== rightValue;
            case '>':
            case 'greater':
                return leftValue > rightValue;
            case '<':
            case 'less':
                return leftValue < rightValue;
            case '>=':
            case 'greaterOrEqual':
                return leftValue >= rightValue;
            case '<=':
            case 'lessOrEqual':
                return leftValue <= rightValue;
            default:
                return leftValue === rightValue;
        }
    },

    /**
     * Check if a value is in a range
     */
    inRange(params, context) {
        const { path, min, max, inclusive = true } = params;
        const value = getNestedValue(context.scenario?.state || {}, path);

        if (typeof value !== 'number') return false;

        if (inclusive) {
            return value >= min && value <= max;
        }
        return value > min && value < max;
    },

    /**
     * Always true - useful for unconditional triggers
     */
    always(params, context) {
        return true;
    },

    /**
     * Always false - useful for disabled triggers
     */
    never(params, context) {
        return false;
    }
};

// Aliases for common patterns
conditionHandlers.allOf = conditionHandlers.and;
conditionHandlers.anyOf = conditionHandlers.or;
conditionHandlers.none = conditionHandlers.not;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a nested value from an object using dot notation
 * @param {Object} obj - The object to traverse
 * @param {string} path - Dot-notated path (e.g., 'foo.bar.baz')
 * @returns {*} The value at the path, or undefined
 */
function getNestedValue(obj, path) {
    if (!path) return obj;
    if (typeof path !== 'string') return undefined;

    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
        if (current === null || current === undefined) {
            return undefined;
        }

        // Handle array access like 'items[0]'
        const match = part.match(/^(\w+)\[(\d+)\]$/);
        if (match) {
            current = current[match[1]];
            if (Array.isArray(current)) {
                current = current[parseInt(match[2], 10)];
            } else {
                return undefined;
            }
        } else {
            current = current[part];
        }
    }

    return current;
}

/**
 * Create a condition tree from a shorthand object
 * Converts { field: value } to proper condition format
 */
export function normalizeCondition(condition) {
    if (!condition) return null;

    // Already normalized
    if (condition.type) return condition;

    // Shorthand: { "path.to.value": expectedValue }
    const keys = Object.keys(condition);
    if (keys.length === 1 && !['conditions', 'type'].includes(keys[0])) {
        return {
            type: 'stateEquals',
            path: keys[0],
            value: condition[keys[0]]
        };
    }

    // Implicit AND with conditions array
    if (condition.conditions) {
        return {
            type: 'and',
            conditions: condition.conditions.map(normalizeCondition)
        };
    }

    return condition;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
    evaluate,
    evaluateMultiple,
    registerCondition,
    unregisterCondition,
    normalizeCondition,
    getNestedValue
};

export { conditionHandlers, getNestedValue };
