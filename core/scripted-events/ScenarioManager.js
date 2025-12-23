/**
 * ScenarioManager - Main orchestrator for the Scripted Events System
 *
 * This is the central controller that:
 * - Loads and manages scenarios
 * - Coordinates triggers, conditions, and actions
 * - Manages scenario state and variables
 * - Handles stage progression
 * - Provides API for scenario control
 *
 * Usage:
 *   import ScenarioManager from './ScenarioManager.js';
 *
 *   // Load and start a scenario
 *   await ScenarioManager.loadScenario('/scenarios/tutorial.scenario.json');
 *   await ScenarioManager.startScenario();
 *
 *   // Or use as a feature
 *   FeatureRegistry.register(ScenarioManager);
 */

import FeatureBase from '../FeatureBase.js';
import EventBus, { Events } from '../EventBus.js';
import StateManager from '../StateManager.js';
import { TriggerEngine } from './TriggerEngine.js';
import { ScenarioLoader, scenarioLoader } from './ScenarioLoader.js';
import { executeSequence } from './ActionExecutor.js';
import { emitScenarioEvent } from './EventEmitterMixin.js';
import { ScenarioEvents } from './SemanticEvents.js';

// Available built-in scenarios for the dropdown
const BUILT_IN_SCENARIOS = [
    { value: '', label: 'None (disabled)' },
    { value: '/scenarios/tutorial.scenario.json', label: 'RetrOS Tutorial' },
    { value: '/scenarios/cipher-hunt.scenario.json', label: 'The Cipher Hunt' }
];

/**
 * ScenarioManager Feature
 */
class ScenarioManagerFeature extends FeatureBase {
    constructor() {
        super({
            id: 'scenario-manager',
            name: 'Scenario Manager',
            description: 'Orchestrates scripted events, puzzles, and tutorials',
            icon: '🎬',
            category: 'core',
            dependencies: [],
            config: {
                autoStart: false,
                debugMode: false,
                showIndicator: true,
                defaultScenario: ''  // Path to auto-start scenario on boot
            },
            settings: [
                {
                    id: 'showIndicator',
                    label: 'Show Scenario Indicator',
                    type: 'boolean',
                    default: true
                },
                {
                    id: 'debugMode',
                    label: 'Debug Mode',
                    type: 'boolean',
                    default: false
                },
                {
                    id: 'defaultScenario',
                    label: 'Auto-Start Scenario on Boot',
                    type: 'select',
                    options: BUILT_IN_SCENARIOS,
                    default: '',
                    adminOnly: true,  // Only admins can configure this
                    description: 'Select a scenario to automatically start when the site loads'
                }
            ]
        });

        // Current loaded scenario
        this.scenario = null;

        // Trigger engine instance
        this.triggerEngine = null;

        // Current state
        this.state = {};

        // Scenario runtime state
        this.runtime = {
            isRunning: false,
            isPaused: false,
            currentStageId: null,
            completedStages: new Set(),
            startTime: null,
            stageStartTime: null,
            hintsUsed: 0
        };

        // Loader instance
        this.loader = scenarioLoader;
    }

    /**
     * Initialize the feature
     */
    async initialize() {
        this.log('Initializing Scenario Manager');

        // Subscribe to boot complete event for auto-starting default scenario
        this.subscribe(Events.BOOT_COMPLETE, () => {
            this.handleBootComplete();
        });

        // Subscribe to system events for pause/resume
        this.subscribe('system:blur', () => {
            if (this.scenario?.config?.pauseOnBlur && this.runtime.isRunning) {
                this.pauseScenario();
            }
        });

        this.subscribe('system:focus', () => {
            if (this.runtime.isPaused) {
                this.resumeScenario();
            }
        });

        // Subscribe to scenario control events
        this.subscribe('scenario:load', (data) => this.loadScenario(data.path || data.scenario));
        this.subscribe('scenario:start', () => this.startScenario());
        this.subscribe('scenario:stop', () => this.stopScenario());
        this.subscribe('scenario:pause', () => this.pauseScenario());
        this.subscribe('scenario:resume', () => this.resumeScenario());

        this.log('Scenario Manager initialized');
    }

