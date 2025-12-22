# Scripted Events System - Implementation Plan

## Overview

A comprehensive system for creating puzzle games and guided experiences in RetrOS. This system enables linear progression through stages with triggers, conditions, and actions that span all apps, features, and the OS.

**Example Flow:**
1. Note appears on desktop with Caesar cipher → Player decodes it externally
2. Message says "Beat Minesweeper for next clue" → Player wins Minesweeper
3. System detects win → New file appears with next puzzle
4. And so on...

---

## Architecture

```
                      +------------------------+
                      |   ScenarioManager      |  ← Core orchestrator (FeatureBase)
                      +------------------------+
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
+───────▼────────+    +───────────▼───────────+   +─────────▼─────────+
│ TriggerEngine  │    │    ActionExecutor     │   │ ConditionEvaluator│
│ (Event Matcher)│    │  (Effect Performer)   │   │  (Rule Checker)   │
+────────────────+    +───────────────────────+   +───────────────────+
        │                         │                         │
        └─────────────┬───────────┴───────────┬─────────────┘
                      │                       │
              +───────▼───────+       +───────▼────────+
              │   EventBus    │       │  StateManager  │
              │ (All events)  │       │ (Progress/Save)│
              +───────────────+       +────────────────+
```

---

## File Structure

```
/home/user/RetrOS/
├── core/
│   └── scripted-events/
│       ├── ScenarioManager.js       # Main feature class
│       ├── TriggerEngine.js         # Event matching
│       ├── ActionExecutor.js        # Action execution
│       ├── ConditionEvaluator.js    # Condition logic
│       ├── ScenarioLoader.js        # Scenario parsing
│       ├── SemanticEvents.js        # Event definitions
│       └── index.js                 # Barrel export
│
├── scenarios/
│   ├── tutorial.scenario.json       # First-time tutorial
│   └── cipher-hunt.scenario.json    # Example puzzle game
│
├── apps/
│   └── ScenarioPlayer.js            # Scenario browser/launcher
│
└── docs/
    └── SCENARIO_AUTHORING.md        # Authoring guide
```

---

## Core Components

### 1. ScenarioManager (FeatureBase Extension)

The main orchestrator that:
- Loads and validates scenarios
- Manages stage progression
- Saves/loads progress to localStorage
- Coordinates triggers, conditions, and actions

```javascript
class ScenarioManager extends FeatureBase {
    // Load a scenario from file or object
    async loadScenario(scenarioPathOrObject);

    // Start/pause/resume/reset
    startScenario();
    pauseScenario();
    resumeScenario();
    resetScenario();

    // Progress management
    getProgress();
    saveProgress();
    loadProgress();

    // Stage control
    goToStage(stageId);
    advanceToNextStage();
}
```

### 2. TriggerEngine

Subscribes to EventBus and matches events against registered triggers:

```javascript
class TriggerEngine {
    registerTrigger(trigger);      // Add a trigger for current stage
    unregisterTrigger(triggerId);  // Remove a trigger
    clearAllTriggers();            // Clear on stage change
    startListening();              // Begin matching events
    stopListening();               // Stop matching
}
```

### 3. ActionExecutor

Executes actions when triggers fire:

**Built-in Action Types:**
| Action | Description |
|--------|-------------|
| `createFile` | Create file in filesystem (optionally on desktop) |
| `modifyFile` | Change file contents |
| `deleteFile` | Remove file |
| `showDialog` | System dialog box |
| `showNotification` | Toast notification |
| `playSound` | Play sound effect |
| `unlockApp` / `lockApp` | Enable/disable app access |
| `unlockAchievement` | Grant achievement |
| `setState` | Set scenario state variable |
| `emitEvent` | Emit custom event |
| `advanceStage` | Move to next stage |
| `completeScenario` | Finish scenario |
| `wait` | Delay before next action |
| `showHint` | Display hint |
| `launchApp` | Open an application |
| `visualEffect` | CSS animation effect |

### 4. ConditionEvaluator

Evaluates conditions with AND/OR/NOT logic:

**Built-in Condition Types:**
| Condition | Description |
|-----------|-------------|
| `stageActive` | Current stage matches |
| `stageCompleted` | Stage was completed |
| `stateEquals` | State value equals |
| `stateExists` | State key exists |
| `stateGreater` / `stateLess` | Numeric comparisons |
| `fileExists` | File exists in filesystem |
| `fileContains` | File contains pattern |
| `appOpen` | App is currently open |
| `achievementUnlocked` | Achievement granted |
| `timeElapsed` | Time since event |
| `eventMatch` | Event data matches |
| `and` / `or` / `not` | Logical operators |

