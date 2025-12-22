/**
 * ActionExecutor - Executes scenario actions
 * Supports 25+ action types for full OS control
 */

import EventBus from '../EventBus.js';
import StateManager from '../StateManager.js';
import FileSystemManager from '../FileSystemManager.js';
import WindowManager from '../WindowManager.js';
import AppRegistry from '../../apps/AppRegistry.js';
import FeatureRegistry from '../FeatureRegistry.js';
import { Events } from './SemanticEvents.js';

class ActionExecutorClass {
    constructor() {
        // Custom action handlers registered by plugins
        this.customActions = new Map();
    }

    /**
     * Register a custom action type
     * @param {string} type - Action type name
     * @param {Function} handler - Handler function (params, context) => Promise<result>
     */
    registerAction(type, handler) {
        this.customActions.set(type, handler);
    }

    /**
     * Unregister a custom action type
     * @param {string} type - Action type name
     */
    unregisterAction(type) {
        this.customActions.delete(type);
    }

    /**
     * Execute an action or array of actions
     * @param {Object|Array} actions - Action(s) to execute
     * @param {Object} context - Execution context
     * @returns {Promise<Object>} Execution result
     */
    async execute(actions, context = {}) {
        if (!actions) return { success: true };

        // Handle array of actions
        if (Array.isArray(actions)) {
            const results = [];
            for (const action of actions) {
                const result = await this.executeSingle(action, context);
                results.push(result);
                if (!result.success && action.stopOnError !== false) {
                    return { success: false, results, error: result.error };
                }
            }
            return { success: true, results };
        }

        // Handle actions object with array
        if (actions.actions) {
            return this.execute(actions.actions, context);
        }

        // Handle single action
        return this.executeSingle(actions, context);
    }

    /**
     * Execute a single action
     * @param {Object} action - Action object with type and params
     * @param {Object} context - Execution context
     * @returns {Promise<Object>} Execution result
     */
    async executeSingle(action, context) {
        const { type, ...params } = action;

        try {
            // Emit action execution event
            EventBus.emit(Events.SCENARIO_ACTION_EXECUTED, { type, params });

            // Check for custom action first
            if (this.customActions.has(type)) {
                const result = await this.customActions.get(type)(params, context);
                return { success: true, result };
            }

            // Built-in actions
            let result;
            switch (type) {
                // File actions
                case 'createFile':
                    result = await this.createFile(params, context);
                    break;
                case 'modifyFile':
                    result = await this.modifyFile(params, context);
                    break;
                case 'deleteFile':
                    result = await this.deleteFile(params, context);
                    break;
                case 'createFolder':
                    result = await this.createFolder(params, context);
                    break;

                // Desktop actions
                case 'createDesktopIcon':
                    result = await this.createDesktopIcon(params, context);
                    break;
                case 'removeDesktopIcon':
                    result = await this.removeDesktopIcon(params, context);
                    break;

                // Dialog/notification actions
                case 'showDialog':
                    result = await this.showDialog(params, context);
                    break;
                case 'showNotification':
                    result = await this.showNotification(params, context);
                    break;
                case 'showClippy':
                    result = await this.showClippy(params, context);
                    break;

                // Sound actions
                case 'playSound':
                    result = await this.playSound(params, context);
                    break;
                case 'playAudio':
                    result = await this.playAudio(params, context);
                    break;
                case 'stopAudio':
                    result = await this.stopAudio(params, context);
                    break;

                // App actions
                case 'unlockApp':
                    result = await this.unlockApp(params, context);
                    break;
                case 'lockApp':
                    result = await this.lockApp(params, context);
                    break;
                case 'launchApp':
                    result = await this.launchApp(params, context);
                    break;
                case 'closeApp':
                    result = await this.closeApp(params, context);
                    break;

                // Achievement actions
                case 'unlockAchievement':
                    result = await this.unlockAchievement(params, context);
                    break;

                // State actions
                case 'setState':
                    result = await this.setState(params, context);
                    break;
                case 'modifyState':
                    result = await this.modifyState(params, context);
                    break;

                // Event actions
                case 'emitEvent':
                    result = await this.emitEvent(params, context);
                    break;

                // Scenario flow actions
                case 'advanceStage':
                    result = await this.advanceStage(params, context);
                    break;
                case 'completeScenario':
                    result = await this.completeScenario(params, context);
                    break;
                case 'failScenario':
                    result = await this.failScenario(params, context);
                    break;

                // Utility actions
                case 'wait':
                    result = await this.wait(params, context);
                    break;
                case 'showHint':
                    result = await this.showHint(params, context);
                    break;
                case 'visualEffect':
                    result = await this.visualEffect(params, context);
                    break;

                // System actions
                case 'setWallpaper':
                    result = await this.setWallpaper(params, context);
                    break;
                case 'enableFeature':
                    result = await this.enableFeature(params, context);
                    break;
                case 'disableFeature':
                    result = await this.disableFeature(params, context);
                    break;
                case 'modifyClipboard':
                    result = await this.modifyClipboard(params, context);
                    break;
                case 'focusWindow':
                    result = await this.focusWindow(params, context);
                    break;
                case 'minimizeAll':
                    result = await this.minimizeAll(params, context);
                    break;
                case 'triggerScreensaver':
                    result = await this.triggerScreensaver(params, context);
                    break;

                // Variable actions
                case 'setVariable':
                    result = await this.setVariable(params, context);
                    break;
                case 'modifyVariable':
                    result = await this.modifyVariable(params, context);
                    break;

                // Debug actions
                case 'log':
                    result = await this.log(params, context);
                    break;

                default:
                    console.warn(`[ActionExecutor] Unknown action type: ${type}`);
                    return { success: false, error: `Unknown action type: ${type}` };
            }

            return { success: true, result };
        } catch (error) {
            console.error(`[ActionExecutor] Action "${type}" failed:`, error);
            return { success: false, error: error.message };
        }
    }

