/**
 * ScriptRunner - RetrOS Scripting IDE
 *
 * A development tool for writing and testing RetroScript scripts.
 * Provides syntax highlighting, output console, and event monitoring.
 */

import AppBase from './AppBase.js';
import EventBus from '../core/EventBus.js';
import ScriptEngine from '../core/ScriptEngine.js';
import CommandBus from '../core/CommandBus.js';
import FileSystemManager from '../core/FileSystemManager.js';

class ScriptRunner extends AppBase {
    constructor() {
        super({
            id: 'scriptrunner',
            name: 'Script Runner',
            icon: '📜',
            width: 800,
            height: 600,
            category: 'systemtools'
        });

        this.output = [];
        this.eventLog = [];
        this.isRecording = false;
        this.maxLogEntries = 100;
    }

    onOpen(params) {
        const sampleScript = `# RetrOS Script Demo
# Launch an app and interact with it

# Launch Notepad
launch notepad

# Wait for it to open
wait 500

# Show a notification
notify Script is running!

# Set a variable
set $count = 0

# Loop and log
loop 3 {
    set $count = $count + 1
    print Loop iteration: $count
}

# Play a sound
play notify

# Final message
alert Script completed successfully!`;

        return `
            <div class="script-runner">
                <div class="script-toolbar">
                    <button class="script-btn" id="runBtn" title="Run Script (F5)">
                        <span class="btn-icon">▶</span> Run
                    </button>
                    <button class="script-btn" id="stopBtn" title="Stop Script">
                        <span class="btn-icon">⏹</span> Stop
                    </button>
                    <button class="script-btn" id="clearBtn" title="Clear Output">
                        <span class="btn-icon">🗑</span> Clear
                    </button>
                    <span class="toolbar-divider"></span>
                    <button class="script-btn" id="recordBtn" title="Record Events">
                        <span class="btn-icon">⏺</span> Record
                    </button>
                    <button class="script-btn" id="saveBtn" title="Save Script">
                        <span class="btn-icon">💾</span> Save
                    </button>
                    <button class="script-btn" id="loadBtn" title="Load Script">
                        <span class="btn-icon">📂</span> Load
                    </button>
                    <span class="toolbar-divider"></span>
                    <button class="script-btn" id="helpBtn" title="Script Help">
                        <span class="btn-icon">❓</span> Help
                    </button>
                </div>

                <div class="script-main">
                    <div class="script-editor-pane">
                        <div class="pane-header">Script Editor</div>
                        <textarea class="script-editor" id="scriptEditor" spellcheck="false">${sampleScript}</textarea>
                    </div>

                    <div class="script-output-pane">
                        <div class="output-tabs">
                            <button class="output-tab active" data-tab="output">Output</button>
                            <button class="output-tab" data-tab="events">Events</button>
                            <button class="output-tab" data-tab="commands">Commands</button>
                        </div>
                        <div class="output-content" id="outputContent">
                            <pre class="output-text" id="outputText">Ready to run scripts...
</pre>
                        </div>
                    </div>
                </div>

                <div class="script-statusbar">
                    <span id="statusText">Ready</span>
                    <span class="status-divider">|</span>
                    <span id="lineInfo">Line 1, Col 1</span>
                </div>
            </div>

            <style>
                .script-runner {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--win95-gray);
                    font-family: 'MS Sans Serif', Tahoma, sans-serif;
                }

                .script-toolbar {
                    display: flex;
                    padding: 4px;
                    background: var(--win95-gray);
                    border-bottom: 1px solid #808080;
                    gap: 2px;
                    flex-wrap: wrap;
                }

                .script-btn {
                    padding: 4px 8px;
                    background: var(--win95-gray);
                    border: 2px outset var(--win95-light);
                    cursor: pointer;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .script-btn:hover {
                    background: #d0d0d0;
                }

                .script-btn:active {
                    border-style: inset;
                }

                .script-btn .btn-icon {
                    font-size: 12px;
                }

                .toolbar-divider {
                    width: 1px;
                    background: #808080;
                    margin: 0 4px;
                }

                .script-main {
                    display: flex;
                    flex: 1;
                    min-height: 0;
                }

                .script-editor-pane {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    border-right: 2px groove var(--win95-gray);
                }

                .script-output-pane {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-width: 250px;
                }

                .pane-header {
                    padding: 4px 8px;
                    background: var(--win95-blue);
                    color: white;
                    font-weight: bold;
                    font-size: 12px;
                }

                .script-editor {
                    flex: 1;
                    font-family: 'Consolas', 'Courier New', monospace;
                    font-size: 13px;
                    line-height: 1.4;
                    padding: 8px;
                    border: 2px inset var(--win95-light);
                    resize: none;
                    background: white;
                    color: #000;
                    tab-size: 4;
                }

                .script-editor:focus {
                    outline: none;
                }

                .output-tabs {
                    display: flex;
                    background: var(--win95-gray);
                    border-bottom: 1px solid #808080;
                }

                .output-tab {
                    padding: 4px 12px;
                    border: none;
                    background: #d0d0d0;
                    cursor: pointer;
                    font-size: 12px;
                    border-right: 1px solid #808080;
                }

                .output-tab.active {
                    background: white;
                    border-bottom: 1px solid white;
                    margin-bottom: -1px;
                }

                .output-content {
                    flex: 1;
                    overflow: auto;
                    background: #000;
                }

                .output-text {
                    font-family: 'Consolas', 'Courier New', monospace;
                    font-size: 12px;
                    line-height: 1.4;
                    padding: 8px;
                    margin: 0;
                    color: #00ff00;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }

                .output-text .error {
                    color: #ff6b6b;
                }

                .output-text .success {
                    color: #00ff00;
                }

                .output-text .info {
                    color: #87ceeb;
                }

                .output-text .event {
                    color: #ffd700;
                }

                .script-statusbar {
                    display: flex;
                    padding: 4px 8px;
                    background: var(--win95-gray);
                    border-top: 2px groove var(--win95-gray);
                    font-size: 11px;
                    color: #404040;
                }

                .status-divider {
                    margin: 0 8px;
                    color: #808080;
                }

                .recording .record-indicator {
                    color: red;
                    animation: blink 1s infinite;
                }

                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
            </style>
        `;
    }

