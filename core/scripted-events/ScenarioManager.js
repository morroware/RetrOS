/**
 * ScenarioManager - Main orchestrator for the scripted events system
 * Extends FeatureBase to integrate with the feature registry
 */

import FeatureBase from '../FeatureBase.js';
import EventBus from '../EventBus.js';
import StorageManager from '../StorageManager.js';
import ScenarioLoader from './ScenarioLoader.js';
import TriggerEngine from './TriggerEngine.js';
import ActionExecutor from './ActionExecutor.js';
import ConditionEvaluator from './ConditionEvaluator.js';
import { Events } from './SemanticEvents.js';

class ScenarioManager extends FeatureBase {
    constructor() {
        super({
            id: 'scenario-manager',
            name: 'Scenario System',
            description: 'Enables scriptable puzzles, tutorials, and guided experiences',
            icon: '🎮',
            category: 'enhancement',
            dependencies: [],
            config: {
                showProgressIndicator: true,
                enableHints: true,
                autoSaveProgress: true
            },
            settings: [
                {
                    key: 'showProgressIndicator',
                    label: 'Show Progress Indicator',
                    type: 'boolean',
                    description: 'Display scenario progress in taskbar'
                },
                {
                    key: 'enableHints',
                    label: 'Enable Hints',
                    type: 'boolean',
                    description: 'Show hints after configured delay'
                },
                {
                    key: 'autoSaveProgress',
                    label: 'Auto-Save Progress',
                    type: 'boolean',
                    description: 'Automatically save scenario progress'
                }
            ]
        });

        // Current scenario state
        this.currentScenario = null;
        this.currentStageId = null;
        this.completedStages = [];
        this.variables = {};
        this.startTime = null;
        this.timestamps = {};
        this.hintsShown = [];
        this.hintTimers = [];

        // Status
        this.status = 'idle'; // idle, running, paused, completed, failed
    }

    /**
     * Initialize the scenario system
     */
    async initialize() {
        this.log('Initializing scenario system...');

        // Load enabled state
        this.loadEnabledState();

        if (this.enabled) {
            await this.enable();
        }

        this.initialized = true;
    }

    /**
     * Enable the scenario system
     */
    async enable() {
        // Start the trigger engine (it will wait for scenarios)
        TriggerEngine.start((trigger, context) => {
            this.handleTriggerFired(trigger, context);
        });

        // Listen for scenario-related events
        this.subscribe('scenario:load', (data) => this.loadScenario(data.path));
        this.subscribe('scenario:start', (data) => this.start(data?.scenarioId));
        this.subscribe('scenario:stop', () => this.stop());
        this.subscribe('scenario:pause', () => this.pause());
        this.subscribe('scenario:resume', () => this.resume());

        // Restore any saved progress
        this.restoreProgress();

        this.enabled = true;
        this.saveEnabledState(true);
        this.log('Scenario system enabled');
    }

    /**
     * Disable the scenario system
     */
    async disable() {
        // Stop any running scenario
        this.stop();

        // Stop the trigger engine
        TriggerEngine.stop();

        this.cleanup();
        this.enabled = false;
        this.saveEnabledState(false);
        this.log('Scenario system disabled');
    }

    /**
     * Load a scenario from path
     * @param {string} path - Path to scenario JSON
     * @returns {boolean} Success
     */
    loadScenario(path) {
        const scenario = ScenarioLoader.load(path);
        if (!scenario) {
            const errors = ScenarioLoader.getErrors();
            this.error('Failed to load scenario:', errors);
            EventBus.emit('scenario:load:failed', { path, errors });
            return false;
        }

        this.currentScenario = scenario;
        this.variables = { ...scenario.variables };
        this.status = 'loaded';

        EventBus.emit(Events.SCENARIO_LOADED, {
            id: scenario.id,
            name: scenario.name
        });

        this.log(`Loaded scenario: ${scenario.name}`);
        return true;
    }

    /**
     * Load a scenario from object (for bundled scenarios)
     * @param {Object} scenario - Scenario object
     * @returns {boolean} Success
     */
    loadScenarioObject(scenario) {
        const validated = ScenarioLoader.validate(scenario);
        if (!validated) {
            const errors = ScenarioLoader.getErrors();
            this.error('Invalid scenario object:', errors);
            return false;
        }

        this.currentScenario = validated;
        this.variables = { ...validated.variables };
        this.status = 'loaded';

        EventBus.emit(Events.SCENARIO_LOADED, {
            id: validated.id,
            name: validated.name
        });

        this.log(`Loaded scenario: ${validated.name}`);
        return true;
    }