    // ========== FILE ACTIONS ==========

    async createFile({ path, content = '', addToDesktop = false, icon }, context) {
        FileSystemManager.writeFile(path, content);

        if (addToDesktop) {
            const fileName = path.split('/').pop();
            const ext = fileName.split('.').pop();
            StateManager.addIcon({
                id: `file-${Date.now()}`,
                label: fileName,
                icon: icon || this.getIconForExtension(ext),
                type: 'file',
                path: path
            });
        }

        return { path };
    }

    async modifyFile({ path, content, append = false }, context) {
        if (append) {
            const existing = FileSystemManager.readFile(path) || '';
            FileSystemManager.writeFile(path, existing + content);
        } else {
            FileSystemManager.writeFile(path, content);
        }
        return { path };
    }

    async deleteFile({ path }, context) {
        FileSystemManager.deleteFile(path);
        return { path };
    }

    async createFolder({ path }, context) {
        FileSystemManager.createDirectory(path);
        return { path };
    }

    // ========== DESKTOP ACTIONS ==========

    async createDesktopIcon({ id, label, type = 'app', icon, position, appId, path }, context) {
        const iconData = {
            id: id || `icon-${Date.now()}`,
            label,
            icon,
            type
        };

        if (type === 'app' && appId) {
            iconData.appId = appId;
        }
        if (type === 'file' && path) {
            iconData.path = path;
        }
        if (position) {
            iconData.position = position;
        }

        StateManager.addIcon(iconData);
        return { id: iconData.id };
    }

    async removeDesktopIcon({ id }, context) {
        StateManager.removeIcon(id);
        return { id };
    }

    // ========== DIALOG/NOTIFICATION ACTIONS ==========

    async showDialog({ title, message, icon, buttons = ['OK'] }, context) {
        return new Promise(resolve => {
            EventBus.emit('dialog:show', {
                title,
                message,
                icon,
                buttons,
                onClose: (result) => resolve({ button: result })
            });
        });
    }

    async showNotification({ message, icon, duration = 3000 }, context) {
        EventBus.emit('notification:show', { message, icon, duration });
        return { shown: true };
    }