    /**
     * Handle boot complete event - auto-start default scenario if configured
     */
    async handleBootComplete() {
        // Get the default scenario setting
        const defaultScenario = this.getConfig('defaultScenario');

        if (!defaultScenario) {
            this.log('No default scenario configured');
            return;
        }

        this.log(`Auto-starting default scenario: ${defaultScenario}`);

        // Small delay to let the UI fully initialize
        setTimeout(async () => {
            try {
                const loaded = await this.loadScenario(defaultScenario);
                if (loaded) {
                    await this.startScenario();
                    this.log('Default scenario started successfully');
                } else {
                    this.warn(`Failed to load default scenario: ${defaultScenario}`);
                }
            } catch (error) {
                this.error('Error starting default scenario:', error);
            }
        }, 1500);  // Wait 1.5s after boot for UI to settle
    }

    /**
     * Load a scenario from a URL path or object
     * @param {string|Object} source - URL path or scenario object
     * @returns {boolean} - Success status
     */
    async loadScenario(source) {
        // Stop any running scenario
        if (this.runtime.isRunning) {
            await this.stopScenario();
        }

        try {
            let scenario;

            if (typeof source === 'string') {
                // Convert path to URL - scenarios are served as static files
                // Remove leading slash for relative URL if present
                const url = source.startsWith('/') ? `.${source}` : source;
                this.log(`Loading scenario from URL: ${url}`);
                scenario = await this.loader.loadFromUrl(url);
            } else if (typeof source === 'object') {
                // Load from object
                scenario = this.loader.loadFromObject(source);
            } else {
                throw new Error('Invalid scenario source');
            }

            if (!scenario) {
                const errors = this.loader.getLastErrors();
                this.error('Failed to load scenario:', errors);
                return false;
            }

            this.scenario = scenario;

            // Initialize state with scenario variables
            this.state = { ...scenario.variables };

            // Emit loaded event
            emitScenarioEvent(ScenarioEvents.LOADED, {
                id: scenario.id,
                name: scenario.name,
                stageCount: scenario.stages.length
            }, 'ScenarioManager');

            this.log(`Loaded scenario: ${scenario.name}`);
            return true;
        } catch (error) {
            this.error('Error loading scenario:', error);
            return false;
        }
    }

    /**
     * Start the loaded scenario
     * @returns {boolean} - Success status
     */
    async startScenario() {
        if (!this.scenario) {
            this.error('No scenario loaded');
            return false;
        }

        if (this.runtime.isRunning) {
            this.warn('Scenario already running');
            return false;
        }

        this.log(`Starting scenario: ${this.scenario.name}`);

        // Initialize trigger engine
        this.triggerEngine = new TriggerEngine({
            scenario: this.getScenarioContext(),
            manager: this
        });

        // Register global triggers
        if (this.scenario.globalTriggers.length > 0) {
            this.triggerEngine.registerTriggers(this.scenario.globalTriggers);
        }

        // Start the trigger engine
        this.triggerEngine.start();

        // Update runtime state
        this.runtime.isRunning = true;
        this.runtime.isPaused = false;
        this.runtime.startTime = Date.now();
        this.runtime.completedStages = new Set();
        this.runtime.hintsUsed = 0;

        // Execute onStart actions
        if (this.scenario.onStart?.actions?.length > 0) {
            await executeSequence(this.scenario.onStart.actions, {
                scenario: this.getScenarioContext(),
                manager: this
            });
        }

        // Emit started event
        emitScenarioEvent(ScenarioEvents.STARTED, {
            id: this.scenario.id,
            name: this.scenario.name
        }, 'ScenarioManager');

        // Enter initial stage
        const initialStage = this.scenario.stages.find(s => s.isInitialStage);
        if (initialStage) {
            await this.enterStage(initialStage.id);
        }

        // Show indicator
        if (this.getConfig('showIndicator')) {
            this.showScenarioIndicator();
        }

        return true;
    }

