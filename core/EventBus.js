/**
 * EventBus - Central event messaging system
 * NOW POWERED BY: SemanticEventBus with validation, middleware, and enhanced features!
 *
 * This file provides backward compatibility - all existing code continues to work
 * while gaining the benefits of semantic events, validation, and better debugging.
 *
 * Usage (all still work):
 *   EventBus.on('window:open', handler)
 *   EventBus.emit('window:open', { id: 'notepad' })
 *   EventBus.off('window:open', handler)
 *
 * New features:
 *   EventBus.on('window:*', handler)  // Wildcard subscriptions
 *   EventBus.use(middleware)          // Add middleware
 *   EventBus.getEventLog()            // View event history
 *   EventBus.getEventSchema('window:open')  // Get event documentation
 */

import SemanticEventBus from './SemanticEventBus.js';

// Re-export SemanticEventBus as EventBus for backward compatibility
// All existing code will now use the enhanced semantic event bus!
const EventBus = SemanticEventBus;

// Legacy event constants - mapped to new semantic events for compatibility
// Old code using these constants will automatically use new event names
export const Events = {
    // Window events
    WINDOW_OPEN: 'window:open',
    WINDOW_CLOSE: 'window:close',
    WINDOW_FOCUS: 'window:focus',
    WINDOW_MINIMIZE: 'window:minimize',
    WINDOW_MAXIMIZE: 'window:maximize',
    WINDOW_RESTORE: 'window:restore',
    WINDOW_RESIZE: 'window:resize',

    // Taskbar events
    TASKBAR_UPDATE: 'ui:taskbar:update',

    // Icon events
    ICON_CLICK: 'icon:click',
    ICON_DBLCLICK: 'icon:dblclick',
    ICON_MOVE: 'icon:move',
    ICON_DELETE: 'icon:delete',

    // App events
    APP_LAUNCH: 'app:launch',
    APP_OPEN: 'app:open',
    APP_CLOSE: 'app:close',

    // Menu events
    START_MENU_TOGGLE: 'ui:menu:start:toggle',
    CONTEXT_MENU_SHOW: 'ui:menu:context:show',
    CONTEXT_MENU_HIDE: 'ui:menu:context:hide',

    // System events (note: boot:complete now maps to system:ready)
    BOOT_COMPLETE: 'system:ready',
    SHUTDOWN: 'system:shutdown',
    SCREENSAVER_START: 'system:screensaver:start',
    SCREENSAVER_END: 'system:screensaver:end',

    // Achievement events
    ACHIEVEMENT_UNLOCK: 'achievement:unlock',

    // Sound events
    SOUND_PLAY: 'sound:play',
    VOLUME_CHANGE: 'sound:volume',

    // Audio playback events (for MP3/media files)
    AUDIO_PLAY: 'audio:play',
    AUDIO_STOP: 'audio:stop',
    AUDIO_STOP_ALL: 'audio:stopall',
    AUDIO_PAUSE: 'audio:pause',
    AUDIO_RESUME: 'audio:resume',
    AUDIO_ENDED: 'audio:ended',
    AUDIO_ERROR: 'audio:error',
    AUDIO_LOADED: 'audio:loaded',
    AUDIO_TIME_UPDATE: 'audio:timeupdate',

    // State events
    STATE_CHANGE: 'state:change',

    // Drag events
    DRAG_START: 'drag:start',
    DRAG_MOVE: 'drag:move',
    DRAG_END: 'drag:end',

    // Menu action events
    MENU_ACTION: 'ui:menu:action',

    // App registration
    APP_REGISTERED: 'app:registered',

    // Pet events
    PET_TOGGLE: 'feature:pet:toggle',
    PET_CHANGE: 'feature:pet:change',

    // Setting events
    SETTING_CHANGED: 'setting:changed',

    // Desktop events
    DESKTOP_RENDER: 'desktop:render',
    DESKTOP_REFRESH: 'desktop:refresh'
};

// Also register legacy event names that might be used directly as strings
// This ensures backward compatibility for code using old event names
const LEGACY_EVENT_MAPPING = {
    'startmenu:toggle': 'ui:menu:start:toggle',
    'contextmenu:show': 'ui:menu:context:show',
    'contextmenu:hide': 'ui:menu:context:hide',
    'taskbar:update': 'ui:taskbar:update',
    'menu:action': 'ui:menu:action',
    'boot:complete': 'system:ready',
    'screensaver:start': 'system:screensaver:start',
    'screensaver:end': 'system:screensaver:end',
    'pet:toggle': 'feature:pet:toggle',
    'pet:change': 'feature:pet:change',
    'setting:changed': 'setting:changed',
    'desktop:render': 'desktop:render'
};

// Wrap emit to automatically map legacy event names
const originalEmit = EventBus.emit.bind(EventBus);
EventBus.emit = function(eventName, payload, options) {
    // Map legacy event names to new semantic ones
    const mappedEventName = LEGACY_EVENT_MAPPING[eventName] || eventName;
    return originalEmit(mappedEventName, payload, options);
};

// Wrap on to automatically map legacy event names
const originalOn = EventBus.on.bind(EventBus);
EventBus.on = function(eventName, callback) {
    // Map legacy event names to new semantic ones
    const mappedEventName = LEGACY_EVENT_MAPPING[eventName] || eventName;
    return originalOn(mappedEventName, callback);
};

// Wrap once to automatically map legacy event names
const originalOnce = EventBus.once.bind(EventBus);
EventBus.once = function(eventName, callback) {
    // Map legacy event names to new semantic ones
    const mappedEventName = LEGACY_EVENT_MAPPING[eventName] || eventName;
    return originalOnce(mappedEventName, callback);
};

// Wrap off to automatically map legacy event names
const originalOff = EventBus.off.bind(EventBus);
EventBus.off = function(eventName, callback) {
    // Map legacy event names to new semantic ones
    const mappedEventName = LEGACY_EVENT_MAPPING[eventName] || eventName;
    return originalOff(mappedEventName, callback);
};

export { EventBus };
export default EventBus;
