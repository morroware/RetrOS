# Scripted Events System - Comprehensive Implementation Plan

## Overview

A **fully scriptable OS** where every app, feature, system component, and UI interaction emits semantic events. This enables puzzle games, tutorials, guided experiences, and automated testing across the entire RetrOS platform.

**Design Principles:**
1. **Everything Emits Events** - Every user action and state change is observable
2. **Easily Extensible** - Simple patterns for adding new events to any component
3. **Plugin-Friendly** - Third-party plugins integrate seamlessly
4. **Non-Breaking** - Events are additive; existing functionality unchanged
5. **Self-Documenting** - Event names describe what happened

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SCENARIO LAYER                                │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ ScenarioManager │──│ TriggerEngine│──│  ConditionEvaluator    │  │
│  │   (Orchestrator)│  │(Event Matcher)│  │   (Rule Checker)       │  │
│  └────────┬────────┘  └──────────────┘  └────────────────────────┘  │
│           │                                                          │
│  ┌────────▼────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ ActionExecutor  │  │ScenarioLoader│  │   ScenarioPlayer App   │  │
│  │(Effect Performer)│  │ (JSON Parser)│  │    (UI for users)      │  │
│  └─────────────────┘  └──────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │         EVENT BUS           │
                    │   (Central Message Hub)     │
                    │    ~150+ Semantic Events    │
                    └──────────────┬──────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
┌───────▼───────┐  ┌───────────────▼───────────────┐  ┌───────▼───────┐
│   32 APPS     │  │      7 FEATURES              │  │  CORE SYSTEMS │
│ (Games, Utils,│  │ (Achievements, Sound,        │  │ (Windows, FS, │
│  Specialized) │  │  Clippy, Pet, etc.)          │  │  State, UI)   │
└───────────────┘  └───────────────────────────────┘  └───────────────┘
```

---

## File Structure

```
/home/user/RetrOS/
├── core/
│   └── scripted-events/
│       ├── ScenarioManager.js       # Main orchestrator (FeatureBase)
│       ├── TriggerEngine.js         # Event subscription & matching
│       ├── ActionExecutor.js        # Action execution with 25+ types
│       ├── ConditionEvaluator.js    # Condition logic (AND/OR/NOT)
│       ├── ScenarioLoader.js        # JSON parsing & validation
│       ├── SemanticEvents.js        # 150+ event constants (THE SOURCE OF TRUTH)
│       ├── EventEmitterMixin.js     # Mixin for easy event emission
│       └── index.js                 # Barrel export
│
├── scenarios/
│   ├── schema.json                  # JSON Schema for validation
│   ├── tutorial.scenario.json       # First-time user tutorial
│   ├── cipher-hunt.scenario.json    # Puzzle game example
│   └── custom/                      # User-created scenarios
│
├── apps/
│   └── ScenarioPlayer.js            # Scenario browser & launcher
│
└── docs/
    ├── SCENARIO_AUTHORING.md        # How to write scenarios
    ├── EVENT_CATALOG.md             # Complete event reference
    └── ADDING_EVENTS.md             # How to add events to new components
```

---

## The Event Emitter Pattern

Every component uses a consistent pattern for emitting events:

```javascript
// In any app (AppBase provides this.emit())
this.emit('notepad:saved', {
    path: filePath,
    content: content,
    wordCount: content.split(/\s+/).length
});

// In any feature (FeatureBase provides this.emit())
this.emit('pet:action', {
    action: 'sleeping',
    position: { x: 100, y: 200 }
});

// In core systems (use EventBus directly)
import EventBus from './EventBus.js';
EventBus.emit('file:created', { path, content });
```

### Adding Events to Any Component (The Pattern)

```javascript
// 1. Import the semantic events
import { Events } from '../core/scripted-events/SemanticEvents.js';

// 2. Emit at the right moment
this.emit(Events.NOTEPAD_SAVED, { path, content });