    /**
     * Stop the current scenario
     * @param {boolean} abort - Whether this is an abort (vs normal stop)
     */
    async stopScenario(abort = false) {
        if (!this.runtime.isRunning) return;

        this.log(`Stopping scenario${abort ? ' (aborted)' : ''}`);

        // Stop trigger engine
        if (this.triggerEngine) {
            this.triggerEngine.stop();
            this.triggerEngine = null;
        }

        // Execute onAbort actions if aborting
        if (abort && this.scenario?.onAbort?.actions?.length > 0) {
            await executeSequence(this.scenario.onAbort.actions, {
                scenario: this.getScenarioContext(),
                manager: this
            });

            emitScenarioEvent(ScenarioEvents.ABORTED, {
                id: this.scenario.id
            }, 'ScenarioManager');
        }

        // Reset runtime state
        this.runtime.isRunning = false;
        this.runtime.isPaused = false;
        this.runtime.currentStageId = null;

        // Hide indicator
        this.hideScenarioIndicator();
    }

    /**
     * Pause the scenario
     */
    pauseScenario() {
        if (!this.runtime.isRunning || this.runtime.isPaused) return;

        this.runtime.isPaused = true;

        emitScenarioEvent(ScenarioEvents.PAUSED, {
            id: this.scenario?.id
        }, 'ScenarioManager');

        this.log('Scenario paused');
    }

    /**
     * Resume the scenario
     */
    resumeScenario() {
        if (!this.runtime.isRunning || !this.runtime.isPaused) return;

        this.runtime.isPaused = false;

        emitScenarioEvent(ScenarioEvents.RESUMED, {
            id: this.scenario?.id
        }, 'ScenarioManager');

        this.log('Scenario resumed');
    }

    /**
     * Enter a stage
     * @param {string} stageId - Stage ID to enter
     */
    async enterStage(stageId) {
        const stage = this.scenario.stages.find(s => s.id === stageId);
        if (!stage) {
            this.error(`Stage not found: ${stageId}`);
            return;
        }

        // Exit current stage if any
        if (this.runtime.currentStageId) {
            await this.exitStage(this.runtime.currentStageId);
        }

        this.log(`Entering stage: ${stage.name}`);

        // Update runtime
        this.runtime.currentStageId = stageId;
        this.runtime.stageStartTime = Date.now();

        // Update trigger engine context
        if (this.triggerEngine) {
            this.triggerEngine.updateContext({
                scenario: this.getScenarioContext()
            });

            // Register stage triggers
            if (stage.triggers.length > 0) {
                this.triggerEngine.registerTriggers(
                    stage.triggers.map(t => ({ ...t, stageId }))
                );
            }
        }

        // Execute onEnter actions
        if (stage.onEnter?.actions?.length > 0) {
            await executeSequence(stage.onEnter.actions, {
                scenario: this.getScenarioContext(),
                manager: this
            });
        }

        // Emit stage entered event
        emitScenarioEvent(ScenarioEvents.STAGE_ENTERED, {
            stageId,
            stageName: stage.name,
            scenarioId: this.scenario.id
        }, 'ScenarioManager');

        // Setup hint timer
        this.setupHintTimer(stage);
    }

    /**
     * Exit a stage
     * @param {string} stageId - Stage ID to exit
     */
    async exitStage(stageId) {
        const stage = this.scenario.stages.find(s => s.id === stageId);
        if (!stage) return;

        this.log(`Exiting stage: ${stage.name}`);

        // Clear hint timer
        this.clearHintTimer();

        // Execute onExit actions
        if (stage.onExit?.actions?.length > 0) {
            await executeSequence(stage.onExit.actions, {
                scenario: this.getScenarioContext(),
                manager: this
            });
        }

        // Clear stage triggers
        if (this.triggerEngine) {
            this.triggerEngine.clearStage(stageId);
        }
    }

    /**
     * Advance to a specific stage
     * @param {string} stageId - Target stage ID
     */
    async advanceToStage(stageId) {
        // Mark current stage as completed
        if (this.runtime.currentStageId) {
            this.runtime.completedStages.add(this.runtime.currentStageId);

            emitScenarioEvent(ScenarioEvents.STAGE_COMPLETED, {
                stageId: this.runtime.currentStageId,
                scenarioId: this.scenario.id
            }, 'ScenarioManager');
        }

        // Enter new stage
        await this.enterStage(stageId);
    }

