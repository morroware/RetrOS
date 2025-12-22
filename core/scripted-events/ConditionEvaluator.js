/**
 * ConditionEvaluator - Evaluates conditions for scenario triggers
 * Supports 20+ condition types with AND/OR/NOT logic
 */

import StateManager from '../StateManager.js';
import FileSystemManager from '../FileSystemManager.js';
import WindowManager from '../WindowManager.js';
import AppRegistry from '../../apps/AppRegistry.js';
import FeatureRegistry from '../FeatureRegistry.js';

class ConditionEvaluatorClass {
    constructor() {
        // Custom condition handlers registered by plugins
        this.customConditions = new Map();
    }

    /**
     * Register a custom condition type
     * @param {string} type - Condition type name
     * @param {Function} handler - Handler function (params, context) => boolean
     */
    registerCondition(type, handler) {
        this.customConditions.set(type, handler);
    }

    /**
     * Unregister a custom condition type
     * @param {string} type - Condition type name
     */
    unregisterCondition(type) {
        this.customConditions.delete(type);
    }

    /**
     * Evaluate a condition or condition tree
     * @param {Object} condition - Condition object or tree
     * @param {Object} context - Evaluation context
     * @returns {boolean} Result of evaluation
     */
    evaluate(condition, context = {}) {
        if (!condition) return true;

        // Handle condition trees (AND/OR/NOT)
        if (condition.and) {
            return this.evaluateAnd(condition.and, context);
        }
        if (condition.or) {
            return this.evaluateOr(condition.or, context);
        }
        if (condition.not) {
            return !this.evaluate(condition.not, context);
        }

        // Handle single condition
        return this.evaluateSingle(condition, context);
    }

    /**
     * Evaluate AND condition (all must be true)
     * @param {Array} conditions - Array of conditions
     * @param {Object} context - Evaluation context
     * @returns {boolean}
     */
    evaluateAnd(conditions, context) {
        return conditions.every(cond => this.evaluate(cond, context));
    }

    /**
     * Evaluate OR condition (any must be true)
     * @param {Array} conditions - Array of conditions
     * @param {Object} context - Evaluation context
     * @returns {boolean}
     */
    evaluateOr(conditions, context) {
        return conditions.some(cond => this.evaluate(cond, context));
    }

    /**
     * Evaluate a single condition
     * @param {Object} condition - Condition object with type and params
     * @param {Object} context - Evaluation context
     * @returns {boolean}
     */
    evaluateSingle(condition, context) {
        const { type, ...params } = condition;

        // Check for custom condition first
        if (this.customConditions.has(type)) {
            try {
                return this.customConditions.get(type)(params, context);
            } catch (error) {
                console.error(`[ConditionEvaluator] Custom condition "${type}" error:`, error);
                return false;
            }
        }

        // Built-in conditions
        switch (type) {
            // Stage conditions
            case 'stageActive':
                return this.stageActive(params, context);
            case 'stageCompleted':
                return this.stageCompleted(params, context);

            // State conditions
            case 'stateEquals':
                return this.stateEquals(params, context);
            case 'stateExists':
                return this.stateExists(params, context);
            case 'stateGreater':
                return this.stateGreater(params, context);
            case 'stateLess':
                return this.stateLess(params, context);
            case 'stateContains':
                return this.stateContains(params, context);
            case 'stateBetween':
                return this.stateBetween(params, context);

            // File conditions
            case 'fileExists':
                return this.fileExists(params, context);
            case 'fileContains':
                return this.fileContains(params, context);
            case 'fileEquals':
                return this.fileEquals(params, context);

            // App conditions
            case 'appOpen':
                return this.appOpen(params, context);
            case 'appFocused':
                return this.appFocused(params, context);
            case 'appLocked':
                return this.appLocked(params, context);

            // Window conditions
            case 'windowExists':
                return this.windowExists(params, context);
            case 'windowMinimized':
                return this.windowMinimized(params, context);
            case 'windowCount':
                return this.windowCount(params, context);

            // Achievement conditions
            case 'achievementUnlocked':
                return this.achievementUnlocked(params, context);

            // Feature conditions
            case 'featureEnabled':
                return this.featureEnabled(params, context);

            // Time conditions
            case 'timeElapsed':
                return this.timeElapsed(params, context);
            case 'timeBefore':
                return this.timeBefore(params, context);
            case 'timeAfter':
                return this.timeAfter(params, context);

            // Event conditions
            case 'eventMatch':
                return this.eventMatch(params, context);
            case 'eventData':
                return this.eventData(params, context);

            // Utility conditions
            case 'random':
                return this.random(params, context);
            case 'count':
                return this.count(params, context);

            // Variable conditions (scenario-specific)
            case 'variableEquals':
                return this.variableEquals(params, context);
            case 'variableGreater':
                return this.variableGreater(params, context);
            case 'variableLess':
                return this.variableLess(params, context);
            case 'variableContains':
                return this.variableContains(params, context);

            default:
                console.warn(`[ConditionEvaluator] Unknown condition type: ${type}`);
                return false;
        }
    }

    // ========== STAGE CONDITIONS ==========

    stageActive({ stageId }, context) {
        return context.scenario?.currentStageId === stageId;
    }

    stageCompleted({ stageId }, context) {
        return context.scenario?.completedStages?.includes(stageId) ?? false;
    }

    // ========== STATE CONDITIONS ==========

    stateEquals({ path, value }, context) {
        const stateValue = StateManager.getState(path);
        return stateValue === value;
    }

    stateExists({ path }, context) {
        const stateValue = StateManager.getState(path);
        return stateValue !== undefined && stateValue !== null;
    }

    stateGreater({ path, value }, context) {
        const stateValue = StateManager.getState(path);
        return typeof stateValue === 'number' && stateValue > value;
    }

