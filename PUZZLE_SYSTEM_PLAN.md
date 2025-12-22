# Scripted Event System - Implementation Plan

## Overview

A comprehensive event coordination system for creating interactive puzzle games within RetrOS. This system enables linear progression scenarios where users solve puzzles across multiple apps, features, and OS components.

**Example Scenario:**
1. Desktop shows a note with Caesar-shifted text: "EHDW PLQHVZHHSHU IRU QHAW FOXH"
2. User decodes it: "BEAT MINESWEEPER FOR NEXT CLUE"
3. Upon winning Minesweeper, Terminal opens with next puzzle
4. Process continues through multiple apps/features

---

## System Architecture

### 1. Core Components

```
/plugins/features/puzzle-system/
├── index.js                    # Plugin manifest
├── PuzzleCoordinator.js        # Core event coordinator
├── PuzzleScenarioLoader.js     # Loads scenario definitions
├── PuzzleStateManager.js       # Tracks progress & state
├── PuzzleUI.js                 # Progress tracker overlay
├── PuzzleConditionEvaluator.js # Evaluates trigger conditions
├── PuzzleActionExecutor.js     # Executes puzzle actions
└── scenarios/
    ├── example-caesar.json     # Example scenario
    └── tutorial.json           # Tutorial scenario
```

### 2. Scenario Definition Format (JSON DSL)

```json
{
  "id": "caesar-cipher-mystery",
  "name": "The Cipher Mystery",
  "version": "1.0.0",
  "author": "RetrOS",
  "description": "Decode ciphers and solve puzzles across the OS",

  "initialState": {
    "level": 1,
    "hintsUsed": 0,
    "startTime": null
  },

  "steps": [
    {
      "id": "step-1-desktop-note",
      "name": "Discover the Note",
      "description": "A mysterious note appears on your desktop",

      "triggers": [
        {
          "type": "boot",
          "condition": "state.level === 1"
        }
      ],

      "actions": [
        {
          "type": "createDesktopFile",
          "params": {
            "filename": "mysterious_note.txt",
            "content": "EHDW PLQHVZHHSHU IRU QHAW FOXH\n\n(Hint: The alphabet has been shifted...)",
            "icon": "📝",
            "position": { "x": 300, "y": 200 }
          }
        },
        {
          "type": "setState",
          "params": {
            "key": "startTime",
            "value": "{{timestamp}}"
          }
        },
        {
          "type": "showNotification",
          "params": {
            "title": "New Game Started",
            "message": "Can you solve the mystery?",
            "icon": "🔍"
          }
        }
      ],

      "completionConditions": [
        {
          "type": "event",
          "event": "puzzle:step-complete",
          "data": { "stepId": "step-1-desktop-note" }
        }
      ],

      "nextStep": "step-2-minesweeper-challenge"
    },

    {
      "id": "step-2-minesweeper-challenge",
      "name": "Beat Minesweeper",
      "description": "Win Minesweeper to unlock the next clue",

      "triggers": [
        {
          "type": "stepComplete",
          "stepId": "step-1-desktop-note"
        }
      ],

      "actions": [
        {
          "type": "unlockApp",
          "params": {
            "appId": "minesweeper"
          }
        }
      ],

      "completionConditions": [
        {
          "type": "appEvent",
          "appId": "minesweeper",
          "event": "game:win",
          "condition": "data.difficulty === 'easy'"
        }
      ],

      "onComplete": [
        {
          "type": "unlockAchievement",
          "params": {
            "achievementId": "puzzle_minesweeper_master"
          }
        },
        {
          "type": "launchApp",
          "params": {
            "appId": "terminal",
            "params": {
              "autoExecute": "type C:\\Users\\Seth\\Desktop\\next_clue.txt"
            }
          }
        },
        {
          "type": "createFile",
          "params": {
            "path": "C:/Users/Seth/Desktop/next_clue.txt",
            "content": "Well done! Your next challenge awaits in the Calculator.\nFind the answer to: 2^10 + 512"
          }
        }
      ],

      "nextStep": "step-3-calculator-puzzle"
    },

    {
      "id": "step-3-calculator-puzzle",
      "name": "Calculator Challenge",
      "description": "Calculate the correct answer",

      "triggers": [
        {
          "type": "stepComplete",
          "stepId": "step-2-minesweeper-challenge"
        }
      ],

      "actions": [],

      "completionConditions": [
        {
          "type": "appEvent",
          "appId": "calculator",
          "event": "calculation:result",
          "condition": "data.result === 1536"
        }
      ],

      "onComplete": [
        {
          "type": "showDialog",
          "params": {
            "title": "Congratulations!",
            "message": "You've completed The Cipher Mystery!\n\nTime: {{formatTime(timestamp - state.startTime)}}\nHints Used: {{state.hintsUsed}}",
            "buttons": ["Awesome!"]
          }
        },
        {
          "type": "setState",
          "params": {
            "key": "completed",
            "value": true
          }
        }
      ],

      "nextStep": null
    }
  ],

  "hints": [
    {
      "stepId": "step-1-desktop-note",
      "cost": 0,
      "content": "Try shifting each letter back by 3 positions in the alphabet."
    },
    {
      "stepId": "step-2-minesweeper-challenge",
      "cost": 1,
      "content": "Start with the corners - they're safest!"
    }
  ],

  "achievements": [
    {
      "id": "puzzle_minesweeper_master",
      "name": "Minesweeper Master",
      "description": "Beat Minesweeper in the puzzle",
      "icon": "💣"
    },
    {
      "id": "puzzle_speed_demon",
      "name": "Speed Demon",
      "description": "Complete the puzzle in under 10 minutes",
      "icon": "⚡",
      "condition": "state.completedTime - state.startTime < 600000"
    }
  ],

  "settings": {
    "allowHints": true,
    "trackTime": true,
    "showProgress": true,
    "saveProgress": true
  }
}
```