    /**
     * Complete the scenario successfully
     */
    async completeScenario() {
        if (!this.runtime.isRunning) return;

        this.log(`Scenario completed: ${this.scenario.name}`);

        // Mark final stage as completed
        if (this.runtime.currentStageId) {
            this.runtime.completedStages.add(this.runtime.currentStageId);
        }

        // Calculate duration
        const duration = Date.now() - this.runtime.startTime;

        // Execute onComplete actions
        if (this.scenario.onComplete?.actions?.length > 0) {
            await executeSequence(this.scenario.onComplete.actions, {
                scenario: this.getScenarioContext(),
                manager: this,
                duration,
                hintsUsed: this.runtime.hintsUsed
            });
        }

        // Emit completed event
        emitScenarioEvent(ScenarioEvents.COMPLETED, {
            id: this.scenario.id,
            name: this.scenario.name,
            duration,
            stagesCompleted: this.runtime.completedStages.size,
            hintsUsed: this.runtime.hintsUsed
        }, 'ScenarioManager');

        // Save completion to state
        StateManager.setState(`scenarios.${this.scenario.id}.completed`, true);
        StateManager.setState(`scenarios.${this.scenario.id}.completionTime`, Date.now());

        // Stop the scenario
        await this.stopScenario(false);
    }

    /**
     * Fail the scenario
     * @param {string} reason - Failure reason
     */
    async failScenario(reason = 'Unknown') {
        if (!this.runtime.isRunning) return;

        this.log(`Scenario failed: ${reason}`);

        // Calculate duration
        const duration = Date.now() - this.runtime.startTime;

        // Execute onFail actions
        if (this.scenario.onFail?.actions?.length > 0) {
            await executeSequence(this.scenario.onFail.actions, {
                scenario: this.getScenarioContext(),
                manager: this,
                reason,
                duration
            });
        }

        // Emit failed event
        emitScenarioEvent(ScenarioEvents.FAILED, {
            id: this.scenario.id,
            name: this.scenario.name,
            reason,
            duration
        }, 'ScenarioManager');

        // Stop the scenario
        await this.stopScenario(false);
    }

    /**
     * Get scenario state value
     * @param {string} path - State path
     * @returns {*} - State value
     */
    getState(path) {
        if (!path) return this.state;

        const parts = path.split('.');
        let current = this.state;

        for (const part of parts) {
            if (current === null || current === undefined) return undefined;
            current = current[part];
        }

        return current;
    }

    /**
     * Set scenario state value
     * @param {string} path - State path
     * @param {*} value - Value to set
     */
    setState(path, value) {
        const parts = path.split('.');
        let current = this.state;

        for (let i = 0; i < parts.length - 1; i++) {
            if (!(parts[i] in current)) {
                current[parts[i]] = {};
            }
            current = current[parts[i]];
        }

        const oldValue = current[parts[parts.length - 1]];
        current[parts[parts.length - 1]] = value;

        // Emit state changed event
        emitScenarioEvent(ScenarioEvents.STATE_CHANGED, {
            path,
            value,
            oldValue,
            scenarioId: this.scenario?.id
        }, 'ScenarioManager');
    }

    /**
     * Get the current scenario context for triggers/actions
     * @returns {Object} - Context object
     */
    getScenarioContext() {
        return {
            id: this.scenario?.id,
            name: this.scenario?.name,
            state: this.state,
            currentStageId: this.runtime.currentStageId,
            completedStages: this.runtime.completedStages,
            startTime: this.runtime.startTime,
            stageStartTime: this.runtime.stageStartTime,
            isRunning: this.runtime.isRunning,
            isPaused: this.runtime.isPaused,
            getState: this.getState.bind(this),
            setState: this.setState.bind(this)
        };
    }