    stateLess({ path, value }, context) {
        const stateValue = StateManager.getState(path);
        return typeof stateValue === 'number' && stateValue < value;
    }

    stateContains({ path, value }, context) {
        const stateValue = StateManager.getState(path);
        if (Array.isArray(stateValue)) {
            return stateValue.includes(value);
        }
        if (typeof stateValue === 'string') {
            return stateValue.includes(value);
        }
        return false;
    }

    stateBetween({ path, min, max }, context) {
        const stateValue = StateManager.getState(path);
        return typeof stateValue === 'number' && stateValue >= min && stateValue <= max;
    }

    // ========== FILE CONDITIONS ==========

    fileExists({ path }, context) {
        return FileSystemManager.exists(path);
    }

    fileContains({ path, pattern, regex = false }, context) {
        const content = FileSystemManager.readFile(path);
        if (!content) return false;

        if (regex) {
            try {
                const re = new RegExp(pattern);
                return re.test(content);
            } catch (e) {
                console.error('[ConditionEvaluator] Invalid regex:', pattern);
                return false;
            }
        }
        return content.includes(pattern);
    }

    fileEquals({ path, content }, context) {
        const fileContent = FileSystemManager.readFile(path);
        return fileContent === content;
    }

    // ========== APP CONDITIONS ==========

    appOpen({ appId }, context) {
        const app = AppRegistry.get(appId);
        return app?.isOpen ?? false;
    }

    appFocused({ appId }, context) {
        const activeWindow = StateManager.getState('ui.activeWindow');
        if (!activeWindow) return false;
        // Window IDs can be 'appId' or 'appId-N' for multi-instance apps
        return activeWindow === appId || activeWindow.startsWith(appId + '-');
    }

    appLocked({ appId }, context) {
        const app = AppRegistry.get(appId);
        return app?.locked ?? false;
    }

    // ========== WINDOW CONDITIONS ==========

    windowExists({ windowId }, context) {
        return WindowManager.exists(windowId);
    }

    windowMinimized({ windowId }, context) {
        return WindowManager.isMinimized(windowId);
    }

    windowCount({ appId, min = 0, max = Infinity }, context) {
        const app = AppRegistry.get(appId);
        if (!app) return false;
        const count = app.openWindows?.size ?? 0;
        return count >= min && count <= max;
    }

    // ========== ACHIEVEMENT CONDITIONS ==========

    achievementUnlocked({ id }, context) {
        const achievements = StateManager.getState('achievements') || [];
        return achievements.includes(id);
    }

    // ========== FEATURE CONDITIONS ==========

    featureEnabled({ featureId }, context) {
        return FeatureRegistry.isEnabled(featureId);
    }

    // ========== TIME CONDITIONS ==========

    timeElapsed({ duration, since }, context) {
        const startTime = since ? context.scenario?.timestamps?.[since] : context.scenario?.startTime;
        if (!startTime) return false;
        return Date.now() - startTime >= duration;
    }

    timeBefore({ time }, context) {
        const now = new Date();
        const target = new Date(time);
        return now < target;
    }

    timeAfter({ time }, context) {
        const now = new Date();
        const target = new Date(time);
        return now > target;
    }

    // ========== EVENT CONDITIONS ==========

    eventMatch({ field, value, op = 'equals' }, context) {
        const eventData = context.event;
        if (!eventData) return false;

        const fieldValue = this.getNestedValue(eventData, field);

        switch (op) {
            case 'equals':
                return fieldValue === value;
            case 'contains':
                return String(fieldValue).includes(value);
            case 'startsWith':
                return String(fieldValue).startsWith(value);
            case 'endsWith':
                return String(fieldValue).endsWith(value);
            case 'greater':
                return fieldValue > value;
            case 'less':
                return fieldValue < value;
            case 'regex':
                try {
                    return new RegExp(value).test(fieldValue);
                } catch (e) {
                    return false;
                }
            default:
                return fieldValue === value;
        }
    }

    eventData({ path, value }, context) {
        const eventData = context.event;
        if (!eventData) return false;
        const fieldValue = this.getNestedValue(eventData, path);
        return fieldValue === value;
    }

    // ========== UTILITY CONDITIONS ==========

    random({ probability }, context) {
        return Math.random() < probability;
    }

    count({ event, min = 0, max = Infinity, window: timeWindow }, context) {
        const eventCounts = context.scenario?.eventCounts || {};
        const count = eventCounts[event] || 0;

        // TODO: Implement time window filtering if needed
        return count >= min && count <= max;
    }

    // ========== VARIABLE CONDITIONS ==========

    variableEquals({ name, value }, context) {
        const variables = context.scenario?.variables || {};
        return variables[name] === value;
    }

    variableGreater({ name, value }, context) {
        const variables = context.scenario?.variables || {};
        return typeof variables[name] === 'number' && variables[name] > value;
    }

    variableLess({ name, value }, context) {
        const variables = context.scenario?.variables || {};
        return typeof variables[name] === 'number' && variables[name] < value;
    }

    variableContains({ name, value }, context) {
        const variables = context.scenario?.variables || {};
        const varValue = variables[name];
        if (Array.isArray(varValue)) {
            return varValue.includes(value);
        }
        if (typeof varValue === 'string') {
            return varValue.includes(value);
        }
        return false;
    }

    // ========== HELPER METHODS ==========

    /**
     * Get nested value from object using dot notation
     * @param {Object} obj - Source object
     * @param {string} path - Dot-notation path
     * @returns {*} Value at path
     */
    getNestedValue(obj, path) {
        if (!path) return obj;
        return path.split('.').reduce((current, key) => {
            return current?.[key];
        }, obj);
    }
}

const ConditionEvaluator = new ConditionEvaluatorClass();
export default ConditionEvaluator;
