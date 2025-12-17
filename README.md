# RetrOS - Seth Morrow OS

<div align="center">

**A Windows 95-Themed Retro Operating System Simulator**

*Version 95.0*

[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-f7df1e?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No Dependencies](https://img.shields.io/badge/Dependencies-None-brightgreen?style=flat-square)](https://github.com/morroware/RetrOS)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

[Features](#features) | [Installation](#installation) | [Usage](#usage) | [Applications](#applications) | [Easter Eggs](#easter-eggs) | [Architecture](#architecture)

</div>

---

## Overview

RetrOS is a fully-functional Windows 95 desktop environment simulator built entirely with vanilla JavaScript, HTML5, and CSS3. Experience the nostalgic computing era of the mid-1990s right in your web browser, complete with draggable windows, classic applications, retro games, a virtual file system, and plenty of hidden surprises.

This project demonstrates advanced JavaScript patterns, event-driven architecture, and sophisticated UI/UX implementation—all without any external frameworks or dependencies.

---

## Features

### Desktop Environment
- **Authentic Windows 95 Interface** - Pixel-perfect recreation of the classic desktop
- **Draggable & Resizable Windows** - Full window management with minimize, maximize, and close
- **Desktop Icons** - Drag to reposition, double-click to launch, right-click for context menus
- **Start Menu** - Fully functional start menu with categories and submenus
- **Taskbar** - Window buttons, quick launch area, and system tray with live clock
- **Context Menus** - Right-click anywhere for contextual options
- **CRT Effect** - Optional retro scanline overlay for that authentic monitor feel
- **Custom Dialogs** - Windows 95-style alert, confirm, and prompt dialogs (replaces browser modals)

### Virtual File System
- **Multi-Drive Support** - C: (Local Disk), D: (CD-ROM), A: (Floppy)
- **Full Directory Structure** - Windows, Program Files, Users folders
- **File Operations** - Create, read, edit, delete, move, and copy files
- **Persistent Storage** - Files saved to localStorage persist across sessions
- **File Type Support** - Text files, images, shortcuts, executables
- **Integration** - Notepad and Paint save/load from the virtual file system

### Productivity Applications
- **Notepad** - Text editor with file system integration (New, Open, Save, Save As, Download)
- **Calculator** - Full arithmetic operations with keyboard support
- **Paint** - Drawing application with brush, eraser, bucket fill, and file system save/load
- **Terminal** - MS-DOS style command line with extensive command set

### System Applications
- **My Computer** - Windows Explorer-style file browser with grid/list views and drag-and-drop
- **Control Panel** - System settings for display, sound, desktop pet, and screensaver
- **Admin Panel** - Advanced administration for icons, security, achievements, and diagnostics
- **Recycle Bin** - View, restore, or permanently delete removed items
- **Internet Explorer** - Web browser with bookmarks, history, and address bar

### Classic Games
- **Snake** - The timeless arcade game with high score tracking
- **Minesweeper** - Complete implementation with timer and mine counter
- **Asteroids** - Space shooter with smooth physics and particle effects
- **Solitaire** - Klondike card game with drag-and-drop
- **DOOM** - Classic 1993 FPS via WebAssembly (Chocolate Doom)

### Special Features
- **Clippy Assistant** - The iconic paperclip helper with personality
- **Desktop Pet** - Animated companion that walks across your screen (8 pet options)
- **Screensaver** - Activates after configurable inactivity period
- **Achievement System** - Unlock achievements for various actions
- **Easter Eggs** - Hidden features waiting to be discovered
- **Run Dialog** - Launch apps with Ctrl+R (Windows Run dialog style)
- **Shutdown Dialog** - Shutdown, restart, or log off options

### Technical Features
- **Zero Dependencies** - 100% vanilla JavaScript
- **LocalStorage Persistence** - Your settings, files, and high scores are saved
- **Web Audio API** - Synthesized sound effects
- **Responsive Windows** - Apps resize properly when windows are resized
- **Modular Architecture** - Clean, maintainable codebase

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
| Corner drag | Resize window |

### Keyboard Shortcuts

| Shortcut | Application | Action |
|----------|-------------|--------|
| `Ctrl+R` | Global | Open Run dialog |
| `Ctrl+S` | Notepad | Save file |
| `0-9`, `+-*/` | Calculator | Input |
| `Enter` | Calculator | Calculate |
| `Escape` | Calculator | Clear |
| `Arrow Keys` | Snake | Move snake |
| `WASD` | Snake | Move snake (alt) |
| `Arrow Keys` | Terminal | Command history |

---

## Applications

### My Computer

A Windows Explorer-style file browser for navigating the virtual file system.

**Features:**
- Browse drives (C:, D:, A:) and directories
- Grid and list view modes
- Address bar showing current path
- Back, Up, and View toolbar buttons
- Drive information with usage bars
- Open files with appropriate applications
- Drag and drop to move files between folders
- Support for shortcuts (.lnk files)

**System Folders:**
- My Documents, My Pictures, My Music
- Control Panel, Recycle Bin

---

### Internet Explorer

A retro-styled web browser for surfing the information superhighway.

**Features:**
- Full address bar with Go button
- Back, Forward, Refresh, Home navigation
- Bookmarks bar (Wikipedia, Internet Archive, Google, Hacker News)
- History management
- Status bar showing load status
- Auto-maximizes on open for better viewing

**Usage:**
1. Launch from desktop or Start Menu
2. Enter URL in address bar or click a bookmark
3. Press Enter or click Go to navigate

---

### Control Panel

System settings and configuration center.

**Settings Available:**
- **Display** - Desktop background color, CRT effect toggle
- **Sound** - Enable/disable system sounds
- **Desktop Pet** - Enable/disable, choose from 8 pet types
- **Screensaver** - Set delay (1, 3, 5, 10 minutes, or never)
- **System Info** - Storage usage, achievements count
- **Advanced** - Reset RetrOS, Export/Import settings

---

### Admin Panel

Advanced system administration for power users.

**Tabs:**
- **Desktop Icons** - Add, edit, or delete desktop icons
- **Security** - Set or remove admin password
- **Achievements** - Unlock all or clear achievements
- **System** - Diagnostics, console output, factory reset

**Security:**
- Set a password to protect Admin Panel access
- Password persists across sessions

---

### Recycle Bin

Manage deleted desktop items.

**Features:**
- View all deleted items with icons
- Grid or list view modes
- Restore items to desktop (double-click or Restore button)
- Permanently delete individual items
- Empty entire Recycle Bin

---

### Notepad

A simple text editor with full file system integration.

**Features:**
- Create and edit text documents
- **New** - Start a fresh document
- **Open** - Browse and open files from the virtual file system
- **Save** - Save to current file location
- **Save As** - Choose location and filename via file dialog
- **Download** - Export as a real `.txt` file
- File path display in toolbar
- Keyboard shortcuts (Ctrl+S to save)

---

### Calculator

A fully-functional calculator with standard arithmetic operations.

**Features:**
- Addition, subtraction, multiplication, division
- Decimal point support
- Clear and backspace functions
- Keyboard input support

**Usage:**
- Click buttons or use keyboard
- Press `Enter` or `=` to calculate
- Press `Escape` or `C` to clear

---

### Paint

A drawing application inspired by MS Paint with file system support.

**Features:**
- **Brush Tool** - Free-hand drawing
- **Eraser Tool** - Remove drawn content
- **Bucket Fill** - Fill areas with color
- **Color Palette** - 16 preset colors + custom color picker
- **Brush Size** - Adjustable from 1-12 pixels
- **Status Bar** - Real-time cursor coordinates and tool info
- **Resizable Canvas** - Canvas expands when window is resized
- **File Operations** - Open, Save, Save As for PNG images

**Usage:**
1. Select a tool from the toolbar
2. Choose a color from the palette
3. Adjust brush size if needed
4. Draw on the canvas
5. Save to file system or start new

---

### Terminal

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

---

### Snake

The classic snake game where you collect food to grow longer.

**Controls:**
- Arrow Keys or WASD to move
- Avoid walls and your own tail
- Collect food (red squares) to grow

**Features:**
- Score tracking
- Persistent high score
- Increasing difficulty (snake speeds up)

---

### Minesweeper

The beloved puzzle game of logic and luck.

**Controls:**
- Left-click to reveal a cell
- Right-click to flag/unflag a mine
- Click the face button to restart

**Features:**
- 9x9 grid with 10 mines
- First-click safety (never hit a mine first)
- Timer and mine counter
- Chording support (click number with correct flags)

---

### Asteroids

Classic arcade space shooter action.

**Controls:**
- Arrow Keys - Rotate and thrust
- Spacebar - Fire laser

**Features:**
- Physics-based movement
- Asteroid fragmentation
- Score and lives tracking
- 60 FPS smooth gameplay

---

### Solitaire

Klondike solitaire card game.

**Rules:**
- Move cards between 7 tableau columns
- Build foundations (Ace to King) by suit
- Alternate colors when stacking on tableau
- Draw from stock pile when stuck

**Features:**
- Drag-and-drop card movement
- Auto-detect valid moves
- Move counter and timer
- Win detection

---

### DOOM

The legendary 1993 first-person shooter running via WebAssembly.

**Features:**
- Full DOOM gameplay via Chocolate Doom
- Browser-based WebAssembly port
- Original game experience

---

## System Dialogs

RetrOS features authentic Windows 95-style dialog boxes that replace browser modals.

### Run Dialog
- Open with **Ctrl+R** or from Start Menu
- Type application names (notepad, calc, cmd, paint, etc.)
- Enter URLs to open in browser
- Click Browse to open My Computer

### Shutdown Dialog
- Access from Start Menu → Shut Down
- **Shut down** - Shows "It's now safe to turn off your computer"
- **Restart** - Reloads the page
- **Log off** - Clears session and shows welcome

### File Dialogs
- Windows 95-style Open and Save As dialogs
- Browse virtual file system
- Navigate folders, create new folders
- Filter by file type

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

## Achievement System

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

---

## Clippy Assistant

The iconic Microsoft Office Assistant makes an appearance! Clippy randomly spawns (50% chance) when you boot up and offers "helpful" advice.

**Clippy's Personality:**
- Offers random tips and commentary
- Becomes progressively annoyed if dismissed repeatedly
- Eventually gives up entirely if you keep dismissing him

---

## Desktop Pet

An animated companion that walks across your desktop.

**Activation:**
- Enter the Konami Code, or
- Enable via Control Panel → Desktop Pet

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

---

## Architecture

### Project Structure

```
RetrOS/
├── index.html              # Main entry point
├── index.js                # Application bootstrap
├── styles.css              # Windows 95 styling (1000+ lines)
├── README.md               # This file
│
├── apps/                   # Application implementations
│   ├── AppBase.js          # Base class for all apps
│   ├── AppRegistry.js      # Central app registry & launcher
│   ├── Calculator.js       # Calculator application
│   ├── Notepad.js          # Text editor with file system
│   ├── Terminal.js         # MS-DOS terminal
│   ├── Paint.js            # Paint with file system
│   ├── Snake.js            # Snake game
│   ├── Minesweeper.js      # Minesweeper game
│   ├── Asteroids.js        # Asteroids game
│   ├── Solitaire.js        # Solitaire card game
│   ├── Doom.js             # DOOM WebAssembly wrapper
│   ├── MediaPlayer.js      # Media player
│   ├── Browser.js          # Internet Explorer browser
│   ├── MyComputer.js       # File explorer
│   ├── RecycleBin.js       # Deleted items manager
│   ├── ControlPanel.js     # System settings
│   └── AdminPanel.js       # Admin tools
│
├── core/                   # Core system modules
│   ├── EventBus.js         # Pub/sub event system
│   ├── StateManager.js     # Centralized state management
│   ├── WindowManager.js    # Window lifecycle & operations
│   ├── StorageManager.js   # LocalStorage abstraction
│   └── FileSystemManager.js # Virtual file system
│
├── features/               # Feature modules
│   ├── ClippyAssistant.js  # Clippy helper
│   ├── DesktopPet.js       # Desktop pet companion
│   ├── Screensaver.js      # Screensaver module
│   ├── EasterEggs.js       # Hidden triggers
│   ├── AchievementSystem.js # Achievement tracking
│   ├── SoundSystem.js      # Web Audio sound effects
│   └── SystemDialogs.js    # Windows 95-style dialogs
│
└── ui/                     # UI rendering components
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
// Consistent app interface
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
| `smos_notepadContent` | Notepad saved content |
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

Or use Control Panel → Advanced → Reset

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

### Adding New Applications

1. Create a new file in `/apps/`:

```javascript
// apps/MyApp.js
import AppBase from './AppBase.js';

class MyApp extends AppBase {
    constructor() {
        super({
            id: 'myapp',
            title: 'My Application',
            icon: '🎯',
            width: 400,
            height: 300,
            resizable: true
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

### Adding Desktop Icons

Modify the `defaultIcons` array in `StateManager.js`:

```javascript
{
    id: 'myapp',
    label: 'My App',
    emoji: '🎯',
    x: 20,
    y: 300,
    type: 'app'
}
```

Or use the Admin Panel to add icons through the GUI.

---

## Credits

- **Design Inspiration:** Microsoft Windows 95
- **DOOM Port:** Chocolate Doom WebAssembly
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