    /**
     * Start the loaded scenario
     * @param {string} [scenarioId] - Optional scenario ID to start (if loading by ID)
     */
    async start(scenarioId) {
        if (!this.currentScenario) {
            this.error('No scenario loaded');
            return false;
        }

        if (scenarioId && this.currentScenario.id !== scenarioId) {
            this.error(`Scenario ID mismatch: ${scenarioId}`);
            return false;
        }

        // Reset state
        this.completedStages = [];
        this.hintsShown = [];
        this.timestamps = {};
        this.startTime = Date.now();
        this.timestamps['start'] = this.startTime;

        // Clear previous triggers
        TriggerEngine.clearAllTriggers();
        TriggerEngine.reset();

        // Register global triggers
        TriggerEngine.registerTriggers(this.currentScenario.globalTriggers, {
            scenarioId: this.currentScenario.id,
            stageId: 'global'
        });

        // Execute onStart actions
        if (this.currentScenario.onStart) {
            await this.executeActions(this.currentScenario.onStart);
        }

        // Find and enter initial stage
        const initialStage = this.currentScenario.stages.find(s => s.isInitialStage);
        if (initialStage) {
            await this.enterStage(initialStage.id);
        }

        this.status = 'running';

        EventBus.emit(Events.SCENARIO_STARTED, {
            id: this.currentScenario.id,
            name: this.currentScenario.name,
            stageId: this.currentStageId
        });

        this.log(`Started scenario: ${this.currentScenario.name}`);
        return true;
    }

    /**
     * Stop the current scenario
     */
    async stop() {
        if (!this.currentScenario) return;

        // Clear hint timers
        this.hintTimers.forEach(timer => clearTimeout(timer));
        this.hintTimers = [];

        // Execute onAbort if running
        if (this.status === 'running' || this.status === 'paused') {
            if (this.currentScenario.onAbort) {
                await this.executeActions(this.currentScenario.onAbort);
            }

            EventBus.emit(Events.SCENARIO_ABORTED, {
                id: this.currentScenario.id,
                stageId: this.currentStageId
            });
        }

        // Clear triggers
        TriggerEngine.clearAllTriggers();

        // Reset state
        this.currentScenario = null;
        this.currentStageId = null;
        this.completedStages = [];
        this.variables = {};
        this.status = 'idle';

        this.log('Scenario stopped');
    }

    /**
     * Pause the current scenario
     */
    pause() {
        if (this.status !== 'running') return;

        // Pause hint timers
        this.hintTimers.forEach(timer => clearTimeout(timer));
        this.hintTimers = [];

        this.status = 'paused';
        this.log('Scenario paused');
    }

    /**
     * Resume the paused scenario
     */
    resume() {
        if (this.status !== 'paused') return;

        // Restart hint timers for current stage
        const stage = this.getCurrentStage();
        if (stage) {
            this.startHintTimers(stage);
        }

        this.status = 'running';
        this.log('Scenario resumed');
    }

    /**
     * Enter a stage
     * @param {string} stageId - Stage ID to enter
     */
    async enterStage(stageId) {
        const stage = this.currentScenario.stages.find(s => s.id === stageId);
        if (!stage) {
            this.error(`Stage not found: ${stageId}`);
            return false;
        }

        // Exit current stage if any
        if (this.currentStageId) {
            await this.exitStage(this.currentStageId);
        }

        this.currentStageId = stageId;
        this.timestamps[`stage:${stageId}`] = Date.now();

        // Register stage triggers
        TriggerEngine.registerTriggers(stage.triggers, {
            scenarioId: this.currentScenario.id,
            stageId: stageId
        });

        // Execute onEnter actions
        if (stage.onEnter) {
            await this.executeActions(stage.onEnter);
        }

        // Start hint timers
        this.startHintTimers(stage);

        EventBus.emit(Events.SCENARIO_STAGE_ENTERED, {
            scenarioId: this.currentScenario.id,
            stageId,
            stageName: stage.name
        });

        this.log(`Entered stage: ${stage.name}`);

        // Auto-save progress
        if (this.getConfig('autoSaveProgress')) {
            this.saveProgress();
        }

        return true;
    }

