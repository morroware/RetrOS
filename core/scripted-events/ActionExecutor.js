/**
 * ActionExecutor - Executes scenario actions
 *
 * Supports 25+ action types including:
 * - File operations (create, modify, delete)
 * - Desktop icons (create, remove)
 * - UI dialogs, notifications, Clippy
 * - Sound and audio
 * - App control (launch, close, lock, unlock)
 * - Achievements
 * - State management
 * - Event emission
 * - Scenario flow control
 * - Visual effects
 * - And more...
 */

import EventBus, { Events } from '../EventBus.js';
import FileSystemManager from '../FileSystemManager.js';
import StateManager from '../StateManager.js';
import WindowManager from '../WindowManager.js';
import AppRegistry from '../../apps/AppRegistry.js';
import { emitScenarioEvent } from './EventEmitterMixin.js';
import { ScenarioEvents } from './SemanticEvents.js';

// Registry for custom action handlers
const customActions = new Map();

/**
 * Register a custom action type
 * @param {string} type - Action type name
 * @param {Function} handler - Async handler function (params, context) => result
 */
export function registerAction(type, handler) {
    if (customActions.has(type)) {
        console.warn(`[ActionExecutor] Overwriting action type: ${type}`);
    }
    customActions.set(type, handler);
}

/**
 * Unregister a custom action type
 * @param {string} type - Action type to remove
 */
export function unregisterAction(type) {
    customActions.delete(type);
}

/**
 * Execute a single action
 * @param {Object} action - The action to execute
 * @param {Object} context - Execution context (scenario state, manager reference, etc.)
 * @returns {Promise<Object>} - Result of the action execution
 */
export async function execute(action, context = {}) {
    if (!action || typeof action !== 'object') {
        return { success: false, error: 'Invalid action' };
    }

    const { type, ...params } = action;

    if (!type) {
        return { success: false, error: 'Action type not specified' };
    }

    // Emit action started event
    emitScenarioEvent(ScenarioEvents.ACTION_EXECUTED, {
        type,
        params,
        status: 'started'
    }, 'ActionExecutor');

    try {
        let result;

        // Check for custom action first
        if (customActions.has(type)) {
            result = await customActions.get(type)(params, context);
        } else {
            // Built-in action handlers
            const handler = actionHandlers[type];
            if (!handler) {
                throw new Error(`Unknown action type: ${type}`);
            }
            result = await handler(params, context);
        }

        // Emit action completed event
        emitScenarioEvent(ScenarioEvents.ACTION_EXECUTED, {
            type,
            params,
            status: 'completed',
            result
        }, 'ActionExecutor');

        return { success: true, result };
    } catch (error) {
        console.error(`[ActionExecutor] Action "${type}" failed:`, error);

        // Emit action failed event
        emitScenarioEvent(ScenarioEvents.ACTION_EXECUTED, {
            type,
            params,
            status: 'failed',
            error: error.message
        }, 'ActionExecutor');

        return { success: false, error: error.message };
    }
}

/**
 * Execute multiple actions in sequence
 * @param {Array<Object>} actions - Array of actions to execute
 * @param {Object} context - Execution context
 * @returns {Promise<Array<Object>>} - Results of all actions
 */
export async function executeSequence(actions, context = {}) {
    if (!Array.isArray(actions)) {
        return [];
    }

    const results = [];
    for (const action of actions) {
        const result = await execute(action, context);
        results.push(result);

        // Stop on failure if configured
        if (!result.success && context.stopOnFailure) {
            break;
        }
    }
    return results;
}

/**
 * Execute multiple actions in parallel
 * @param {Array<Object>} actions - Array of actions to execute
 * @param {Object} context - Execution context
 * @returns {Promise<Array<Object>>} - Results of all actions
 */
export async function executeParallel(actions, context = {}) {
    if (!Array.isArray(actions)) {
        return [];
    }

    return Promise.all(actions.map(action => execute(action, context)));
}

// =============================================================================
// ACTION HANDLERS
// =============================================================================