// That's it! The event is now scriptable.
```

---

# COMPLETE EVENT CATALOG

## 1. GAME APPS (9 apps, ~45 events)

### Minesweeper
| Event | Data | When |
|-------|------|------|
| `minesweeper:started` | `{ difficulty, rows, cols, mines }` | New game begins |
| `minesweeper:cell:revealed` | `{ row, col, value, isFirstClick }` | Cell uncovered |
| `minesweeper:cell:flagged` | `{ row, col, flagged }` | Flag placed/removed |
| `minesweeper:cell:questioned` | `{ row, col }` | Question mark placed |
| `minesweeper:chord` | `{ row, col, cellsRevealed }` | Chord action performed |
| `minesweeper:win` | `{ time, difficulty, flagsUsed }` | Game won |
| `minesweeper:lose` | `{ time, row, col }` | Mine clicked |
| `minesweeper:timer:tick` | `{ time }` | Each second (for time puzzles) |
| `game:win` | `{ appId: 'minesweeper', ... }` | Generic game win |
| `game:lose` | `{ appId: 'minesweeper', ... }` | Generic game lose |

### Snake
| Event | Data | When |
|-------|------|------|
| `snake:started` | `{ difficulty }` | Game begins |
| `snake:moved` | `{ direction, position, length }` | Snake moves |
| `snake:ate` | `{ position, newLength, score }` | Food eaten |
| `snake:grew` | `{ length }` | Snake grows |
| `snake:collided` | `{ type: 'wall'|'self', position }` | Collision detected |
| `snake:win` | `{ score, length, time }` | Win condition met |
| `snake:lose` | `{ score, length, reason }` | Game over |
| `snake:direction:changed` | `{ from, to }` | Direction change |
| `game:win` | `{ appId: 'snake', score }` | Generic win |
| `game:lose` | `{ appId: 'snake', score }` | Generic lose |

### Asteroids
| Event | Data | When |
|-------|------|------|
| `asteroids:started` | `{ level }` | Game/level begins |
| `asteroids:ship:rotated` | `{ angle }` | Ship rotates |
| `asteroids:ship:thrusted` | `{ velocity }` | Thrust applied |
| `asteroids:ship:fired` | `{ position, angle }` | Bullet fired |
| `asteroids:asteroid:destroyed` | `{ size, position, score }` | Asteroid hit |
| `asteroids:asteroid:split` | `{ fromSize, toSize }` | Large asteroid splits |
| `asteroids:ufo:spawned` | `{ type: 'large'|'small' }` | UFO appears |
| `asteroids:ufo:destroyed` | `{ type, score }` | UFO destroyed |
| `asteroids:ship:destroyed` | `{ lives }` | Ship hit |
| `asteroids:level:complete` | `{ level, score }` | All asteroids cleared |
| `asteroids:extralife` | `{ lives, score }` | Extra life earned |
| `asteroids:win` | `{ finalScore, level }` | Game won (if applicable) |
| `asteroids:lose` | `{ finalScore, level }` | All lives lost |
| `game:win` | `{ appId: 'asteroids', score }` | Generic win |
| `game:lose` | `{ appId: 'asteroids', score }` | Generic lose |

### Solitaire (Klondike)
| Event | Data | When |
|-------|------|------|
| `solitaire:started` | `{ drawCount: 1|3 }` | New game |
| `solitaire:card:moved` | `{ card, from, to }` | Card moved |
| `solitaire:card:flipped` | `{ card, pile }` | Card revealed |
| `solitaire:foundation:added` | `{ card, suit, count }` | Card to foundation |
| `solitaire:stock:drawn` | `{ cardsDrawn }` | Stock pile drawn |
| `solitaire:stock:recycled` | `{ recycleCount }` | Stock pile reset |
| `solitaire:invalid:move` | `{ card, from, to, reason }` | Invalid move attempted |
| `solitaire:win` | `{ time, moves, score }` | All cards in foundations |
| `solitaire:hint:used` | `{ hintNumber }` | Hint requested |
| `game:win` | `{ appId: 'solitaire', moves, time }` | Generic win |

### FreeCell
| Event | Data | When |
|-------|------|------|
| `freecell:started` | `{ seed }` | New game |
| `freecell:card:moved` | `{ card, from, to }` | Card moved |
| `freecell:freecell:used` | `{ card, cellIndex }` | Free cell used |
| `freecell:freecell:emptied` | `{ cellIndex }` | Free cell emptied |
| `freecell:foundation:added` | `{ card, suit }` | Card to foundation |
| `freecell:invalid:move` | `{ card, reason }` | Invalid move |
| `freecell:win` | `{ moves, time }` | Game won |
| `freecell:stuck` | `{ availableMoves: 0 }` | No moves available |
| `game:win` | `{ appId: 'freecell', moves }` | Generic win |

### SkiFree
| Event | Data | When |
|-------|------|------|
| `skifree:started` | `{}` | Run begins |
| `skifree:turned` | `{ direction }` | Skier turns |
| `skifree:jumped` | `{ height }` | Skier jumps |
| `skifree:trick` | `{ type, points }` | Trick performed |
| `skifree:obstacle:hit` | `{ type: 'tree'|'rock'|'snowman' }` | Obstacle collision |
| `skifree:ramp:hit` | `{ airTime }` | Ramp jump |
| `skifree:monster:spawned` | `{ distance }` | Monster appears |
| `skifree:monster:caught` | `{}` | Monster catches player |
| `skifree:monster:escaped` | `{}` | Outran the monster |
| `skifree:distance` | `{ meters }` | Distance milestone |
| `skifree:finished` | `{ distance, time }` | Reached finish |
| `game:win` | `{ appId: 'skifree', distance }` | Escaped monster/finished |
| `game:lose` | `{ appId: 'skifree', distance }` | Caught by monster |

### Zork (Text Adventure)
| Event | Data | When |
|-------|------|------|
| `zork:started` | `{ savedGame: boolean }` | Adventure begins |
| `zork:command` | `{ command, args, raw }` | Command entered |
| `zork:room:entered` | `{ room, from, description }` | Moved to new room |
| `zork:room:looked` | `{ room, objects }` | Looked at room |
| `zork:item:taken` | `{ item, from }` | Item picked up |
| `zork:item:dropped` | `{ item, in: room }` | Item dropped |
| `zork:item:used` | `{ item, on, result }` | Item used |
| `zork:item:examined` | `{ item, description }` | Item examined |
| `zork:container:opened` | `{ container, contents }` | Container opened |
| `zork:npc:encountered` | `{ npc, hostile }` | NPC found |
| `zork:npc:attacked` | `{ npc, weapon, result }` | Combat |
| `zork:npc:defeated` | `{ npc }` | Enemy killed |
| `zork:player:died` | `{ cause }` | Player death |
| `zork:score:changed` | `{ score, delta, reason }` | Score changed |
| `zork:lantern:lit` | `{ remaining }` | Lantern turned on |
| `zork:lantern:dimming` | `{ remaining }` | Lantern low |
| `zork:lantern:died` | `{}` | Lantern out |
| `zork:dark:entered` | `{ room }` | Entered dark room |
| `zork:secret:found` | `{ secret }` | Secret discovered |
| `zork:win` | `{ score, moves, treasures }` | Game completed |
| `game:win` | `{ appId: 'zork', score }` | Generic win |

### Paint
| Event | Data | When |
|-------|------|------|
| `paint:started` | `{ width, height }` | New canvas |
| `paint:tool:selected` | `{ tool, previous }` | Tool changed |
| `paint:color:selected` | `{ color, type: 'primary'|'secondary' }` | Color picked |
| `paint:brush:resized` | `{ size }` | Brush size changed |
| `paint:stroke:started` | `{ tool, position }` | Drawing started |
| `paint:stroke:ended` | `{ tool, from, to }` | Drawing ended |
| `paint:shape:drawn` | `{ shape, bounds }` | Shape completed |
| `paint:text:added` | `{ text, position, font }` | Text inserted |
| `paint:fill:applied` | `{ position, color }` | Flood fill |
| `paint:selection:made` | `{ bounds }` | Area selected |
| `paint:clipboard:copied` | `{ bounds }` | Selection copied |
| `paint:clipboard:pasted` | `{ position }` | Paste action |
| `paint:canvas:cleared` | `{}` | Canvas cleared |
| `paint:undo` | `{ action }` | Undo performed |
| `paint:redo` | `{ action }` | Redo performed |
| `paint:saved` | `{ path, format }` | Image saved |
| `paint:opened` | `{ path }` | Image opened |

### Doom
| Event | Data | When |
|-------|------|------|
| `doom:started` | `{}` | Game launched |
| `doom:focused` | `{}` | Game focused |
| `doom:blurred` | `{}` | Game unfocused |
| `doom:fullscreen:entered` | `{}` | Fullscreen mode |
| `doom:fullscreen:exited` | `{}` | Windowed mode |

---

## 2. UTILITY APPS (15 apps, ~75 events)

### Notepad
| Event | Data | When |
|-------|------|------|
| `notepad:opened` | `{ path?, content? }` | Notepad opened |
| `notepad:typed` | `{ content, length, wordCount }` | Text changed (debounced) |
| `notepad:content:matched` | `{ pattern, matched: boolean }` | Content matches pattern |
| `notepad:word:typed` | `{ word }` | Complete word typed |
| `notepad:line:added` | `{ lineNumber, content }` | New line added |
| `notepad:saved` | `{ path, content, wordCount }` | File saved |
| `notepad:save:failed` | `{ path, error }` | Save failed |
| `notepad:file:opened` | `{ path, content }` | File loaded |
| `notepad:file:new` | `{}` | New file created |
| `notepad:cleared` | `{}` | Content cleared |
| `notepad:find` | `{ query, found, count }` | Find performed |
| `notepad:replace` | `{ find, replace, count }` | Replace performed |
| `notepad:print` | `{ content }` | Print requested |
| `notepad:wordwrap:toggled` | `{ enabled }` | Word wrap changed |
| `notepad:font:changed` | `{ font, size }` | Font changed |

### Calculator
| Event | Data | When |
|-------|------|------|
| `calculator:opened` | `{}` | Calculator opened |
| `calculator:digit:pressed` | `{ digit, display }` | Number entered |
| `calculator:operator:pressed` | `{ operator, operand }` | Operator pressed |
| `calculator:equals` | `{ expression, result }` | Equals pressed |
| `calculator:result` | `{ value }` | Calculation complete |
| `calculator:cleared` | `{ type: 'C'|'CE' }` | Cleared |
| `calculator:memory:stored` | `{ value }` | Memory store |
| `calculator:memory:recalled` | `{ value }` | Memory recall |
| `calculator:memory:cleared` | `{}` | Memory clear |
| `calculator:memory:added` | `{ value }` | Memory add |
| `calculator:error` | `{ type: 'divide_by_zero'|'overflow' }` | Error occurred |
| `calculator:mode:changed` | `{ mode: 'standard'|'scientific' }` | Mode change |

### Terminal
| Event | Data | When |
|-------|------|------|
| `terminal:opened` | `{ cwd }` | Terminal opened |
| `terminal:command` | `{ command, args, fullCommand, cwd }` | Command executed |
| `terminal:command:success` | `{ command, output }` | Command succeeded |
| `terminal:command:failed` | `{ command, error }` | Command failed |
| `terminal:cd` | `{ from, to }` | Directory changed |
| `terminal:ls` | `{ path, files, directories }` | Listed directory |
| `terminal:cat` | `{ path, content }` | File displayed |
| `terminal:mkdir` | `{ path }` | Directory created |
| `terminal:rm` | `{ path, type }` | Item deleted |
| `terminal:touch` | `{ path }` | File created |
| `terminal:echo` | `{ text }` | Echo output |
| `terminal:clear` | `{}` | Screen cleared |
| `terminal:help` | `{ command? }` | Help displayed |
| `terminal:history:navigated` | `{ index, command }` | History arrow used |
| `terminal:tab:completed` | `{ partial, completed }` | Tab completion |
| `terminal:secret:command` | `{ command }` | Easter egg command |
| `terminal:output` | `{ text }` | Any output printed |
| `terminal:prompt:shown` | `{ cwd }` | Prompt displayed |

### Browser
| Event | Data | When |
|-------|------|------|
| `browser:opened` | `{ url? }` | Browser opened |
| `browser:navigate` | `{ url, from }` | Navigation started |
| `browser:loaded` | `{ url, title }` | Page loaded |
| `browser:failed` | `{ url, error }` | Load failed |
| `browser:back` | `{ from, to }` | Back button |
| `browser:forward` | `{ from, to }` | Forward button |
| `browser:refresh` | `{ url }` | Refresh clicked |
| `browser:home` | `{}` | Home button |
| `browser:bookmark:added` | `{ url, title }` | Bookmark added |
| `browser:bookmark:removed` | `{ url }` | Bookmark removed |
| `browser:url:typed` | `{ url }` | URL entered |
| `browser:search` | `{ query }` | Search performed |

### MediaPlayer
| Event | Data | When |
|-------|------|------|
| `mediaplayer:opened` | `{}` | Player opened |
| `mediaplayer:file:loaded` | `{ path, title, duration }` | File loaded |
| `mediaplayer:play` | `{ track, position }` | Playback started |
| `mediaplayer:pause` | `{ track, position }` | Playback paused |
| `mediaplayer:stop` | `{ track }` | Playback stopped |
| `mediaplayer:seek` | `{ from, to }` | Position changed |
| `mediaplayer:volume:changed` | `{ volume, muted }` | Volume adjusted |
| `mediaplayer:track:ended` | `{ track }` | Track finished |
| `mediaplayer:track:next` | `{ from, to }` | Next track |
| `mediaplayer:track:previous` | `{ from, to }` | Previous track |
| `mediaplayer:playlist:loaded` | `{ tracks }` | Playlist loaded |
| `mediaplayer:playlist:shuffled` | `{}` | Shuffle toggled |
| `mediaplayer:repeat:changed` | `{ mode: 'off'|'one'|'all' }` | Repeat mode |
| `mediaplayer:visualizer:changed` | `{ type }` | Visualizer changed |

### Winamp
| Event | Data | When |
|-------|------|------|
| `winamp:opened` | `{}` | Winamp opened |
| `winamp:play` | `{ track }` | Play pressed |
| `winamp:pause` | `{}` | Pause pressed |
| `winamp:stop` | `{}` | Stop pressed |
| `winamp:next` | `{}` | Next track |
| `winamp:previous` | `{}` | Previous track |
| `winamp:volume:changed` | `{ volume }` | Volume adjusted |
| `winamp:balance:changed` | `{ balance }` | Balance adjusted |
| `winamp:eq:changed` | `{ band, value }` | Equalizer adjusted |
| `winamp:eq:toggled` | `{ enabled }` | EQ on/off |
| `winamp:playlist:toggled` | `{ visible }` | Playlist window |
| `winamp:skin:changed` | `{ skin }` | Skin changed |
| `winamp:track:loaded` | `{ path, info }` | Track loaded |

### Calendar
| Event | Data | When |
|-------|------|------|
| `calendar:opened` | `{ date }` | Calendar opened |
| `calendar:date:selected` | `{ date }` | Date clicked |
| `calendar:month:changed` | `{ month, year }` | Month navigated |
| `calendar:year:changed` | `{ year }` | Year changed |
| `calendar:event:created` | `{ date, title, details }` | Event added |
| `calendar:event:deleted` | `{ date, eventId }` | Event removed |
| `calendar:event:clicked` | `{ date, event }` | Event selected |
| `calendar:today:clicked` | `{}` | Today button |
| `calendar:view:changed` | `{ view: 'month'|'week'|'day' }` | View mode |

### Clock
| Event | Data | When |
|-------|------|------|
| `clock:opened` | `{}` | Clock opened |
| `clock:format:changed` | `{ format: '12h'|'24h' }` | Format toggled |
| `clock:clicked` | `{ clickCount }` | Clock clicked |
| `clock:alarm:set` | `{ time }` | Alarm created |
| `clock:alarm:triggered` | `{ time }` | Alarm went off |
| `clock:alarm:dismissed` | `{}` | Alarm dismissed |
| `clock:time:checked` | `{ time }` | Time viewed |

### FileExplorer / MyComputer
| Event | Data | When |
|-------|------|------|
| `explorer:opened` | `{ path }` | Explorer opened |
| `explorer:navigated` | `{ from, to }` | Folder opened |
| `explorer:file:selected` | `{ path, type }` | File selected |
| `explorer:file:opened` | `{ path, type }` | File double-clicked |
| `explorer:file:created` | `{ path, type }` | New file/folder |
| `explorer:file:deleted` | `{ path }` | File deleted |
| `explorer:file:renamed` | `{ from, to }` | File renamed |
| `explorer:file:copied` | `{ from, to }` | File copied |
| `explorer:file:moved` | `{ from, to }` | File moved |
| `explorer:file:cut` | `{ path }` | Cut to clipboard |
| `explorer:file:pasted` | `{ path }` | Paste from clipboard |
| `explorer:view:changed` | `{ view: 'icons'|'list'|'details' }` | View mode |
| `explorer:sort:changed` | `{ by, order }` | Sort changed |
| `explorer:refresh` | `{ path }` | View refreshed |
| `explorer:back` | `{ to }` | Back navigation |
| `explorer:forward` | `{ to }` | Forward navigation |
| `explorer:up` | `{ to }` | Parent folder |

### TaskManager
| Event | Data | When |
|-------|------|------|
| `taskmanager:opened` | `{}` | Task Manager opened |
| `taskmanager:process:selected` | `{ processId, name }` | Process selected |
| `taskmanager:process:killed` | `{ processId, name }` | End task clicked |
| `taskmanager:tab:changed` | `{ tab }` | Tab switched |
| `taskmanager:refresh` | `{}` | List refreshed |
| `taskmanager:priority:changed` | `{ processId, priority }` | Priority changed |

### RecycleBin
| Event | Data | When |
|-------|------|------|
| `recyclebin:opened` | `{ itemCount }` | Bin opened |
| `recyclebin:item:selected` | `{ item }` | Item selected |
| `recyclebin:item:restored` | `{ item, to }` | Item restored |
| `recyclebin:item:deleted` | `{ item }` | Permanently deleted |
| `recyclebin:emptied` | `{ itemCount }` | Bin emptied |
| `recyclebin:item:received` | `{ item, from }` | Item added to bin |

### FindFiles
| Event | Data | When |
|-------|------|------|
| `findfiles:opened` | `{}` | Find opened |
| `findfiles:search:started` | `{ query, path, options }` | Search began |
| `findfiles:search:completed` | `{ query, results, count }` | Search finished |
| `findfiles:result:selected` | `{ path }` | Result clicked |
| `findfiles:result:opened` | `{ path }` | Result double-clicked |
| `findfiles:filter:changed` | `{ filter }` | Filter applied |

### Defrag
| Event | Data | When |
|-------|------|------|
| `defrag:opened` | `{}` | Defrag opened |
| `defrag:started` | `{ drive }` | Defrag started |
| `defrag:progress` | `{ percent, blocksProcessed }` | Progress update |
| `defrag:paused` | `{ percent }` | Defrag paused |
| `defrag:resumed` | `{ percent }` | Defrag resumed |
| `defrag:completed` | `{ drive, duration }` | Defrag finished |
| `defrag:cancelled` | `{ percent }` | Defrag cancelled |

### HelpSystem
| Event | Data | When |
|-------|------|------|
| `help:opened` | `{ topic? }` | Help opened |
| `help:topic:selected` | `{ topic }` | Topic clicked |
| `help:search` | `{ query, results }` | Search performed |
| `help:link:clicked` | `{ href }` | Link followed |
| `help:back` | `{}` | Back navigation |
| `help:home` | `{}` | Home clicked |

### ControlPanel
| Event | Data | When |
|-------|------|------|
| `controlpanel:opened` | `{}` | Control Panel opened |
| `controlpanel:applet:opened` | `{ applet }` | Applet launched |
| `controlpanel:setting:changed` | `{ category, key, value }` | Setting modified |

### DisplayProperties
| Event | Data | When |
|-------|------|------|
| `display:opened` | `{}` | Display Properties opened |
| `display:wallpaper:changed` | `{ wallpaper }` | Wallpaper selected |
| `display:wallpaper:applied` | `{ wallpaper }` | Wallpaper applied |
| `display:theme:changed` | `{ theme }` | Theme changed |
| `display:resolution:changed` | `{ width, height }` | Resolution changed |
| `display:colors:changed` | `{ depth }` | Color depth changed |
| `display:screensaver:changed` | `{ screensaver }` | Screensaver selected |

### ChatRoom
| Event | Data | When |
|-------|------|------|
| `chatroom:opened` | `{ room? }` | Chat opened |
| `chatroom:joined` | `{ room, username }` | Joined room |
| `chatroom:left` | `{ room }` | Left room |
| `chatroom:message:sent` | `{ message, room }` | Message sent |
| `chatroom:message:received` | `{ message, from, room }` | Message received |
| `chatroom:user:joined` | `{ username, room }` | User joined |
| `chatroom:user:left` | `{ username, room }` | User left |
| `chatroom:private:sent` | `{ message, to }` | Private message |
| `chatroom:private:received` | `{ message, from }` | Private received |
| `chatroom:emote` | `{ emote, username }` | Emote used |

### HyperCard
| Event | Data | When |
|-------|------|------|
| `hypercard:opened` | `{ stack? }` | HyperCard opened |
| `hypercard:stack:loaded` | `{ stack, cardCount }` | Stack loaded |
| `hypercard:stack:created` | `{ name }` | New stack |
| `hypercard:card:navigated` | `{ from, to }` | Card changed |
| `hypercard:card:created` | `{ cardId }` | New card |
| `hypercard:card:deleted` | `{ cardId }` | Card removed |
| `hypercard:button:clicked` | `{ buttonId, cardId }` | Button pressed |
| `hypercard:field:edited` | `{ fieldId, content }` | Field modified |
| `hypercard:link:followed` | `{ to }` | Link clicked |
| `hypercard:script:executed` | `{ script, result }` | Script ran |
| `hypercard:stack:saved` | `{ stack }` | Stack saved |

---

## 3. SYSTEM APPS (3 apps, ~15 events)

### FeaturesSettings
| Event | Data | When |
|-------|------|------|
| `features:opened` | `{}` | Settings opened |
| `features:feature:toggled` | `{ featureId, enabled }` | Feature toggled |
| `features:config:changed` | `{ featureId, key, value }` | Config changed |
| `features:reset` | `{ featureId }` | Feature reset |

### SoundSettings
| Event | Data | When |
|-------|------|------|
| `soundsettings:opened` | `{}` | Settings opened |
| `soundsettings:volume:changed` | `{ volume }` | Volume changed |
| `soundsettings:muted` | `{ muted }` | Mute toggled |
| `soundsettings:sound:toggled` | `{ soundId, enabled }` | Sound on/off |
| `soundsettings:test` | `{ soundId }` | Sound tested |

### AdminPanel
| Event | Data | When |
|-------|------|------|
| `admin:opened` | `{}` | Admin opened |
| `admin:action` | `{ action, params }` | Admin action |
| `admin:diagnostic:run` | `{ test }` | Diagnostic ran |
| `admin:export:state` | `{}` | State exported |
| `admin:import:state` | `{}` | State imported |
| `admin:reset:all` | `{}` | Factory reset |

---

## 4. FEATURES (7 features, ~40 events)

### AchievementSystem
| Event | Data | When |
|-------|------|------|
| `achievement:unlocked` | `{ id, name, description, icon }` | Achievement earned |
| `achievement:progress` | `{ id, current, total }` | Progress updated |
| `achievement:displayed` | `{ id }` | Toast shown |
| `achievement:dismissed` | `{ id }` | Toast dismissed |
| `achievement:viewed` | `{ id }` | Details viewed |
| `achievement:all:unlocked` | `{ count }` | All achievements earned |

### SoundSystem
| Event | Data | When |
|-------|------|------|
| `sound:played` | `{ type, volume }` | Sound effect played |
| `sound:failed` | `{ type, error }` | Sound failed |
| `audio:started` | `{ src, duration }` | Music started |
| `audio:ended` | `{ src }` | Music ended |
| `audio:paused` | `{ src, position }` | Music paused |
| `audio:resumed` | `{ src, position }` | Music resumed |
| `audio:volume:changed` | `{ volume }` | Volume changed |
| `audio:muted` | `{ muted }` | Mute toggled |
| `audio:error` | `{ src, error }` | Audio error |

### ClippyAssistant
| Event | Data | When |
|-------|------|------|
| `clippy:appeared` | `{ tip }` | Clippy shown |
| `clippy:dismissed` | `{ clickCount }` | Clippy hidden |
| `clippy:tip:shown` | `{ tip, category }` | Tip displayed |
| `clippy:tip:clicked` | `{ tip }` | Tip interacted |
| `clippy:existential` | `{ quote }` | Existential moment |
| `clippy:annoyed` | `{ level }` | User annoyed |
| `clippy:terminated` | `{}` | Killed 100 times |
| `clippy:toggled` | `{ enabled }` | Clippy on/off |

### DesktopPet
| Event | Data | When |
|-------|------|------|
| `pet:spawned` | `{ type, position }` | Pet appeared |
| `pet:action` | `{ action, position }` | Action changed |
| `pet:idle` | `{ duration }` | Became idle |
| `pet:walking` | `{ direction, position }` | Started walking |
| `pet:running` | `{ direction }` | Started running |
| `pet:sleeping` | `{}` | Fell asleep |
| `pet:woke` | `{}` | Woke up |
| `pet:jumped` | `{ height }` | Jumped |
| `pet:fell` | `{ from }` | Fell |
| `pet:dragged` | `{ from, to }` | Dragged by user |
| `pet:clicked` | `{ position }` | Pet clicked |
| `pet:doubleclicked` | `{}` | Pet double-clicked |
| `pet:fortune` | `{ fortune }` | Fortune shown |
| `pet:type:changed` | `{ from, to }` | Pet type changed |
| `pet:toggled` | `{ enabled }` | Pet on/off |

### Screensaver
| Event | Data | When |
|-------|------|------|
| `screensaver:started` | `{ type }` | Screensaver activated |
| `screensaver:ended` | `{ duration, type }` | Screensaver dismissed |
| `screensaver:type:changed` | `{ type }` | Screensaver changed |
| `screensaver:delay:changed` | `{ delay }` | Timeout changed |
| `screensaver:preview` | `{ type }` | Preview started |
| `screensaver:configured` | `{ type, config }` | Settings changed |
| `screensaver:idle:detected` | `{ idleTime }` | User went idle |
| `screensaver:activity:detected` | `{}` | User returned |

### EasterEggs
| Event | Data | When |
|-------|------|------|
| `easteregg:found` | `{ egg, method }` | Easter egg triggered |
| `easteregg:konami` | `{}` | Konami code entered |
| `easteregg:matrix` | `{}` | Matrix mode activated |
| `easteregg:disco` | `{ clickCount }` | Disco mode |
| `easteregg:secret:typed` | `{ secret }` | Secret word typed |
| `easteregg:all:found` | `{ count }` | All eggs discovered |

### FeatureRegistry
| Event | Data | When |
|-------|------|------|
| `feature:registered` | `{ featureId, name }` | Feature added |
| `feature:enabled` | `{ featureId }` | Feature enabled |
| `feature:disabled` | `{ featureId }` | Feature disabled |
| `feature:config:changed` | `{ featureId, config }` | Config updated |
| `feature:error` | `{ featureId, error }` | Feature error |

---

## 5. CORE SYSTEMS (~50 events)

### WindowManager
| Event | Data | When |
|-------|------|------|
| `window:created` | `{ windowId, appId, title }` | Window created |
| `window:opened` | `{ windowId, appId }` | Window shown |
| `window:closed` | `{ windowId, appId }` | Window closed |
| `window:focused` | `{ windowId, appId, previous }` | Window focused |
| `window:blurred` | `{ windowId, appId }` | Window lost focus |
| `window:minimized` | `{ windowId }` | Window minimized |
| `window:maximized` | `{ windowId }` | Window maximized |
| `window:restored` | `{ windowId, from }` | Window restored |
| `window:resized` | `{ windowId, width, height }` | Window resized |
| `window:moved` | `{ windowId, x, y }` | Window moved |
| `window:drag:started` | `{ windowId }` | Drag began |
| `window:drag:ended` | `{ windowId, x, y }` | Drag ended |
| `window:snapped` | `{ windowId, edge }` | Window snapped |
| `window:titlebar:clicked` | `{ windowId, button }` | Title button clicked |
| `window:z:changed` | `{ windowId, z }` | Z-index changed |

### FileSystemManager
| Event | Data | When |
|-------|------|------|
| `fs:file:created` | `{ path, content, extension }` | File created |
| `fs:file:written` | `{ path, content, size }` | File saved |
| `fs:file:read` | `{ path, content }` | File read |
| `fs:file:deleted` | `{ path }` | File deleted |
| `fs:file:renamed` | `{ from, to }` | File renamed |
| `fs:file:moved` | `{ from, to }` | File moved |
| `fs:file:copied` | `{ from, to }` | File copied |
| `fs:directory:created` | `{ path }` | Folder created |
| `fs:directory:deleted` | `{ path }` | Folder deleted |
| `fs:directory:listed` | `{ path, contents }` | Folder listed |
| `fs:error` | `{ operation, path, error }` | FS error |

### StateManager
| Event | Data | When |
|-------|------|------|
| `state:changed` | `{ path, value, oldValue }` | State changed |
| `state:persisted` | `{ key }` | State saved to storage |
| `state:loaded` | `{ key }` | State loaded from storage |
| `state:reset` | `{ path? }` | State reset |
| `state:icons:changed` | `{ icons }` | Desktop icons changed |
| `state:windows:changed` | `{ windows }` | Windows state changed |
| `state:settings:changed` | `{ key, value }` | Setting changed |

### AppRegistry
| Event | Data | When |
|-------|------|------|
| `app:registered` | `{ appId, name, category }` | App registered |
| `app:launched` | `{ appId, params }` | App launch started |
| `app:opened` | `{ appId, windowId }` | App window opened |
| `app:closed` | `{ appId, windowId }` | App window closed |
| `app:focused` | `{ appId }` | App received focus |
| `app:locked` | `{ appId }` | App locked |
| `app:unlocked` | `{ appId }` | App unlocked |
| `app:launch:failed` | `{ appId, error }` | Launch failed |
| `app:launch:blocked` | `{ appId, reason }` | Launch blocked |

### PluginLoader
| Event | Data | When |
|-------|------|------|
| `plugin:loading` | `{ pluginId }` | Plugin loading |
| `plugin:loaded` | `{ pluginId, features, apps }` | Plugin loaded |
| `plugin:failed` | `{ pluginId, error }` | Plugin failed |
| `plugin:unloaded` | `{ pluginId }` | Plugin unloaded |

---

## 6. UI COMPONENTS (~30 events)

### Desktop
| Event | Data | When |
|-------|------|------|
| `desktop:clicked` | `{ x, y, button }` | Desktop clicked |
| `desktop:rightclicked` | `{ x, y }` | Context menu shown |
| `desktop:icon:clicked` | `{ iconId, clicks }` | Icon clicked |
| `desktop:icon:doubleclicked` | `{ iconId }` | Icon opened |
| `desktop:icon:selected` | `{ iconId }` | Icon selected |
| `desktop:icon:deselected` | `{ iconId }` | Icon deselected |
| `desktop:icon:dragged` | `{ iconId, from, to }` | Icon moved |
| `desktop:icon:dropped` | `{ iconId, x, y }` | Icon placed |
| `desktop:icon:created` | `{ iconId, type }` | Icon added |
| `desktop:icon:deleted` | `{ iconId }` | Icon removed |
| `desktop:icon:renamed` | `{ iconId, from, to }` | Icon renamed |
| `desktop:selection:cleared` | `{}` | Selection cleared |
| `desktop:wallpaper:changed` | `{ wallpaper }` | Wallpaper changed |
| `desktop:arranged` | `{ by }` | Icons arranged |
| `desktop:refreshed` | `{}` | Desktop refreshed |

### Taskbar
| Event | Data | When |
|-------|------|------|
| `taskbar:button:clicked` | `{ windowId }` | Task button clicked |
| `taskbar:button:rightclicked` | `{ windowId }` | Task button right-click |
| `taskbar:start:clicked` | `{}` | Start button clicked |
| `taskbar:start:opened` | `{}` | Start menu opened |
| `taskbar:start:closed` | `{}` | Start menu closed |
| `taskbar:clock:clicked` | `{ clickCount }` | Clock clicked |
| `taskbar:tray:icon:clicked` | `{ iconId }` | Tray icon clicked |
| `taskbar:quicklaunch:clicked` | `{ appId }` | Quick launch used |

### StartMenu
| Event | Data | When |
|-------|------|------|
| `startmenu:opened` | `{}` | Menu opened |
| `startmenu:closed` | `{ reason }` | Menu closed |
| `startmenu:item:hovered` | `{ item }` | Item hovered |
| `startmenu:item:clicked` | `{ item, type }` | Item clicked |
| `startmenu:submenu:opened` | `{ menu }` | Submenu opened |
| `startmenu:programs:opened` | `{}` | Programs menu |
| `startmenu:shutdown:clicked` | `{}` | Shutdown clicked |
| `startmenu:run:clicked` | `{}` | Run clicked |
| `startmenu:find:clicked` | `{}` | Find clicked |

### ContextMenu
| Event | Data | When |
|-------|------|------|
| `contextmenu:opened` | `{ x, y, target }` | Menu opened |
| `contextmenu:closed` | `{}` | Menu closed |
| `contextmenu:item:clicked` | `{ action, target }` | Item selected |
| `contextmenu:item:hovered` | `{ action }` | Item hovered |

### System
| Event | Data | When |
|-------|------|------|
| `system:boot:started` | `{}` | Boot began |
| `system:boot:phase` | `{ phase, name }` | Boot phase |
| `system:boot:completed` | `{ duration }` | Boot finished |
| `system:shutdown:started` | `{}` | Shutdown began |
| `system:shutdown:completed` | `{}` | Shutdown finished |
| `system:idle:started` | `{ after }` | User went idle |
| `system:idle:ended` | `{ duration }` | User returned |
| `system:error` | `{ error, context }` | System error |
| `system:dialog:shown` | `{ type, message }` | Dialog shown |
| `system:dialog:closed` | `{ type, result }` | Dialog closed |
| `system:notification:shown` | `{ message }` | Toast shown |
| `system:notification:clicked` | `{ message }` | Toast clicked |
| `system:notification:dismissed` | `{ message }` | Toast dismissed |

---

## 7. GENERIC EVENTS (Cross-cutting)

These events work across multiple apps for consistent behavior:

| Event | Data | When |
|-------|------|------|
| `game:win` | `{ appId, score?, time?, metadata }` | Any game won |
| `game:lose` | `{ appId, score?, reason }` | Any game lost |
| `game:started` | `{ appId, difficulty? }` | Any game started |
| `game:paused` | `{ appId }` | Any game paused |
| `game:resumed` | `{ appId }` | Any game resumed |
| `file:opened` | `{ path, app, content? }` | File opened in any app |
| `file:saved` | `{ path, app, content }` | File saved from any app |
| `input:typed` | `{ text, app, field? }` | Text typed anywhere |
| `action:performed` | `{ action, app, target }` | Generic action |
| `setting:changed` | `{ category, key, value }` | Any setting changed |

---

## ACTIONS CATALOG (25+ Action Types)

| Action | Parameters | Description |
|--------|------------|-------------|
| `createFile` | `path, content, addToDesktop?, icon?` | Create filesystem file |
| `modifyFile` | `path, content, append?` | Modify file contents |
| `deleteFile` | `path` | Delete file |
| `createFolder` | `path` | Create directory |
| `createDesktopIcon` | `id, label, type, icon, position?` | Add desktop icon |
| `removeDesktopIcon` | `id` | Remove desktop icon |
| `showDialog` | `title, message, icon?, buttons?` | Show dialog box |
| `showNotification` | `message, icon?, duration?` | Show toast |
| `showClippy` | `message, duration?` | Clippy says something |
| `playSound` | `sound` | Play system sound |
| `playAudio` | `src, loop?` | Play audio file |
| `stopAudio` | `src?` | Stop audio |
| `unlockApp` | `appId` | Enable app |
| `lockApp` | `appId, message?` | Disable app |
| `launchApp` | `appId, params?` | Open application |
| `closeApp` | `appId` | Close application |
| `unlockAchievement` | `id` | Grant achievement |
| `setState` | `path, value, persist?` | Set scenario state |
| `modifyState` | `path, operation, value` | Increment/decrement |
| `emitEvent` | `event, data` | Emit custom event |
| `advanceStage` | `stageId` | Go to next stage |
| `completeScenario` | `{}` | Finish scenario |
| `failScenario` | `reason?` | Fail scenario |
| `wait` | `duration` | Delay (ms) |
| `showHint` | `message, index?` | Display hint |
| `visualEffect` | `effect, target?, duration?` | CSS effect |
| `setWallpaper` | `wallpaper` | Change wallpaper |
| `enableFeature` | `featureId` | Enable feature |
| `disableFeature` | `featureId` | Disable feature |
| `modifyClipboard` | `content` | Set clipboard |
| `sendKeys` | `keys, target?` | Simulate keystrokes |
| `focusWindow` | `windowId` | Focus window |
| `minimizeAll` | `{}` | Minimize all windows |
| `triggerScreensaver` | `type?` | Start screensaver |
| `log` | `message, level?` | Debug logging |

---

## CONDITIONS CATALOG (20+ Condition Types)

| Condition | Parameters | Description |
|-----------|------------|-------------|
| `stageActive` | `stageId` | Current stage matches |
| `stageCompleted` | `stageId` | Stage was completed |
| `stateEquals` | `path, value` | State equals value |
| `stateExists` | `path` | State key exists |
| `stateGreater` | `path, value` | State > value |
| `stateLess` | `path, value` | State < value |
| `stateContains` | `path, value` | Array contains value |
| `fileExists` | `path` | File exists |
| `fileContains` | `path, pattern, regex?` | File matches pattern |
| `fileEquals` | `path, content` | File content exact match |
| `appOpen` | `appId` | App is open |
| `appFocused` | `appId` | App has focus |
| `appLocked` | `appId` | App is locked |
| `windowExists` | `windowId` | Window exists |
| `windowMinimized` | `windowId` | Window minimized |
| `achievementUnlocked` | `id` | Achievement earned |
| `featureEnabled` | `featureId` | Feature is on |
| `timeElapsed` | `duration, since?` | Time passed |
| `timeBefore` | `time` | Before specific time |
| `timeAfter` | `time` | After specific time |
| `eventMatch` | `field, value, op?` | Event data matches |
| `eventData` | `path, value` | Nested event data |
| `random` | `probability` | Random chance (0-1) |
| `and` | `conditions[]` | All conditions true |
| `or` | `conditions[]` | Any condition true |
| `not` | `condition` | Negate condition |
| `count` | `event, min, max?, window?` | Event count in timeframe |

---

## EXTENSIBILITY PATTERNS

### Adding Events to a New App

```javascript
// 1. In your app class, emit events at key moments:
class MyNewApp extends AppBase {
    constructor() {
        super({ id: 'myapp', name: 'My App', ... });
    }