---

## 3. Core Feature Implementation

### PuzzleCoordinator (Central Orchestrator)

```javascript
import FeatureBase from '../../../core/FeatureBase.js';
import EventBus from '../../../core/EventBus.js';
import StateManager from '../../../core/StateManager.js';

class PuzzleCoordinator extends FeatureBase {
    constructor() {
        super({
            id: 'puzzle-coordinator',
            name: 'Puzzle System',
            icon: '🎮',
            category: 'enhancement',
            config: {
                currentScenario: null,
                currentStep: null,
                scenarioState: {},
                enabled: false
            },
            settings: [
                {
                    key: 'showProgress',
                    label: 'Show Progress Overlay',
                    type: 'boolean',
                    default: true
                },
                {
                    key: 'enableHints',
                    label: 'Enable Hints',
                    type: 'boolean',
                    default: true
                }
            ]
        });

        this.scenario = null;
        this.eventListeners = new Map();
    }

    async initialize() {
        // Subscribe to system events
        this.subscribe('boot:complete', () => this.onBootComplete());
        this.subscribe('app:close', (data) => this.onAppClose(data));
        this.subscribe('puzzle:step-complete', (data) => this.onStepComplete(data));
        this.subscribe('puzzle:hint-request', (data) => this.showHint(data));

        // Restore active scenario if exists
        if (this.getConfig('currentScenario')) {
            await this.loadScenario(this.getConfig('currentScenario'));
        }
    }

    async loadScenario(scenarioId) {
        // Load scenario definition
        const scenario = await PuzzleScenarioLoader.load(scenarioId);
        this.scenario = scenario;

        // Initialize state
        const savedState = this.getConfig('scenarioState');
        this.state = savedState || { ...scenario.initialState };

        // Set current scenario
        this.setConfig('currentScenario', scenarioId);
        this.setConfig('enabled', true);

        // Start from saved step or first step
        const currentStepId = this.getConfig('currentStep') || scenario.steps[0].id;
        await this.activateStep(currentStepId);

        // Show UI
        this.emit('puzzle:scenario-loaded', { scenario, state: this.state });
    }

    async activateStep(stepId) {
        const step = this.scenario.steps.find(s => s.id === stepId);
        if (!step) return;

        this.currentStep = step;
        this.setConfig('currentStep', stepId);

        // Execute step actions
        for (const action of step.actions) {
            await PuzzleActionExecutor.execute(action, this.state);
        }

        // Register completion listeners
        this.registerCompletionListeners(step);

        // Emit step activated
        this.emit('puzzle:step-activated', { step, state: this.state });
    }

    registerCompletionListeners(step) {
        // Clear previous listeners
        this.clearCompletionListeners();

        for (const condition of step.completionConditions) {
            if (condition.type === 'event') {
                const handler = (data) => {
                    if (this.evaluateCondition(condition, data)) {
                        this.completeStep(step);
                    }
                };
                this.subscribe(condition.event, handler);
                this.eventListeners.set(condition.event, handler);
            }
            else if (condition.type === 'appEvent') {
                const eventName = `${condition.appId}:${condition.event}`;
                const handler = (data) => {
                    if (this.evaluateCondition(condition, data)) {
                        this.completeStep(step);
                    }
                };
                this.subscribe(eventName, handler);
                this.eventListeners.set(eventName, handler);
            }
        }
    }

    clearCompletionListeners() {
        for (const [event, handler] of this.eventListeners) {
            EventBus.off(event, handler);
        }
        this.eventListeners.clear();
    }

    evaluateCondition(condition, data) {
        if (!condition.condition) return true;

        // Use PuzzleConditionEvaluator for complex conditions
        return PuzzleConditionEvaluator.evaluate(condition.condition, {
            data,
            state: this.state
        });
    }

    async completeStep(step) {
        console.log(`Step completed: ${step.id}`);

        // Execute onComplete actions
        if (step.onComplete) {
            for (const action of step.onComplete) {
                await PuzzleActionExecutor.execute(action, this.state);
            }
        }

        // Update state
        this.state.completedSteps = this.state.completedSteps || [];
        this.state.completedSteps.push(step.id);
        this.saveState();

        // Emit completion
        this.emit('puzzle:step-complete', { step, state: this.state });

        // Activate next step
        if (step.nextStep) {
            await this.activateStep(step.nextStep);
        } else {
            // Scenario complete
            await this.completeScenario();
        }
    }

    async completeScenario() {
        console.log('Scenario completed!');

        // Award achievements
        for (const achievement of this.scenario.achievements) {
            if (!achievement.condition || this.evaluateCondition({ condition: achievement.condition }, {})) {
                StateManager.unlockAchievement(achievement.id);
            }
        }

        // Emit completion
        this.emit('puzzle:scenario-complete', {
            scenario: this.scenario,
            state: this.state
        });

        // Reset
        this.setConfig('currentScenario', null);
        this.setConfig('currentStep', null);
        this.setConfig('enabled', false);
    }

    saveState() {
        this.setConfig('scenarioState', this.state);
    }

    showHint(data) {
        const hint = this.scenario.hints.find(h => h.stepId === this.currentStep.id);
        if (!hint) return;

        if (hint.cost > 0) {
            this.state.hintsUsed = (this.state.hintsUsed || 0) + hint.cost;
            this.saveState();
        }

        // Show hint dialog
        EventBus.emit('system:dialog', {
            title: 'Hint',
            message: hint.content,
            icon: '💡',
            buttons: ['OK']
        });
    }

    onBootComplete() {
        if (!this.getConfig('enabled')) return;

        // Trigger boot-based steps
        const bootSteps = this.scenario.steps.filter(step =>
            step.triggers.some(t => t.type === 'boot')
        );

        for (const step of bootSteps) {
            if (step.triggers.some(t => this.evaluateCondition(t, {}))) {
                this.activateStep(step.id);
            }
        }
    }
}

export default PuzzleCoordinator;
```

