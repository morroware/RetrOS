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

RetrOS is a fully-functional Windows 95 desktop environment simulator built entirely with vanilla JavaScript, HTML5, and CSS3. Experience the nostalgic computing era of the mid-1990s right in your web browser, complete with draggable windows, classic applications, retro games, and plenty of hidden surprises.

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

### Productivity Applications
- **Notepad** - Text editor with save/load functionality and file export
- **Calculator** - Full arithmetic operations with keyboard support
- **Paint** - Drawing application with brush, eraser, and bucket fill tools
- **Terminal** - MS-DOS style command line with extensive command set

### Classic Games
- **Snake** - The timeless arcade game with high score tracking
- **Minesweeper** - Complete implementation with timer and mine counter
- **Asteroids** - Space shooter with smooth physics and particle effects
- **Solitaire** - Klondike card game with drag-and-drop
- **DOOM** - Classic 1993 FPS via WebAssembly (Chocolate Doom)

### Special Features
- **Clippy Assistant** - The iconic paperclip helper with personality
- **Desktop Pet** - Animated companion that walks across your screen
- **Screensaver** - Activates after 5 minutes of inactivity
- **Achievement System** - Unlock achievements for various actions
- **Easter Eggs** - Hidden features waiting to be discovered

### Technical Features
- **Zero Dependencies** - 100% vanilla JavaScript
- **LocalStorage Persistence** - Your settings, files, and high scores are saved
- **Web Audio API** - Synthesized sound effects
- **Responsive Design** - Works in modern browsers
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

---

## Usage

### Boot Sequence

When you first load RetrOS, you'll experience an authentic boot sequence:
1. BIOS-style startup screen
2. Loading bar animation
3. "Starting Windows 95..." message
4. Desktop loads with icons

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
| `Ctrl+S` | Notepad | Save file |
| `0-9`, `+-*/` | Calculator | Input |
| `Enter` | Calculator | Calculate |
| `Escape` | Calculator | Clear |
| `Arrow Keys` | Snake | Move snake |
| `WASD` | Snake | Move snake (alt) |
| `Arrow Keys` | Terminal | Command history |

---

## Applications

### Notepad

A simple text editor for creating and editing text files.

**Features:**
- Create and edit text documents
- Save to browser storage (persists between sessions)
- Download as `.txt` file
- Keyboard shortcuts (Ctrl+S to save)

**Usage:**
1. Launch from desktop or Start Menu → Programs → Notepad
2. Type your content
3. Click "Save" or press Ctrl+S
4. Use "Download" to export as a file

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

A drawing application inspired by MS Paint.

**Features:**
- **Brush Tool** - Free-hand drawing
- **Eraser Tool** - Remove drawn content
- **Bucket Fill** - Fill areas with color
- **Color Palette** - 16 preset colors + custom color picker
- **Brush Size** - Adjustable from 1-12 pixels
- **Status Bar** - Real-time cursor coordinates

**Usage:**
1. Select a tool from the toolbar
2. Choose a color from the palette
3. Adjust brush size if needed
4. Draw on the canvas

---

### Terminal

An MS-DOS style command-line interface with an extensive command set.

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

**Advanced Commands:**

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

**Face Guide:**
| Face | Meaning |
|------|---------|
| 😀 | Playing |
| 😲 | Clicking |
| 😎 | Won! |
| 😵 | Lost |

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

**Usage:**
1. Launch DOOM from desktop or Start Menu
2. Click the window to start
3. Use standard DOOM controls

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

### Clock Easter Egg

Click the taskbar clock **10 times** to trigger Disco Fever mode and unlock an achievement.

### Clippy Annoyance

Dismiss Clippy **5 times** to unlock the "Clippy Hater" achievement.

---

## Achievement System

Unlock achievements by performing various actions:

| Achievement | How to Unlock |
|-------------|---------------|
| 🏆 **First Boot** | Launch RetrOS for the first time |
| 🏆 **Konami Master** | Enter the Konami Code |
| 🏆 **Disco Fever** | Click the clock 10 times |
| 🏆 **Multitasker** | Open 10+ windows simultaneously |
| 🏆 **Clippy Hater** | Dismiss Clippy 5 times |
| 🏆 **Neo** | Enter Matrix mode in Terminal |

