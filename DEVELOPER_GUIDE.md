# RetrOS Developer Guide

A comprehensive guide for creating new applications and extending RetrOS.

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
13. [Troubleshooting](#troubleshooting)

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

RetrOS is built on these core modules in `/core/`:

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
const content = FileSystemManager.readFile(['C:', 'Users', 'Seth', 'Documents', 'file.txt']);

// Write a file
FileSystemManager.writeFile(
    ['C:', 'Users', 'Seth', 'Documents', 'new.txt'],
    'File content here'
);

// List directory
const files = FileSystemManager.listDirectory(['C:', 'Users', 'Seth', 'Documents']);
// Returns: [{name, type, extension, size, created, modified}, ...]

// Check if file exists
const exists = FileSystemManager.exists(['C:', 'file.txt']);

// Create directory
FileSystemManager.createDirectory(['C:', 'MyFolder']);

// Delete item
FileSystemManager.deleteItem(['C:', 'Users', 'Seth', 'Desktop', 'file.txt']);

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
const desktopPath = PATHS.DESKTOP;      // ['C:', 'Users', 'Seth', 'Desktop']
const documentsPath = PATHS.DOCUMENTS;  // ['C:', 'Users', 'Seth', 'Documents']
const userHome = PATHS.USER_HOME;       // ['C:', 'Users', 'Seth']
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
    initialPath: ['C:', 'Users', 'Seth', 'Documents']
});
if (result) {
    // result = { filename, path, fullPath }
}

// File save dialog
const saveResult = await SystemDialogs.showFileSave({
    title: 'Save File',
    filter: 'txt',
    initialPath: ['C:', 'Users', 'Seth', 'Documents'],
    defaultFilename: 'untitled.txt'
});
```

---

## Icon System

RetrOS uses FontAwesome 6.5.1 for icons with automatic emoji fallback.

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

RetrOS centralizes configuration in `/core/Constants.js`:

```javascript
import { PATHS, WINDOW, TIMING, STORAGE_KEYS, APP_CATEGORIES } from '../core/Constants.js';

// User paths
PATHS.USER_HOME      // ['C:', 'Users', 'Seth']
PATHS.DESKTOP        // ['C:', 'Users', 'Seth', 'Desktop']
PATHS.DOCUMENTS      // ['C:', 'Users', 'Seth', 'Documents']
PATHS.PICTURES       // ['C:', 'Users', 'Seth', 'Pictures']

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
const desktopPath = ['C:', 'Users', 'Seth', 'Desktop'];
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