    /**
     * Exit a stage
     * @param {string} stageId - Stage ID to exit
     */
    async exitStage(stageId) {
        const stage = this.currentScenario.stages.find(s => s.id === stageId);
        if (!stage) return;

        // Clear hint timers
        this.hintTimers.forEach(timer => clearTimeout(timer));
        this.hintTimers = [];

        // Unregister stage triggers
        TriggerEngine.unregisterStage(stageId);

        // Execute onExit actions
        if (stage.onExit) {
            await this.executeActions(stage.onExit);
        }

        // Mark as completed
        if (!this.completedStages.includes(stageId)) {
            this.completedStages.push(stageId);
        }

        EventBus.emit(Events.SCENARIO_STAGE_EXITED, {
            scenarioId: this.currentScenario.id,
            stageId,
            stageName: stage.name
        });

        this.log(`Exited stage: ${stage.name}`);
    }

    /**
     * Advance to a specific stage
     * @param {string} stageId - Target stage ID
     */
    async advanceToStage(stageId) {
        return this.enterStage(stageId);
    }

    /**
     * Complete the scenario successfully
     */
    async complete() {
        if (!this.currentScenario) return;

        // Exit current stage
        if (this.currentStageId) {
            await this.exitStage(this.currentStageId);
        }

        // Execute onComplete actions
        if (this.currentScenario.onComplete) {
            await this.executeActions(this.currentScenario.onComplete);
        }

        const duration = Date.now() - this.startTime;

        EventBus.emit(Events.SCENARIO_COMPLETED, {
            id: this.currentScenario.id,
            name: this.currentScenario.name,
            duration,
            stagesCompleted: this.completedStages.length,
            hintsUsed: this.hintsShown.length
        });

        this.status = 'completed';
        this.log(`Scenario completed: ${this.currentScenario.name} (${duration}ms)`);

        // Clear saved progress
        this.clearSavedProgress();

        // Reset (keep scenario loaded for replay)
        TriggerEngine.clearAllTriggers();
    }

    /**
     * Fail the scenario
     * @param {string} reason - Failure reason
     */
    async fail(reason) {
        if (!this.currentScenario) return;

        // Execute onFail actions
        if (this.currentScenario.onFail) {
            await this.executeActions(this.currentScenario.onFail);
        }

        EventBus.emit(Events.SCENARIO_FAILED, {
            id: this.currentScenario.id,
            name: this.currentScenario.name,
            reason,
            stageId: this.currentStageId
        });

        this.status = 'failed';
        this.log(`Scenario failed: ${reason}`);

        // Clear triggers
        TriggerEngine.clearAllTriggers();
    }

    /**
     * Handle a trigger firing
     * @param {Object} trigger - The trigger that fired
     * @param {Object} context - Trigger context
     */
    async handleTriggerFired(trigger, context) {
        if (this.status !== 'running') return;

        this.log(`Trigger fired: ${trigger.id}`);

        // Build execution context
        const execContext = {
            ...context,
            scenarioManager: this,
            scenario: {
                id: this.currentScenario?.id,
                currentStageId: this.currentStageId,
                completedStages: this.completedStages,
                variables: this.variables,
                startTime: this.startTime,
                timestamps: this.timestamps,
                eventCounts: TriggerEngine.getEventCounts()
            }
        };

        // Execute trigger actions
        if (trigger.actions && trigger.actions.length > 0) {
            await this.executeActions(trigger.actions, execContext);
        }
    }

    /**
     * Execute an array of actions
     * @param {Array} actions - Actions to execute
     * @param {Object} context - Execution context
     */
    async executeActions(actions, context = {}) {
        const execContext = {
            ...context,
            scenarioManager: this,
            scenario: {
                id: this.currentScenario?.id,
                currentStageId: this.currentStageId,
                completedStages: this.completedStages,
                variables: this.variables,
                startTime: this.startTime,
                timestamps: this.timestamps,
                eventCounts: TriggerEngine.getEventCounts()
            }
        };

        return ActionExecutor.execute(actions, execContext);
    }

