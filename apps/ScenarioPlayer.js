/**
 * ScenarioPlayer App
 * Browse, load, and play scripted scenarios
 */

import AppBase from './AppBase.js';
import ScenarioManager from '../core/scripted-events/ScenarioManager.js';
import ScenarioLoader from '../core/scripted-events/ScenarioLoader.js';
import { Events } from '../core/scripted-events/SemanticEvents.js';

// Bundled tutorial scenario (embedded to avoid JSON import issues)
const tutorialScenario = {
    id: "tutorial-basics",
    name: "RetrOS Tutorial",
    description: "Learn the basics of RetrOS - open apps, play games, and discover secrets!",
    version: "1.0.0",
    author: "RetrOS Team",
    icon: "📚",
    difficulty: "easy",
    estimatedTime: "5 minutes",
    tags: ["tutorial", "beginner", "introduction"],
    requirements: { apps: ["notepad", "minesweeper"], features: [] },
    config: { allowSkip: true, showProgress: true, autoSave: true, hintDelay: 30000, maxHints: 3 },
    variables: { appsOpened: 0, gamesPlayed: 0, notesWritten: false },
    onStart: {
        actions: [
            { type: "showNotification", message: "Welcome to the RetrOS Tutorial! Let's learn the basics." },
            { type: "showClippy", message: "Hi there! I'm here to help you learn RetrOS. Let's start by opening Notepad!" }
        ]
    },
    stages: [
        {
            id: "open-notepad",
            name: "Open Your First App",
            description: "Open Notepad from the desktop or Start menu",
            isInitialStage: true,
            onEnter: { actions: [{ type: "showNotification", message: "📝 Step 1: Double-click the Notepad icon on the desktop, or find it in the Start menu!" }] },
            hints: [
                { delay: 15000, message: "Look for the 📝 icon on the desktop!" },
                { delay: 30000, message: "You can also click Start → Programs → Accessories → Notepad" }
            ],
            triggers: [{
                id: "notepad-opened",
                event: "notepad:opened",
                actions: [
                    { type: "modifyVariable", name: "appsOpened", operation: "increment" },
                    { type: "showNotification", message: "Great! You opened Notepad! Now try typing something." },
                    { type: "advanceStage", stageId: "write-note" }
                ],
                once: true
            }]
        },
        {
            id: "write-note",
            name: "Write a Note",
            description: "Type something in Notepad",
            onEnter: { actions: [{ type: "showClippy", message: "Now type something! Try writing 'Hello RetrOS' or anything you like." }] },
            hints: [{ delay: 20000, message: "Just click in the text area and start typing!" }],
            triggers: [{
                id: "text-typed",
                event: "notepad:typed",
                actions: [
                    { type: "setVariable", name: "notesWritten", value: true },
                    { type: "showNotification", message: "Excellent! You're getting the hang of it! Now let's try a game." },
                    { type: "advanceStage", stageId: "play-minesweeper" }
                ],
                once: true
            }]
        },
        {
            id: "play-minesweeper",
            name: "Play a Game",
            description: "Open and play Minesweeper",
            onEnter: {
                actions: [
                    { type: "showNotification", message: "💣 Step 3: Now let's play Minesweeper! Find it in Start → Programs → Games" },
                    { type: "showClippy", message: "Minesweeper is a classic! Left-click to reveal cells, right-click to flag mines." }
                ]
            },
            hints: [
                { delay: 20000, message: "Look in Start → Programs → Games → Minesweeper" },
                { delay: 40000, message: "The 💣 icon should be on your desktop too!" }
            ],
            triggers: [
                {
                    id: "minesweeper-started",
                    event: "minesweeper:started",
                    actions: [
                        { type: "modifyVariable", name: "gamesPlayed", operation: "increment" },
                        { type: "showNotification", message: "You started Minesweeper! Try to reveal some cells." }
                    ],
                    once: true
                },
                {
                    id: "cell-revealed",
                    event: "minesweeper:cell:revealed",
                    actions: [{ type: "advanceStage", stageId: "complete" }],
                    once: true
                }
            ]
        },
        {
            id: "complete",
            name: "Tutorial Complete",
            description: "You've learned the basics!",
            onEnter: { actions: [{ type: "completeScenario" }] }
        }
    ],
    globalTriggers: [{
        id: "win-any-game",
        event: "game:win",
        actions: [{ type: "showNotification", message: "🎉 Congratulations on winning!" }]
    }],
    onComplete: {
        actions: [
            { type: "showDialog", title: "🎉 Tutorial Complete!", message: "You've learned the basics of RetrOS!\n\n• Opening apps\n• Using Notepad\n• Playing games\n\nNow explore on your own!" },
            { type: "playSound", sound: "achievement" },
            { type: "unlockAchievement", id: "tutorial_complete" }
        ]
    },
    onFail: {
        actions: [{ type: "showDialog", title: "Tutorial Interrupted", message: "No worries! You can restart the tutorial anytime." }]
    }
};