    onMount() {
        // Emit when app is ready
        this.emit('myapp:ready', { timestamp: Date.now() });
    }

    doSomething() {
        // Emit before action
        this.emit('myapp:action:started', { action: 'something' });

        // ... do the thing ...

        // Emit after action
        this.emit('myapp:action:completed', {
            action: 'something',
            result: 'success'
        });
    }

    onClose() {
        this.emit('myapp:closed', { sessionDuration: this.getSessionTime() });
    }
}
```

### Adding Events to a New Feature

```javascript
class MyFeature extends FeatureBase {
    async initialize() {
        // Emit when feature initializes
        this.emit('myfeature:initialized', { config: this.config });

        // Subscribe to other events
        this.subscribe('window:opened', (data) => {
            // React and emit
            this.emit('myfeature:reacted', { to: data.appId });
        });
    }
}
```

### Adding Events to Core Systems

```javascript
// In any core module:
import EventBus from './EventBus.js';

function doOperation() {
    EventBus.emit('core:operation:started', { op: 'something' });
    // ... operation ...
    EventBus.emit('core:operation:completed', { op: 'something' });
}
```

### Custom Action Handler (for plugins)

```javascript
// Register custom action type
ActionExecutor.registerAction('myCustomAction', async (params, context) => {
    const { target, value } = params;
    // Do custom action
    console.log(`Custom action on ${target} with ${value}`);
    return { success: true };
});