---

## 4. Action Executor

### PuzzleActionExecutor.js

```javascript
import EventBus from '../../../core/EventBus.js';
import StateManager from '../../../core/StateManager.js';
import FileSystemManager from '../../../core/FileSystemManager.js';
import AppRegistry from '../../../apps/AppRegistry.js';

class PuzzleActionExecutor {
    static async execute(action, state) {
        const handler = this.handlers[action.type];
        if (!handler) {
            console.warn(`Unknown action type: ${action.type}`);
            return;
        }

        // Interpolate parameters with state
        const params = this.interpolateParams(action.params, state);

        await handler(params, state);
    }

    static interpolateParams(params, state) {
        const json = JSON.stringify(params);
        const interpolated = json.replace(/\{\{(.+?)\}\}/g, (match, expr) => {
            try {
                // Safe evaluation with limited context
                const fn = new Function('state', 'timestamp', `return ${expr}`);
                return fn(state, Date.now());
            } catch (e) {
                console.error('Interpolation error:', e);
                return match;
            }
        });
        return JSON.parse(interpolated);
    }

    static handlers = {
        // Desktop & Files
        createDesktopFile: async (params) => {
            const { filename, content, icon, position } = params;

            // Create file in filesystem
            const path = `C:/Users/Seth/Desktop/${filename}`;
            FileSystemManager.createFile(path, content);

            // Add desktop icon
            StateManager.addIcon({
                id: `puzzle-file-${filename}`,
                label: filename,
                emoji: icon || '📄',
                type: 'file',
                path: path,
                x: position?.x || 100,
                y: position?.y || 100
            });
        },

        createFile: async (params) => {
            const { path, content } = params;
            FileSystemManager.createFile(path, content);
        },

        deleteFile: async (params) => {
            const { path } = params;
            FileSystemManager.deleteFile(path);
        },

        // Apps
        launchApp: async (params) => {
            const { appId, params: appParams } = params;
            AppRegistry.launch(appId, appParams);
        },

        closeApp: async (params) => {
            const { appId } = params;
            const windows = StateManager.getState('windows');
            const appWindow = windows.find(w => w.appId === appId);
            if (appWindow) {
                EventBus.emit('window:close', { id: appWindow.id });
            }
        },

        unlockApp: async (params) => {
            const { appId } = params;
            // Add to available apps or remove restriction
            EventBus.emit('puzzle:app-unlocked', { appId });
        },

        // State
        setState: async (params, state) => {
            const { key, value } = params;
            state[key] = value;
        },

        incrementState: async (params, state) => {
            const { key, amount } = params;
            state[key] = (state[key] || 0) + (amount || 1);
        },

        // UI
        showDialog: async (params) => {
            const { title, message, buttons, icon } = params;
            EventBus.emit('system:dialog', {
                title,
                message,
                buttons: buttons || ['OK'],
                icon
            });
        },

        showNotification: async (params) => {
            const { title, message, icon, duration } = params;
            EventBus.emit('system:notification', {
                title,
                message,
                icon,
                duration: duration || 5000
            });
        },

        // Achievements
        unlockAchievement: async (params) => {
            const { achievementId } = params;
            StateManager.unlockAchievement(achievementId);
        },

        // System
        playSound: async (params) => {
            const { soundId } = params;
            EventBus.emit('sound:play', { soundId });
        },

        // Custom events
        emitEvent: async (params) => {
            const { event, data } = params;
            EventBus.emit(event, data);
        }
    };
}

export default PuzzleActionExecutor;
```

