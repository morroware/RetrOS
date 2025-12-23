/**
 * ScenarioPlayer App
 * Browse, launch, and manage scenario-based games and experiences
 *
 * This app allows users to:
 * - Browse available scenarios
 * - See scenario details (difficulty, estimated time, description)
 * - Launch scenarios
 * - View progress and completion status
 */

import AppBase from './AppBase.js';
import { ScenarioManager } from '../core/scripted-events/ScenarioManager.js';
import { scenarioLoader } from '../core/scripted-events/ScenarioLoader.js';
import StateManager from '../core/StateManager.js';
import EventBus from '../core/EventBus.js';

class ScenarioPlayer extends AppBase {
    constructor() {
        super({
            id: 'scenario-player',
            name: 'Scenario Player',
            icon: '🎬',
            width: 550,
            height: 450,
            resizable: true,
            singleton: true,
            category: 'games'
        });
    }

    onOpen() {
        return `
            <style>
                .scenario-player {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: #c0c0c0;
                    font-family: 'MS Sans Serif', Arial, sans-serif;
                }
                .scenario-header {
                    padding: 8px;
                    border-bottom: 1px solid #808080;
                    background: linear-gradient(to right, #000080, #1084d0);
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .scenario-header-icon {
                    font-size: 24px;
                }
                .scenario-header-text h2 {
                    margin: 0;
                    font-size: 14px;
                    font-weight: bold;
                }
                .scenario-header-text p {
                    margin: 2px 0 0 0;
                    font-size: 11px;
                    opacity: 0.9;
                }
                .scenario-content {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }
                .scenario-list {
                    width: 200px;
                    border-right: 1px solid #808080;
                    background: white;
                    overflow-y: auto;
                }
                .scenario-item {
                    padding: 8px;
                    border-bottom: 1px solid #e0e0e0;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .scenario-item:hover {
                    background: #e0e0ff;
                }
                .scenario-item.selected {
                    background: #000080;
                    color: white;
                }
                .scenario-item.completed .scenario-item-icon::after {
                    content: '';
                    font-size: 10px;
                }
                .scenario-item-icon {
                    font-size: 20px;
                }
                .scenario-item-info {
                    flex: 1;
                    min-width: 0;
                }
                .scenario-item-name {
                    font-weight: bold;
                    font-size: 12px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .scenario-item-meta {
                    font-size: 10px;
                    opacity: 0.7;
                }
                .scenario-details {
                    flex: 1;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                }
                .scenario-details h3 {
                    margin: 0 0 8px 0;
                    font-size: 16px;
                    color: #000080;
                }
                .scenario-details-icon {
                    font-size: 48px;
                    text-align: center;
                    margin-bottom: 12px;
                }
                .scenario-meta-row {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 8px;
                    font-size: 11px;
                }
                .scenario-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .scenario-description {
                    flex: 1;
                    background: white;
                    border: 1px inset #808080;
                    padding: 8px;
                    font-size: 12px;
                    line-height: 1.5;
                    overflow-y: auto;
                    margin-bottom: 12px;
                }
                .scenario-tags {
                    display: flex;
                    gap: 4px;
                    flex-wrap: wrap;
                    margin-bottom: 12px;
                }
                .scenario-tag {
                    background: #e0e0e0;
                    padding: 2px 6px;
                    border-radius: 2px;
                    font-size: 10px;
                }
                .scenario-actions {
                    display: flex;
                    gap: 8px;
                    justify-content: flex-end;
                }
                .scenario-empty {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #808080;
                    font-size: 12px;
                    text-align: center;
                    padding: 20px;
                }
                .scenario-running {
                    background: #ffffcc;
                    border: 1px solid #808080;
                    padding: 12px;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .scenario-running-indicator {
                    width: 10px;
                    height: 10px;
                    background: #00aa00;
                    border-radius: 50%;
                    animation: pulse 1s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .difficulty-easy { color: #008800; }
                .difficulty-medium { color: #888800; }
                .difficulty-hard { color: #cc4400; }
                .difficulty-expert { color: #cc0000; }
            </style>
            <div class="scenario-player">
                <div class="scenario-header">
                    <span class="scenario-header-icon">🎬</span>
                    <div class="scenario-header-text">
                        <h2>Scenario Player</h2>
                        <p>Interactive experiences, puzzles, and tutorials</p>
                    </div>
                </div>
                <div class="scenario-content">
                    <div class="scenario-list" id="scenarioList">
                        <!-- Populated dynamically -->
                    </div>
                    <div class="scenario-details" id="scenarioDetails">
                        <div class="scenario-empty">
                            Select a scenario from the list to view details
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    onMount() {
        this.loadScenarios();

        // Listen for scenario events
        this.onEvent('scenario:completed', () => this.loadScenarios());
        this.onEvent('scenario:loaded', () => this.updateRunningStatus());
    }

    loadScenarios() {
        const list = this.getElement('#scenarioList');
        if (!list) return;

        // Get available scenarios
        const scenarios = this.getAvailableScenarios();
        const completedScenarios = StateManager.getState('scenarios') || {};

        if (scenarios.length === 0) {
            list.innerHTML = `
                <div class="scenario-empty">
                    No scenarios available.<br><br>
                    Scenarios will appear here when added to the /scenarios folder.
                </div>
            `;
            return;
        }

        list.innerHTML = scenarios.map(scenario => {
            const isCompleted = completedScenarios[scenario.id]?.completed;
            return `
                <div class="scenario-item ${isCompleted ? 'completed' : ''}"
                     data-id="${scenario.id}"
                     data-path="${scenario.path || ''}">
                    <span class="scenario-item-icon">${scenario.icon || '📄'}</span>
                    <div class="scenario-item-info">
                        <div class="scenario-item-name">${scenario.name}</div>
                        <div class="scenario-item-meta">
                            ${scenario.difficulty || 'Unknown'} • ${scenario.estimatedTime || '?'}
                            ${isCompleted ? ' ✓' : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers
        list.querySelectorAll('.scenario-item').forEach(item => {
            item.addEventListener('click', () => this.selectScenario(item.dataset.id));
        });
    }

    getAvailableScenarios() {
        // Get scenarios from loader
        const loadedScenarios = scenarioLoader.listScenarios();

        // Also include some built-in scenarios
        const builtIn = [
            {
                id: 'tutorial',
                name: 'RetrOS Tutorial',
                description: 'Learn the basics of IlluminatOS! This guided tutorial will walk you through the desktop, apps, and features.',
                icon: '📚',
                difficulty: 'easy',
                estimatedTime: '5-10 min',
                tags: ['tutorial', 'beginner'],
                path: '/scenarios/tutorial.scenario.json'
            },
            {
                id: 'cipher-hunt',
                name: 'The Cipher Hunt',
                description: 'A mysterious message has been left on the system. Can you decode the clues and uncover the secret?',
                icon: '🔐',
                difficulty: 'medium',
                estimatedTime: '15-20 min',
                tags: ['puzzle', 'mystery'],
                path: '/scenarios/cipher-hunt.scenario.json'
            }
        ];

        // Merge, avoiding duplicates
        const allScenarios = [...builtIn];
        loadedScenarios.forEach(s => {
            if (!allScenarios.find(b => b.id === s.id)) {
                allScenarios.push(s);
            }
        });

        return allScenarios;
    }

    selectScenario(id) {
        const scenarios = this.getAvailableScenarios();
        const scenario = scenarios.find(s => s.id === id);

        if (!scenario) return;

        // Update selection
        const list = this.getElement('#scenarioList');
        list.querySelectorAll('.scenario-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.id === id);
        });

        // Show details
        this.showScenarioDetails(scenario);
    }

