/**
 * Scripted Events System - Barrel Export
 *
 * This module provides a fully scriptable event system for RetrOS.
 * It enables puzzle games, tutorials, guided experiences, and automated testing.
 *
 * Usage:
 *   import { ScenarioManager, Events } from './core/scripted-events/index.js';
 *
 *   // Load and start a scenario
 *   ScenarioManager.loadScenario('/scenarios/tutorial.json');
 *   ScenarioManager.start();
 *
 *   // Emit events from your app
 *   this.emit(Events.MINESWEEPER_WIN, { time: 120, difficulty: 'easy' });
 */

// Core components
export { default as ScenarioManager } from './ScenarioManager.js';
export { default as TriggerEngine } from './TriggerEngine.js';
export { default as ActionExecutor } from './ActionExecutor.js';
export { default as ConditionEvaluator } from './ConditionEvaluator.js';
export { default as ScenarioLoader } from './ScenarioLoader.js';

// Event definitions
export {
    Events,
    getEventsForComponent,
    isValidEvent,
    getEventCategory
} from './SemanticEvents.js';

// Default export for convenience
export { default } from './ScenarioManager.js';