---

## 5. App Integration Hooks

### Minesweeper Integration

**File: `/apps/Minesweeper.js`**

Add event emission when game is won:

```javascript
checkWin() {
    if (this.gameWon) return;

    // Check if all non-mine cells revealed
    let revealedCount = 0;
    for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
            if (this.revealed[row][col]) revealedCount++;
        }
    }

    if (revealedCount === (this.rows * this.cols - this.mines)) {
        this.gameWon = true;

        // PUZZLE INTEGRATION: Emit win event
        this.emit('minesweeper:game:win', {
            difficulty: this.difficulty,
            time: this.elapsedTime,
            windowId: this.getWindowId()
        });

        // Show win message
        this.showWinMessage();
    }
}
```

### Calculator Integration

**File: `/apps/Calculator.js`**

Emit calculation results:

```javascript
calculate() {
    try {
        const result = eval(this.display);
        this.display = String(result);
        this.updateDisplay();

        // PUZZLE INTEGRATION: Emit calculation result
        this.emit('calculator:calculation:result', {
            result: result,
            windowId: this.getWindowId()
        });

    } catch (e) {
        this.display = 'Error';
        this.updateDisplay();
    }
}
```

### Terminal Integration

**File: `/apps/Terminal.js`**

Emit command executions:

```javascript
executeCommand(command) {
    const trimmedCommand = command.trim();

    // PUZZLE INTEGRATION: Emit command before execution
    this.emit('terminal:command:execute', {
        command: trimmedCommand,
        windowId: this.getWindowId()
    });

    // ... existing command execution logic ...

    // After execution
    this.emit('terminal:command:complete', {
        command: trimmedCommand,
        output: this.getLastOutput(),
        windowId: this.getWindowId()
    });
}
```