class ScenarioPlayer extends AppBase {
    constructor() {
        super({
            id: 'scenario-player',
            name: 'Scenario Player',
            icon: '🎮',
            width: 500,
            height: 450,
            resizable: true,
            singleton: true,
            category: 'games'
        });

        // Bundled scenarios
        this.bundledScenarios = [
            tutorialScenario
        ];
    }

    onOpen() {
        return `
            <style>
                .scenario-player {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #c0c0c0;
                    font-family: 'MS Sans Serif', Tahoma, sans-serif;
                    font-size: 11px;
                }
                .sp-header {
                    padding: 8px;
                    border-bottom: 2px groove #fff;
                    background: linear-gradient(to bottom, #c0c0c0, #a0a0a0);
                }
                .sp-header h2 {
                    margin: 0 0 4px 0;
                    font-size: 14px;
                }
                .sp-header p {
                    margin: 0;
                    color: #444;
                }
                .sp-content {
                    flex: 1;
                    overflow: auto;
                    padding: 8px;
                }
                .sp-status {
                    padding: 8px;
                    border-top: 2px groove #fff;
                    background: #e0e0e0;
                }
                .scenario-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .scenario-card {
                    background: #fff;
                    border: 2px inset #808080;
                    padding: 10px;
                    cursor: pointer;
                }
                .scenario-card:hover {
                    background: #e8e8ff;
                }
                .scenario-card.selected {
                    background: #000080;
                    color: #fff;
                }
                .scenario-card .sc-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 6px;
                }
                .scenario-card .sc-icon {
                    font-size: 24px;
                }
                .scenario-card .sc-title {
                    font-weight: bold;
                    font-size: 13px;
                }
                .scenario-card .sc-meta {
                    font-size: 10px;
                    color: #666;
                    display: flex;
                    gap: 10px;
                }
                .scenario-card.selected .sc-meta {
                    color: #aaa;
                }
                .scenario-card .sc-desc {
                    margin-top: 6px;
                    color: #333;
                }
                .scenario-card.selected .sc-desc {
                    color: #ddd;
                }
                .sp-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 8px;
                }
                .sp-actions button {
                    padding: 4px 16px;
                }
                .sp-progress {
                    display: none;
                    padding: 10px;
                    background: #ffffcc;
                    border: 2px inset #808080;
                    margin-bottom: 8px;
                }
                .sp-progress.active {
                    display: block;
                }
                .sp-progress .progress-title {
                    font-weight: bold;
                    margin-bottom: 4px;
                }
                .sp-progress .progress-bar {
                    height: 16px;
                    background: #fff;
                    border: 1px inset #808080;
                    margin: 4px 0;
                }
                .sp-progress .progress-fill {
                    height: 100%;
                    background: #000080;
                    width: 0%;
                    transition: width 0.3s;
                }
                .sp-progress .progress-info {
                    font-size: 10px;
                    color: #666;
                }
                .tag {
                    display: inline-block;
                    background: #e0e0e0;
                    padding: 1px 4px;
                    font-size: 9px;
                    border-radius: 2px;
                    margin-right: 4px;
                }
                .scenario-card.selected .tag {
                    background: #4040a0;
                }
            </style>
            <div class="scenario-player">
                <div class="sp-header">
                    <h2>🎮 Scenario Player</h2>
                    <p>Select a scenario to play guided experiences, puzzles, and tutorials</p>
                </div>

                <div class="sp-content">
                    <div class="sp-progress" id="progressPanel">
                        <div class="progress-title" id="progressTitle">Scenario Running</div>
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                        <div class="progress-info">
                            Stage: <span id="progressStage">-</span> |
                            Progress: <span id="progressPercent">0</span>%
                        </div>
                        <div class="sp-actions">
                            <button class="btn" id="btnStop">⏹ Stop</button>
                            <button class="btn" id="btnPause">⏸ Pause</button>
                        </div>
                    </div>

                    <div class="scenario-list" id="scenarioList">
                        <!-- Scenarios will be rendered here -->
                    </div>
                </div>

                <div class="sp-status">
                    <div class="sp-actions">
                        <button class="btn" id="btnPlay" disabled>▶ Play Selected</button>
                        <button class="btn" id="btnRefresh">🔄 Refresh</button>
                    </div>
                </div>
            </div>
        `;
    }