    onMount() {
        const runBtn = this.getElement('#runBtn');
        const stopBtn = this.getElement('#stopBtn');
        const clearBtn = this.getElement('#clearBtn');
        const recordBtn = this.getElement('#recordBtn');
        const saveBtn = this.getElement('#saveBtn');
        const loadBtn = this.getElement('#loadBtn');
        const helpBtn = this.getElement('#helpBtn');
        const editor = this.getElement('#scriptEditor');
        const tabs = this.getElement('.output-tabs');

        // Run script
        this.addHandler(runBtn, 'click', () => this.runScript());

        // Stop script
        this.addHandler(stopBtn, 'click', () => this.stopScript());

        // Clear output
        this.addHandler(clearBtn, 'click', () => this.clearOutput());

        // Record events
        this.addHandler(recordBtn, 'click', () => this.toggleRecording());

        // Save script
        this.addHandler(saveBtn, 'click', () => this.saveScript());

        // Load script
        this.addHandler(loadBtn, 'click', () => this.loadScript());

        // Help
        this.addHandler(helpBtn, 'click', () => this.showHelp());

        // Tab switching
        this.addHandler(tabs, 'click', (e) => {
            if (e.target.classList.contains('output-tab')) {
                this.switchTab(e.target.dataset.tab);
            }
        });

        // Track cursor position
        this.addHandler(editor, 'keyup', () => this.updateLineInfo());
        this.addHandler(editor, 'click', () => this.updateLineInfo());

        // F5 to run
        this.addHandler(editor, 'keydown', (e) => {
            if (e.key === 'F5') {
                e.preventDefault();
                this.runScript();
            }
        });

        // Subscribe to script output events
        this.subscribe('script:output', ({ message }) => {
            this.appendOutput(message, 'success');
        });

        this.subscribe('script:error', ({ error, line }) => {
            this.appendOutput(`Error${line ? ` at line ${line}` : ''}: ${error}`, 'error');
        });

        // Monitor events for event log
        this.eventSubscription = EventBus.on('*', (payload, meta, event) => {
            if (this.eventLog.length > this.maxLogEntries) {
                this.eventLog.shift();
            }
            this.eventLog.push({
                time: new Date().toLocaleTimeString(),
                event: event.name,
                payload: JSON.stringify(payload).substring(0, 100)
            });
        });
    }

    async runScript() {
        const editor = this.getElement('#scriptEditor');
        const script = editor.value;

        this.setStatus('Running...');
        this.appendOutput('\n--- Script Started ---', 'info');

        const result = await ScriptEngine.run(script);

        if (result.success) {
            this.appendOutput('--- Script Completed ---', 'success');
            if (result.result !== undefined && result.result !== null) {
                this.appendOutput(`Result: ${JSON.stringify(result.result)}`, 'info');
            }
        } else {
            this.appendOutput(`--- Script Failed: ${result.error} ---`, 'error');
        }

        this.setStatus('Ready');
    }

    stopScript() {
        ScriptEngine.stop();
        this.appendOutput('--- Script Stopped ---', 'info');
        this.setStatus('Stopped');
    }

    clearOutput() {
        this.output = [];
        this.eventLog = [];
        const outputText = this.getElement('#outputText');
        if (outputText) {
            outputText.innerHTML = 'Output cleared.\n';
        }
    }

    toggleRecording() {
        const recordBtn = this.getElement('#recordBtn');

        if (this.isRecording) {
            this.isRecording = false;
            EventBus.emit('macro:record:stop');
            recordBtn.innerHTML = '<span class="btn-icon">⏺</span> Record';
            this.appendOutput('Recording stopped', 'info');
        } else {
            this.isRecording = true;
            EventBus.emit('macro:record:start', { macroId: 'script-runner-macro' });
            recordBtn.innerHTML = '<span class="btn-icon record-indicator">⏺</span> Stop Rec';
            this.appendOutput('Recording started - perform actions to record...', 'info');
        }
    }