### Notepad Integration

**File: `/apps/Notepad.js`**

Emit file saves and content changes:

```javascript
save() {
    if (this.currentFile) {
        FileSystemManager.writeFile(this.currentFile, this.content);
        this.modified = false;
        this.updateTitle();

        // PUZZLE INTEGRATION: Emit save event
        this.emit('notepad:file:save', {
            path: this.currentFile,
            content: this.content,
            windowId: this.getWindowId()
        });
    } else {
        this.saveAs();
    }
}
```

---

## 6. Progress UI Component

### PuzzleUI.js

```javascript
import FeatureBase from '../../../core/FeatureBase.js';

class PuzzleUI extends FeatureBase {
    constructor() {
        super({
            id: 'puzzle-ui',
            name: 'Puzzle Progress UI',
            category: 'enhancement'
        });

        this.overlay = null;
    }

    async initialize() {
        this.subscribe('puzzle:scenario-loaded', (data) => this.onScenarioLoaded(data));
        this.subscribe('puzzle:step-activated', (data) => this.onStepActivated(data));
        this.subscribe('puzzle:step-complete', (data) => this.onStepComplete(data));
        this.subscribe('puzzle:scenario-complete', (data) => this.onScenarioComplete(data));
    }

    onScenarioLoaded(data) {
        this.createOverlay(data.scenario);
    }

    createOverlay(scenario) {
        if (this.overlay) this.overlay.remove();

        this.overlay = document.createElement('div');
        this.overlay.id = 'puzzle-progress-overlay';
        this.overlay.innerHTML = `
            <div class="puzzle-progress-header">
                <span class="puzzle-title">${scenario.name}</span>
                <button class="puzzle-hint-btn" title="Get Hint">💡</button>
                <button class="puzzle-close-btn" title="Hide Progress">×</button>
            </div>
            <div class="puzzle-progress-steps">
                ${scenario.steps.map((step, i) => `
                    <div class="puzzle-step" data-step-id="${step.id}">
                        <span class="puzzle-step-number">${i + 1}</span>
                        <span class="puzzle-step-name">${step.name}</span>
                        <span class="puzzle-step-status">⚪</span>
                    </div>
                `).join('')}
            </div>
        `;

        document.body.appendChild(this.overlay);

        // Event listeners
        this.addHandler(this.overlay.querySelector('.puzzle-hint-btn'), 'click', () => {
            this.emit('puzzle:hint-request', {});
        });

        this.addHandler(this.overlay.querySelector('.puzzle-close-btn'), 'click', () => {
            this.overlay.classList.toggle('hidden');
        });
    }

    onStepActivated(data) {
        const stepEl = this.overlay.querySelector(`[data-step-id="${data.step.id}"]`);
        if (stepEl) {
            stepEl.classList.add('active');
            stepEl.querySelector('.puzzle-step-status').textContent = '🔵';
        }
    }

    onStepComplete(data) {
        const stepEl = this.overlay.querySelector(`[data-step-id="${data.step.id}"]`);
        if (stepEl) {
            stepEl.classList.remove('active');
            stepEl.classList.add('complete');
            stepEl.querySelector('.puzzle-step-status').textContent = '✅';
        }
    }

    onScenarioComplete(data) {
        setTimeout(() => {
            if (this.overlay) {
                this.overlay.remove();
                this.overlay = null;
            }
        }, 3000);
    }
}

export default PuzzleUI;
```

