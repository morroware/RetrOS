/**
 * ScenarioLoader - JSON parsing and validation for scenarios
 * Loads scenarios from filesystem or URLs
 */

import FileSystemManager from '../FileSystemManager.js';

class ScenarioLoaderClass {
    constructor() {
        // Cache of loaded scenarios
        this.cache = new Map();

        // Validation errors from last load
        this.lastErrors = [];
    }

    /**
     * Load a scenario from a path
     * @param {string} path - Filesystem path to scenario JSON
     * @returns {Object|null} Parsed and validated scenario or null
     */
    load(path) {
        // Check cache first
        if (this.cache.has(path)) {
            return this.cache.get(path);
        }

        try {
            const content = FileSystemManager.readFile(path);
            if (!content) {
                this.lastErrors = [{ message: `File not found: ${path}` }];
                return null;
            }

            const scenario = JSON.parse(content);
            const validated = this.validate(scenario);

            if (validated) {
                this.cache.set(path, validated);
                return validated;
            }

            return null;
        } catch (error) {
            this.lastErrors = [{ message: `Parse error: ${error.message}` }];
            return null;
        }
    }

    /**
     * Load a scenario from a URL (for bundled scenarios)
     * @param {string} url - URL to scenario JSON
     * @returns {Promise<Object|null>} Parsed and validated scenario
     */
    async loadFromUrl(url) {
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                this.lastErrors = [{ message: `Failed to fetch: ${response.statusText}` }];
                return null;
            }

            const scenario = await response.json();
            const validated = this.validate(scenario);

            if (validated) {
                this.cache.set(url, validated);
                return validated;
            }