// Use in scenario:
{
    "type": "myCustomAction",
    "params": { "target": "something", "value": 42 }
}
```

### Custom Condition Handler (for plugins)

```javascript
// Register custom condition type
ConditionEvaluator.registerCondition('myCustomCheck', (params, context) => {
    const { threshold } = params;
    return context.scenario.state.value >= threshold;
});

// Use in scenario:
{
    "type": "myCustomCheck",
    "params": { "threshold": 100 }
}
```

### Custom Trigger Handler (for complex matching)

```javascript
// Register custom trigger type
TriggerEngine.registerMatcher('sequence', (trigger, events) => {
    // Match a sequence of events
    const { sequence } = trigger;
    return events.slice(-sequence.length).every((e, i) =>
        e.type === sequence[i]
    );
});
```

---

## IMPLEMENTATION PHASES (Revised)

### Phase 1: Event Infrastructure (Foundation)
1. Create `/core/scripted-events/` folder
2. Implement `SemanticEvents.js` with ALL 150+ events
3. Create `EventEmitterMixin.js` for consistent emission
4. Add event emission to `EventBus.js` for instrumentation
5. Create event validation/schema system

### Phase 2: Scenario Engine Core
6. Implement `ConditionEvaluator.js` with all 20+ conditions
7. Implement `ActionExecutor.js` with all 25+ actions
8. Implement `TriggerEngine.js` with pattern matching
9. Implement `ScenarioLoader.js` with JSON Schema validation
10. Implement `ScenarioManager.js` (FeatureBase extension)
11. Create `index.js` barrel export

### Phase 3: Game App Events (9 apps)
12. Minesweeper - 10 events
13. Snake - 10 events
14. Asteroids - 14 events
15. Solitaire - 10 events
16. FreeCell - 8 events
17. SkiFree - 12 events
18. Zork - 21 events
19. Paint - 17 events
20. Doom - 5 events

### Phase 4: Utility App Events (15 apps)
21. Notepad - 15 events
22. Calculator - 12 events
23. Terminal - 18 events
24. Browser - 12 events
25. MediaPlayer - 14 events
26. Winamp - 12 events
27. Calendar - 9 events
28. Clock - 6 events
29. FileExplorer/MyComputer - 16 events
30. TaskManager - 6 events
31. RecycleBin - 6 events
32. FindFiles - 6 events
33. Defrag - 7 events
34. HelpSystem - 6 events
35. ControlPanel - 3 events
36. DisplayProperties - 6 events
37. ChatRoom - 10 events
38. HyperCard - 11 events

### Phase 5: System App Events (3 apps)
39. FeaturesSettings - 4 events
40. SoundSettings - 5 events
41. AdminPanel - 6 events

### Phase 6: Feature Events (7 features)
42. AchievementSystem - 6 events
43. SoundSystem - 9 events
44. ClippyAssistant - 8 events
45. DesktopPet - 15 events
46. Screensaver - 8 events
47. EasterEggs - 6 events
48. FeatureRegistry - 5 events

### Phase 7: Core System Events
49. WindowManager - 15 events
50. FileSystemManager - 11 events
51. StateManager - 7 events
52. AppRegistry - 9 events
53. PluginLoader - 4 events

### Phase 8: UI Component Events
54. Desktop - 15 events
55. Taskbar - 8 events
56. StartMenu - 9 events
57. ContextMenu - 4 events
58. System dialogs/notifications - 8 events

### Phase 9: UI & Content
59. Create `ScenarioPlayer.js` app
60. Add scenario indicator to taskbar
61. Create Settings integration
62. Create `tutorial.scenario.json`
63. Create `cipher-hunt.scenario.json`
64. Create `schema.json` for validation

### Phase 10: Documentation & Polish
65. Write `SCENARIO_AUTHORING.md`
66. Write `EVENT_CATALOG.md`
67. Write `ADDING_EVENTS.md`
68. End-to-end testing
69. Performance optimization
70. Edge case handling

---

## EVENT NAMING CONVENTIONS

```
{component}:{subject}:{action}