**CSS Styles** (add to `/styles.css`):

```css
#puzzle-progress-overlay {
    position: fixed;
    top: 40px;
    right: 20px;
    width: 300px;
    background: var(--window-bg);
    border: 2px solid var(--window-border);
    box-shadow: 4px 4px 0 rgba(0,0,0,0.2);
    z-index: 99999;
    font-family: 'MS Sans Serif', sans-serif;
    font-size: 11px;
}

#puzzle-progress-overlay.hidden {
    display: none;
}

.puzzle-progress-header {
    background: linear-gradient(90deg, #000080, #1084d0);
    color: white;
    padding: 4px 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.puzzle-title {
    font-weight: bold;
}

.puzzle-hint-btn,
.puzzle-close-btn {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 14px;
    padding: 2px 6px;
}

.puzzle-hint-btn:hover,
.puzzle-close-btn:hover {
    background: rgba(255,255,255,0.2);
}

.puzzle-progress-steps {
    padding: 8px;
    max-height: 400px;
    overflow-y: auto;
}

.puzzle-step {
    display: flex;
    align-items: center;
    padding: 6px;
    margin: 4px 0;
    background: #c0c0c0;
    border: 1px solid #808080;
}

.puzzle-step.active {
    background: #ffffe0;
    border-color: #ffd700;
}

.puzzle-step.complete {
    background: #90ee90;
    border-color: #008000;
}

.puzzle-step-number {
    display: inline-block;
    width: 24px;
    height: 24px;
    background: #000080;
    color: white;
    border-radius: 50%;
    text-align: center;
    line-height: 24px;
    margin-right: 8px;
    font-weight: bold;
}

.puzzle-step-name {
    flex: 1;
}

.puzzle-step-status {
    font-size: 16px;
}
```

---

## 7. Scenario Loader

### PuzzleScenarioLoader.js

```javascript
class PuzzleScenarioLoader {
    static scenarios = new Map();

    static async load(scenarioId) {
        // Check cache
        if (this.scenarios.has(scenarioId)) {
            return this.scenarios.get(scenarioId);
        }

        // Load from file
        try {
            const response = await fetch(`./plugins/features/puzzle-system/scenarios/${scenarioId}.json`);
            const scenario = await response.json();

            // Validate scenario
            this.validate(scenario);

            // Cache
            this.scenarios.set(scenarioId, scenario);

            return scenario;
        } catch (e) {
            console.error(`Failed to load scenario: ${scenarioId}`, e);
            throw e;
        }
    }

    static validate(scenario) {
        // Basic validation
        if (!scenario.id || !scenario.name || !scenario.steps) {
            throw new Error('Invalid scenario: missing required fields');
        }

        // Validate steps
        for (const step of scenario.steps) {
            if (!step.id || !step.triggers || !step.completionConditions) {
                throw new Error(`Invalid step: ${step.id}`);
            }
        }

        return true;
    }

    static async loadAll() {
        // Load all scenarios from directory
        const scenarios = [];

        // In a real implementation, this would scan the scenarios directory
        // For now, we'll manually register known scenarios
        const scenarioIds = ['example-caesar', 'tutorial'];

        for (const id of scenarioIds) {
            try {
                const scenario = await this.load(id);
                scenarios.push(scenario);
            } catch (e) {
                console.warn(`Failed to load scenario ${id}:`, e);
            }
        }

        return scenarios;
    }

    static list() {
        return Array.from(this.scenarios.values()).map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            author: s.author,
            version: s.version
        }));
    }
}

export default PuzzleScenarioLoader;
```

