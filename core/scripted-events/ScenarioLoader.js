/**
 * ScenarioLoader - Loads, parses, and validates scenario JSON files
 *
 * Features:
 * - JSON parsing with error handling
 * - Schema validation
 * - Default value population
 * - Scenario transformation/normalization
 * - File loading from various sources
 */

import FileSystemManager from '../FileSystemManager.js';
import { isValidEvent, Events } from './SemanticEvents.js';

/**
 * Default scenario configuration values
 */
const DEFAULT_CONFIG = {
    allowSkip: false,
    showProgress: true,
    autoSave: true,
    hintDelay: 30000,
    maxHints: 3,
    pauseOnBlur: false
};

/**
 * ScenarioLoader class
 */
export class ScenarioLoader {
    constructor() {
        // Cache of loaded scenarios
        this.cache = new Map();

        // Validation errors from last load
        this.lastErrors = [];
    }

    /**
     * Load a scenario from a JSON string
     * @param {string} jsonString - JSON content
     * @param {Object} options - Loading options
     * @returns {Object|null} - Parsed and validated scenario or null on error
     */
    loadFromString(jsonString, options = {}) {
        const { validate = true, normalize = true, cacheKey = null } = options;

        try {
            // Parse JSON
            const raw = JSON.parse(jsonString);

            // Validate if requested
            if (validate) {
                const errors = this.validate(raw);
                if (errors.length > 0) {
                    this.lastErrors = errors;
                    if (!options.ignoreErrors) {
                        console.error('[ScenarioLoader] Validation errors:', errors);
                        return null;
                    }
                }
            }

            // Normalize/transform
            const scenario = normalize ? this.normalize(raw) : raw;

            // Cache if key provided
            if (cacheKey) {
                this.cache.set(cacheKey, scenario);
            }

            return scenario;
        } catch (error) {
            console.error('[ScenarioLoader] Parse error:', error.message);
            this.lastErrors = [{ type: 'parse', message: error.message }];
            return null;
        }
    }

    /**
     * Load a scenario from a file path (virtual file system)
     * @param {string} path - File path
     * @param {Object} options - Loading options
     * @returns {Object|null} - Parsed scenario or null
     */
    loadFromFile(path, options = {}) {
        try {
            const content = FileSystemManager.readFile(path);
            if (content === null) {
                this.lastErrors = [{ type: 'file', message: `File not found: ${path}` }];
                return null;
            }

            return this.loadFromString(content, { ...options, cacheKey: path });
        } catch (error) {
            this.lastErrors = [{ type: 'file', message: error.message }];
            return null;
        }
    }