    async saveScript() {
        const editor = this.getElement('#scriptEditor');
        const script = editor.value;

        try {
            const result = await EventBus.request('dialog:file-save', {
                title: 'Save Script',
                defaultPath: ['C:', 'Users', 'User', 'Documents'],
                filters: [
                    { name: 'RetroScript', extensions: ['retro'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            }, { timeout: 60000 });

            if (result && result.path) {
                FileSystemManager.writeFile(result.path, script, 'retro');
                this.appendOutput(`Script saved to ${result.path.join('/')}`, 'success');
            }
        } catch (e) {
            // Save to default location
            const path = ['C:', 'Users', 'User', 'Documents', 'script.retro'];
            FileSystemManager.writeFile(path, script, 'retro');
            this.appendOutput(`Script saved to ${path.join('/')}`, 'success');
        }
    }

    async loadScript() {
        try {
            const result = await EventBus.request('dialog:file-open', {
                title: 'Open Script',
                defaultPath: ['C:', 'Users', 'User', 'Documents'],
                filters: [
                    { name: 'RetroScript', extensions: ['retro'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            }, { timeout: 60000 });

            if (result && result.path) {
                const content = FileSystemManager.readFile(result.path);
                const editor = this.getElement('#scriptEditor');
                if (editor) {
                    editor.value = content;
                    this.appendOutput(`Script loaded from ${result.path.join('/')}`, 'success');
                }
            }
        } catch (e) {
            this.appendOutput('Load cancelled', 'info');
        }
    }

    showHelp() {
        const helpText = `
RetroScript Language Reference
==============================

COMMANDS:
  launch <app>              Launch an application
  launch <app> with k=v     Launch with parameters
  close [windowId]          Close a window
  wait <ms>                 Wait for milliseconds
  print <message>           Print to output
  alert <message>           Show alert dialog
  notify <message>          Show notification
  play <sound>              Play a sound

VARIABLES:
  set $name = value         Set a variable
  $name                     Use a variable in expressions

CONTROL FLOW:
  if condition then { }     Conditional
  loop N { }                Repeat N times
  while condition { }       While loop
  break                     Exit loop

EVENTS:
  emit event key=value      Emit an event
  on event { }              Subscribe to event

FILESYSTEM:
  write "text" to "path"    Write to file
  read "path" into $var     Read file into variable
  mkdir "path"              Create directory
  delete "path"             Delete file/directory

BUILT-IN FUNCTIONS:
  call random min max       Random number
  call concat a b c         Concatenate strings
  call upper "text"         Uppercase
  call lower "text"         Lowercase
  call now                  Current timestamp
  call time                 Current time string
  call date                 Current date string

EXAMPLES:
  # Open calculator, compute, close
  launch calculator
  wait 500
  close

  # Create a file
  write "Hello World!" to "C:/test.txt"

  # Loop with counter
  loop 5 {
      print Iteration: $i
  }
`;

        this.appendOutput(helpText, 'info');
    }

    switchTab(tabName) {
        const tabs = this.getElement('.output-tabs').querySelectorAll('.output-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        const outputText = this.getElement('#outputText');
        if (!outputText) return;

        switch (tabName) {
            case 'output':
                outputText.innerHTML = this.output.join('\n') || 'No output yet.\n';
                break;
            case 'events':
                outputText.innerHTML = this.eventLog.map(e =>
                    `<span class="event">[${e.time}] ${e.event}</span>\n  ${e.payload}`
                ).join('\n\n') || 'No events logged yet.\n';
                break;
            case 'commands':
                const commands = CommandBus.getCommands();
                outputText.innerHTML = 'Available Commands:\n\n' + commands.map(c =>
                    `  command:${c}`
                ).join('\n');
                break;
        }
    }

    appendOutput(message, type = 'normal') {
        const outputText = this.getElement('#outputText');
        if (!outputText) return;

        const timestamp = new Date().toLocaleTimeString();
        const formattedMessage = type !== 'normal'
            ? `<span class="${type}">[${timestamp}] ${this.escapeHtml(message)}</span>`
            : `[${timestamp}] ${this.escapeHtml(message)}`;

        this.output.push(formattedMessage);
        if (this.output.length > this.maxLogEntries) {
            this.output.shift();
        }

        outputText.innerHTML = this.output.join('\n');
        outputText.parentElement.scrollTop = outputText.parentElement.scrollHeight;
    }

    setStatus(text) {
        const statusText = this.getElement('#statusText');
        if (statusText) {
            statusText.textContent = text;
        }
    }

    updateLineInfo() {
        const editor = this.getElement('#scriptEditor');
        const lineInfo = this.getElement('#lineInfo');
        if (!editor || !lineInfo) return;

        const text = editor.value.substring(0, editor.selectionStart);
        const lines = text.split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;

        lineInfo.textContent = `Line ${line}, Col ${col}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    onClose() {
        if (this.eventSubscription) {
            this.eventSubscription();
        }
        if (this.isRecording) {
            EventBus.emit('macro:record:stop');
        }
    }
}

export default new ScriptRunner();