---

## Semantic Events (New Events to Add)

### Game Events
```javascript
'game:win'    // { appId, score?, time?, metadata? }
'game:lose'   // { appId, reason? }
'game:start'  // { appId }
```

### File Events
```javascript
'file:created'       // { path, content?, extension }
'file:opened'        // { path, content }
'file:saved'         // { path, content }
'file:deleted'       // { path }
```

### App Events
```javascript
'app:opened'   // { appId, params? }
'app:closed'   // { appId }
```

### Terminal Events
```javascript
'terminal:command'  // { command, args, fullCommand }
'terminal:cd'       // { oldPath, newPath }
```

### Notepad Events
```javascript
'notepad:typed'   // { content, filename }
'notepad:saved'   // { path, content }
```

### Scenario Events
```javascript
'scenario:started'     // { scenarioId }
'scenario:completed'   // { scenarioId, time }
'stage:started'        // { stageId }
'stage:completed'      // { stageId }
```

---

## Scenario File Format

```json
{
    "id": "cipher-hunt",
    "name": "The Cipher Hunt",
    "description": "Decode mysterious messages",
    "version": "1.0.0",
    "author": "RetrOS Team",
    "icon": "🔍",
    "difficulty": "medium",
    "estimatedTime": "15-30 minutes",

    "onStart": {
        "actions": [
            {
                "type": "showDialog",
                "params": {
                    "title": "Welcome",
                    "message": "A mysterious note has appeared..."
                }
            },
            {
                "type": "createFile",
                "params": {
                    "path": ["C:", "Users", "Seth", "Desktop", "note.txt"],
                    "content": "KHOOR ZRUOG! (Hint: Caesar -3)",
                    "addToDesktop": true,
                    "icon": "📜"
                }
            }
        ]
    },

    "stages": [
        {
            "id": "decode-message",
            "name": "Decode the Message",
            "isInitialStage": true,

            "hints": [
                { "delay": 30000, "message": "It's a Caesar cipher..." },
                { "delay": 60000, "message": "Shift each letter back by 3" }
            ],

            "triggers": [
                {
                    "id": "minesweeper-win",
                    "event": "game:win",
                    "conditions": {
                        "type": "eventMatch",
                        "field": "appId",
                        "value": "minesweeper"
                    },
                    "actions": [
                        { "type": "showNotification", "params": { "message": "🎉 New clue unlocked!" }},
                        { "type": "advanceStage", "params": { "stageId": "stage-2" }}
                    ]
                }
            ]
        },
        {
            "id": "stage-2",
            "name": "Find the Secret",
            "onEnter": {
                "actions": [
                    {
                        "type": "createFile",
                        "params": {
                            "path": ["C:", "Users", "Seth", "Desktop", "clue2.txt"],
                            "content": "Navigate to C:\\Secret and read the file..."
                        }
                    }
                ]
            },
            "triggers": [/* ... */]
        }
    ],

    "onComplete": {
        "actions": [
            { "type": "unlockAchievement", "params": { "id": "cipher_master" }},
            { "type": "showDialog", "params": { "title": "🏆 Congratulations!", "message": "You completed The Cipher Hunt!" }}
        ]
    },

    "globalTriggers": [/* triggers active across all stages */],

    "requirements": {
        "apps": ["minesweeper", "notepad", "terminal"]
    }
}
```

---

## Apps Requiring Modifications

### High Priority

| File | Changes |
|------|---------|
| `apps/Minesweeper.js` | Add `game:win`, `game:lose` events in `triggerGameOver()` |
| `apps/Snake.js` | Add `game:win`, `game:lose` events |
| `apps/Notepad.js` | Add `notepad:saved`, `notepad:typed` events |
| `apps/Terminal.js` | Add `terminal:command`, `terminal:cd` events |
| `core/FileSystemManager.js` | Add `file:created`, `file:opened`, `file:saved` events |
| `apps/AppRegistry.js` | Add `app:opened` event + app locking support |

### Medium Priority

| File | Changes |
|------|---------|
| `apps/Asteroids.js` | Add game events |
| `apps/Solitaire.js` | Add `game:win` event |
| `apps/FreeCell.js` | Add `game:win` event |

### Low Priority

| File | Changes |
|------|---------|
| `apps/SkiFree.js` | Add game events |
| `apps/Browser.js` | Add `browser:navigate` events |
| `apps/Calculator.js` | Add `calculator:result` event |

---

## Implementation Phases