---

## 8. Condition Evaluator

### PuzzleConditionEvaluator.js

```javascript
class PuzzleConditionEvaluator {
    static evaluate(condition, context) {
        if (typeof condition === 'boolean') {
            return condition;
        }

        if (typeof condition === 'string') {
            return this.evaluateExpression(condition, context);
        }

        return false;
    }

    static evaluateExpression(expr, context) {
        try {
            // Create safe evaluation context
            const { data, state } = context;

            // Safe evaluation with limited scope
            const fn = new Function('data', 'state', `
                'use strict';
                return (${expr});
            `);

            return fn(data, state);
        } catch (e) {
            console.error('Condition evaluation error:', e);
            return false;
        }
    }

    static evaluateComplex(conditions, context) {
        // Support AND/OR logic
        if (conditions.and) {
            return conditions.and.every(c => this.evaluate(c, context));
        }

        if (conditions.or) {
            return conditions.or.some(c => this.evaluate(c, context));
        }

        if (conditions.not) {
            return !this.evaluate(conditions.not, context);
        }

        return this.evaluate(conditions, context);
    }
}

export default PuzzleConditionEvaluator;
```

---

## 9. Plugin Manifest

### /plugins/features/puzzle-system/index.js

```javascript
import PuzzleCoordinator from './PuzzleCoordinator.js';
import PuzzleUI from './PuzzleUI.js';

export default {
    id: 'puzzle-system',
    name: 'Puzzle System',
    version: '1.0.0',
    author: 'RetrOS Team',
    description: 'Scripted event system for creating interactive puzzle games',

    features: [
        new PuzzleCoordinator(),
        new PuzzleUI()
    ],

    apps: [],

    onLoad: async () => {
        console.log('Puzzle System loaded');

        // Register puzzle-specific achievements
        // (Could be done via separate registration system)
    },

    onUnload: async () => {
        console.log('Puzzle System unloaded');
    }
};
```

---

## 10. Implementation Phases

### Phase 1: Core Infrastructure (Days 1-2)
1. Create plugin directory structure
2. Implement PuzzleCoordinator base
3. Implement PuzzleActionExecutor with basic actions
4. Implement PuzzleScenarioLoader
5. Create basic scenario JSON format

### Phase 2: App Integration (Days 3-4)
1. Add event emissions to Minesweeper
2. Add event emissions to Calculator
3. Add event emissions to Terminal
4. Add event emissions to Notepad
5. Test event propagation

### Phase 3: UI & State (Day 5)
1. Implement PuzzleUI progress overlay
2. Add CSS styling
3. Implement state persistence
4. Add hint system

### Phase 4: Example Scenario (Day 6)
1. Create Caesar cipher example scenario
2. Test full flow
3. Debug and refine
4. Add achievements

### Phase 5: Advanced Features (Days 7-8)
1. Implement PuzzleConditionEvaluator with complex logic
2. Add more action types (timers, conditionals, etc.)
3. Create puzzle editor UI (optional)
4. Add scenario import/export

