/**
 * Scripted Events System - Barrel Export
 *
 * A fully scriptable OS where every app, feature, system component,
 * and UI interaction emits semantic events. This enables puzzle games,
 * tutorials, guided experiences, and automated testing.
 *
 * Usage:
 *   // Import everything
 *   import * as ScriptedEvents from './core/scripted-events';
 *
 *   // Import specific modules
 *   import { ScenarioManager, Events } from './core/scripted-events';
 *
 *   // Start a scenario
 *   await ScenarioManager.loadScenario('/scenarios/tutorial.scenario.json');
 *   await ScenarioManager.startScenario();
 */

// =============================================================================
// CORE COMPONENTS
// =============================================================================

// Semantic Events - The source of truth for all events
export {
    Events,
    EventCategories,
    getEventsForComponent,
    isValidEvent,
    getEventCategory,
    // Individual event groups
    MinesweeperEvents,
    SnakeEvents,
    AsteroidsEvents,
    SolitaireEvents,
    FreeCellEvents,
    SkiFreeEvents,
    ZorkEvents,
    PaintEvents,
    DoomEvents,
    GameEvents,
    NotepadEvents,
    CalculatorEvents,
    TerminalEvents,
    BrowserEvents,
    MediaPlayerEvents,
    WinampEvents,
    CalendarEvents,
    ClockEvents,
    ExplorerEvents,
    TaskManagerEvents,
    RecycleBinEvents,
    FindFilesEvents,
    DefragEvents,
    HelpEvents,
    ControlPanelEvents,
    DisplayPropertiesEvents,
    ChatRoomEvents,
    HyperCardEvents,
    FeaturesSettingsEvents,
    SoundSettingsEvents,
    AdminPanelEvents,
    AchievementEvents,
    SoundSystemEvents,
    ClippyEvents,
    DesktopPetEvents,
    ScreensaverEvents,
    EasterEggEvents,
    FeatureRegistryEvents,
    WindowEvents,
    FileSystemEvents,
    StateEvents,
    AppRegistryEvents,
    PluginEvents,
    DesktopEvents,
    TaskbarEvents,
    StartMenuEvents,
    ContextMenuEvents,
    SystemEvents,
    GenericEvents,
    ScenarioEvents
} from './SemanticEvents.js';

// Event Emitter Mixin - For consistent event emission
export {
    emitScenarioEvent,
    EventEmitterMixin,
    createEventEmitter,
    emitsEvent,
    emitBatch,
    setScenarioEventDebug,
    isScenarioEventDebugEnabled
} from './EventEmitterMixin.js';

// Condition Evaluator - For checking trigger conditions
export {
    evaluate as evaluateCondition,
    evaluateMultiple as evaluateConditions,
    registerCondition,
    unregisterCondition,
    normalizeCondition,
    getNestedValue,
    conditionHandlers
} from './ConditionEvaluator.js';

// Action Executor - For executing scenario actions
export {
    execute as executeAction,
    executeSequence,
    executeParallel,
    registerAction,
    unregisterAction,
    actionHandlers
} from './ActionExecutor.js';

// Trigger Engine - For event subscription and matching
export {
    TriggerEngine,
    registerMatcher,
    unregisterMatcher
} from './TriggerEngine.js';

// Scenario Loader - For loading and validating scenarios
export {
    ScenarioLoader,
    scenarioLoader
} from './ScenarioLoader.js';

// Scenario Manager - Main orchestrator
export {
    ScenarioManager
} from './ScenarioManager.js';

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

import { ScenarioManager } from './ScenarioManager.js';
import { Events } from './SemanticEvents.js';
import { emitScenarioEvent, EventEmitterMixin } from './EventEmitterMixin.js';
import { TriggerEngine } from './TriggerEngine.js';
import { ScenarioLoader, scenarioLoader } from './ScenarioLoader.js';
import { evaluate as evaluateCondition, registerCondition } from './ConditionEvaluator.js';
import { execute as executeAction, registerAction } from './ActionExecutor.js';

export default {
    // Main manager
    ScenarioManager,

    // Events
    Events,

    // Core utilities
    emitScenarioEvent,
    EventEmitterMixin,
    TriggerEngine,
    ScenarioLoader,
    scenarioLoader,

    // Registration APIs
    registerCondition,
    registerAction,

    // Evaluation APIs
    evaluateCondition,
    executeAction
};