    async showClippy({ message, duration = 5000 }, context) {
        EventBus.emit('clippy:show', { message, duration });
        return { shown: true };
    }

    // ========== SOUND ACTIONS ==========

    async playSound({ sound, force = false }, context) {
        EventBus.emit('sound:play', { type: sound, force });
        return { played: sound };
    }

    async playAudio({ src, loop = false, volume = 1 }, context) {
        EventBus.emit('audio:play', { src, loop, volume });
        return { playing: src };
    }

    async stopAudio({ src }, context) {
        if (src) {
            EventBus.emit('audio:stop', { src });
        } else {
            EventBus.emit('audio:stopall');
        }
        return { stopped: true };
    }

    // ========== APP ACTIONS ==========

    async unlockApp({ appId }, context) {
        const app = AppRegistry.get(appId);
        if (app) {
            app.locked = false;
            EventBus.emit(Events.APP_UNLOCKED, { appId });
        }
        return { appId };
    }

    async lockApp({ appId, message }, context) {
        const app = AppRegistry.get(appId);
        if (app) {
            app.locked = true;
            app.lockMessage = message;
            EventBus.emit(Events.APP_LOCKED, { appId, message });
        }
        return { appId };
    }

    async launchApp({ appId, params = {} }, context) {
        AppRegistry.launch(appId, params);
        return { appId };
    }

    async closeApp({ appId }, context) {
        const app = AppRegistry.get(appId);
        if (app) {
            app.closeAll?.() || app.close?.();
        }
        return { appId };
    }

    // ========== ACHIEVEMENT ACTIONS ==========

    async unlockAchievement({ id }, context) {
        StateManager.unlockAchievement(id);
        return { id };
    }

    // ========== STATE ACTIONS ==========

    async setState({ path, value, persist = false }, context) {
        StateManager.setState(path, value, persist);
        return { path, value };
    }

    async modifyState({ path, operation, value }, context) {
        const current = StateManager.getState(path) || 0;
        let newValue;

        switch (operation) {
            case 'increment':
                newValue = current + (value || 1);
                break;
            case 'decrement':
                newValue = current - (value || 1);
                break;
            case 'multiply':
                newValue = current * value;
                break;
            case 'divide':
                newValue = current / value;
                break;
            case 'append':
                newValue = Array.isArray(current) ? [...current, value] : [current, value];
                break;
            case 'remove':
                newValue = Array.isArray(current) ? current.filter(v => v !== value) : current;
                break;
            case 'toggle':
                newValue = !current;
                break;
            default:
                newValue = value;
        }

        StateManager.setState(path, newValue);
        return { path, oldValue: current, newValue };
    }

    // ========== EVENT ACTIONS ==========

    async emitEvent({ event, data = {} }, context) {
        EventBus.emit(event, data);
        return { event, data };
    }

    // ========== SCENARIO FLOW ACTIONS ==========

    async advanceStage({ stageId }, context) {
        if (context.scenarioManager) {
            context.scenarioManager.advanceToStage(stageId);
        }
        return { stageId };
    }

    async completeScenario(params, context) {
        if (context.scenarioManager) {
            context.scenarioManager.complete();
        }
        return { completed: true };
    }

    async failScenario({ reason }, context) {
        if (context.scenarioManager) {
            context.scenarioManager.fail(reason);
        }
        return { failed: true, reason };
    }

    // ========== UTILITY ACTIONS ==========

    async wait({ duration }, context) {
        await new Promise(resolve => setTimeout(resolve, duration));
        return { waited: duration };
    }

    async showHint({ message, index }, context) {
        EventBus.emit(Events.SCENARIO_HINT_SHOWN, { message, index });
        // Also show as notification
        EventBus.emit('notification:show', { message, icon: '💡', duration: 5000 });
        return { message };
    }