### Phase 1: Foundation
1. Create `/core/scripted-events/` folder structure
2. Implement `SemanticEvents.js` - event name constants
3. Implement `ConditionEvaluator.js` - condition logic
4. Implement `ActionExecutor.js` - action handlers

### Phase 2: Core Engine
5. Implement `TriggerEngine.js` - event matching
6. Implement `ScenarioLoader.js` - JSON parsing/validation
7. Implement `ScenarioManager.js` - main feature class
8. Create `index.js` barrel export
9. Register with FeatureRegistry in `index.js`

### Phase 3: App Integration
10. Modify `Minesweeper.js` - add game events
11. Modify `Snake.js` - add game events
12. Modify `Notepad.js` - add save/type events
13. Modify `Terminal.js` - add command events
14. Modify `FileSystemManager.js` - add file events
15. Modify `AppRegistry.js` - add app events + locking

### Phase 4: UI Integration
16. Create `ScenarioPlayer.js` app - scenario browser
17. Add scenario progress indicator to taskbar
18. Integrate with SystemDialogs for notifications
19. Add to Settings for enable/disable

### Phase 5: Content & Documentation
20. Create `tutorial.scenario.json` - first-time experience
21. Create `cipher-hunt.scenario.json` - example puzzle
22. Write `SCENARIO_AUTHORING.md` documentation

### Phase 6: Testing & Polish
23. End-to-end testing of scenarios
24. Edge case handling (abort, window close)
25. Performance optimization
26. Save/load progress verification

---

## Example: Adding Events to Minesweeper

```javascript
// In apps/Minesweeper.js, modify triggerGameOver():

triggerGameOver(win) {
    this.gameOver = true;
    this.setInstanceState('gameOver', true);
    this.stopTimer();

    const faceBtn = this.getElement('#mineFace');
    if (faceBtn) {
        faceBtn.textContent = win ? '😎' : '😵';
    }

    // NEW: Emit semantic game events
    if (win) {
        this.emit('game:win', {
            appId: 'minesweeper',
            time: this.time,
            difficulty: {
                rows: this.rows,
                cols: this.cols,
                mines: this.mines
            }
        });

        // Existing achievement unlock
        StateManager.unlockAchievement('mine_sweeper');
    } else {
        this.emit('game:lose', {
            appId: 'minesweeper',
            time: this.time
        });

        // Reveal all mines...
    }
}
```

---

## App Locking Support

Add to `AppRegistry.js`:

```javascript
class AppRegistryClass {
    constructor() {
        this.apps = new Map();
        this.lockedApps = new Set();
    }

    lockApp(appId) {
        this.lockedApps.add(appId);
        EventBus.emit('app:locked', { appId });
    }

    unlockApp(appId) {
        this.lockedApps.delete(appId);
        EventBus.emit('app:unlocked', { appId });
    }

    isLocked(appId) {
        return this.lockedApps.has(appId);
    }

    launch(appId, params = {}) {
        if (this.isLocked(appId)) {
            EventBus.emit('dialog:alert', {
                message: `${appId} is currently locked.`,
                icon: 'warning'
            });
            return false;
        }
        // ... existing launch logic
    }
}
```

---

## StateManager Progress Storage

```javascript
// Add to StateManager state:
scenarios: {
    active: null,                    // Currently active scenario ID
    progress: {                      // Per-scenario progress
        'cipher-hunt': {
            currentStage: 'decode-message',
            completedStages: [],
            startTime: 1703001234567,
            state: { hintsUsed: 0 }
        }
    },
    completed: ['tutorial'],         // Completed scenario IDs
    available: ['tutorial', 'cipher-hunt']
}

// Storage key: 'smos_scenarioProgress'
```

---

## Future Enhancements

1. **Visual Scenario Editor** - HyperCard-like app for creating scenarios
2. **Scenario Marketplace** - Share scenarios via JSON import/export
3. **Branching Narratives** - Non-linear stage progression
4. **Time-based Challenges** - Speedrun modes
5. **Multiplayer Scenarios** - Cooperative puzzle solving
6. **Custom Trigger Plugins** - Extend trigger types

---

## Key Design Decisions

1. **Feature-based Architecture**: ScenarioManager extends FeatureBase for consistent lifecycle management and settings integration

2. **Event-Driven**: Leverages existing EventBus for loose coupling between apps and scenarios

3. **JSON Scenarios**: Easy to author, version control, and share

4. **Progressive Enhancement**: Apps emit semantic events that scenarios *may* listen to - no breaking changes to existing functionality

5. **Persistent Progress**: Save/load state via StateManager for multi-session play

6. **Extensible Actions**: Register custom action handlers for plugin integration