Examples:
  minesweeper:cell:revealed    - Minesweeper cell was revealed
  snake:food:eaten             - Snake ate food
  terminal:command:executed    - Terminal ran command
  window:focus:changed         - Window focus changed
  file:content:saved           - File was saved
  achievement:badge:unlocked   - Achievement earned
```

**Rules:**
1. Use lowercase with colons as separators
2. Component first (app id, feature id, or system name)
3. Subject next (what is affected)
4. Action last (what happened, past tense)
5. Keep it short but descriptive
6. Use consistent vocabulary across similar events

---

## SCENARIO FILE FORMAT (Complete)

```json
{
    "$schema": "./schema.json",
    "id": "unique-scenario-id",
    "name": "Display Name",
    "description": "What this scenario is about",
    "version": "1.0.0",
    "author": "Author Name",
    "icon": "🎮",
    "difficulty": "easy|medium|hard|expert",
    "estimatedTime": "10-15 minutes",
    "tags": ["puzzle", "tutorial", "adventure"],

    "requirements": {
        "apps": ["minesweeper", "notepad"],
        "features": ["soundsystem"],
        "minVersion": "1.0.0"
    },

    "config": {
        "allowSkip": false,
        "showProgress": true,
        "autoSave": true,
        "hintDelay": 30000,
        "maxHints": 3
    },

    "variables": {
        "score": 0,
        "hintsUsed": 0,
        "itemsFound": [],
        "secretDiscovered": false
    },

    "onStart": {
        "actions": [/* initial setup */]
    },

    "stages": [
        {
            "id": "stage-id",
            "name": "Stage Name",
            "description": "What to do",
            "isInitialStage": true,

            "onEnter": { "actions": [] },
            "onExit": { "actions": [] },

            "hints": [
                { "delay": 30000, "message": "First hint" },
                { "delay": 60000, "message": "Second hint" }
            ],

            "triggers": [
                {
                    "id": "trigger-id",
                    "event": "game:win",
                    "conditions": { /* condition tree */ },
                    "actions": [ /* action list */ ],
                    "once": true,
                    "priority": 1
                }
            ]
        }
    ],

    "globalTriggers": [/* always-active triggers */],

    "onComplete": {
        "actions": [/* cleanup and rewards */]
    },

    "onFail": {
        "actions": [/* failure handling */]
    },

    "onAbort": {
        "actions": [/* user cancelled */]
    }
}
```

---

## STATISTICS

| Category | Count |
|----------|-------|
| **Total Apps** | 32 |
| **Total Features** | 7 |
| **Core Systems** | 5 |
| **UI Components** | 4 |
| **Total Events** | ~150+ |
| **Action Types** | 25+ |
| **Condition Types** | 20+ |
| **Trigger Patterns** | 5+ |

**This makes RetrOS a fully scriptable operating system where every user interaction, state change, and system event can trigger scenario actions.**