const actionHandlers = {
    // -------------------------------------------------------------------------
    // FILE SYSTEM ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Create a file in the virtual file system
     */
    async createFile(params, context) {
        const { path, content = '', addToDesktop = false, icon } = params;
        FileSystemManager.writeFile(path, content);

        if (addToDesktop) {
            const fileName = path.split('/').pop();
            await actionHandlers.createDesktopIcon({
                id: `file-${Date.now()}`,
                label: fileName,
                type: 'file',
                icon: icon || getFileIcon(fileName),
                data: { path }
            }, context);
        }

        return { path, created: true };
    },

    /**
     * Modify an existing file
     */
    async modifyFile(params, context) {
        const { path, content, append = false } = params;

        if (append) {
            const existing = FileSystemManager.readFile(path) || '';
            FileSystemManager.writeFile(path, existing + content);
        } else {
            FileSystemManager.writeFile(path, content);
        }

        return { path, modified: true };
    },

    /**
     * Delete a file
     */
    async deleteFile(params, context) {
        const { path } = params;
        FileSystemManager.deleteFile(path);
        return { path, deleted: true };
    },

    /**
     * Create a folder
     */
    async createFolder(params, context) {
        const { path } = params;
        FileSystemManager.createDirectory(path);
        return { path, created: true };
    },

    // -------------------------------------------------------------------------
    // DESKTOP ICON ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Create a desktop icon
     */
    async createDesktopIcon(params, context) {
        const { id, label, type = 'app', icon, position, data = {} } = params;

        const iconData = {
            id: id || `icon-${Date.now()}`,
            label,
            type,
            icon: icon || '📄',
            ...data
        };

        if (position) {
            iconData.x = position.x;
            iconData.y = position.y;
        }

        // Add to desktop icons state
        const icons = StateManager.getState('desktopIcons') || [];
        icons.push(iconData);
        StateManager.setState('desktopIcons', icons);

        // Trigger desktop refresh
        EventBus.emit('desktop:refresh');

        return { iconId: iconData.id, created: true };
    },

    /**
     * Remove a desktop icon
     */
    async removeDesktopIcon(params, context) {
        const { id } = params;

        const icons = StateManager.getState('desktopIcons') || [];
        const filtered = icons.filter(icon => icon.id !== id);
        StateManager.setState('desktopIcons', filtered);

        EventBus.emit('desktop:refresh');

        return { iconId: id, removed: true };
    },

    // -------------------------------------------------------------------------
    // UI DIALOG ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Show a dialog box
     */
    async showDialog(params, context) {
        const { title, message, icon = 'info', buttons = ['OK'] } = params;

        return new Promise(resolve => {
            // Use system dialogs if available
            EventBus.emit('dialog:show', {
                title,
                message,
                icon,
                buttons,
                callback: (result) => resolve({ button: result })
            });

            // Fallback to alert if no dialog system
            if (!EventBus.listenerCount('dialog:show')) {
                alert(`${title}\n\n${message}`);
                resolve({ button: 'OK' });
            }
        });
    },

    /**
     * Show a notification toast
     */
    async showNotification(params, context) {
        const { message, icon, duration = 3000 } = params;

        EventBus.emit('notification:show', {
            message,
            icon,
            duration
        });

        return { shown: true };
    },

    /**
     * Show Clippy with a message
     */
    async showClippy(params, context) {
        const { message, duration } = params;

        EventBus.emit('clippy:speak', {
            message,
            duration
        });

        return { shown: true };
    },

    // -------------------------------------------------------------------------
    // SOUND ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Play a system sound
     */
    async playSound(params, context) {
        const { sound } = params;
        EventBus.emit(Events.SOUND_PLAY, { type: sound });
        return { played: sound };
    },

    /**
     * Play an audio file
     */
    async playAudio(params, context) {
        const { src, loop = false, volume = 1.0 } = params;

        EventBus.emit(Events.AUDIO_PLAY, {
            src,
            loop,
            volume
        });

        return { playing: src };
    },

    /**
     * Stop audio playback
     */
    async stopAudio(params, context) {
        const { src } = params;

        if (src) {
            EventBus.emit(Events.AUDIO_STOP, { src });
        } else {
            EventBus.emit(Events.AUDIO_STOP_ALL);
        }

        return { stopped: true };
    },

    // -------------------------------------------------------------------------
    // APP CONTROL ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Unlock an app (remove lock)
     */
    async unlockApp(params, context) {
        const { appId } = params;

        const lockedApps = StateManager.getState('lockedApps') || {};
        delete lockedApps[appId];
        StateManager.setState('lockedApps', lockedApps);

        EventBus.emit('app:unlocked', { appId });

        return { appId, unlocked: true };
    },

    /**
     * Lock an app (prevent launch)
     */
    async lockApp(params, context) {
        const { appId, message } = params;

        const lockedApps = StateManager.getState('lockedApps') || {};
        lockedApps[appId] = { locked: true, message };
        StateManager.setState('lockedApps', lockedApps);

        EventBus.emit('app:locked', { appId, message });

        return { appId, locked: true };
    },

    /**
     * Launch an application
     */
    async launchApp(params, context) {
        const { appId, params: appParams } = params;

        try {
            const app = AppRegistry.get(appId);
            if (app) {
                await AppRegistry.launch(appId, appParams);
                return { appId, launched: true };
            }
            throw new Error(`App not found: ${appId}`);
        } catch (error) {
            return { appId, launched: false, error: error.message };
        }
    },

    /**
     * Close an application
     */
    async closeApp(params, context) {
        const { appId } = params;

        const windows = WindowManager.getWindows().filter(w => w.appId === appId);
        for (const win of windows) {
            WindowManager.closeWindow(win.id);
        }

        return { appId, closed: true, windowsClosed: windows.length };
    },

    // -------------------------------------------------------------------------
    // ACHIEVEMENT ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Unlock an achievement
     */
    async unlockAchievement(params, context) {
        const { id } = params;

        EventBus.emit(Events.ACHIEVEMENT_UNLOCK, { id });

        return { achievementId: id, unlocked: true };
    },

    // -------------------------------------------------------------------------
    // STATE ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Set scenario state
     */
    async setState(params, context) {
        const { path, value, persist = false } = params;

        if (context.scenario?.setState) {
            context.scenario.setState(path, value);
        }

        if (persist) {
            StateManager.setState(`scenarios.${context.scenario?.id}.${path}`, value);
        }

        return { path, value, set: true };
    },

    /**
     * Modify state (increment, decrement, etc.)
     */
    async modifyState(params, context) {
        const { path, operation, value = 1 } = params;

        if (!context.scenario?.getState || !context.scenario?.setState) {
            throw new Error('Scenario context required for modifyState');
        }

        let current = context.scenario.getState(path) || 0;

        switch (operation) {
            case 'increment':
            case 'add':
                current += value;
                break;
            case 'decrement':
            case 'subtract':
                current -= value;
                break;
            case 'multiply':
                current *= value;
                break;
            case 'divide':
                current /= value;
                break;
            case 'append':
                if (Array.isArray(current)) {
                    current = [...current, value];
                } else if (typeof current === 'string') {
                    current += value;
                }
                break;
            case 'remove':
                if (Array.isArray(current)) {
                    current = current.filter(item => item !== value);
                }
                break;
            case 'toggle':
                current = !current;
                break;
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }

        context.scenario.setState(path, current);
        return { path, operation, newValue: current };
    },

    // -------------------------------------------------------------------------
    // EVENT ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Emit a custom event
     */
    async emitEvent(params, context) {
        const { event, data = {} } = params;

        EventBus.emit(event, {
            ...data,
            _source: 'scenario',
            _scenarioId: context.scenario?.id
        });

        return { event, emitted: true };
    },

    // -------------------------------------------------------------------------
    // SCENARIO FLOW ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Advance to a specific stage
     */
    async advanceStage(params, context) {
        const { stageId } = params;

        if (context.manager?.advanceToStage) {
            await context.manager.advanceToStage(stageId);
            return { stageId, advanced: true };
        }

        throw new Error('Scenario manager required for advanceStage');
    },

    /**
     * Complete the scenario
     */
    async completeScenario(params, context) {
        if (context.manager?.completeScenario) {
            await context.manager.completeScenario();
            return { completed: true };
        }

        throw new Error('Scenario manager required for completeScenario');
    },

    /**
     * Fail the scenario
     */
    async failScenario(params, context) {
        const { reason } = params;

        if (context.manager?.failScenario) {
            await context.manager.failScenario(reason);
            return { failed: true, reason };
        }

        throw new Error('Scenario manager required for failScenario');
    },

    // -------------------------------------------------------------------------
    // TIMING ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Wait for a duration
     */
    async wait(params, context) {
        const { duration } = params;

        await new Promise(resolve => setTimeout(resolve, duration));
        return { waited: duration };
    },

    // -------------------------------------------------------------------------
    // HINT ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Show a hint to the user
     */
    async showHint(params, context) {
        const { message, index } = params;

        EventBus.emit('scenario:hint', {
            message,
            index,
            scenarioId: context.scenario?.id
        });

        emitScenarioEvent(ScenarioEvents.HINT_SHOWN, {
            message,
            index
        }, 'ActionExecutor');

        return { shown: true, message };
    },

    // -------------------------------------------------------------------------
    // VISUAL EFFECT ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Apply a visual effect
     */
    async visualEffect(params, context) {
        const { effect, target, duration = 1000 } = params;

        const element = target ? document.querySelector(target) : document.body;
        if (!element) {
            return { applied: false, error: 'Target not found' };
        }

        // Apply effect class
        element.classList.add(`scenario-effect-${effect}`);

        // Remove after duration
        if (duration > 0) {
            setTimeout(() => {
                element.classList.remove(`scenario-effect-${effect}`);
            }, duration);
        }

        return { effect, applied: true };
    },

    // -------------------------------------------------------------------------
    // WALLPAPER/THEME ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Set the desktop wallpaper
     */
    async setWallpaper(params, context) {
        const { wallpaper } = params;

        StateManager.setState('settings.wallpaper', wallpaper);
        EventBus.emit('wallpaper:change', { wallpaper });

        return { wallpaper, set: true };
    },

    // -------------------------------------------------------------------------
    // FEATURE CONTROL ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Enable a feature
     */
    async enableFeature(params, context) {
        const { featureId } = params;

        EventBus.emit('feature:enable', { featureId });
        return { featureId, enabled: true };
    },

    /**
     * Disable a feature
     */
    async disableFeature(params, context) {
        const { featureId } = params;

        EventBus.emit('feature:disable', { featureId });
        return { featureId, disabled: true };
    },

    // -------------------------------------------------------------------------
    // CLIPBOARD ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Modify the clipboard content
     */
    async modifyClipboard(params, context) {
        const { content } = params;

        try {
            await navigator.clipboard.writeText(content);
            return { set: true };
        } catch {
            // Fallback for environments without clipboard API
            StateManager.setState('clipboard', content);
            return { set: true, fallback: true };
        }
    },

    // -------------------------------------------------------------------------
    // INPUT SIMULATION ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Simulate key presses (limited functionality)
     */
    async sendKeys(params, context) {
        const { keys, target } = params;

        // This is primarily for documentation/logging purposes
        // Actual key simulation is complex and limited in browsers
        console.log(`[Scenario] Simulating keys: ${keys} to ${target || 'document'}`);

        return { keys, simulated: true };
    },

    // -------------------------------------------------------------------------
    // WINDOW CONTROL ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Focus a specific window
     */
    async focusWindow(params, context) {
        const { windowId } = params;

        WindowManager.focusWindow(windowId);
        return { windowId, focused: true };
    },

    /**
     * Minimize all windows
     */
    async minimizeAll(params, context) {
        const windows = WindowManager.getWindows();
        for (const win of windows) {
            WindowManager.minimizeWindow(win.id);
        }
        return { minimized: windows.length };
    },

    // -------------------------------------------------------------------------
    // SCREENSAVER ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Trigger the screensaver
     */
    async triggerScreensaver(params, context) {
        const { type } = params;

        EventBus.emit(Events.SCREENSAVER_START, { type });
        return { triggered: true, type };
    },

    // -------------------------------------------------------------------------
    // LOGGING ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Log a message (for debugging)
     */
    async log(params, context) {
        const { message, level = 'info' } = params;

        const logFn = console[level] || console.log;
        logFn(`[Scenario:${context.scenario?.id || 'unknown'}] ${message}`);

        return { logged: true };
    },

    // -------------------------------------------------------------------------
    // CONDITIONAL ACTION
    // -------------------------------------------------------------------------

    /**
     * Execute actions conditionally
     */
    async conditional(params, context) {
        const { condition, then: thenActions, else: elseActions } = params;

        // Import ConditionEvaluator dynamically to avoid circular dependency
        const { evaluate } = await import('./ConditionEvaluator.js');

        const conditionMet = evaluate(condition, context);

        if (conditionMet && thenActions) {
            return executeSequence(thenActions, context);
        } else if (!conditionMet && elseActions) {
            return executeSequence(elseActions, context);
        }

        return { conditionMet, executed: conditionMet ? 'then' : 'else' };
    },

    // -------------------------------------------------------------------------
    // LOOP ACTIONS
    // -------------------------------------------------------------------------

    /**
     * Execute actions multiple times
     */
    async repeat(params, context) {
        const { times, actions, delay = 0 } = params;

        const results = [];
        for (let i = 0; i < times; i++) {
            const iterResults = await executeSequence(actions, {
                ...context,
                iteration: i
            });
            results.push(iterResults);

            if (delay > 0 && i < times - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        return { iterations: times, results };
    }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get an appropriate icon for a file based on extension
 */
function getFileIcon(fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconMap = {
        'txt': '📄',
        'md': '📝',
        'json': '📋',
        'js': '📜',
        'html': '🌐',
        'css': '🎨',
        'png': '🖼️',
        'jpg': '🖼️',
        'jpeg': '🖼️',
        'gif': '🖼️',
        'mp3': '🎵',
        'wav': '🎵',
        'mp4': '🎬',
        'exe': '⚙️',
        'zip': '📦'
    };
    return iconMap[ext] || '📄';
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
    execute,
    executeSequence,
    executeParallel,
    registerAction,
    unregisterAction
};

export { actionHandlers };