Achievements persist between sessions and display as toast notifications when unlocked.

---

## Clippy Assistant

The iconic Microsoft Office Assistant makes an appearance! Clippy randomly spawns (50% chance) when you boot up and offers "helpful" advice.

**Clippy's Personality:**
- Offers random tips and commentary
- Becomes progressively annoyed if dismissed repeatedly
- Eventually gives up entirely if you keep dismissing him

**Messages include:**
- "It looks like you're trying to use a computer. Need help?"
- "Did you know? The 'Any' key doesn't actually exist!"
- "Have you tried turning it off and on again?"
- And many more...

---

## Desktop Pet

An animated companion that walks across your desktop.

**Activation:**
- Enter the Konami Code, or
- Enable via Settings (after unlocking)

**Available Pets:**
| Pet | Emoji |
|-----|-------|
| Dog | 🐕 |
| Cat | 🐱 |
| Duck | 🦆 |
| Turtle | 🐢 |
| Rabbit | 🐰 |
| Fox | 🦊 |
| Frog | 🐸 |
| Penguin | 🐧 |

**Features:**
- Walks continuously across the screen
- Click for random fortune cookie messages
- Customizable in settings

---

## Architecture

### Project Structure

```
RetrOS/
├── index.html              # Main entry point
├── styles.css              # Windows 95 styling (1000+ lines)
├── README.md               # This file
│
├── apps/                   # Application implementations
│   ├── AppBase.js          # Base class for all apps
│   ├── AppRegistry.js      # Central app registry & launcher
│   ├── Calculator.js       # Calculator application
│   ├── Notepad.js          # Text editor
│   ├── Terminal.js         # MS-DOS terminal (60KB)
│   ├── Paint.js            # Paint application
│   ├── Snake.js            # Snake game
│   ├── Minesweeper.js      # Minesweeper game
│   ├── Asteroids.js        # Asteroids game
│   ├── Solitaire.js        # Solitaire card game
│   ├── Doom.js             # DOOM WebAssembly wrapper
│   ├── MediaPlayer.js      # Media player placeholder
│   └── SystemApps.js       # System utility stubs
│
├── core/                   # Core system modules
│   ├── EventBus.js         # Pub/sub event system
│   ├── StateManager.js     # Centralized state management
│   ├── WindowManager.js    # Window lifecycle & operations
│   └── StorageManager.js   # LocalStorage abstraction
│
├── features/               # Feature modules
│   ├── ClippyAssistant.js  # Clippy helper
│   ├── DesktopPet.js       # Desktop pet companion
│   ├── Screensaver.js      # Screensaver module
│   ├── EasterEggs.js       # Hidden triggers
│   ├── AchievementSystem.js # Achievement tracking
│   └── SoundSystem.js      # Web Audio sound effects
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

Settings are stored in localStorage and can be modified:

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

---

## Browser Compatibility

### Tested Browsers

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome 90+ | ✅ Full Support | Recommended |
| Firefox 88+ | ✅ Full Support | |
| Safari 14+ | ✅ Full Support | |
| Edge 90+ | ✅ Full Support | |
| Opera 76+ | ✅ Full Support | |
| IE 11 | ❌ Not Supported | Use Edge |

### Required Features

- ES6 Modules (`<script type="module">`)
- CSS Custom Properties (CSS Variables)
- LocalStorage API
- Canvas 2D Context
- Web Audio API (for sounds)
- Pointer Events

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

export default new MyApp();
```

2. Register in `AppRegistry.js`:

```javascript
import MyApp from './MyApp.js';
AppRegistry.register(MyApp, {
    category: 'accessories',
    description: 'My custom application'
});
```

### Adding Desktop Icons

Modify the `defaultIcons` array in `StateManager.js`:

```javascript
{
    id: 'myapp',
    title: 'My App',
    icon: '🎯',
    x: 20,
    y: 300,
    action: () => AppRegistry.launch('myapp')
}
```

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
