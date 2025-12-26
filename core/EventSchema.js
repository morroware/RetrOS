/**
 * EventSchema - Semantic event definitions with validation
 * Provides type safety, documentation, and validation for all system events
 *
 * Each event has:
 * - namespace: Event category (window, app, system, ui, etc.)
 * - action: What the event does
 * - description: Human-readable description
 * - payload: Expected payload schema (field: type, '?' suffix = optional)
 * - example: Example payload for documentation
 */

export const EventSchema = {
    // ==========================================
    // WINDOW EVENTS
    // ==========================================
    'window:create': {
        namespace: 'window',
        action: 'create',
        description: 'Triggered when a new window is being created',
        payload: {
            id: 'string',
            title: 'string',
            appId: 'string',
            width: 'number',
            height: 'number',
            x: 'number?',
            y: 'number?',
            resizable: 'boolean?',
            minimizable: 'boolean?',
            maximizable: 'boolean?'
        },
        example: {
            id: 'window-notepad-1',
            title: 'Notepad',
            appId: 'notepad',
            width: 500,
            height: 400,
            resizable: true
        }
    },

    'window:open': {
        namespace: 'window',
        action: 'open',
        description: 'Triggered after window is opened and rendered in DOM',
        payload: {
            id: 'string',
            appId: 'string?',
            element: 'HTMLElement?'
        },
        example: {
            id: 'window-notepad-1',
            appId: 'notepad'
        }
    },

    'window:close': {
        namespace: 'window',
        action: 'close',
        description: 'Triggered when window is closing',
        payload: {
            id: 'string',
            appId: 'string?'
        },
        example: {
            id: 'window-notepad-1',
            appId: 'notepad'
        }
    },

    'window:focus': {
        namespace: 'window',
        action: 'focus',
        description: 'Triggered when window receives focus',
        payload: {
            id: 'string',
            previousId: 'string?'
        },
        example: {
            id: 'window-calculator-1',
            previousId: 'window-notepad-1'
        }
    },

    'window:minimize': {
        namespace: 'window',
        action: 'minimize',
        description: 'Triggered when window is minimized',
        payload: {
            id: 'string'
        },
        example: {
            id: 'window-notepad-1'
        }
    },

    'window:maximize': {
        namespace: 'window',
        action: 'maximize',
        description: 'Triggered when window is maximized',
        payload: {
            id: 'string'
        },
        example: {
            id: 'window-notepad-1'
        }
    },

    'window:restore': {
        namespace: 'window',
        action: 'restore',
        description: 'Triggered when window is restored from minimized/maximized',
        payload: {
            id: 'string'
        },
        example: {
            id: 'window-notepad-1'
        }
    },

    'window:resize': {
        namespace: 'window',
        action: 'resize',
        description: 'Triggered when window is resized',
        payload: {
            id: 'string',
            width: 'number',
            height: 'number'
        },
        example: {
            id: 'window-notepad-1',
            width: 600,
            height: 500
        }
    },

    // ==========================================
    // APP EVENTS
    // ==========================================
    'app:launch': {
        namespace: 'app',
        action: 'launch',
        description: 'Request to launch an application',
        payload: {
            appId: 'string',
            params: 'object?'
        },
        example: {
            appId: 'notepad',
            params: { file: 'readme.txt' }
        }
    },

    'app:open': {
        namespace: 'app',
        action: 'open',
        description: 'Triggered when app successfully opens',
        payload: {
            appId: 'string',
            windowId: 'string',
            instance: 'number?'
        },
        example: {
            appId: 'notepad',
            windowId: 'window-notepad-1',
            instance: 0
        }
    },

    'app:close': {
        namespace: 'app',
        action: 'close',
        description: 'Triggered when app closes',
        payload: {
            appId: 'string',
            windowId: 'string'
        },
        example: {
            appId: 'notepad',
            windowId: 'window-notepad-1'
        }
    },

    'app:registered': {
        namespace: 'app',
        action: 'registered',
        description: 'Triggered when app is registered in AppRegistry',
        payload: {
            appId: 'string',
            name: 'string',
            category: 'string?'
        },
        example: {
            appId: 'notepad',
            name: 'Notepad',
            category: 'accessories'
        }
    },

    // ==========================================
    // SYSTEM EVENTS
    // ==========================================
    'system:boot': {
        namespace: 'system',
        action: 'boot',
        description: 'System boot sequence started',
        payload: {
            timestamp: 'number',
            phase: 'string?'
        },
        example: {
            timestamp: 1234567890,
            phase: 'initialization'
        }
    },

    'system:ready': {
        namespace: 'system',
        action: 'ready',
        description: 'System fully initialized and ready (formerly boot:complete)',
        payload: {
            timestamp: 'number',
            bootTime: 'number?'
        },
        example: {
            timestamp: 1234567890,
            bootTime: 2500
        }
    },

    'system:shutdown': {
        namespace: 'system',
        action: 'shutdown',
        description: 'System shutdown initiated',
        payload: {
            reason: 'string?'
        },
        example: {
            reason: 'user_requested'
        }
    },

    'system:screensaver:start': {
        namespace: 'system',
        action: 'screensaver:start',
        description: 'Screensaver activated',
        payload: {
            mode: 'string?'
        },
        example: {
            mode: 'flying-toasters'
        }
    },

    'system:screensaver:end': {
        namespace: 'system',
        action: 'screensaver:end',
        description: 'Screensaver deactivated',
        payload: {},
        example: {}
    },

    // ==========================================
    // UI EVENTS
    // ==========================================
    'ui:menu:start:open': {
        namespace: 'ui',
        action: 'menu:start:open',
        description: 'Start menu opened',
        payload: {},
        example: {}
    },

    'ui:menu:start:close': {
        namespace: 'ui',
        action: 'menu:start:close',
        description: 'Start menu closed',
        payload: {},
        example: {}
    },

    'ui:menu:start:toggle': {
        namespace: 'ui',
        action: 'menu:start:toggle',
        description: 'Start menu toggled',
        payload: {},
        example: {}
    },

    'ui:menu:context:show': {
        namespace: 'ui',
        action: 'menu:context:show',
        description: 'Context menu shown',
        payload: {
            x: 'number',
            y: 'number',
            items: 'array',
            target: 'string?'
        },
        example: {
            x: 100,
            y: 200,
            items: [{ label: 'Open', action: 'open' }],
            target: 'desktop'
        }
    },

    'ui:menu:context:hide': {
        namespace: 'ui',
        action: 'menu:context:hide',
        description: 'Context menu hidden',
        payload: {},
        example: {}
    },

    'ui:menu:action': {
        namespace: 'ui',
        action: 'menu:action',
        description: 'Menu action triggered',
        payload: {
            action: 'string',
            data: 'any?'
        },
        example: {
            action: 'open',
            data: { fileId: 'readme.txt' }
        }
    },

    'ui:taskbar:update': {
        namespace: 'ui',
        action: 'taskbar:update',
        description: 'Taskbar needs to update',
        payload: {},
        example: {}
    },

    // ==========================================
    // ICON EVENTS
    // ==========================================
    'icon:click': {
        namespace: 'icon',
        action: 'click',
        description: 'Icon clicked (single click)',
        payload: {
            iconId: 'string',
            appId: 'string?'
        },
        example: {
            iconId: 'notepad-icon',
            appId: 'notepad'
        }
    },

    'icon:dblclick': {
        namespace: 'icon',
        action: 'dblclick',
        description: 'Icon double-clicked',
        payload: {
            iconId: 'string',
            appId: 'string?'
        },
        example: {
            iconId: 'notepad-icon',
            appId: 'notepad'
        }
    },

    'icon:move': {
        namespace: 'icon',
        action: 'move',
        description: 'Icon moved on desktop',
        payload: {
            iconId: 'string',
            x: 'number',
            y: 'number'
        },
        example: {
            iconId: 'notepad-icon',
            x: 100,
            y: 150
        }
    },

    'icon:delete': {
        namespace: 'icon',
        action: 'delete',
        description: 'Icon deleted',
        payload: {
            iconId: 'string'
        },
        example: {
            iconId: 'notepad-icon'
        }
    },

    // ==========================================
    // STATE EVENTS
    // ==========================================
    'state:change': {
        namespace: 'state',
        action: 'change',
        description: 'State value changed',
        payload: {
            path: 'string',
            value: 'any',
            oldValue: 'any?'
        },
        example: {
            path: 'settings.sound',
            value: true,
            oldValue: false
        }
    },

    // ==========================================
    // SOUND EVENTS
    // ==========================================
    'sound:play': {
        namespace: 'sound',
        action: 'play',
        description: 'Play a system sound',
        payload: {
            type: 'string',
            volume: 'number?'
        },
        example: {
            type: 'open',
            volume: 0.5
        }
    },

    'sound:volume': {
        namespace: 'sound',
        action: 'volume',
        description: 'Volume changed',
        payload: {
            volume: 'number'
        },
        example: {
            volume: 0.7
        }
    },

    // ==========================================
    // AUDIO PLAYBACK EVENTS (Media files)
    // ==========================================
    'audio:play': {
        namespace: 'audio',
        action: 'play',
        description: 'Start audio playback',
        payload: {
            url: 'string',
            title: 'string?'
        },
        example: {
            url: '/music/song.mp3',
            title: 'My Favorite Song'
        }
    },

    'audio:pause': {
        namespace: 'audio',
        action: 'pause',
        description: 'Pause audio playback',
        payload: {},
        example: {}
    },

    'audio:resume': {
        namespace: 'audio',
        action: 'resume',
        description: 'Resume audio playback',
        payload: {},
        example: {}
    },

    'audio:stop': {
        namespace: 'audio',
        action: 'stop',
        description: 'Stop audio playback',
        payload: {},
        example: {}
    },

    'audio:stopall': {
        namespace: 'audio',
        action: 'stopall',
        description: 'Stop all audio playback',
        payload: {},
        example: {}
    },

    'audio:ended': {
        namespace: 'audio',
        action: 'ended',
        description: 'Audio playback ended',
        payload: {
            url: 'string?'
        },
        example: {
            url: '/music/song.mp3'
        }
    },

    'audio:error': {
        namespace: 'audio',
        action: 'error',
        description: 'Audio playback error',
        payload: {
            error: 'string',
            url: 'string?'
        },
        example: {
            error: 'Failed to load audio',
            url: '/music/song.mp3'
        }
    },

    'audio:loaded': {
        namespace: 'audio',
        action: 'loaded',
        description: 'Audio file loaded',
        payload: {
            url: 'string',
            duration: 'number?'
        },
        example: {
            url: '/music/song.mp3',
            duration: 180
        }
    },

    'audio:timeupdate': {
        namespace: 'audio',
        action: 'timeupdate',
        description: 'Audio playback time updated',
        payload: {
            currentTime: 'number',
            duration: 'number'
        },
        example: {
            currentTime: 45,
            duration: 180
        }
    },

    // ==========================================
    // FEATURE EVENTS
    // ==========================================
    'feature:enable': {
        namespace: 'feature',
        action: 'enable',
        description: 'Feature enabled',
        payload: {
            featureId: 'string'
        },
        example: {
            featureId: 'clippy'
        }
    },

    'feature:disable': {
        namespace: 'feature',
        action: 'disable',
        description: 'Feature disabled',
        payload: {
            featureId: 'string'
        },
        example: {
            featureId: 'clippy'
        }
    },

    'feature:pet:toggle': {
        namespace: 'feature',
        action: 'pet:toggle',
        description: 'Desktop pet toggled',
        payload: {},
        example: {}
    },

    'feature:pet:change': {
        namespace: 'feature',
        action: 'pet:change',
        description: 'Desktop pet changed',
        payload: {
            petType: 'string'
        },
        example: {
            petType: 'cat'
        }
    },

    // ==========================================
    // ACHIEVEMENT EVENTS
    // ==========================================
    'achievement:unlock': {
        namespace: 'achievement',
        action: 'unlock',
        description: 'Achievement unlocked',
        payload: {
            achievementId: 'string',
            title: 'string',
            description: 'string?'
        },
        example: {
            achievementId: 'first_app',
            title: 'First Steps',
            description: 'Opened your first app'
        }
    },

    // ==========================================
    // FILESYSTEM EVENTS
    // ==========================================
    'fs:file:create': {
        namespace: 'fs',
        action: 'file:create',
        description: 'File created in virtual filesystem',
        payload: {
            path: 'string',
            type: 'string',
            content: 'any?'
        },
        example: {
            path: '/documents/readme.txt',
            type: 'file',
            content: 'Hello world'
        }
    },

    'fs:file:update': {
        namespace: 'fs',
        action: 'file:update',
        description: 'File updated',
        payload: {
            path: 'string',
            content: 'any'
        },
        example: {
            path: '/documents/readme.txt',
            content: 'Updated content'
        }
    },

    'fs:file:delete': {
        namespace: 'fs',
        action: 'file:delete',
        description: 'File deleted',
        payload: {
            path: 'string'
        },
        example: {
            path: '/documents/readme.txt'
        }
    },

    'fs:directory:create': {
        namespace: 'fs',
        action: 'directory:create',
        description: 'Directory created',
        payload: {
            path: 'string'
        },
        example: {
            path: '/documents/projects'
        }
    },

    // ==========================================
    // DRAG & DROP EVENTS
    // ==========================================
    'drag:start': {
        namespace: 'drag',
        action: 'start',
        description: 'Drag operation started',
        payload: {
            itemId: 'string',
            itemType: 'string',
            x: 'number',
            y: 'number'
        },
        example: {
            itemId: 'notepad-icon',
            itemType: 'icon',
            x: 100,
            y: 100
        }
    },

    'drag:move': {
        namespace: 'drag',
        action: 'move',
        description: 'Item being dragged',
        payload: {
            itemId: 'string',
            x: 'number',
            y: 'number'
        },
        example: {
            itemId: 'notepad-icon',
            x: 150,
            y: 125
        }
    },

    'drag:end': {
        namespace: 'drag',
        action: 'end',
        description: 'Drag operation ended',
        payload: {
            itemId: 'string',
            x: 'number',
            y: 'number',
            target: 'string?'
        },
        example: {
            itemId: 'notepad-icon',
            x: 200,
            y: 150,
            target: 'desktop'
        }
    },

    // ==========================================
    // SETTING EVENTS
    // ==========================================
    'setting:changed': {
        namespace: 'setting',
        action: 'changed',
        description: 'Setting value changed',
        payload: {
            key: 'string',
            value: 'any',
            oldValue: 'any?'
        },
        example: {
            key: 'sound',
            value: true,
            oldValue: false
        }
    },

    // ==========================================
    // DESKTOP EVENTS
    // ==========================================
    'desktop:render': {
        namespace: 'desktop',
        action: 'render',
        description: 'Desktop needs to re-render',
        payload: {},
        example: {}
    },

    'desktop:refresh': {
        namespace: 'desktop',
        action: 'refresh',
        description: 'Desktop refresh requested',
        payload: {},
        example: {}
    }
};

/**
 * Get event schema for a given event name
 * @param {string} eventName - Event name
 * @returns {object|null} Event schema or null
 */
export function getEventSchema(eventName) {
    return EventSchema[eventName] || null;
}

/**
 * Get all events in a namespace
 * @param {string} namespace - Namespace (e.g., 'window', 'app')
 * @returns {string[]} Array of event names
 */
export function getEventsByNamespace(namespace) {
    return Object.keys(EventSchema).filter(
        eventName => EventSchema[eventName].namespace === namespace
    );
}

/**
 * Get all registered event names
 * @returns {string[]} Array of all event names
 */
export function getAllEvents() {
    return Object.keys(EventSchema);
}

/**
 * Check if an event is registered
 * @param {string} eventName - Event name
 * @returns {boolean} True if event exists
 */
export function isEventRegistered(eventName) {
    return EventSchema.hasOwnProperty(eventName);
}

export default EventSchema;