    /**
     * Start hint timers for a stage
     * @param {Object} stage - Stage with hints
     */
    startHintTimers(stage) {
        if (!this.getConfig('enableHints')) return;
        if (!stage.hints || stage.hints.length === 0) return;

        this.hintTimers.forEach(timer => clearTimeout(timer));
        this.hintTimers = [];

        stage.hints.forEach((hint, index) => {
            // Skip already shown hints
            const hintKey = `${stage.id}:${index}`;
            if (this.hintsShown.includes(hintKey)) return;

            const timer = setTimeout(() => {
                if (this.status === 'running' && this.currentStageId === stage.id) {
                    this.showHint(hint.message, index, stage.id);
                }
            }, hint.delay || 30000);

            this.hintTimers.push(timer);
        });
    }

    /**
     * Show a hint
     * @param {string} message - Hint message
     * @param {number} index - Hint index
     * @param {string} stageId - Stage ID
     */
    showHint(message, index, stageId) {
        const hintKey = `${stageId}:${index}`;
        if (this.hintsShown.includes(hintKey)) return;

        this.hintsShown.push(hintKey);

        EventBus.emit(Events.SCENARIO_HINT_SHOWN, {
            message,
            index,
            stageId,
            scenarioId: this.currentScenario?.id
        });

        // Also show as notification
        EventBus.emit('notification:show', {
            message: `💡 Hint: ${message}`,
            duration: 5000
        });

        this.log(`Hint shown: ${message}`);
    }

    /**
     * Get a variable value
     * @param {string} name - Variable name
     * @returns {*} Variable value
     */
    getVariable(name) {
        return this.variables[name];
    }

    /**
     * Set a variable value
     * @param {string} name - Variable name
     * @param {*} value - Variable value
     */
    setVariable(name, value) {
        const oldValue = this.variables[name];
        this.variables[name] = value;

        EventBus.emit(Events.SCENARIO_VARIABLE_CHANGED, {
            name,
            value,
            oldValue,
            scenarioId: this.currentScenario?.id
        });
    }

    /**
     * Get the current stage object
     * @returns {Object|null} Current stage
     */
    getCurrentStage() {
        if (!this.currentScenario || !this.currentStageId) return null;
        return this.currentScenario.stages.find(s => s.id === this.currentStageId);
    }

    /**
     * Get scenario progress
     * @returns {Object} Progress info
     */
    getProgress() {
        if (!this.currentScenario) return null;

        return {
            scenarioId: this.currentScenario.id,
            scenarioName: this.currentScenario.name,
            status: this.status,
            currentStageId: this.currentStageId,
            currentStageName: this.getCurrentStage()?.name,
            completedStages: this.completedStages.length,
            totalStages: this.currentScenario.stages.length,
            percent: Math.round((this.completedStages.length / this.currentScenario.stages.length) * 100),
            hintsUsed: this.hintsShown.length,
            elapsed: this.startTime ? Date.now() - this.startTime : 0
        };
    }

    /**
     * Save progress to storage
     */
    saveProgress() {
        if (!this.currentScenario || this.status !== 'running') return;

        const progress = {
            scenarioId: this.currentScenario.id,
            currentStageId: this.currentStageId,
            completedStages: this.completedStages,
            variables: this.variables,
            startTime: this.startTime,
            timestamps: this.timestamps,
            hintsShown: this.hintsShown,
            triggerState: TriggerEngine.getState()
        };

        StorageManager.set('scenario_progress', progress);
        this.log('Progress saved');
    }

    /**
     * Restore progress from storage
     */
    restoreProgress() {
        const progress = StorageManager.get('scenario_progress');
        if (!progress) return false;

        // Would need to reload the scenario and restore state
        // For now, just log that we found saved progress
        this.log(`Found saved progress for scenario: ${progress.scenarioId}`);
        return true;
    }

    /**
     * Clear saved progress
     */
    clearSavedProgress() {
        StorageManager.remove('scenario_progress');
    }

    /**
     * Check if a scenario is currently running
     * @returns {boolean}
     */
    isRunning() {
        return this.status === 'running';
    }

    /**
     * Check if a scenario is loaded
     * @returns {boolean}
     */
    isLoaded() {
        return this.currentScenario !== null;
    }

    /**
     * Get the current scenario
     * @returns {Object|null}
     */
    getScenario() {
        return this.currentScenario;
    }

    /**
     * Get status
     * @returns {string}
     */
    getStatus() {
        return this.status;
    }
}

// Export singleton instance
const scenarioManager = new ScenarioManager();
export default scenarioManager;