            return null;
        } catch (error) {
            this.lastErrors = [{ message: `Fetch error: ${error.message}` }];
            return null;
        }
    }

    /**
     * Parse scenario from JSON string
     * @param {string} jsonString - JSON string
     * @returns {Object|null} Parsed and validated scenario
     */
    parse(jsonString) {
        try {
            const scenario = JSON.parse(jsonString);
            return this.validate(scenario);
        } catch (error) {
            this.lastErrors = [{ message: `Parse error: ${error.message}` }];
            return null;
        }
    }

    /**
     * Validate a scenario object
     * @param {Object} scenario - Scenario object to validate
     * @returns {Object|null} Normalized scenario or null if invalid
     */
    validate(scenario) {
        this.lastErrors = [];

        // Required fields
        if (!scenario.id) {
            this.lastErrors.push({ field: 'id', message: 'Scenario must have an id' });
        }
        if (!scenario.name) {
            this.lastErrors.push({ field: 'name', message: 'Scenario must have a name' });
        }
        if (!scenario.stages || !Array.isArray(scenario.stages) || scenario.stages.length === 0) {
            this.lastErrors.push({ field: 'stages', message: 'Scenario must have at least one stage' });
        }

        if (this.lastErrors.length > 0) {
            return null;
        }

        // Normalize and add defaults
        const normalized = {
            // Metadata
            id: scenario.id,
            name: scenario.name,
            description: scenario.description || '',
            version: scenario.version || '1.0.0',
            author: scenario.author || 'Unknown',
            icon: scenario.icon || '📜',
            difficulty: scenario.difficulty || 'medium',
            estimatedTime: scenario.estimatedTime || null,
            tags: scenario.tags || [],

            // Requirements
            requirements: this.normalizeRequirements(scenario.requirements),

            // Configuration
            config: this.normalizeConfig(scenario.config),

            // Variables (scenario state)
            variables: scenario.variables || {},

            // Lifecycle actions
            onStart: this.normalizeActions(scenario.onStart),
            onComplete: this.normalizeActions(scenario.onComplete),
            onFail: this.normalizeActions(scenario.onFail),
            onAbort: this.normalizeActions(scenario.onAbort),

            // Stages
            stages: this.normalizeStages(scenario.stages),

            // Global triggers (always active)
            globalTriggers: this.normalizeTriggers(scenario.globalTriggers || [])
        };

        // Validate stages
        const stageIds = new Set();
        let hasInitialStage = false;

        for (const stage of normalized.stages) {
            if (stageIds.has(stage.id)) {
                this.lastErrors.push({ field: 'stages', message: `Duplicate stage id: ${stage.id}` });
            }
            stageIds.add(stage.id);

            if (stage.isInitialStage) {
                if (hasInitialStage) {
                    this.lastErrors.push({ field: 'stages', message: 'Multiple initial stages defined' });
                }
                hasInitialStage = true;
            }
        }

        // If no initial stage marked, use first stage
        if (!hasInitialStage && normalized.stages.length > 0) {
            normalized.stages[0].isInitialStage = true;
        }

        // Validate trigger references
        for (const stage of normalized.stages) {
            for (const trigger of stage.triggers || []) {
                if (trigger.actions) {
                    for (const action of trigger.actions) {
                        if (action.type === 'advanceStage' && action.stageId) {
                            if (!stageIds.has(action.stageId)) {
                                this.lastErrors.push({
                                    field: 'triggers',
                                    message: `Stage "${stage.id}" references unknown stage: ${action.stageId}`
                                });
                            }
                        }
                    }
                }
            }
        }

        if (this.lastErrors.length > 0) {
            return null;
        }

        return normalized;
    }

    /**
     * Normalize requirements object
     * @param {Object} requirements - Requirements from scenario
     * @returns {Object} Normalized requirements
     */
    normalizeRequirements(requirements) {
        if (!requirements) {
            return { apps: [], features: [], minVersion: null };
        }

        return {
            apps: requirements.apps || [],
            features: requirements.features || [],
            minVersion: requirements.minVersion || null
        };
    }

    /**
     * Normalize config object
     * @param {Object} config - Config from scenario
     * @returns {Object} Normalized config
     */
    normalizeConfig(config) {
        return {
            allowSkip: config?.allowSkip ?? false,
            showProgress: config?.showProgress ?? true,
            autoSave: config?.autoSave ?? true,
            hintDelay: config?.hintDelay ?? 30000,
            maxHints: config?.maxHints ?? 3,
            ...config
        };
    }

    /**
     * Normalize actions object/array
     * @param {Object|Array} actions - Actions from scenario
     * @returns {Array} Normalized actions array
     */
    normalizeActions(actions) {
        if (!actions) return [];
        if (Array.isArray(actions)) return actions;
        if (actions.actions && Array.isArray(actions.actions)) return actions.actions;
        return [actions];
    }

    /**
     * Normalize stages array
     * @param {Array} stages - Stages from scenario
     * @returns {Array} Normalized stages
     */
    normalizeStages(stages) {
        if (!stages) return [];

        return stages.map((stage, index) => ({
            id: stage.id || `stage-${index}`,
            name: stage.name || `Stage ${index + 1}`,
            description: stage.description || '',
            isInitialStage: stage.isInitialStage || false,
            onEnter: this.normalizeActions(stage.onEnter),
            onExit: this.normalizeActions(stage.onExit),
            hints: stage.hints || [],
            triggers: this.normalizeTriggers(stage.triggers || [])
        }));
    }

    /**
     * Normalize triggers array
     * @param {Array} triggers - Triggers from scenario
     * @returns {Array} Normalized triggers
     */
    normalizeTriggers(triggers) {
        if (!triggers) return [];

        return triggers.map((trigger, index) => ({
            id: trigger.id || `trigger-${index}-${Date.now()}`,
            event: trigger.event || '*',
            conditions: trigger.conditions || null,
            actions: this.normalizeActions(trigger.actions),
            once: trigger.once ?? false,
            priority: trigger.priority ?? 0,
            matcher: trigger.matcher || null
        }));
    }

    /**
     * Get validation errors from last load/validate
     * @returns {Array} Array of error objects
     */
    getErrors() {
        return this.lastErrors;
    }

    /**
     * Clear the scenario cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Remove a specific scenario from cache
     * @param {string} path - Path to remove
     */
    uncache(path) {
        this.cache.delete(path);
    }

    /**
     * List all scenarios in a directory
     * @param {string} dirPath - Directory path
     * @returns {Array} Array of scenario metadata
     */
    listScenarios(dirPath) {
        const scenarios = [];

        try {
            const files = FileSystemManager.listDirectory(dirPath);
            if (!files) return scenarios;

            for (const file of files) {
                if (file.name.endsWith('.scenario.json') || file.name.endsWith('.json')) {
                    const fullPath = `${dirPath}/${file.name}`;
                    const content = FileSystemManager.readFile(fullPath);

                    if (content) {
                        try {
                            const parsed = JSON.parse(content);
                            scenarios.push({
                                path: fullPath,
                                id: parsed.id,
                                name: parsed.name || file.name,
                                description: parsed.description || '',
                                icon: parsed.icon || '📜',
                                difficulty: parsed.difficulty || 'medium',
                                estimatedTime: parsed.estimatedTime,
                                tags: parsed.tags || [],
                                author: parsed.author || 'Unknown'
                            });
                        } catch (e) {
                            // Skip invalid JSON files
                        }
                    }
                }
            }
        } catch (e) {
            console.error('[ScenarioLoader] Error listing scenarios:', e);
        }

        return scenarios;
    }

    /**
     * Create a minimal valid scenario template
     * @param {Object} options - Template options
     * @returns {Object} Scenario template
     */
    createTemplate(options = {}) {
        return {
            id: options.id || 'new-scenario',
            name: options.name || 'New Scenario',
            description: options.description || 'A new scenario',
            version: '1.0.0',
            author: options.author || 'Unknown',
            icon: options.icon || '📜',
            difficulty: options.difficulty || 'medium',
            tags: options.tags || [],

            config: {
                allowSkip: false,
                showProgress: true,
                autoSave: true,
                hintDelay: 30000,
                maxHints: 3
            },

            variables: {},

            onStart: {
                actions: [
                    { type: 'showNotification', message: 'Scenario started!' }
                ]
            },

            stages: [
                {
                    id: 'start',
                    name: 'Getting Started',
                    description: 'The first stage',
                    isInitialStage: true,
                    hints: [
                        { delay: 30000, message: 'Need help? Check the description.' }
                    ],
                    triggers: [
                        {
                            id: 'example-trigger',
                            event: 'app:launched',
                            conditions: {
                                type: 'eventData',
                                path: 'appId',
                                value: 'notepad'
                            },
                            actions: [
                                { type: 'completeScenario' }
                            ],
                            once: true
                        }
                    ]
                }
            ],

            globalTriggers: [],

            onComplete: {
                actions: [
                    { type: 'showDialog', title: 'Congratulations!', message: 'You completed the scenario!' },
                    { type: 'playSound', sound: 'achievement' }
                ]
            },

            onFail: {
                actions: [
                    { type: 'showDialog', title: 'Try Again', message: 'Better luck next time!' }
                ]
            }
        };
    }
}

const ScenarioLoader = new ScenarioLoaderClass();
export default ScenarioLoader;
