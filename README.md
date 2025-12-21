# RetrOS

<div align="center">

**A Windows 95-Themed Retro Operating System Simulator**

*Version 95.0*

[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-f7df1e?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Dependencies](https://img.shields.io/badge/Dependencies-None-brightgreen?style=flat-square)](https://github.com/morroware/RetrOS)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

[Features](#features) | [Installation](#installation) | [Usage](#usage) | [Applications](#applications) | [Plugin System](#plugin-system) | [Easter Eggs](#easter-eggs) | [Architecture](#architecture)

</div>

---

## Overview

RetrOS is a fully-functional Windows 95 desktop environment simulator built entirely with vanilla JavaScript, HTML5, and CSS3. Experience the nostalgic computing era of the mid-1990s right in your web browser, complete with draggable windows, classic applications, retro games, a virtual file system, and plenty of hidden surprises.

This project demonstrates advanced JavaScript patterns, event-driven architecture, and sophisticated UI/UX implementation—all without any external frameworks or dependencies.

**Project Stats:**
- **~32,500 lines of code** across 47+ JavaScript files
- **29 fully-functional applications**
- **Extensible plugin system** with example DVD Bouncer screensaver
- **Zero external dependencies** - pure vanilla JavaScript

---

## Features

### Desktop Environment
- **Authentic Windows 95 Interface** - Pixel-perfect recreation of the classic desktop
- **Draggable & Resizable Windows** - Full window management with minimize, maximize, and close
- **Desktop Icons** - Drag to reposition, double-click to launch, right-click for context menus
- **Selection Box** - Click and drag to multi-select desktop icons
- **Start Menu** - Fully functional start menu with 7 categories and submenus
- **Taskbar** - Window buttons, quick launch area, and system tray with live clock
- **Context Menus** - Right-click anywhere for contextual options
- **CRT Effect** - Optional retro scanline overlay for that authentic monitor feel
- **Custom Dialogs** - Windows 95-style alert, confirm, and prompt dialogs (replaces browser modals)
- **Window Snapping** - Drag windows to screen edges for snap preview

### Virtual File System
- **Multi-Drive Support** - C: (Local Disk), D: (CD-ROM), A: (Floppy)
- **Full Directory Structure** - Windows, Program Files, Users folders with default files
- **File Operations** - Create, read, edit, delete, move, copy, and rename files
- **Persistent Storage** - Files saved to localStorage persist across sessions
- **File Type Support** - Text files (.txt), images (.png), shortcuts (.lnk), executables
- **File Associations** - Notepad opens .txt files, Paint opens .png files automatically

### Technical Features
- **Zero Dependencies** - 100% vanilla JavaScript with ES6+ modules
- **LocalStorage Persistence** - Settings, files, and high scores are saved
- **Web Audio API** - Synthesized sound effects
- **Responsive Windows** - Apps resize properly when windows are resized
- **Touch Support** - Mobile and tablet compatible
- **Modular Architecture** - Clean, maintainable codebase with separation of concerns

---

## Installation

### Quick Start (No Build Required)

RetrOS requires no build process, package installation, or compilation. Simply:

1. **Clone the repository**
   ```bash
   git clone https://github.com/morroware/RetrOS.git
   cd RetrOS
   ```

2. **Open in browser**

   Option A - Direct file access:
   ```bash
   # Simply open index.html in your browser
   open index.html        # macOS
   xdg-open index.html    # Linux
   start index.html       # Windows
   ```

   Option B - Local HTTP server (recommended):
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx http-server

   # Using PHP
   php -S localhost:8000
   ```
   Then navigate to `http://localhost:8000`

### Browser Requirements

| Browser | Minimum Version |
|---------|-----------------|
| Chrome  | 61+             |
| Firefox | 60+             |
| Safari  | 11+             |
| Edge    | 79+             |

**Required Browser APIs:**
- ES6 Modules
- Canvas 2D
- Web Audio API
- LocalStorage
- CSS Grid/Flexbox
- ResizeObserver

---

## Usage

### Boot Sequence

When you first load RetrOS, you'll experience an authentic boot sequence:
1. BIOS-style startup screen
2. Loading bar animation
3. "Starting Windows 95..." message
4. Desktop loads with icons
5. Welcome dialog with tips (first visit only)

### Desktop Navigation

| Action | Result |
|--------|--------|
| Double-click icon | Launch application |
| Single-click icon | Select icon |
| Drag icon | Reposition on desktop |
| Click + drag on desktop | Selection box for multiple icons |
| Right-click desktop | Open context menu |
| Right-click icon | Icon-specific options |
| Click Start button | Open Start Menu |
| Click taskbar window | Focus/restore window |

### Window Controls

| Button | Function |
|--------|----------|
| `_` | Minimize to taskbar |
| `[]` | Maximize/Restore |
| `X` | Close window |
| Title bar drag | Move window |
| Edge/corner drag | Resize window (8 directions) |

### Keyboard Shortcuts

| Shortcut | Application | Action |
|----------|-------------|--------|
| `Ctrl+R` | Global | Open Run dialog |
| `Ctrl+S` | Notepad/Paint | Save file |
| `0-9`, `+-*/` | Calculator | Input |
| `Enter` | Calculator | Calculate |
| `Escape` | Calculator | Clear |
| `Arrow Keys` | Snake/SkiFree | Move |
| `WASD` | Snake | Move (alt) |
| `Arrow Keys` | Terminal | Command history |
| `Space` | SkiFree | Start/Restart |
| `F` | SkiFree | Speed boost |
| `P` | SkiFree | Pause |

---

## Applications

RetrOS includes 29 fully-functional applications organized into categories:

### Productivity (7 apps)

| App | Description |
|-----|-------------|
| **Notepad** | Text editor with file system integration (New, Open, Save, Save As, Download) |
| **Calculator** | Full arithmetic operations with keyboard support, multiple instances |
| **Paint** | Drawing application with brush, eraser, bucket fill, color picker, and file save/load |
| **Terminal** | MS-DOS style command line with 30+ commands |
| **Calendar** | Monthly calendar with date selection and navigation |
| **Clock** | Analog clock display with timezone support |
| **Find Files** | File search utility across the virtual file system |

### System Applications (6 apps)

| App | Description |
|-----|-------------|
| **My Computer** | Windows Explorer-style file browser with grid/list views and drag-and-drop |
| **Control Panel** | System settings for display, sound, desktop pet, and screensaver |
| **Display Properties** | Display settings with Background, Screensaver, Appearance, and Effects tabs |
| **Sound Settings** | Audio control panel |
| **Admin Panel** | Advanced administration for icons, security, achievements, and diagnostics |
| **Recycle Bin** | View, restore, or permanently delete removed items |

### Games (7 apps)

| App | Description |
|-----|-------------|
| **Snake** | Classic snake game with high score tracking and increasing difficulty |
| **Minesweeper** | Complete implementation with timer, mine counter, and first-click safety |
| **Asteroids** | Space shooter with smooth physics, particle effects, and 60 FPS gameplay |
| **Solitaire** | Klondike card game with drag-and-drop and move counter |
| **FreeCell** | Card game variant with 8 foundation piles |
| **SkiFree** | Classic skiing game with obstacles - watch out for the Yeti! |
| **DOOM** | Classic 1993 FPS via WebAssembly (Chocolate Doom port) |

### Multimedia (2 apps)

| App | Description |
|-----|-------------|
| **Winamp** | Legendary music player with visualizer, playlist, 8-band EQ, shuffle/repeat |
| **Media Player** | Windows Media Player style audio/video player |

### Internet & Communication (2 apps)

| App | Description |
|-----|-------------|
| **Internet Explorer** | Web browser with bookmarks, history, and address bar |
| **Chat Room** | 90s AOL/IRC style chat room simulator with bot users |

### Utilities (5 apps)

| App | Description |
|-----|-------------|
| **Disk Defragmenter** | Classic satisfying block-moving defrag visualization |
| **Task Manager** | Process viewer and management |
| **Help System** | Built-in help documentation |

---

### Application Details

#### Terminal

An MS-DOS style command-line interface with extensive command set.

**Core Commands:**

| Command | Description |
|---------|-------------|
| `help` | Display available commands |
| `dir` / `ls` | List directory contents |
| `cd <path>` | Change directory |
| `cat <file>` | Display file contents |
| `cls` / `clear` | Clear screen |
| `echo <text>` | Print text |
| `date` | Display current date |
| `time` | Display current time |
| `ver` | Show system version |
| `exit` | Close terminal |

**File System Commands:**

| Command | Description |
|---------|-------------|
| `tree` | Display directory tree |
| `type <file>` | Display file contents |
| `mkdir <name>` | Create directory |
| `del <file>` | Delete file |
| `copy <src> <dst>` | Copy file |
| `move <src> <dst>` | Move file |
| `find <text>` | Search for text |
| `ping <host>` | Simulate network ping |

**Fun Commands:**

| Command | Description |
|---------|-------------|
| `matrix` | Enter the Matrix |
| `disco` | Start disco mode |
| `zork` | Play text adventure |
| `bsod` | Blue Screen of Death |
| `fortune` | Random fortune |
| `cowsay <text>` | ASCII cow says text |

#### Winamp

The legendary MP3 player clone - it really whips the llama's ass!

**Features:**
- Classic Winamp skin with LCD display
- Real-time audio visualizer
- 8-track playlist with synthesized music
- Volume and balance sliders
- 8-band EQ display
- Shuffle and repeat modes
- Play, pause, stop, next, previous controls

#### SkiFree

The classic Windows skiing game where you dodge obstacles and flee from the Yeti!

**Controls:**
- Arrow Keys - Steer left/right, speed up/down
- F - Speed boost
- Space - Start/Restart
- P - Pause

**Tips:**
- Go fast (press F) to outrun the Yeti
- The Yeti is faster than your normal speed!
- Hit jumps for bonus points

#### Chat Room

Experience the golden age of internet chat with this 90s AOL/IRC style chat room simulator!

**Commands:**
- `/me [action]` - Perform an action (*username does something*)
- `/nick [name]` - Change your screen name
- `/clear` - Clear the chat window
- `/users` - List users in the room
- `/help` - Show available commands

---

## Special Features

### Clippy Assistant

The iconic Microsoft Office Assistant makes an appearance! Clippy randomly spawns (50% chance) when you boot up and offers "helpful" advice.

**Clippy's Personality:**
- Offers random tips and commentary
- Becomes progressively annoyed if dismissed repeatedly
- Eventually gives up entirely if you keep dismissing him

### Desktop Pet

An animated companion that walks across your desktop.

**Activation:**
- Enter the Konami Code, or
- Enable via Control Panel > Desktop Pet

**Available Pets:**
| Pet | Emoji |
|-----|-------|
| Dog | 🐕 |
| Cat | 🐈 |
| Rabbit | 🐇 |
| Hamster | 🐹 |
| Fox | 🦊 |
| Raccoon | 🦝 |
| Squirrel | 🐿️ |
| Hedgehog | 🦔 |

**Features:**
- Walks continuously across the screen
- Click for random fortune cookie messages
- Customizable in Control Panel

### Screensaver

Activates after configurable inactivity period (1, 3, 5, 10 minutes, or never). Configure via Control Panel or Display Properties.

### Achievement System

Unlock achievements by performing various actions:

| Achievement | How to Unlock |
|-------------|---------------|
| First Boot | Launch RetrOS for the first time |
| Konami Master | Enter the Konami Code |
| Disco Fever | Click the clock 10 times |
| Multitasker | Open 10+ windows simultaneously |
| Clippy Hater | Dismiss Clippy 5 times |
| Neo | Enter Matrix mode in Terminal |

Achievements persist between sessions and display as toast notifications when unlocked.

### DVD Bouncer Screensaver

A nostalgic bouncing DVD logo screensaver plugin that brings back memories of the classic DVD player experience!

**Features:**
- Classic bouncing DVD logo animation
- Color changes on every wall bounce
- Corner hit tracking with celebration messages
- Configurable speed, size, and idle timeout
- Auto-start after period of inactivity

**Configuration (Settings > Features > DVD Bouncer):**
| Setting | Range | Description |
|---------|-------|-------------|
| Bounce Speed | 1-10 | How fast the logo bounces |
| Logo Size | 40-200px | Size of the DVD logo |
| Idle Timeout | 10-300s | Seconds before auto-start |
| Auto-start | On/Off | Enable idle activation |

**Tips:**
- Wait for the legendary corner hit!
- Every 5th corner hit gets a special message
- Click anywhere to dismiss the screensaver

---

## Plugin System

RetrOS features a powerful plugin system for extending functionality without modifying core code.

### Architecture

```
plugins/
├── features/                    # Feature plugins
│   └── dvd-bouncer/            # Example plugin
│       ├── index.js            # Plugin manifest
│       ├── DVDBouncerFeature.js # Feature implementation
│       └── README.md           # Documentation
└── apps/                        # App plugins (future)
```

### Creating Plugins

Plugins can provide new features, apps, and integrate with existing systems:

1. **Create a feature class** extending `FeatureBase`
2. **Create a plugin manifest** with metadata and exports
3. **Register in boot sequence** via `PluginLoader`

See the [Developer Guide](DEVELOPER_GUIDE.md#plugin-system) for comprehensive documentation.

### Plugin Features

| Capability | Description |
|------------|-------------|
| **FeatureBase** | Base class with lifecycle hooks, config management, event helpers |
| **FeatureRegistry** | Central registry with dependency resolution |
| **PluginLoader** | Dynamic loading from manifest |
| **Settings UI** | Auto-generated settings from feature definitions |
| **Event Integration** | Emit/subscribe to system events |
| **Auto-cleanup** | Handlers automatically cleaned on disable |

### Example: DVD Bouncer Plugin

```javascript
// plugins/features/dvd-bouncer/DVDBouncerFeature.js
import FeatureBase from '../../../core/FeatureBase.js';

class DVDBouncerFeature extends FeatureBase {
    constructor() {
        super({
            id: 'dvd-bouncer',
            name: 'DVD Bouncer',
            category: 'plugin',
            config: { speed: 2, logoSize: 80, idleTimeout: 60000 },
            settings: [/* UI definitions */]
        });
    }

    async initialize() {
        this.subscribe('window:open', () => this.resetIdleTimer());
        this.addHandler(document, 'mousemove', () => this.onUserActivity());
        this.startIdleMonitoring();
    }

    start() { /* Create UI, start animation */ }
    stop() { /* Clean up, emit events */ }
}
```

---

## Easter Eggs

RetrOS contains several hidden features and easter eggs. Here's how to discover them:

### Konami Code

Enter the famous Konami Code to unlock a special surprise:
```
↑ ↑ ↓ ↓ ← → ← → B A
```
**Reward:** Celebration animation + unlocks Desktop Pet

### Rosebud Cheat

Type `rosebud` anywhere to gain admin access (SimCity/The Sims reference).

### Terminal Secrets

Enter these commands in the Terminal:

| Command | Effect |
|---------|--------|
| `matrix` | Green "digital rain" effect from The Matrix |
| `disco` | Colorful disco mode |
| `zork` | Play the classic text adventure |
| `bsod` | Trigger a Blue Screen of Death |

### Hidden Files

Explore the file system to find secret files:
- `C:/Users/Seth/Secret/aperture.log` - Portal reference
- `C:/Users/Seth/Secret/hal9000.txt` - 2001: A Space Odyssey reference

### Clock Easter Egg

Click the taskbar clock **10 times** to trigger Disco Fever mode and unlock an achievement.

### Clippy Annoyance

Dismiss Clippy **5 times** to unlock the "Clippy Hater" achievement.

---

## System Dialogs

RetrOS features authentic Windows 95-style dialog boxes that replace browser modals.

### Run Dialog
- Open with **Ctrl+R** or from Start Menu
- Type application names (notepad, calc, cmd, paint, etc.)
- Enter URLs to open in browser
- Click Browse to open My Computer

### Shutdown Dialog
- Access from Start Menu > Shut Down
- **Shut down** - Shows "It's now safe to turn off your computer"
- **Restart** - Reloads the page
- **Log off** - Clears session and shows welcome

### File Dialogs
- Windows 95-style Open and Save As dialogs
- Browse virtual file system
- Navigate folders, create new folders
- Filter by file type

---

## Architecture

### Project Structure

```
RetrOS/
├── index.html              # Main entry point with boot screen and UI placeholders
├── index.js                # Boot sequence & system initialization
├── styles.css              # Windows 95 styling (~2700 lines)
│
├── apps/                   # Application implementations (29 apps)
│   ├── AppBase.js          # Base class for all apps (multi-instance support)
│   ├── AppRegistry.js      # Central app registry & launcher
│   ├── Calculator.js       # Calculator with keyboard support
│   ├── Notepad.js          # Text editor with file system
│   ├── Terminal.js         # MS-DOS terminal (30+ commands)
│   ├── Paint.js            # Drawing app with file system
│   ├── Snake.js            # Snake game
│   ├── Minesweeper.js      # Minesweeper game
│   ├── Asteroids.js        # Asteroids game
│   ├── Solitaire.js        # Klondike solitaire
│   ├── FreeCell.js         # FreeCell card game
│   ├── Doom.js             # DOOM WebAssembly wrapper
│   ├── MediaPlayer.js      # Media player
│   ├── Browser.js          # Internet Explorer browser
│   ├── MyComputer.js       # File explorer
│   ├── RecycleBin.js       # Deleted items manager
│   ├── ControlPanel.js     # System settings
│   ├── DisplayProperties.js # Display settings
│   ├── SoundSettings.js    # Sound settings
│   ├── AdminPanel.js       # Admin tools
│   ├── Winamp.js           # Winamp music player
│   ├── SkiFree.js          # SkiFree skiing game
│   ├── ChatRoom.js         # 90s chat room simulator
│   ├── Defrag.js           # Disk Defragmenter
│   ├── Calendar.js         # Calendar app
│   ├── Clock.js            # Clock app
│   ├── FindFiles.js        # File search utility
│   ├── TaskManager.js      # Task manager
│   └── Help.js             # Help system
│
├── core/                   # Core system modules (10 modules)
│   ├── EventBus.js         # Pub/sub event system
│   ├── StateManager.js     # Centralized state management
│   ├── WindowManager.js    # Window lifecycle & operations
│   ├── StorageManager.js   # LocalStorage abstraction
│   ├── FileSystemManager.js # Virtual file system
│   ├── IconSystem.js       # FontAwesome + emoji icon support
│   ├── Constants.js        # Centralized configuration
│   ├── PluginLoader.js     # Plugin loading & management
│   ├── FeatureRegistry.js  # Feature registration & lifecycle
│   └── FeatureBase.js      # Base class for features
│
├── features/               # Core system features (7 modules)
│   ├── ClippyAssistant.js  # Clippy helper popup
│   ├── DesktopPet.js       # Desktop pet companion
│   ├── Screensaver.js      # Screensaver module
│   ├── EasterEggs.js       # Hidden triggers
│   ├── AchievementSystem.js # Achievement tracking
│   ├── SoundSystem.js      # Web Audio sound effects
│   └── SystemDialogs.js    # Windows 95-style dialogs
│
├── plugins/                # Third-party plugins
│   └── features/           # Feature plugins
│       └── dvd-bouncer/    # DVD Bouncer screensaver plugin
│
└── ui/                     # UI rendering components (4 renderers)
    ├── DesktopRenderer.js  # Desktop icons
    ├── TaskbarRenderer.js  # Taskbar & system tray
    ├── StartMenuRenderer.js # Start menu
    └── ContextMenuRenderer.js # Right-click menus
```

### Design Patterns

**Event-Driven Architecture**
```javascript
// Central pub/sub messaging
EventBus.on('window:open', (data) => { ... });
EventBus.emit('app:launch', { appId: 'calculator' });
```

**Singleton Pattern**
```javascript
// Single instances for core services
const StateManager = new StateManagerClass();
export default StateManager;
```

**Observer Pattern**
```javascript
// Reactive state subscriptions
StateManager.subscribe('windows', (windows) => {
    TaskbarRenderer.update(windows);
});
```

**Base Class Pattern**
```javascript
// Consistent app interface with multi-instance support
class MyApp extends AppBase {
    onOpen() { return '<div>App content</div>'; }
    onMount() { /* setup event listeners */ }
    onClose() { /* cleanup */ }
}
```

### Data Flow

```
User Action
    ↓
UI Renderer (captures event)
    ↓
EventBus (broadcasts event)
    ↓
Handlers (process event)
    ↓
StateManager (updates state)
    ↓
StorageManager (persists to localStorage)
    ↓
Subscribers (react to state changes)
    ↓
UI Updates
```

### Key Technologies

| Category | Technology |
|----------|------------|
| Language | JavaScript ES6+ (classes, modules, async/await) |
| Markup | HTML5 |
| Styling | CSS3 (Grid, Flexbox, Variables, Animations) |
| Graphics | HTML5 Canvas 2D API |
| Audio | Web Audio API |
| Storage | LocalStorage |
| Icons | FontAwesome 6.5.1 (with emoji fallback) |
| Fonts | VT323 (Google Fonts) for retro terminal feel |
| Build | None required (native ES modules) |

---

## Configuration

### Settings

Settings are stored in localStorage and can be modified via Control Panel:

| Setting | Default | Description |
|---------|---------|-------------|
| `sound` | `false` | Enable/disable sound effects |
| `crtEffect` | `true` | Enable/disable CRT scanline overlay |
| `pet.enabled` | `false` | Show/hide desktop pet |
| `pet.type` | `🐕` | Current pet emoji |
| `screensaverDelay` | `300000` | Screensaver delay (ms) |

### LocalStorage Keys

RetrOS uses the prefix `smos_` for all stored data:

| Key | Purpose |
|-----|---------|
| `smos_desktopIcons` | Icon positions |
| `smos_achievements` | Unlocked achievements |
| `smos_snakeHigh` | Snake high score |
| `smos_soundEnabled` | Sound preference |
| `smos_crtEnabled` | CRT effect preference |
| `smos_petEnabled` | Pet visibility |
| `smos_currentPet` | Selected pet type |
| `smos_fileSystem` | Virtual file system data |
| `smos_recycledItems` | Recycle bin contents |
| `smos_adminPassword` | Admin panel password |

### Clearing Data

To reset RetrOS to default state:

```javascript
// In browser console
Object.keys(localStorage)
    .filter(key => key.startsWith('smos_'))
    .forEach(key => localStorage.removeItem(key));
location.reload();
```

Or use the Terminal:
```
reset --factory
```

Or use Control Panel > Advanced > Reset

---

## Browser Compatibility

### Tested Browsers

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome 90+ | Full Support | Recommended |
| Firefox 88+ | Full Support | |
| Safari 14+ | Full Support | |
| Edge 90+ | Full Support | |
| Opera 76+ | Full Support | |
| IE 11 | Not Supported | Use Edge |

### Required Features

- ES6 Modules (`<script type="module">`)
- CSS Custom Properties (CSS Variables)
- LocalStorage API
- Canvas 2D Context
- Web Audio API (for sounds)
- Pointer Events
- ResizeObserver API

---

## Development

For detailed information on creating new applications, see the [Developer Guide](DEVELOPER_GUIDE.md).

### Quick Start: Adding New Applications

1. Create a new file in `/apps/`:

```javascript
// apps/MyApp.js
import AppBase from './AppBase.js';

class MyApp extends AppBase {
    constructor() {
        super({
            id: 'myapp',
            name: 'My Application',
            icon: 'fa-solid fa-star', // FontAwesome class or emoji
            width: 400,
            height: 300,
            resizable: true,
            singleton: false,
            category: 'accessories'
        });
    }

    onOpen() {
        return `
            <div class="myapp-container">
                <h1>Hello World!</h1>
            </div>
        `;
    }

    onMount() {
        // Setup event listeners after DOM is ready
        // Use this.addHandler() for automatic cleanup
    }

    onClose() {
        // Cleanup when window closes
    }
}

export default MyApp;
```

2. Register in `AppRegistry.js`:

```javascript
import MyApp from './MyApp.js';
AppRegistry.register(new MyApp(), {
    category: 'accessories',
    description: 'My custom application'
});
```

---

## Credits

- **Design Inspiration:** Microsoft Windows 95
- **DOOM Port:** Chocolate Doom WebAssembly
- **Icons:** FontAwesome 6.5.1
- **Font:** VT323 (Google Fonts)
- **Clippy:** Microsoft Office Assistant (1997-2007, RIP)

---

## License

This project is available under the MIT License. See [LICENSE](LICENSE) for details.

---

## Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<div align="center">

**Built with nostalgia and JavaScript**

*"It looks like you're reading a README. Would you like help?"* - Clippy

</div>