    onMount() {
        this.selectedScenario = null;

        // Button handlers
        this.getElement('#btnPlay')?.addEventListener('click', () => this.playSelected());
        this.getElement('#btnRefresh')?.addEventListener('click', () => this.loadScenarios());
        this.getElement('#btnStop')?.addEventListener('click', () => this.stopScenario());
        this.getElement('#btnPause')?.addEventListener('click', () => this.togglePause());

        // Listen for scenario events
        this.onEvent(Events.SCENARIO_STARTED, () => this.updateProgress());
        this.onEvent(Events.SCENARIO_STAGE_ENTERED, () => this.updateProgress());
        this.onEvent(Events.SCENARIO_COMPLETED, () => this.onScenarioEnd());
        this.onEvent(Events.SCENARIO_FAILED, () => this.onScenarioEnd());
        this.onEvent(Events.SCENARIO_ABORTED, () => this.onScenarioEnd());

        // Load scenarios
        this.loadScenarios();

        // Update progress if scenario is already running
        this.updateProgress();
    }

    loadScenarios() {
        const list = this.getElement('#scenarioList');
        if (!list) return;

        // Use bundled scenarios
        const scenarios = this.bundledScenarios.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            icon: s.icon || '📜',
            difficulty: s.difficulty || 'medium',
            estimatedTime: s.estimatedTime,
            tags: s.tags || [],
            author: s.author,
            data: s
        }));

        if (scenarios.length === 0) {
            list.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No scenarios available. Check the scenarios folder.</p>';
            return;
        }

        list.innerHTML = scenarios.map(s => `
            <div class="scenario-card" data-id="${s.id}">
                <div class="sc-header">
                    <span class="sc-icon">${s.icon}</span>
                    <span class="sc-title">${s.name}</span>
                </div>
                <div class="sc-meta">
                    <span>⚡ ${s.difficulty}</span>
                    ${s.estimatedTime ? `<span>⏱ ${s.estimatedTime}</span>` : ''}
                    ${s.author ? `<span>👤 ${s.author}</span>` : ''}
                </div>
                <div class="sc-desc">${s.description}</div>
                ${s.tags.length ? `<div style="margin-top: 6px">${s.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
            </div>
        `).join('');

        // Add click handlers
        list.querySelectorAll('.scenario-card').forEach(card => {
            card.addEventListener('click', () => {
                // Deselect others
                list.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('selected'));
                // Select this one
                card.classList.add('selected');
                this.selectedScenario = scenarios.find(s => s.id === card.dataset.id);
                this.getElement('#btnPlay').disabled = false;
            });

            // Double-click to play
            card.addEventListener('dblclick', () => {
                this.selectedScenario = scenarios.find(s => s.id === card.dataset.id);
                this.playSelected();
            });
        });
    }

    playSelected() {
        if (!this.selectedScenario) return;

        // Load the scenario
        const success = ScenarioManager.loadScenarioObject(this.selectedScenario.data);
        if (!success) {
            this.alert('Failed to load scenario');
            return;
        }

        // Start it
        ScenarioManager.start();
        this.updateProgress();
    }

    stopScenario() {
        ScenarioManager.stop();
        this.onScenarioEnd();
    }

    togglePause() {
        if (ScenarioManager.getStatus() === 'running') {
            ScenarioManager.pause();
            this.getElement('#btnPause').textContent = '▶ Resume';
        } else if (ScenarioManager.getStatus() === 'paused') {
            ScenarioManager.resume();
            this.getElement('#btnPause').textContent = '⏸ Pause';
        }
    }

    updateProgress() {
        const progress = ScenarioManager.getProgress();
        const panel = this.getElement('#progressPanel');

        if (!progress || progress.status === 'idle') {
            panel?.classList.remove('active');
            return;
        }

        panel?.classList.add('active');

        const title = this.getElement('#progressTitle');
        const fill = this.getElement('#progressFill');
        const stage = this.getElement('#progressStage');
        const percent = this.getElement('#progressPercent');

        if (title) title.textContent = `🎮 ${progress.scenarioName}`;
        if (fill) fill.style.width = `${progress.percent}%`;
        if (stage) stage.textContent = progress.currentStageName || '-';
        if (percent) percent.textContent = progress.percent;
    }

    onScenarioEnd() {
        const panel = this.getElement('#progressPanel');
        panel?.classList.remove('active');
        this.getElement('#btnPause').textContent = '⏸ Pause';
    }
}

export default ScenarioPlayer;