### Phase 6: Polish & Documentation (Day 9)
1. Write documentation
2. Create tutorial scenario
3. Add error handling
4. Performance optimization

---

## 11. Event Naming Conventions

### App Events
- `{appId}:game:win` - Game won
- `{appId}:game:lose` - Game lost
- `{appId}:file:save` - File saved
- `{appId}:file:open` - File opened
- `{appId}:command:execute` - Command executed
- `{appId}:calculation:result` - Calculation completed

### Puzzle Events
- `puzzle:scenario-loaded` - Scenario loaded
- `puzzle:scenario-complete` - Scenario completed
- `puzzle:step-activated` - Step started
- `puzzle:step-complete` - Step completed
- `puzzle:hint-request` - User requested hint
- `puzzle:app-unlocked` - App unlocked in puzzle

### System Events (existing)
- `boot:complete` - System booted
- `window:open` - Window opened
- `achievement:unlock` - Achievement unlocked

---

## 12. Advanced Action Types (Future)

```json
{
  "type": "waitForTime",
  "params": {
    "duration": 5000,
    "then": [
      { "type": "showDialog", "params": { "message": "Time's up!" } }
    ]
  }
}

{
  "type": "conditional",
  "params": {
    "condition": "state.hintsUsed < 3",
    "then": [
      { "type": "showNotification", "params": { "message": "Good job!" } }
    ],
    "else": [
      { "type": "showNotification", "params": { "message": "Too many hints!" } }
    ]
  }
}

{
  "type": "loop",
  "params": {
    "count": 3,
    "actions": [
      { "type": "playSound", "params": { "soundId": "beep" } }
    ]
  }
}

{
  "type": "randomChoice",
  "params": {
    "options": [
      { "type": "launchApp", "params": { "appId": "minesweeper" } },
      { "type": "launchApp", "params": { "appId": "snake" } }
    ]
  }
}
```

---

## 13. Security Considerations

1. **Sandboxed Evaluation**: Use `new Function()` with strict scope - no access to global objects
2. **Action Whitelisting**: Only allow predefined action types
3. **File Path Validation**: Restrict file operations to user directories
4. **Resource Limits**: Prevent infinite loops, excessive file creation
5. **Input Sanitization**: Sanitize all user-provided scenario data

---

## 14. Testing Strategy

### Unit Tests
- Scenario loading and validation
- Condition evaluation
- Action execution
- State persistence

### Integration Tests
- Full scenario playthrough
- App event propagation
- Achievement unlocking
- Progress saving/loading

### User Testing
- Example scenario walkthrough
- Hint system usability
- Progress UI clarity
- Error handling

---

## 15. Future Enhancements

1. **Scenario Editor GUI**: Visual editor for creating puzzles
2. **Multiplayer Puzzles**: Collaborative puzzle solving
3. **Time Trials**: Speedrun mode with leaderboards
4. **Branching Paths**: Non-linear puzzle progression
5. **Custom Apps**: Puzzle-specific mini-apps
6. **Inventory System**: Collect and use items across apps
7. **Dialogue System**: NPC conversations (via Clippy integration)
8. **Randomization**: Procedurally generated puzzle elements
9. **Difficulty Scaling**: Adaptive difficulty based on performance
10. **Community Scenarios**: Share and download user-created puzzles

---

## Summary

This scripted event system leverages RetrOS's existing architecture:

- **EventBus** for event coordination
- **FeatureBase** for modular plugin development
- **StateManager** for progress persistence
- **App events** for puzzle triggers
- **JSON DSL** for declarative scenario definition

The system is:
- **Extensible**: Easy to add new action types and conditions
- **Modular**: Packaged as a plugin, doesn't pollute core
- **Declarative**: Scenarios defined in JSON, no coding required
- **Persistent**: Progress saved automatically
- **User-friendly**: Visual progress UI with hints

This provides a powerful foundation for creating engaging puzzle games within the RetrOS environment!