    /**
     * Setup hint timer for a stage
     * @param {Object} stage - Stage object
     */
    setupHintTimer(stage) {
        this.clearHintTimer();

        if (!stage.hints || stage.hints.length === 0) return;
        if (!this.scenario.config.maxHints || this.runtime.hintsUsed >= this.scenario.config.maxHints) return;

        const nextHintIndex = Math.min(this.runtime.hintsUsed, stage.hints.length - 1);
        const hint = stage.hints[nextHintIndex];
        const delay = hint.delay || this.scenario.config.hintDelay;

        this.hintTimer = setTimeout(() => {
            if (this.runtime.isRunning && !this.runtime.isPaused) {
                this.showHint(hint.message, nextHintIndex);
            }
        }, delay);
    }

    /**
     * Clear hint timer
     */
    clearHintTimer() {
        if (this.hintTimer) {
            clearTimeout(this.hintTimer);
            this.hintTimer = null;
        }
    }

    /**
     * Show a hint
     * @param {string} message - Hint message
     * @param {number} index - Hint index
     */
    showHint(message, index) {
        this.runtime.hintsUsed++;

        emitScenarioEvent(ScenarioEvents.HINT_SHOWN, {
            message,
            index,
            scenarioId: this.scenario?.id,
            total: this.runtime.hintsUsed
        }, 'ScenarioManager');

        // Emit to UI
        EventBus.emit('scenario:hint:show', { message, index });

        this.log(`Hint ${index + 1}: ${message}`);
    }

    /**
     * Show scenario indicator in taskbar
     */
    showScenarioIndicator() {
        EventBus.emit('taskbar:indicator:add', {
            id: 'scenario',
            icon: this.scenario?.icon || '🎬',
            tooltip: `${this.scenario?.name} - In Progress`,
            onClick: () => this.showScenarioStatus()
        });
    }

    /**
     * Hide scenario indicator
     */
    hideScenarioIndicator() {
        EventBus.emit('taskbar:indicator:remove', { id: 'scenario' });
    }

    /**
     * Show scenario status dialog
     */
    showScenarioStatus() {
        const currentStage = this.scenario?.stages.find(s => s.id === this.runtime.currentStageId);
        const elapsed = Date.now() - this.runtime.startTime;
        const elapsedMinutes = Math.floor(elapsed / 60000);

        EventBus.emit('dialog:show', {
            title: this.scenario?.name || 'Scenario Status',
            message: `
                Stage: ${currentStage?.name || 'N/A'}
                Progress: ${this.runtime.completedStages.size}/${this.scenario?.stages.length} stages
                Time: ${elapsedMinutes} minutes
                Hints Used: ${this.runtime.hintsUsed}
            `.trim(),
            icon: this.scenario?.icon || '🎬',
            buttons: ['Continue', 'Abort'],
            callback: (button) => {
                if (button === 'Abort') {
                    this.stopScenario(true);
                }
            }
        });
    }

    /**
     * Get info about the current scenario
     * @returns {Object|null} - Scenario info or null
     */
    getScenarioInfo() {
        if (!this.scenario) return null;

        return {
            id: this.scenario.id,
            name: this.scenario.name,
            description: this.scenario.description,
            icon: this.scenario.icon,
            difficulty: this.scenario.difficulty,
            estimatedTime: this.scenario.estimatedTime,
            isRunning: this.runtime.isRunning,
            isPaused: this.runtime.isPaused,
            currentStage: this.runtime.currentStageId,
            progress: this.runtime.completedStages.size / this.scenario.stages.length,
            stagesCompleted: this.runtime.completedStages.size,
            totalStages: this.scenario.stages.length
        };
    }

    /**
     * List available scenarios
     * @returns {Array<Object>} - Array of scenario metadata
     */
    listScenarios() {
        return this.loader.listScenarios();
    }

    /**
     * Check if a scenario is currently running
     * @returns {boolean}
     */
    isRunning() {
        return this.runtime.isRunning;
    }

    /**
     * Check if a scenario is paused
     * @returns {boolean}
     */
    isPaused() {
        return this.runtime.isPaused;
    }

    /**
     * Cleanup when feature is disabled
     */
    cleanup() {
        this.stopScenario(true);
        super.cleanup();
    }
}

// Export singleton instance
export const ScenarioManager = new ScenarioManagerFeature();

export default ScenarioManager;
