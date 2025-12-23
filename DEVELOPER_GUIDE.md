# IlluminatOS! Developer Guide

A comprehensive guide for creating new applications, features, and plugins for IlluminatOS!.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [App Architecture](#app-architecture)
3. [App Lifecycle](#app-lifecycle)
4. [Working with State](#working-with-state)
5. [Event Handling](#event-handling)
6. [File System Integration](#file-system-integration)
7. [Using System Dialogs](#using-system-dialogs)
8. [Icon System](#icon-system)
9. [Sound Integration](#sound-integration)
10. [Configuration Constants](#configuration-constants)
11. [Best Practices](#best-practices)
12. [Common Patterns](#common-patterns)
13. [Plugin System](#plugin-system)
14. [Feature Development](#feature-development)
15. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Step 1: Create the App File

Create a new file in `/apps/YourApp.js`:

```javascript
/**
 * YourApp - Description of your app
 */

import AppBase from './AppBase.js';

class YourApp extends AppBase {
    constructor() {
        super({
            // Required
            id: 'yourapp',           // Unique identifier (lowercase, no spaces)
            name: 'Your App',        // Display name

            // Optional (with defaults)
            icon: 'fa-solid fa-star', // FontAwesome class or emoji
            width: 500,              // Default window width
            height: 400,             // Default window height (or 'auto')
            resizable: true,         // Can user resize?
            singleton: false,        // Only one instance allowed?
            category: 'accessories', // Menu category
            showInMenu: true         // Show in Start Menu?
        });
    }

    /**
     * Called when app opens - return HTML content
     * @param {Object} params - Optional launch parameters
     * @returns {string} HTML content for window
     */
    onOpen(params = {}) {
        // Initialize instance state
        this.setInstanceState('counter', 0);

        return `
            <div class="yourapp-container">
                <h1>Hello, World!</h1>
                <p>Counter: <span id="counter">0</span></p>
                <button class="btn" id="incrementBtn">Increment</button>
            </div>
        `;
    }

    /**
     * Called after window is in DOM - setup event handlers
     */
    onMount() {
        // Use addHandler for automatic cleanup
        this.addHandler(
            this.getElement('#incrementBtn'),
            'click',
            this.handleIncrement
        );
    }

    /**
     * Called when window closes - cleanup resources
     */
    onClose() {
        // Any cleanup needed (most handled automatically)
    }

    // Your custom methods
    handleIncrement() {
        const counter = this.getInstanceState('counter') + 1;
        this.setInstanceState('counter', counter);

        const el = this.getElement('#counter');
        if (el) el.textContent = counter;
    }
}

export default YourApp;
```

### Step 2: Register the App

Open `/apps/AppRegistry.js` and:

1. Import your app at the top:
```javascript
import YourApp from './YourApp.js';
```

2. Register in `initialize()`:
```javascript
// Add to the appropriate category section
this.register(new YourApp(), { category: 'accessories' });
```

### Step 3: Test Your App

Your app will now appear in:
- Start Menu > Programs > [Category]
- Can be launched via Terminal: `start yourapp`
- Can be launched programmatically: `AppRegistry.launch('yourapp')`

---

## App Architecture

### Core Modules

IlluminatOS! is built on these core modules in `/core/`:

| Module | Purpose |
|--------|---------|
| `EventBus.js` | Central pub/sub messaging system |
| `StateManager.js` | Centralized state management with persistence |
| `WindowManager.js` | Window creation, focus, resize, and lifecycle |
| `StorageManager.js` | LocalStorage abstraction layer |
| `FileSystemManager.js` | Virtual file system with multi-drive support |
| `IconSystem.js` | FontAwesome icons with emoji fallback |
| `Constants.js` | Centralized configuration values |

### App Base Class

All apps extend `AppBase`, which provides:

- Multi-instance window support
- Automatic event handler cleanup
- Scoped DOM queries
- Instance-level state management
- Lifecycle hooks
- Integration with core systems

---

## App Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│                    APP LIFECYCLE                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  launch() called                                        │
│       │                                                 │
│       ▼                                                 │
│  ┌─────────┐                                           │
│  │ onOpen  │ ──► Return HTML content                   │
│  └────┬────┘     Initialize instance state             │
│       │                                                 │
│       ▼                                                 │
│  ┌──────────┐                                          │
│  │ onMount  │ ──► Setup event handlers                 │
│  └────┬─────┘     Initialize canvas/complex UI         │
│       │                                                 │
│       ▼                                                 │
│  ┌──────────────────────────────────┐                  │
│  │         WINDOW ACTIVE            │                  │
│  │  • onFocus() when window focused │                  │
│  │  • onBlur() when focus lost      │                  │
│  │  • onResize({width, height})     │                  │
│  └───────────────┬──────────────────┘                  │
│                  │                                      │
│                  ▼                                      │
│  ┌─────────┐                                           │
│  │ onClose │ ──► Cleanup resources                     │
│  └─────────┘     (handlers auto-cleaned)               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Lifecycle Methods

| Method | When Called | Return Value | Purpose |
|--------|-------------|--------------|---------|
| `onOpen(params)` | Window created | HTML string | Build UI, init state |
| `onMount()` | After DOM render | None | Setup handlers, canvas |
| `onFocus()` | Window activated | None | Resume animations |
| `onBlur()` | Window deactivated | None | Pause animations |
| `onResize({w,h})` | Window resized | None | Adjust layout |
| `onClose()` | Window closing | None | Final cleanup |

---

## Working with State

### Instance State (Per-Window)

Use for data unique to each window instance:

```javascript
// Set state
this.setInstanceState('score', 100);
this.setInstanceState('playerName', 'Player 1');

// Get state
const score = this.getInstanceState('score', 0); // 0 is default
const name = this.getInstanceState('playerName');

// Update multiple values
this.updateInstanceState({
    score: 150,
    level: 2
});

// Get all instance state
const allState = this.getAllInstanceState();
```

### Global State (Shared)

Use for data shared across the OS:

```javascript
// Get global state
const soundEnabled = this.getState('settings.sound');
const achievements = this.getState('achievements');

// Set global state (optionally persist to localStorage)
this.setState('settings.sound', true, true); // third param = persist
```

---

## Event Handling

### DOM Events (Use addHandler)

```javascript
onMount() {
    // CORRECT - Auto-cleanup when window closes
    this.addHandler(this.getElement('#btn'), 'click', this.handleClick);
    this.addHandler(document, 'keydown', this.handleKeyboard);
    this.addHandler(window, 'resize', this.handleResize);
}

// Methods are auto-bound to correct `this` and window context
handleClick(e) {
    console.log('Clicked!', this.id); // `this` is your app
}
```

### EventBus Events (Use onEvent)

```javascript
onMount() {
    // Subscribe to system events (auto-cleanup)
    this.onEvent('window:focus', this.handleWindowFocus);
    this.onEvent('setting:changed', this.handleSettingChanged);
}

// Emit events
this.emit('custom:event', { data: 'value' });
```

### Common Events

| Event | Data | Description |
|-------|------|-------------|
| `window:open` | `{id, title}` | Window opened |
| `window:close` | `{id}` | Window closed |
| `window:focus` | `{id}` | Window focused |
| `window:resize` | `{id, width, height}` | Window resized |
| `sound:play` | `{type, force}` | Play sound effect |
| `audio:play` | `{src, volume, loop}` | Play audio file |
| `achievement:unlock` | `{id}` | Achievement unlocked |
| `setting:changed` | `{path, value}` | Setting changed |

---

## File System Integration

```javascript
import FileSystemManager from '../core/FileSystemManager.js';

// Read a file
const content = FileSystemManager.readFile(['C:', 'Users', 'User', 'Documents', 'file.txt']);

// Write a file
FileSystemManager.writeFile(
    ['C:', 'Users', 'User', 'Documents', 'new.txt'],
    'File content here'
);

// List directory
const files = FileSystemManager.listDirectory(['C:', 'Users', 'User', 'Documents']);
// Returns: [{name, type, extension, size, created, modified}, ...]

// Check if file exists
const exists = FileSystemManager.exists(['C:', 'file.txt']);

// Create directory
FileSystemManager.createDirectory(['C:', 'MyFolder']);

// Delete item
FileSystemManager.deleteItem(['C:', 'Users', 'User', 'Desktop', 'file.txt']);

// Move item
FileSystemManager.moveItem(
    ['C:', 'source', 'file.txt'],
    ['C:', 'destination']
);

// Copy item
FileSystemManager.copyItem(
    ['C:', 'source', 'file.txt'],
    ['C:', 'destination']
);

// Rename item
FileSystemManager.renameItem(
    ['C:', 'folder', 'oldname.txt'],
    'newname.txt'
);
```

### Using Constants for Paths

```javascript
import { PATHS } from '../core/Constants.js';

// Use predefined paths
const desktopPath = PATHS.DESKTOP;      // ['C:', 'Users', 'User', 'Desktop']
const documentsPath = PATHS.DOCUMENTS;  // ['C:', 'Users', 'User', 'Documents']
const userHome = PATHS.USER_HOME;       // ['C:', 'Users', 'User']
```

---

## Using System Dialogs

```javascript
import SystemDialogs from '../features/SystemDialogs.js';

// Alert dialog
await SystemDialogs.alert('Message here', 'Title', 'info');
// Types: 'info', 'warning', 'error', 'question'

// Confirm dialog
const confirmed = await SystemDialogs.confirm('Are you sure?', 'Confirm');
if (confirmed) {
    // User clicked OK
}

// Prompt dialog
const input = await SystemDialogs.prompt('Enter name:', 'Input', 'Default');
if (input !== null) {
    // User entered something
}

// File open dialog
const result = await SystemDialogs.showFileOpen({
    title: 'Open File',
    filter: 'txt',  // File extension filter
    initialPath: ['C:', 'Users', 'User', 'Documents']
});
if (result) {
    // result = { filename, path, fullPath }
}

// File save dialog
const saveResult = await SystemDialogs.showFileSave({
    title: 'Save File',
    filter: 'txt',
    initialPath: ['C:', 'Users', 'User', 'Documents'],
    defaultFilename: 'untitled.txt'
});
```

---

## Icon System

IlluminatOS! uses FontAwesome 6.5.1 for icons with automatic emoji fallback.

### Using Icons in Apps

```javascript
import IconSystem from '../core/IconSystem.js';

// Get icon HTML - works with FontAwesome classes or emojis
const icon1 = IconSystem.getIcon('fa-solid fa-folder');  // FontAwesome
const icon2 = IconSystem.getIcon('folder');              // Shorthand
const icon3 = IconSystem.getIcon('🎮');                   // Emoji

// In your HTML template
onOpen() {
    return `
        <div class="toolbar">
            <button>${IconSystem.getIcon('fa-solid fa-save')} Save</button>
            <button>${IconSystem.getIcon('fa-solid fa-folder-open')} Open</button>
        </div>
    `;
}
```

### Icon Shorthand Mappings

| Shorthand | FontAwesome Class |
|-----------|-------------------|
| `folder` | `fa-solid fa-folder` |
| `folder-open` | `fa-solid fa-folder-open` |
| `file` | `fa-solid fa-file` |
| `file-text` | `fa-solid fa-file-lines` |
| `save` | `fa-solid fa-floppy-disk` |
| `computer` | `fa-solid fa-computer` |
| `settings` | `fa-solid fa-gear` |
| `trash` | `fa-solid fa-trash` |

### Fallback Behavior

If FontAwesome fails to load, the IconSystem automatically falls back to emojis:
- `fa-solid fa-folder` → `📁`
- `fa-solid fa-file` → `📄`
- `fa-solid fa-computer` → `💻`

---

## Sound Integration

```javascript
// Play system sound
this.playSound('click');  // click, open, close, error, notify, startup, achievement

// Force play even if sound disabled
this.playSound('error', true);

// Play audio file
this.playAudio('path/to/audio.mp3', {
    volume: 0.8,
    loop: false,
    onEnded: () => console.log('Audio finished')
});

// Stop specific audio
this.stopAudio('path/to/audio.mp3');

// Stop all audio
this.stopAllAudio();
```

---

## Configuration Constants

IlluminatOS! centralizes configuration in `/core/Constants.js`:

```javascript
import { PATHS, WINDOW, TIMING, STORAGE_KEYS, APP_CATEGORIES } from '../core/Constants.js';

// User paths
PATHS.USER_HOME      // ['C:', 'Users', 'User']
PATHS.DESKTOP        // ['C:', 'Users', 'User', 'Desktop']
PATHS.DOCUMENTS      // ['C:', 'Users', 'User', 'Documents']
PATHS.PICTURES       // ['C:', 'Users', 'User', 'Pictures']

// Window configuration
WINDOW.MIN_WIDTH     // 300
WINDOW.MIN_HEIGHT    // 200
WINDOW.BASE_Z_INDEX  // 1000

// Timing values
TIMING.ANIMATION_DURATION  // Animation timing in ms
TIMING.SCREENSAVER_DELAY   // Default screensaver delay

// Storage keys (all prefixed with 'smos_')
STORAGE_KEYS.DESKTOP_ICONS
STORAGE_KEYS.FILE_SYSTEM
STORAGE_KEYS.ACHIEVEMENTS

// App categories for Start Menu
APP_CATEGORIES.ACCESSORIES  // 'accessories'
APP_CATEGORIES.GAMES        // 'games'
APP_CATEGORIES.MULTIMEDIA   // 'multimedia'
APP_CATEGORIES.INTERNET     // 'internet'
APP_CATEGORIES.SYSTEM_TOOLS // 'systemtools'
APP_CATEGORIES.SETTINGS     // 'settings'
```

---

## Best Practices

### 1. Always Use Instance State

```javascript
// CORRECT - State isolated per window
this.setInstanceState('data', value);

// WRONG - Shared across all instances
this.data = value;
```

### 2. Always Use addHandler for Events

```javascript
// CORRECT - Auto cleanup
this.addHandler(element, 'click', this.handler);

// WRONG - Memory leak potential
element.addEventListener('click', this.handler);
```

### 3. Check Window Active State

```javascript
handleKeyboard(e) {
    // Only respond if our window is active
    if (!this.getWindow()?.classList.contains('active')) return;

    // Handle keyboard input
}
```

### 4. Escape HTML Content

```javascript
escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Use when inserting user content
this.getElement('#display').innerHTML = this.escapeHtml(userInput);
```

### 5. Handle Window Resize

```javascript
onResize({ width, height }) {
    // Adjust canvas size
    const canvas = this.getElement('canvas');
    if (canvas) {
        canvas.width = width - 20;
        canvas.height = height - 100;
    }
}
```

### 6. Use Constants Instead of Magic Values

```javascript
import { PATHS, WINDOW } from '../core/Constants.js';

// CORRECT - Use centralized constants
const desktopPath = PATHS.DESKTOP;

// WRONG - Hardcoded paths
const desktopPath = ['C:', 'Users', 'User', 'Desktop'];
```

---

## Common Patterns

### Canvas-Based App (Game)

```javascript
class MyGame extends AppBase {
    constructor() {
        super({ id: 'mygame', name: 'My Game', icon: 'fa-solid fa-gamepad', width: 600, height: 400 });
    }

    onOpen() {
        return `<canvas id="gameCanvas" width="580" height="360"></canvas>`;
    }

    onMount() {
        const canvas = this.getElement('#gameCanvas');
        const ctx = canvas.getContext('2d');
        this.setInstanceState('ctx', ctx);
        this.setInstanceState('running', true);
        this.gameLoop();
    }

    gameLoop() {
        if (!this.getInstanceState('running')) return;

        const ctx = this.getInstanceState('ctx');
        // Draw frame...

        requestAnimationFrame(() => this.gameLoop());
    }

    onBlur() {
        this.setInstanceState('running', false); // Pause
    }

    onFocus() {
        this.setInstanceState('running', true);
        this.gameLoop(); // Resume
    }

    onClose() {
        this.setInstanceState('running', false);
    }
}
```

### File Editor App

```javascript
class MyEditor extends AppBase {
    constructor() {
        super({ id: 'myeditor', name: 'My Editor', icon: 'fa-solid fa-file-pen', width: 600, height: 500 });
    }

    onOpen(params = {}) {
        let content = '';
        if (params.filePath) {
            content = FileSystemManager.readFile(params.filePath);
            this.setInstanceState('currentFile', params.filePath);
        }

        return `
            <div class="editor">
                <div class="toolbar">
                    <button id="saveBtn">Save</button>
                </div>
                <textarea id="content">${this.escapeHtml(content)}</textarea>
            </div>
        `;
    }

    onMount() {
        this.addHandler(this.getElement('#saveBtn'), 'click', this.save);
        this.addHandler(document, 'keydown', this.handleKeyboard);
    }

    handleKeyboard(e) {
        if (!this.getWindow()?.classList.contains('active')) return;
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.save();
        }
    }

    async save() {
        const content = this.getElement('#content').value;
        const currentFile = this.getInstanceState('currentFile');

        if (currentFile) {
            FileSystemManager.writeFile(currentFile, content);
            this.alert('Saved!');
        } else {
            // Show save dialog...
        }
    }
}
```

### Singleton App (One Instance Only)

```javascript
class Settings extends AppBase {
    constructor() {
        super({
            id: 'settings',
            name: 'Settings',
            icon: 'fa-solid fa-gear',
            singleton: true,  // Only one instance allowed
            width: 400,
            height: 300
        });
    }
    // ...
}
```

### App with Toolbar

```javascript
onOpen() {
    return `
        <div class="app-toolbar">
            <button id="newBtn" class="toolbar-btn" title="New">
                ${IconSystem.getIcon('fa-solid fa-file')}
            </button>
            <button id="openBtn" class="toolbar-btn" title="Open">
                ${IconSystem.getIcon('fa-solid fa-folder-open')}
            </button>
            <div class="toolbar-separator"></div>
            <button id="saveBtn" class="toolbar-btn" title="Save">
                ${IconSystem.getIcon('fa-solid fa-floppy-disk')}
            </button>
        </div>
        <div class="app-content">
            <!-- Main content here -->
        </div>
    `;
}
```

---

## Plugin System

IlluminatOS! features a powerful plugin system that allows third-party extensions without modifying core code. Plugins can provide new features, apps, and integrate with existing systems.

### Plugin Architecture

```
plugins/
├── features/                    # Feature plugins
│   ├── dvd-bouncer/            # Example: DVD Bouncer screensaver
│   │   ├── index.js            # Plugin manifest (entry point)
│   │   ├── DVDBouncerFeature.js # Feature implementation
│   │   └── README.md           # Documentation
│   └── your-plugin/            # Your custom plugin
│       ├── index.js
│       └── YourFeature.js
└── apps/                        # App plugins (future)
```

### Core Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `PluginLoader` | `/core/PluginLoader.js` | Loads and manages plugins |
| `FeatureRegistry` | `/core/FeatureRegistry.js` | Registers and initializes features |
| `FeatureBase` | `/core/FeatureBase.js` | Base class for all features |

### Creating a Plugin

#### Step 1: Create Plugin Directory

```bash
mkdir -p plugins/features/my-plugin
```

#### Step 2: Create the Feature Class

Create `plugins/features/my-plugin/MyFeature.js`:

```javascript
import FeatureBase from '../../../core/FeatureBase.js';

class MyFeature extends FeatureBase {
    constructor() {
        super({
            // Required
            id: 'my-feature',           // Unique identifier
            name: 'My Feature',         // Display name

            // Optional
            description: 'Description of what my feature does',
            icon: '🚀',                 // Emoji or FontAwesome class
            category: 'plugin',         // 'core', 'enhancement', or 'plugin'
            dependencies: [],           // Feature IDs this depends on

            // Configuration with defaults
            config: {
                speed: 5,
                enabled: true,
                color: '#FF6B6B'
            },

            // Settings UI definition
            settings: [
                {
                    key: 'speed',
                    label: 'Speed',
                    type: 'number',
                    min: 1,
                    max: 10,
                    step: 1,
                    description: 'Movement speed (1-10)'
                },
                {
                    key: 'enabled',
                    label: 'Enable Effect',
                    type: 'checkbox',
                    description: 'Toggle the effect on/off'
                },
                {
                    key: 'color',
                    label: 'Color',
                    type: 'select',
                    options: [
                        { value: '#FF6B6B', label: 'Red' },
                        { value: '#4ECDC4', label: 'Teal' },
                        { value: '#45B7D1', label: 'Blue' }
                    ],
                    description: 'Choose the primary color'
                }
            ]
        });

        // Instance properties
        this.animationFrame = null;
        this.isRunning = false;
    }

    /**
     * Called during system initialization when feature is enabled
     */
    async initialize() {
        this.log('Initializing...');

        // Subscribe to system events (auto-cleanup)
        this.subscribe('window:open', (data) => this.onWindowOpen(data));
        this.subscribe('boot:complete', () => this.onBootComplete());

        // Add DOM event listeners (auto-cleanup)
        this.addHandler(document, 'keydown', this.handleKeydown);

        this.log('Initialized successfully!');
    }

    /**
     * Called when feature is enabled at runtime
     */
    async enable() {
        this.log('Feature enabled');
        // Re-initialize if needed
        if (!this.initialized) {
            await this.initialize();
            this.initialized = true;
        }
    }

    /**
     * Called when feature is disabled at runtime
     */
    async disable() {
        this.log('Feature disabled');
        this.stop();
    }

    /**
     * Called when feature is cleaned up
     */
    cleanup() {
        this.stop();
        this.log('Cleaned up');
    }

    // Custom methods
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.log('Started');

        // Emit event for other features
        this.emit('my-feature:started', { timestamp: Date.now() });
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        this.emit('my-feature:stopped', { timestamp: Date.now() });
    }

    handleKeydown(e) {
        // Access config values
        const speed = this.getConfig('speed', 5);
        this.log(`Key pressed, speed is: ${speed}`);
    }

    onWindowOpen(data) {
        this.log(`Window opened: ${data.title}`);
    }

    onBootComplete() {
        this.log('System boot complete!');
    }
}

export default MyFeature;
```

#### Step 3: Create the Plugin Manifest

Create `plugins/features/my-plugin/index.js`:

```javascript
import MyFeature from './MyFeature.js';

export default {
    // Plugin metadata
    id: 'my-plugin',
    name: 'My Awesome Plugin',
    version: '1.0.0',
    author: 'Your Name',
    description: 'A brief description of what this plugin does',

    // Features provided by this plugin
    features: [
        new MyFeature()
    ],

    // Apps provided by this plugin (optional)
    apps: [],

    // Lifecycle hooks
    onLoad: async () => {
        console.log('🚀 My Plugin loaded!');
    },

    onUnload: async () => {
        console.log('👋 My Plugin unloaded');
    }
};
```

#### Step 4: Register the Plugin

Plugins are registered in the boot sequence. Add your plugin to `index.js`:

```javascript
// In initializeOS(), Phase 2.5: Load Plugins
await initComponent('PluginLoader', async () => {
    const manifest = PluginLoader.getPluginManifest();

    // Add your plugin
    manifest.plugins.push({
        path: '../plugins/features/my-plugin/index.js',
        enabled: true
    });

    PluginLoader.savePluginManifest(manifest);
    await PluginLoader.loadAllPlugins();
});
```

### Plugin Loading Flow

```
Boot Sequence
     │
     ▼
Phase 2: Register Core Features
     │ FeatureRegistry.registerAll([SoundSystem, ...])
     ▼
Phase 2.5: Load Plugins
     │ PluginLoader.loadAllPlugins()
     │   ├── Load plugin from path
     │   ├── Register plugin features with FeatureRegistry
     │   └── Call plugin.onLoad()
     ▼
Phase 2.7: Initialize All Features
     │ FeatureRegistry.initializeAll()
     │   ├── Resolve dependencies (topological sort)
     │   ├── Load enabled state from storage
     │   └── Call feature.initialize() for enabled features
     ▼
System Ready
```

### PluginLoader API

```javascript
import PluginLoader from './core/PluginLoader.js';

// Load a plugin from path
await PluginLoader.loadPluginFromPath('../plugins/features/my-plugin/index.js');

// Load all plugins from manifest
await PluginLoader.loadAllPlugins();

// Unload a plugin
await PluginLoader.unloadPlugin('my-plugin');

// Get/save manifest
const manifest = PluginLoader.getPluginManifest();
PluginLoader.savePluginManifest(manifest);

// Add plugin to manifest
PluginLoader.addToManifest({
    path: '../plugins/features/my-plugin/index.js',
    enabled: true
});

// Check if plugin is loaded
const isLoaded = PluginLoader.isLoaded('my-plugin');

// Get all loaded plugins
const plugins = PluginLoader.getAll();

// Get features provided by a plugin
const features = PluginLoader.getPluginFeatures('my-plugin');

// Debug info
PluginLoader.logStatus();
```

### Plugin Manifest Storage

The plugin manifest is stored in localStorage and contains:

```javascript
{
    plugins: [
        {
            path: '../plugins/features/dvd-bouncer/index.js',
            enabled: true
        },
        {
            path: '../plugins/features/my-plugin/index.js',
            enabled: true
        }
    ]
}
```

---

## Feature Development

Features are modular system enhancements that extend IlluminatOS! functionality. They differ from apps in that they run in the background and integrate with the OS itself.

### Feature Categories

| Category | Purpose | Can Disable? |
|----------|---------|--------------|
| `core` | Essential system features | No |
| `enhancement` | Optional system features | Yes |
| `plugin` | Third-party plugin features | Yes |

### FeatureBase API

```javascript
class MyFeature extends FeatureBase {
    constructor() {
        super({
            id: 'my-feature',
            name: 'My Feature',
            description: 'Description',
            icon: '🚀',
            category: 'enhancement',
            dependencies: ['soundsystem'],  // Initialize after SoundSystem
            config: { /* defaults */ },
            settings: [ /* UI definitions */ ]
        });
    }
}
```

### Lifecycle Methods

| Method | When Called | Purpose |
|--------|-------------|---------|
| `initialize()` | Boot sequence (if enabled) | Setup subscriptions, handlers |
| `enable()` | User enables feature | Activate feature |
| `disable()` | User disables feature | Deactivate feature |
| `cleanup()` | Feature disabled/unloaded | Clean up resources |

### Configuration Helpers

```javascript
// Get config value (with optional default)
const speed = this.getConfig('speed', 5);

// Set config value (auto-persists)
this.setConfig('speed', 10);

// Get all config
const allConfig = this.getAllConfig();

// Reset to defaults
this.resetConfig();

// Load config from storage
const saved = this.loadConfigFromStorage();
```

### State Helpers

```javascript
// Check if enabled
if (this.isEnabled()) { ... }

// Load enabled state from storage
this.loadEnabledState();

// Save enabled state to storage
this.saveEnabledState(true);
```

### Event Helpers

```javascript
// Subscribe to EventBus (auto-cleanup on disable)
this.subscribe('window:open', (data) => { ... });

// Emit events
this.emit('my-feature:started', { data: 'value' });

// Add DOM event listener (auto-cleanup on disable)
this.addHandler(document, 'keydown', this.handleKeydown);
this.addHandler(element, 'click', this.handleClick, { capture: true });

// Remove specific handler
this.removeHandler(document, 'keydown');
```

### Logging Helpers

```javascript
this.log('Info message');      // [My Feature] Info message
this.warn('Warning message');  // [My Feature] Warning message
this.error('Error message');   // [My Feature] Error message
```

### Hook System

Features can expose hooks for other features to extend:

```javascript
// In your feature - trigger a hook
const results = this.triggerHook('before:start', { data: 'value' });

// In another feature - register a hook handler
myFeature.registerHook('before:start', (data) => {
    console.log('About to start with:', data);
    return { modified: true };
});
```

### FeatureRegistry API

```javascript
import FeatureRegistry from './core/FeatureRegistry.js';

// Register a feature
FeatureRegistry.register(new MyFeature());

// Get a feature instance
const feature = FeatureRegistry.get('my-feature');

// Enable/disable at runtime
await FeatureRegistry.enable('my-feature');
await FeatureRegistry.disable('my-feature');

// Toggle
const newState = await FeatureRegistry.toggle('my-feature');

// Check status
const isEnabled = FeatureRegistry.isEnabled('my-feature');
const isInitialized = FeatureRegistry.isInitialized('my-feature');

// Get all features
const allFeatures = FeatureRegistry.getAll();

// Get by category
const plugins = FeatureRegistry.getByCategory('plugin');

// Get enabled/disabled
const enabled = FeatureRegistry.getEnabled();
const disabled = FeatureRegistry.getDisabled();

// Feature config
const value = FeatureRegistry.getFeatureConfig('my-feature', 'speed', 5);
FeatureRegistry.setFeatureConfig('my-feature', 'speed', 10);
FeatureRegistry.resetFeatureConfig('my-feature');

// Debug
FeatureRegistry.logStatus();
const debug = FeatureRegistry.getDebugInfo();
```

### Settings UI Definition

Features can define settings that appear in the Settings app:

```javascript
settings: [
    // Number input
    {
        key: 'speed',
        label: 'Speed',
        type: 'number',
        min: 1,
        max: 10,
        step: 1,
        description: 'Movement speed'
    },

    // Checkbox
    {
        key: 'autoStart',
        label: 'Auto-start',
        type: 'checkbox',
        description: 'Start automatically'
    },

    // Select dropdown
    {
        key: 'theme',
        label: 'Theme',
        type: 'select',
        options: [
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' }
        ],
        description: 'Choose theme'
    },

    // Text input
    {
        key: 'name',
        label: 'Name',
        type: 'text',
        description: 'Enter a name'
    },

    // With transform (store in ms, display in seconds)
    {
        key: 'timeout',
        label: 'Timeout (seconds)',
        type: 'number',
        min: 10,
        max: 300,
        transform: (value) => value * 1000,        // Input → Storage
        displayTransform: (value) => value / 1000  // Storage → Display
    }
]
```

### Example: Complete Feature Plugin

See the DVD Bouncer plugin for a complete example:

- **Location**: `/plugins/features/dvd-bouncer/`
- **Features**:
  - Idle detection and auto-start
  - Animation with requestAnimationFrame
  - Configuration persistence
  - Event emission for integration
  - DOM event handling with cleanup

---

## Troubleshooting

### App Doesn't Appear in Start Menu

1. Check `showInMenu: true` in constructor
2. Verify category matches existing category (see `APP_CATEGORIES`)
3. Check for JavaScript errors in console
4. Verify app is registered in AppRegistry

### Event Handlers Not Working

1. Use `this.addHandler()` not `addEventListener`
2. Check if element exists: `if (element) this.addHandler(...)`
3. Verify `onMount()` is being called (add console.log)
4. Check active window state for keyboard events

### Multiple Instances Conflict

1. Use `getInstanceState()`/`setInstanceState()` not `this.property`
2. Check `singleton: false` in constructor
3. Verify state keys are unique per operation

### Memory Leaks

1. Use `this.addHandler()` - auto cleanup on close
2. Use `this.onEvent()` for EventBus - auto cleanup
3. Clear intervals/timeouts in `onClose()`
4. Set `running: false` to stop animation loops

### Window Not Responding

1. Check for infinite loops
2. Verify async operations have error handling
3. Check console for unhandled promise rejections

### Icons Not Displaying

1. Check if FontAwesome is loaded (network tab)
2. Use correct FontAwesome class format: `fa-solid fa-icon-name`
3. Fallback to emoji if needed: `icon: '📁'`
4. Check IconSystem mapping for shorthand names

---

## Quick Reference

### DOM Helpers

| Method | Description |
|--------|-------------|
| `this.getWindow()` | Get window element |
| `this.getElement(selector)` | Get element in window |
| `this.getElements(selector)` | Get all matching elements |
| `this.setContent(html)` | Replace window content |
| `this.close()` | Close current window |
| `this.closeAll()` | Close all app windows |

### Utility Methods

| Method | Description |
|--------|-------------|
| `this.playSound(type)` | Play system sound |
| `this.playAudio(src)` | Play audio file |
| `this.alert(msg)` | Show alert dialog |
| `this.unlockAchievement(id)` | Unlock achievement |

### App Categories

| Category | Description |
|----------|-------------|
| `accessories` | Productivity tools (Calculator, Notepad, Paint, Calendar, Clock) |
| `games` | Games (Minesweeper, Snake, Solitaire, FreeCell, SkiFree, Asteroids, DOOM) |
| `multimedia` | Media apps (Media Player, Winamp) |
| `internet` | Network apps (Browser, Chat Room) |
| `systemtools` | Utilities (Terminal, Defrag, Find Files, Task Manager) |
| `settings` | Settings apps (Control Panel, Display Properties, Sound Settings) |
| `system` | System apps (hidden from menu: My Computer, Recycle Bin, Admin Panel) |

---

## Project Structure Reference

```
RetrOS/
├── apps/                   # Application implementations
│   ├── AppBase.js          # Base class - extend this
│   ├── AppRegistry.js      # Register apps here
│   └── [YourApp.js]        # Your new app
│
├── core/                   # Core systems
│   ├── Constants.js        # Configuration constants
│   ├── EventBus.js         # Event system
│   ├── StateManager.js     # State management
│   ├── WindowManager.js    # Window management
│   ├── FileSystemManager.js # Virtual file system
│   ├── StorageManager.js   # LocalStorage
│   └── IconSystem.js       # Icon rendering
│
├── features/               # Optional features
│   ├── SystemDialogs.js    # Dialogs (alert, confirm, file open/save)
│   ├── SoundSystem.js      # Audio system
│   ├── AchievementSystem.js # Achievements
│   └── ...
│
└── ui/                     # UI components
    ├── DesktopRenderer.js  # Desktop icons
    ├── TaskbarRenderer.js  # Taskbar
    ├── StartMenuRenderer.js # Start menu
    └── ContextMenuRenderer.js # Context menus
```

---

## Need Help?

- Check existing apps in `/apps/` for examples:
  - **Calculator.js** - Simple calculator with keyboard support
  - **Notepad.js** - File operations and dialogs
  - **Snake.js** - Canvas-based game with game loop
  - **Paint.js** - Drawing tools with file system integration
  - **Calendar.js** - Date navigation and selection
  - **FreeCell.js** - Complex card game with drag-and-drop
