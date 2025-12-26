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
    },

    // ==========================================
    // DIALOG EVENTS
    // ==========================================
    'dialog:alert': {
        namespace: 'dialog',
        action: 'alert',
        description: 'Show an alert dialog',
        payload: {
            message: 'string',
            title: 'string?',
            icon: 'string?'
        },
        example: {
            message: 'File saved successfully',
            title: 'Success',
            icon: '✅'
        }
    },

    'dialog:confirm': {
        namespace: 'dialog',
        action: 'confirm',
        description: 'Show a confirmation dialog',
        payload: {
            message: 'string',
            title: 'string?',
            confirmText: 'string?',
            cancelText: 'string?',
            requestId: 'string?'
        },
        example: {
            message: 'Are you sure you want to delete this file?',
            title: 'Confirm Delete',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        }
    },

    'dialog:confirm:response': {
        namespace: 'dialog',
        action: 'confirm:response',
        description: 'Response from a confirmation dialog',
        payload: {
            requestId: 'string',
            confirmed: 'boolean'
        },
        example: {
            requestId: 'confirm-123',
            confirmed: true
        }
    },

    'dialog:prompt': {
        namespace: 'dialog',
        action: 'prompt',
        description: 'Show an input prompt dialog',
        payload: {
            message: 'string',
            title: 'string?',
            defaultValue: 'string?',
            placeholder: 'string?',
            requestId: 'string?'
        },
        example: {
            message: 'Enter file name:',
            title: 'New File',
            defaultValue: 'untitled.txt'
        }
    },

    'dialog:prompt:response': {
        namespace: 'dialog',
        action: 'prompt:response',
        description: 'Response from a prompt dialog',
        payload: {
            requestId: 'string',
            value: 'string?',
            cancelled: 'boolean'
        },
        example: {
            requestId: 'prompt-123',
            value: 'myfile.txt',
            cancelled: false
        }
    },

    'dialog:file-open': {
        namespace: 'dialog',
        action: 'file-open',
        description: 'Show file open dialog',
        payload: {
            title: 'string?',
            filter: 'string?',
            directory: 'string?',
            requestId: 'string?'
        },
        example: {
            title: 'Open File',
            filter: '.txt,.md',
            directory: '/documents'
        }
    },

    'dialog:file-open:response': {
        namespace: 'dialog',
        action: 'file-open:response',
        description: 'Response from file open dialog',
        payload: {
            requestId: 'string',
            path: 'string?',
            cancelled: 'boolean'
        },
        example: {
            requestId: 'file-open-123',
            path: '/documents/readme.txt',
            cancelled: false
        }
    },

    'dialog:file-save': {
        namespace: 'dialog',
        action: 'file-save',
        description: 'Show file save dialog',
        payload: {
            title: 'string?',
            defaultName: 'string?',
            filter: 'string?',
            directory: 'string?',
            requestId: 'string?'
        },
        example: {
            title: 'Save File',
            defaultName: 'document.txt',
            directory: '/documents'
        }
    },

    'dialog:file-save:response': {
        namespace: 'dialog',
        action: 'file-save:response',
        description: 'Response from file save dialog',
        payload: {
            requestId: 'string',
            path: 'string?',
            cancelled: 'boolean'
        },
        example: {
            requestId: 'file-save-123',
            path: '/documents/document.txt',
            cancelled: false
        }
    },

    // ==========================================
    // FILESYSTEM CHANGE EVENTS (broader than fs:*)
    // ==========================================
    'filesystem:changed': {
        namespace: 'filesystem',
        action: 'changed',
        description: 'General filesystem change notification (triggers UI refresh)',
        payload: {
            path: 'string?',
            type: 'string?'
        },
        example: {
            path: '/documents',
            type: 'file'
        }
    },

    // ==========================================
    // RECYCLE BIN EVENTS
    // ==========================================
    'recyclebin:update': {
        namespace: 'recyclebin',
        action: 'update',
        description: 'Recycle bin contents changed',
        payload: {
            count: 'number?'
        },
        example: {
            count: 5
        }
    },

    'recyclebin:recycle-file': {
        namespace: 'recyclebin',
        action: 'recycle-file',
        description: 'File moved to recycle bin',
        payload: {
            iconId: 'string',
            path: 'string?',
            originalPath: 'string?'
        },
        example: {
            iconId: 'icon-readme',
            path: '/recyclebin/readme.txt',
            originalPath: '/documents/readme.txt'
        }
    },

    'recyclebin:restore': {
        namespace: 'recyclebin',
        action: 'restore',
        description: 'File restored from recycle bin',
        payload: {
            iconId: 'string',
            originalPath: 'string'
        },
        example: {
            iconId: 'icon-readme',
            originalPath: '/documents/readme.txt'
        }
    },

    'recyclebin:empty': {
        namespace: 'recyclebin',
        action: 'empty',
        description: 'Recycle bin emptied',
        payload: {
            count: 'number?'
        },
        example: {
            count: 3
        }
    },

    // ==========================================
    // NOTIFICATION EVENTS
    // ==========================================
    'notification:show': {
        namespace: 'notification',
        action: 'show',
        description: 'Show a notification toast',
        payload: {
            message: 'string',
            title: 'string?',
            type: 'string?',
            duration: 'number?',
            icon: 'string?'
        },
        example: {
            message: 'File saved',
            title: 'Success',
            type: 'success',
            duration: 3000
        }
    },

    'notification:dismiss': {
        namespace: 'notification',
        action: 'dismiss',
        description: 'Dismiss a notification',
        payload: {
            id: 'string?'
        },
        example: {
            id: 'notification-123'
        }
    },

    // ==========================================
    // CLIPBOARD EVENTS
    // ==========================================
    'clipboard:copy': {
        namespace: 'clipboard',
        action: 'copy',
        description: 'Content copied to clipboard',
        payload: {
            content: 'any',
            type: 'string?'
        },
        example: {
            content: 'Hello world',
            type: 'text'
        }
    },

    'clipboard:paste': {
        namespace: 'clipboard',
        action: 'paste',
        description: 'Paste from clipboard requested',
        payload: {
            target: 'string?'
        },
        example: {
            target: 'notepad-1'
        }
    },

    // ==========================================
    // KEYBOARD/INPUT EVENTS
    // ==========================================
    'keyboard:shortcut': {
        namespace: 'keyboard',
        action: 'shortcut',
        description: 'Keyboard shortcut triggered',
        payload: {
            key: 'string',
            ctrl: 'boolean?',
            alt: 'boolean?',
            shift: 'boolean?',
            meta: 'boolean?'
        },
        example: {
            key: 's',
            ctrl: true
        }
    },

    // ==========================================
    // SCRIPT/AUTOMATION EVENTS
    // ==========================================
    'script:execute': {
        namespace: 'script',
        action: 'execute',
        description: 'Execute a script',
        payload: {
            scriptId: 'string',
            params: 'object?',
            requestId: 'string?'
        },
        example: {
            scriptId: 'auto-backup',
            params: { destination: '/backup' }
        }
    },

    'script:complete': {
        namespace: 'script',
        action: 'complete',
        description: 'Script execution completed',
        payload: {
            scriptId: 'string',
            requestId: 'string?',
            result: 'any?',
            error: 'string?'
        },
        example: {
            scriptId: 'auto-backup',
            requestId: 'req-123',
            result: { filesBackedUp: 5 }
        }
    },

    'script:error': {
        namespace: 'script',
        action: 'error',
        description: 'Script execution error',
        payload: {
            scriptId: 'string',
            requestId: 'string?',
            error: 'string',
            line: 'number?'
        },
        example: {
            scriptId: 'auto-backup',
            error: 'Permission denied',
            line: 15
        }
    },

    'script:output': {
        namespace: 'script',
        action: 'output',
        description: 'Script print/log output',
        payload: {
            message: 'string'
        },
        example: {
            message: 'Hello from script!'
        }
    },

    // ==========================================
    // CHANNEL/SCOPE EVENTS (for isolated communication)
    // ==========================================
    'channel:message': {
        namespace: 'channel',
        action: 'message',
        description: 'Message sent to a specific channel',
        payload: {
            channel: 'string',
            message: 'any',
            sender: 'string?'
        },
        example: {
            channel: 'notepad-sync',
            message: { action: 'update', content: 'Hello' },
            sender: 'notepad-1'
        }
    },

    'channel:subscribe': {
        namespace: 'channel',
        action: 'subscribe',
        description: 'Subscription to a channel',
        payload: {
            channel: 'string',
            subscriber: 'string'
        },
        example: {
            channel: 'notepad-sync',
            subscriber: 'notepad-2'
        }
    },

    'channel:unsubscribe': {
        namespace: 'channel',
        action: 'unsubscribe',
        description: 'Unsubscription from a channel',
        payload: {
            channel: 'string',
            subscriber: 'string'
        },
        example: {
            channel: 'notepad-sync',
            subscriber: 'notepad-2'
        }
    },

    // ==========================================
    // COMMAND EVENTS (for scripting - trigger actions)
    // ==========================================
    'command:app:launch': {
        namespace: 'command',
        action: 'app:launch',
        description: 'Command to launch an application',
        payload: {
            appId: 'string',
            params: 'object?',
            requestId: 'string?'
        },
        example: {
            appId: 'notepad',
            params: { filePath: ['C:', 'Users', 'User', 'readme.txt'] }
        }
    },

    'command:app:close': {
        namespace: 'command',
        action: 'app:close',
        description: 'Command to close an application window',
        payload: {
            windowId: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1'
        }
    },

    'command:window:focus': {
        namespace: 'command',
        action: 'window:focus',
        description: 'Command to focus a window',
        payload: {
            windowId: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1'
        }
    },

    'command:window:minimize': {
        namespace: 'command',
        action: 'window:minimize',
        description: 'Command to minimize a window',
        payload: {
            windowId: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1'
        }
    },

    'command:window:maximize': {
        namespace: 'command',
        action: 'window:maximize',
        description: 'Command to maximize a window',
        payload: {
            windowId: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1'
        }
    },

    'command:window:restore': {
        namespace: 'command',
        action: 'window:restore',
        description: 'Command to restore a window from minimized/maximized',
        payload: {
            windowId: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1'
        }
    },

    'command:window:close': {
        namespace: 'command',
        action: 'window:close',
        description: 'Command to close a window',
        payload: {
            windowId: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1'
        }
    },

    'command:fs:read': {
        namespace: 'command',
        action: 'fs:read',
        description: 'Command to read a file',
        payload: {
            path: 'string',
            requestId: 'string?'
        },
        example: {
            path: 'C:/Users/User/readme.txt'
        }
    },

    'command:fs:write': {
        namespace: 'command',
        action: 'fs:write',
        description: 'Command to write to a file',
        payload: {
            path: 'string',
            content: 'string',
            requestId: 'string?'
        },
        example: {
            path: 'C:/Users/User/newfile.txt',
            content: 'Hello world'
        }
    },

    'command:fs:delete': {
        namespace: 'command',
        action: 'fs:delete',
        description: 'Command to delete a file',
        payload: {
            path: 'string',
            requestId: 'string?'
        },
        example: {
            path: 'C:/Users/User/oldfile.txt'
        }
    },

    'command:fs:mkdir': {
        namespace: 'command',
        action: 'fs:mkdir',
        description: 'Command to create a directory',
        payload: {
            path: 'string',
            requestId: 'string?'
        },
        example: {
            path: 'C:/Users/User/NewFolder'
        }
    },

    'command:dialog:show': {
        namespace: 'command',
        action: 'dialog:show',
        description: 'Command to show a dialog',
        payload: {
            type: 'string',
            message: 'string',
            title: 'string?',
            options: 'object?',
            requestId: 'string?'
        },
        example: {
            type: 'alert',
            message: 'Hello from script!',
            title: 'Script Message'
        }
    },

    'command:sound:play': {
        namespace: 'command',
        action: 'sound:play',
        description: 'Command to play a sound',
        payload: {
            type: 'string',
            volume: 'number?',
            requestId: 'string?'
        },
        example: {
            type: 'notify',
            volume: 0.5
        }
    },

    'command:setting:set': {
        namespace: 'command',
        action: 'setting:set',
        description: 'Command to change a setting',
        payload: {
            key: 'string',
            value: 'any',
            requestId: 'string?'
        },
        example: {
            key: 'sound',
            value: true
        }
    },

    'command:desktop:refresh': {
        namespace: 'command',
        action: 'desktop:refresh',
        description: 'Command to refresh the desktop',
        payload: {
            requestId: 'string?'
        },
        example: {}
    },

    'command:notification:show': {
        namespace: 'command',
        action: 'notification:show',
        description: 'Command to show a notification',
        payload: {
            message: 'string',
            title: 'string?',
            type: 'string?',
            duration: 'number?',
            requestId: 'string?'
        },
        example: {
            message: 'Task completed!',
            title: 'Script',
            type: 'success'
        }
    },

    // ==========================================
    // QUERY EVENTS (for scripting - get state)
    // ==========================================
    'query:windows': {
        namespace: 'query',
        action: 'windows',
        description: 'Query for list of open windows',
        payload: {
            requestId: 'string'
        },
        example: {
            requestId: 'query-123'
        }
    },

    'query:windows:response': {
        namespace: 'query',
        action: 'windows:response',
        description: 'Response with list of open windows',
        payload: {
            requestId: 'string',
            windows: 'array'
        },
        example: {
            requestId: 'query-123',
            windows: [{ id: 'notepad-1', title: 'Notepad', appId: 'notepad' }]
        }
    },

    'query:apps': {
        namespace: 'query',
        action: 'apps',
        description: 'Query for list of available apps',
        payload: {
            requestId: 'string'
        },
        example: {
            requestId: 'query-456'
        }
    },

    'query:apps:response': {
        namespace: 'query',
        action: 'apps:response',
        description: 'Response with list of available apps',
        payload: {
            requestId: 'string',
            apps: 'array'
        },
        example: {
            requestId: 'query-456',
            apps: [{ id: 'notepad', name: 'Notepad', category: 'accessories' }]
        }
    },

    'query:fs:list': {
        namespace: 'query',
        action: 'fs:list',
        description: 'Query directory listing',
        payload: {
            path: 'string',
            requestId: 'string'
        },
        example: {
            path: 'C:/Users/User',
            requestId: 'query-789'
        }
    },

    'query:fs:list:response': {
        namespace: 'query',
        action: 'fs:list:response',
        description: 'Response with directory listing',
        payload: {
            requestId: 'string',
            items: 'array',
            path: 'string'
        },
        example: {
            requestId: 'query-789',
            path: 'C:/Users/User',
            items: [{ name: 'Documents', type: 'directory' }]
        }
    },

    'query:fs:read': {
        namespace: 'query',
        action: 'fs:read',
        description: 'Query to read file contents',
        payload: {
            path: 'string',
            requestId: 'string'
        },
        example: {
            path: 'C:/Users/User/readme.txt',
            requestId: 'query-abc'
        }
    },

    'query:fs:read:response': {
        namespace: 'query',
        action: 'fs:read:response',
        description: 'Response with file contents',
        payload: {
            requestId: 'string',
            content: 'string',
            path: 'string',
            error: 'string?'
        },
        example: {
            requestId: 'query-abc',
            path: 'C:/Users/User/readme.txt',
            content: 'File content here'
        }
    },

    'query:fs:exists': {
        namespace: 'query',
        action: 'fs:exists',
        description: 'Query if a path exists',
        payload: {
            path: 'string',
            requestId: 'string'
        },
        example: {
            path: 'C:/Users/User/readme.txt',
            requestId: 'query-def'
        }
    },

    'query:fs:exists:response': {
        namespace: 'query',
        action: 'fs:exists:response',
        description: 'Response with existence check',
        payload: {
            requestId: 'string',
            exists: 'boolean',
            path: 'string',
            type: 'string?'
        },
        example: {
            requestId: 'query-def',
            path: 'C:/Users/User/readme.txt',
            exists: true,
            type: 'file'
        }
    },

    'query:settings': {
        namespace: 'query',
        action: 'settings',
        description: 'Query current settings',
        payload: {
            key: 'string?',
            requestId: 'string'
        },
        example: {
            key: 'sound',
            requestId: 'query-ghi'
        }
    },

    'query:settings:response': {
        namespace: 'query',
        action: 'settings:response',
        description: 'Response with settings values',
        payload: {
            requestId: 'string',
            settings: 'object'
        },
        example: {
            requestId: 'query-ghi',
            settings: { sound: true, crt: false }
        }
    },

    'query:state': {
        namespace: 'query',
        action: 'state',
        description: 'Query system state by path',
        payload: {
            path: 'string',
            requestId: 'string'
        },
        example: {
            path: 'windows',
            requestId: 'query-jkl'
        }
    },

    'query:state:response': {
        namespace: 'query',
        action: 'state:response',
        description: 'Response with state value',
        payload: {
            requestId: 'string',
            path: 'string',
            value: 'any'
        },
        example: {
            requestId: 'query-jkl',
            path: 'windows',
            value: []
        }
    },

    // ==========================================
    // ACTION RESULT EVENTS (for scripting - command responses)
    // ==========================================
    'action:result': {
        namespace: 'action',
        action: 'result',
        description: 'Result of a command action',
        payload: {
            requestId: 'string',
            success: 'boolean',
            data: 'any?',
            error: 'string?'
        },
        example: {
            requestId: 'cmd-123',
            success: true,
            data: { windowId: 'notepad-1' }
        }
    },

    // ==========================================
    // MACRO/AUTOMATION EVENTS
    // ==========================================
    'macro:record:start': {
        namespace: 'macro',
        action: 'record:start',
        description: 'Start recording a macro',
        payload: {
            macroId: 'string?'
        },
        example: {
            macroId: 'my-macro'
        }
    },

    'macro:record:stop': {
        namespace: 'macro',
        action: 'record:stop',
        description: 'Stop recording a macro',
        payload: {},
        example: {}
    },

    'macro:play': {
        namespace: 'macro',
        action: 'play',
        description: 'Play a recorded macro',
        payload: {
            macroId: 'string',
            speed: 'number?'
        },
        example: {
            macroId: 'my-macro',
            speed: 1.0
        }
    },

    'macro:save': {
        namespace: 'macro',
        action: 'save',
        description: 'Save a macro to storage',
        payload: {
            macroId: 'string',
            events: 'array'
        },
        example: {
            macroId: 'my-macro',
            events: []
        }
    },

    // ==========================================
    // APP-SPECIFIC COMMAND EVENTS
    // ==========================================
    'command:notepad:new': {
        namespace: 'command',
        action: 'notepad:new',
        description: 'Command to create a new document in Notepad',
        payload: {
            windowId: 'string?',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1'
        }
    },

    'command:notepad:open': {
        namespace: 'command',
        action: 'notepad:open',
        description: 'Command to open a file in Notepad',
        payload: {
            windowId: 'string?',
            path: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1',
            path: 'C:/Users/User/readme.txt'
        }
    },

    'command:notepad:save': {
        namespace: 'command',
        action: 'notepad:save',
        description: 'Command to save current document in Notepad',
        payload: {
            windowId: 'string?',
            path: 'string?',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1',
            path: 'C:/Users/User/saved.txt'
        }
    },

    'command:notepad:setText': {
        namespace: 'command',
        action: 'notepad:setText',
        description: 'Command to set text content in Notepad',
        payload: {
            windowId: 'string?',
            text: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'notepad-1',
            text: 'Hello from script!'
        }
    },

    'query:notepad:getText': {
        namespace: 'query',
        action: 'notepad:getText',
        description: 'Query to get current text from Notepad',
        payload: {
            windowId: 'string?',
            requestId: 'string'
        },
        example: {
            windowId: 'notepad-1',
            requestId: 'query-notepad-1'
        }
    },

    'query:notepad:getText:response': {
        namespace: 'query',
        action: 'notepad:getText:response',
        description: 'Response with Notepad text content',
        payload: {
            requestId: 'string',
            text: 'string',
            windowId: 'string'
        },
        example: {
            requestId: 'query-notepad-1',
            windowId: 'notepad-1',
            text: 'Document content'
        }
    },

    'command:calculator:clear': {
        namespace: 'command',
        action: 'calculator:clear',
        description: 'Command to clear Calculator',
        payload: {
            windowId: 'string?',
            requestId: 'string?'
        },
        example: {
            windowId: 'calculator-1'
        }
    },

    'command:calculator:input': {
        namespace: 'command',
        action: 'calculator:input',
        description: 'Command to input value/operator to Calculator',
        payload: {
            windowId: 'string?',
            value: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'calculator-1',
            value: '5'
        }
    },

    'query:calculator:getValue': {
        namespace: 'query',
        action: 'calculator:getValue',
        description: 'Query Calculator display value',
        payload: {
            windowId: 'string?',
            requestId: 'string'
        },
        example: {
            windowId: 'calculator-1',
            requestId: 'query-calc-1'
        }
    },

    'command:terminal:execute': {
        namespace: 'command',
        action: 'terminal:execute',
        description: 'Command to execute a terminal command',
        payload: {
            windowId: 'string?',
            command: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'terminal-1',
            command: 'dir'
        }
    },

    'command:browser:navigate': {
        namespace: 'command',
        action: 'browser:navigate',
        description: 'Command to navigate Browser to URL',
        payload: {
            windowId: 'string?',
            url: 'string',
            requestId: 'string?'
        },
        example: {
            windowId: 'browser-1',
            url: 'https://example.com'
        }
    },

    // ==========================================
    // TIMER/SCHEDULE EVENTS (for scripting)
    // ==========================================
    'timer:set': {
        namespace: 'timer',
        action: 'set',
        description: 'Set a timer to fire an event',
        payload: {
            timerId: 'string',
            delay: 'number',
            event: 'string',
            payload: 'object?',
            repeat: 'boolean?'
        },
        example: {
            timerId: 'my-timer',
            delay: 5000,
            event: 'custom:timer-fired',
            repeat: false
        }
    },

    'timer:clear': {
        namespace: 'timer',
        action: 'clear',
        description: 'Clear a timer',
        payload: {
            timerId: 'string'
        },
        example: {
            timerId: 'my-timer'
        }
    },

    'timer:fired': {
        namespace: 'timer',
        action: 'fired',
        description: 'Timer has fired',
        payload: {
            timerId: 'string'
        },
        example: {
            timerId: 'my-timer'
        }
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