    showScenarioDetails(scenario) {
        const details = this.getElement('#scenarioDetails');
        if (!details) return;

        const completedData = StateManager.getState(`scenarios.${scenario.id}`) || {};
        const isRunning = ScenarioManager.isRunning() &&
            ScenarioManager.getScenarioInfo()?.id === scenario.id;

        const difficultyClass = `difficulty-${scenario.difficulty || 'unknown'}`;

        details.innerHTML = `
            ${isRunning ? `
                <div class="scenario-running">
                    <div class="scenario-running-indicator"></div>
                    <span>Currently running...</span>
                    <button class="btn" id="btnStop">Stop</button>
                </div>
            ` : ''}
            <div class="scenario-details-icon">${scenario.icon || '📄'}</div>
            <h3>${scenario.name}</h3>
            <div class="scenario-meta-row">
                <div class="scenario-meta-item ${difficultyClass}">
                    <span>⚡</span>
                    <span>${scenario.difficulty || 'Unknown'}</span>
                </div>
                <div class="scenario-meta-item">
                    <span>⏱️</span>
                    <span>${scenario.estimatedTime || 'Unknown'}</span>
                </div>
                ${completedData.completed ? `
                    <div class="scenario-meta-item" style="color: green;">
                        <span>✓</span>
                        <span>Completed</span>
                    </div>
                ` : ''}
            </div>
            ${scenario.tags?.length ? `
                <div class="scenario-tags">
                    ${scenario.tags.map(tag => `<span class="scenario-tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
            <div class="scenario-description">
                ${scenario.description || 'No description available.'}
            </div>
            <div class="scenario-actions">
                ${completedData.completed ? `
                    <button class="btn" id="btnReplay">Replay</button>
                ` : ''}
                ${isRunning ? '' : `
                    <button class="btn" id="btnStart">
                        ${completedData.completed ? 'Play Again' : 'Start'}
                    </button>
                `}
            </div>
        `;

        // Add button handlers
        details.querySelector('#btnStart')?.addEventListener('click', () => {
            this.startScenario(scenario);
        });

        details.querySelector('#btnReplay')?.addEventListener('click', () => {
            this.startScenario(scenario);
        });

        details.querySelector('#btnStop')?.addEventListener('click', () => {
            ScenarioManager.stopScenario(true);
            this.loadScenarios();
            this.showScenarioDetails(scenario);
        });
    }

    async startScenario(scenario) {
        console.log('[ScenarioPlayer] Starting scenario:', scenario.name, 'path:', scenario.path);

        // Show loading message via system dialog
        EventBus.emit('dialog:alert', {
            message: `Loading "${scenario.name}"...`,
            title: 'Scenario Player',
            icon: 'info'
        });

        try {
            // Try to load from file
            const loaded = await ScenarioManager.loadScenario(scenario.path);

            if (!loaded) {
                // File doesn't exist or failed to load
                const errors = ScenarioManager.loader?.getLastErrors?.() || [];
                console.error('[ScenarioPlayer] Failed to load scenario:', errors);
                EventBus.emit('dialog:alert', {
                    message: `Could not load scenario: ${errors[0]?.message || 'Unknown error'}`,
                    title: 'Scenario Error',
                    icon: 'error'
                });
                return;
            }

            // Start the scenario
            await ScenarioManager.startScenario();

            // Close this window to let user play
            this.close();
        } catch (error) {
            console.error('[ScenarioPlayer] Error starting scenario:', error);
            EventBus.emit('dialog:alert', {
                message: `Error starting scenario: ${error.message}`,
                title: 'Scenario Error',
                icon: 'error'
            });
        }
    }

    updateRunningStatus() {
        // Refresh the display if a scenario is running
        const info = ScenarioManager.getScenarioInfo();
        if (info) {
            this.selectScenario(info.id);
        }
    }
}

export default ScenarioPlayer;