    /**
     * Load a scenario from a URL
     * @param {string} url - URL to fetch
     * @param {Object} options - Loading options
     * @returns {Promise<Object|null>} - Parsed scenario or null
     */
    async loadFromUrl(url, options = {}) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const jsonString = await response.text();
            return this.loadFromString(jsonString, { ...options, cacheKey: url });
        } catch (error) {
            this.lastErrors = [{ type: 'network', message: error.message }];
            return null;
        }
    }

    /**
     * Load a scenario from an object (for programmatic creation)
     * @param {Object} scenarioObj - Scenario object
     * @param {Object} options - Loading options
     * @returns {Object|null} - Validated scenario or null
     */
    loadFromObject(scenarioObj, options = {}) {
        const { validate = true, normalize = true } = options;

        if (validate) {
            const errors = this.validate(scenarioObj);
            if (errors.length > 0) {
                this.lastErrors = errors;
                if (!options.ignoreErrors) {
                    console.error('[ScenarioLoader] Validation errors:', errors);
                    return null;
                }
            }
        }

        return normalize ? this.normalize(scenarioObj) : scenarioObj;
    }

    /**
     * Validate a scenario object
     * @param {Object} scenario - Scenario to validate
     * @returns {Array<Object>} - Array of validation errors
     */
    validate(scenario) {
        const errors = [];

        // Required fields
        if (!scenario.id) {
            errors.push({ field: 'id', message: 'Scenario ID is required' });
        }
        if (!scenario.name) {
            errors.push({ field: 'name', message: 'Scenario name is required' });
        }
        if (!scenario.stages || !Array.isArray(scenario.stages)) {
            errors.push({ field: 'stages', message: 'Stages array is required' });
        }

        // Validate stages
        if (Array.isArray(scenario.stages)) {
            scenario.stages.forEach((stage, index) => {
                const stageErrors = this.validateStage(stage, index);
                errors.push(...stageErrors);
            });

            // Check for initial stage
            const hasInitial = scenario.stages.some(s => s.isInitialStage);
            if (!hasInitial && scenario.stages.length > 0) {
                // Not an error, first stage will be used
            }
        }

        // Validate triggers
        if (scenario.globalTriggers && Array.isArray(scenario.globalTriggers)) {
            scenario.globalTriggers.forEach((trigger, index) => {
                const triggerErrors = this.validateTrigger(trigger, `globalTriggers[${index}]`);
                errors.push(...triggerErrors);
            });
        }

        // Validate requirements
        if (scenario.requirements) {
            if (scenario.requirements.apps && !Array.isArray(scenario.requirements.apps)) {
                errors.push({ field: 'requirements.apps', message: 'Apps must be an array' });
            }
            if (scenario.requirements.features && !Array.isArray(scenario.requirements.features)) {
                errors.push({ field: 'requirements.features', message: 'Features must be an array' });
            }
        }

        return errors;
    }

    /**
     * Validate a stage object
     * @param {Object} stage - Stage to validate
     * @param {number} index - Stage index for error messages
     * @returns {Array<Object>} - Validation errors
     */
    validateStage(stage, index) {
        const errors = [];
        const prefix = `stages[${index}]`;

        if (!stage.id) {
            errors.push({ field: `${prefix}.id`, message: 'Stage ID is required' });
        }

        // Validate triggers
        if (stage.triggers && Array.isArray(stage.triggers)) {
            stage.triggers.forEach((trigger, tIndex) => {
                const triggerErrors = this.validateTrigger(trigger, `${prefix}.triggers[${tIndex}]`);
                errors.push(...triggerErrors);
            });
        }

        // Validate onEnter actions
        if (stage.onEnter && stage.onEnter.actions) {
            if (!Array.isArray(stage.onEnter.actions)) {
                errors.push({ field: `${prefix}.onEnter.actions`, message: 'Actions must be an array' });
            }
        }

        // Validate onExit actions
        if (stage.onExit && stage.onExit.actions) {
            if (!Array.isArray(stage.onExit.actions)) {
                errors.push({ field: `${prefix}.onExit.actions`, message: 'Actions must be an array' });
            }
        }

        return errors;
    }

    /**
     * Validate a trigger object
     * @param {Object} trigger - Trigger to validate
     * @param {string} path - Field path for error messages
     * @returns {Array<Object>} - Validation errors
     */
    validateTrigger(trigger, path) {
        const errors = [];

        // Event is optional if using events array
        if (!trigger.event && (!trigger.events || trigger.events.length === 0)) {
            errors.push({
                field: `${path}.event`,
                message: 'Trigger must have an event or events array'
            });
        }

        // Actions should be present
        if (!trigger.actions || (Array.isArray(trigger.actions) && trigger.actions.length === 0)) {
            // Warning, not error - trigger might just be for tracking
        }

        // Validate event names (warn only, don't fail)
        const events = trigger.events || (trigger.event ? [trigger.event] : []);
        events.forEach(eventName => {
            if (!eventName.includes('*') && !eventName.includes(':')) {
                // Simple event name, might be valid
            }
        });

        return errors;
    }

    /**
     * Normalize a scenario (add defaults, transform structure)
     * @param {Object} raw - Raw scenario object
     * @returns {Object} - Normalized scenario
     */
    normalize(raw) {
        const scenario = { ...raw };

        // Apply default config
        scenario.config = {
            ...DEFAULT_CONFIG,
            ...(scenario.config || {})
        };

        // Initialize variables with defaults
        scenario.variables = scenario.variables || {};

        // Normalize stages
        if (Array.isArray(scenario.stages)) {
            scenario.stages = scenario.stages.map((stage, index) =>
                this.normalizeStage(stage, index)
            );

            // Mark first stage as initial if none specified
            if (!scenario.stages.some(s => s.isInitialStage) && scenario.stages.length > 0) {
                scenario.stages[0].isInitialStage = true;
            }
        }

        // Normalize global triggers
        if (Array.isArray(scenario.globalTriggers)) {
            scenario.globalTriggers = scenario.globalTriggers.map(
                trigger => this.normalizeTrigger(trigger)
            );
        } else {
            scenario.globalTriggers = [];
        }

        // Normalize lifecycle hooks
        scenario.onStart = this.normalizeLifecycleHook(scenario.onStart);
        scenario.onComplete = this.normalizeLifecycleHook(scenario.onComplete);
        scenario.onFail = this.normalizeLifecycleHook(scenario.onFail);
        scenario.onAbort = this.normalizeLifecycleHook(scenario.onAbort);

        // Set version if not present
        scenario.version = scenario.version || '1.0.0';

        return scenario;
    }

    /**
     * Normalize a stage
     * @param {Object} stage - Stage object
     * @param {number} index - Stage index
     * @returns {Object} - Normalized stage
     */
    normalizeStage(stage, index) {
        const normalized = {
            id: stage.id || `stage-${index}`,
            name: stage.name || `Stage ${index + 1}`,
            description: stage.description || '',
            isInitialStage: stage.isInitialStage || false,
            onEnter: this.normalizeLifecycleHook(stage.onEnter),
            onExit: this.normalizeLifecycleHook(stage.onExit),
            hints: Array.isArray(stage.hints) ? stage.hints : [],
            triggers: Array.isArray(stage.triggers)
                ? stage.triggers.map(t => this.normalizeTrigger(t, stage.id))
                : []
        };

        return normalized;
    }

    /**
     * Normalize a trigger
     * @param {Object} trigger - Trigger object
     * @param {string} stageId - Parent stage ID (optional)
     * @returns {Object} - Normalized trigger
     */
    normalizeTrigger(trigger, stageId = null) {
        const normalized = {
            id: trigger.id || `trigger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            event: trigger.event,
            events: trigger.events || (trigger.event ? [trigger.event] : []),
            conditions: trigger.conditions || null,
            actions: Array.isArray(trigger.actions) ? trigger.actions : [],
            once: trigger.once !== false,  // Default true
            priority: trigger.priority || 0,
            debounce: trigger.debounce || 0,
            enabled: trigger.enabled !== false,  // Default true
            stageId: stageId
        };

        // Normalize actions
        normalized.actions = normalized.actions.map(action => {
            if (typeof action === 'string') {
                // Shorthand action like "completeScenario"
                return { type: action };
            }
            return action;
        });

        return normalized;
    }

    /**
     * Normalize a lifecycle hook
     * @param {Object|undefined} hook - Hook object
     * @returns {Object} - Normalized hook
     */
    normalizeLifecycleHook(hook) {
        if (!hook) {
            return { actions: [] };
        }

        if (Array.isArray(hook)) {
            return { actions: hook };
        }

        return {
            actions: Array.isArray(hook.actions) ? hook.actions : []
        };
    }

    /**
     * Get scenario from cache
     * @param {string} key - Cache key
     * @returns {Object|null} - Cached scenario or null
     */
    getFromCache(key) {
        return this.cache.get(key) || null;
    }

    /**
     * Clear the cache
     * @param {string} key - Optional specific key to clear
     */
    clearCache(key = null) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Get last validation errors
     * @returns {Array<Object>} - Validation errors
     */
    getLastErrors() {
        return [...this.lastErrors];
    }

    /**
     * Create a minimal valid scenario
     * @param {string} id - Scenario ID
     * @param {string} name - Scenario name
     * @returns {Object} - Minimal scenario
     */
    createMinimal(id, name) {
        return this.normalize({
            id,
            name,
            description: '',
            stages: [{
                id: 'main',
                name: 'Main Stage',
                isInitialStage: true,
                triggers: []
            }]
        });
    }

    /**
     * Merge two scenarios (for extending/composing)
     * @param {Object} base - Base scenario
     * @param {Object} extension - Extension scenario
     * @returns {Object} - Merged scenario
     */
    merge(base, extension) {
        const merged = { ...base };

        // Merge config
        merged.config = { ...base.config, ...extension.config };

        // Merge variables
        merged.variables = { ...base.variables, ...extension.variables };

        // Merge stages (extension stages are added)
        merged.stages = [...(base.stages || []), ...(extension.stages || [])];

        // Merge global triggers
        merged.globalTriggers = [
            ...(base.globalTriggers || []),
            ...(extension.globalTriggers || [])
        ];

        // Override lifecycle hooks if provided in extension
        if (extension.onStart?.actions?.length > 0) {
            merged.onStart = extension.onStart;
        }
        if (extension.onComplete?.actions?.length > 0) {
            merged.onComplete = extension.onComplete;
        }

        return this.normalize(merged);
    }

    /**
     * List available scenarios in the scenarios directory
     * @returns {Array<Object>} - Array of scenario metadata
     */
    listScenarios() {
        const scenarios = [];

        try {
            const files = FileSystemManager.listDirectory('/scenarios');
            for (const file of files) {
                if (file.endsWith('.scenario.json')) {
                    const content = FileSystemManager.readFile(`/scenarios/${file}`);
                    if (content) {
                        try {
                            const parsed = JSON.parse(content);
                            scenarios.push({
                                id: parsed.id,
                                name: parsed.name,
                                description: parsed.description,
                                icon: parsed.icon,
                                difficulty: parsed.difficulty,
                                estimatedTime: parsed.estimatedTime,
                                tags: parsed.tags,
                                file: file,
                                path: `/scenarios/${file}`
                            });
                        } catch {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        } catch {
            // Directory doesn't exist yet
        }

        return scenarios;
    }
}

// Export singleton instance
export const scenarioLoader = new ScenarioLoader();

export default ScenarioLoader;