    async visualEffect({ effect, target, duration = 1000 }, context) {
        const element = target ? document.querySelector(target) : document.body;
        if (!element) return { applied: false };

        switch (effect) {
            case 'shake':
                element.style.animation = `shake ${duration}ms`;
                break;
            case 'pulse':
                element.style.animation = `pulse ${duration}ms`;
                break;
            case 'flash':
                element.style.animation = `flash ${duration}ms`;
                break;
            case 'highlight':
                element.style.outline = '3px solid yellow';
                setTimeout(() => element.style.outline = '', duration);
                break;
            case 'dim':
                element.style.opacity = '0.5';
                setTimeout(() => element.style.opacity = '', duration);
                break;
            case 'glow':
                element.style.boxShadow = '0 0 20px gold';
                setTimeout(() => element.style.boxShadow = '', duration);
                break;
        }

        // Clean up animation after duration
        if (['shake', 'pulse', 'flash'].includes(effect)) {
            setTimeout(() => element.style.animation = '', duration);
        }

        return { effect, target, applied: true };
    }

    // ========== SYSTEM ACTIONS ==========

    async setWallpaper({ wallpaper }, context) {
        StateManager.setState('settings.wallpaper', wallpaper, true);
        EventBus.emit(Events.DESKTOP_WALLPAPER_CHANGED, { wallpaper });
        return { wallpaper };
    }

    async enableFeature({ featureId }, context) {
        await FeatureRegistry.enable(featureId);
        return { featureId };
    }

    async disableFeature({ featureId }, context) {
        await FeatureRegistry.disable(featureId);
        return { featureId };
    }

    async modifyClipboard({ content }, context) {
        try {
            await navigator.clipboard.writeText(content);
            return { copied: true };
        } catch (e) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = content;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return { copied: true };
        }
    }

    async focusWindow({ windowId }, context) {
        WindowManager.focus(windowId);
        return { windowId };
    }

    async minimizeAll(params, context) {
        WindowManager.minimizeAll?.();
        return { minimized: true };
    }

    async triggerScreensaver({ type }, context) {
        EventBus.emit('screensaver:trigger', { type });
        return { triggered: true };
    }

    // ========== VARIABLE ACTIONS ==========

    async setVariable({ name, value }, context) {
        if (context.scenarioManager) {
            context.scenarioManager.setVariable(name, value);
        }
        return { name, value };
    }

    async modifyVariable({ name, operation, value }, context) {
        if (!context.scenarioManager) return { name, error: 'No scenario manager' };

        const current = context.scenarioManager.getVariable(name) || 0;
        let newValue;

        switch (operation) {
            case 'increment':
                newValue = current + (value || 1);
                break;
            case 'decrement':
                newValue = current - (value || 1);
                break;
            case 'append':
                newValue = Array.isArray(current) ? [...current, value] : [current, value];
                break;
            case 'remove':
                newValue = Array.isArray(current) ? current.filter(v => v !== value) : current;
                break;
            case 'toggle':
                newValue = !current;
                break;
            default:
                newValue = value;
        }

        context.scenarioManager.setVariable(name, newValue);
        return { name, oldValue: current, newValue };
    }

    // ========== DEBUG ACTIONS ==========

    async log({ message, level = 'log' }, context) {
        const prefix = '[Scenario]';
        switch (level) {
            case 'warn':
                console.warn(prefix, message);
                break;
            case 'error':
                console.error(prefix, message);
                break;
            case 'debug':
                console.debug(prefix, message);
                break;
            default:
                console.log(prefix, message);
        }
        return { logged: true };
    }

    // ========== HELPER METHODS ==========

    getIconForExtension(ext) {
        const iconMap = {
            'txt': '📄',
            'md': '📝',
            'json': '📋',
            'js': '📜',
            'html': '🌐',
            'css': '🎨',
            'png': '🖼️',
            'jpg': '🖼️',
            'gif': '🖼️',
            'mp3': '🎵',
            'wav': '🎵',
            'exe': '⚙️'
        };
        return iconMap[ext] || '📄';
    }
}

const ActionExecutor = new ActionExecutorClass();
export default ActionExecutor;
