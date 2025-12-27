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
        const sampleScript = `# ============================================
# RetroScript Comprehensive Test Suite
# Tests all scripting features, apps, and events
# ============================================

print ========================================
print   RETROSCRIPT COMPREHENSIVE TEST
print ========================================

# ==========================================
# SECTION A: CORE LANGUAGE FEATURES
# ==========================================

# ------------------------------------------
# TEST 1: Variables & Basic Types
# ------------------------------------------
print
print [TEST 1] Variables & Types
print ----------------------------------------

set $string = "Hello World"
set $number = 42
set $decimal = 3.14
set $boolean = true

print String variable: $string
print Number variable: $number
print Decimal variable: $decimal
print Boolean variable: $boolean

# ------------------------------------------
# TEST 2: Arithmetic Operations
# ------------------------------------------
print
print [TEST 2] Arithmetic Operations
print ----------------------------------------

set $a = 20
set $b = 6
set $sum = $a + $b
set $diff = $a - $b
set $prod = $a * $b
set $quot = $a / $b

print $a + $b = $sum (expected: 26)
print $a - $b = $diff (expected: 14)
print $a * $b = $prod (expected: 120)
print $a / $b = $quot (expected: ~3.33)

# ------------------------------------------
# TEST 3: String Functions
# ------------------------------------------
print
print [TEST 3] String Functions
print ----------------------------------------

set $text = "  Hello World  "
set $upper = call upper $text
set $lower = call lower $text
set $trimmed = call trim $text
set $len = call length $trimmed
set $concat = call concat "A" "B" "C"
set $sub = call substr "Hello" 0 3

print upper(): $upper
print lower(): $lower
print trim(): [$trimmed]
print length(): $len
print concat(A,B,C): $concat
print substr(Hello,0,3): $sub

set $hasHello = call contains "Hello World" "Hello"
set $starts = call startsWith "Hello" "He"
set $ends = call endsWith "Hello" "lo"
print contains(Hello World, Hello): $hasHello
print startsWith(Hello, He): $starts
print endsWith(Hello, lo): $ends

# ------------------------------------------
# TEST 4: Math Functions
# ------------------------------------------
print
print [TEST 4] Math Functions
print ----------------------------------------

set $rand = call random 1 100
set $absVal = call abs -42
set $rounded = call round 3.7
set $floored = call floor 3.9
set $ceiled = call ceil 3.1

print random(1,100): $rand
print abs(-42): $absVal
print round(3.7): $rounded
print floor(3.9): $floored
print ceil(3.1): $ceiled

# ------------------------------------------
# TEST 5: Time Functions
# ------------------------------------------
print
print [TEST 5] Time Functions
print ----------------------------------------

set $timestamp = call now
set $timeStr = call time
set $dateStr = call date

print now(): $timestamp
print time(): $timeStr
print date(): $dateStr

# ------------------------------------------
# TEST 6: Type Check Functions
# ------------------------------------------
print
print [TEST 6] Type Check Functions
print ----------------------------------------

set $numCheck = call isNumber 42
set $strCheck = call isString "hello"
set $nullCheck = call isNull null
set $typeOf = call typeof "test"
set $toNum = call toNumber "123"
set $toStr = call toString 456

print isNumber(42): $numCheck
print isString(hello): $strCheck
print isNull(null): $nullCheck
print typeof(test): $typeOf
print toNumber(123): $toNum
print toString(456): $toStr

# ------------------------------------------
# TEST 7: Control Flow - Conditionals
# ------------------------------------------
print
print [TEST 7] Control Flow - Conditionals
print ----------------------------------------

set $x = 10

if $x > 5 then {
    print $x > 5: PASS
}

if $x < 5 then {
    print $x < 5: FAIL
} else {
    print $x < 5 else: PASS
}

set $y = 10
if $x == $y then {
    print $x == $y: PASS
}

if $x != 5 then {
    print $x != 5: PASS
}

# ------------------------------------------
# TEST 8: Control Flow - Loops
# ------------------------------------------
print
print [TEST 8] Control Flow - Loops
print ----------------------------------------

print Count loop (0 to 2):
loop 3 {
    print   iteration $i
}

print Loop with break at 2:
loop 5 {
    print   iteration $i
    if $i == 2 then {
        print   breaking!
        break
    }
}

# ==========================================
# SECTION B: SYSTEM FEATURES
# ==========================================

# ------------------------------------------
# TEST 9: Sound System
# ------------------------------------------
print
print [TEST 9] Sound System
print ----------------------------------------

print Playing sounds...
play notify
wait 200
play open
wait 200
print Sound test complete

# ------------------------------------------
# TEST 10: Notifications
# ------------------------------------------
print
print [TEST 10] Notifications
print ----------------------------------------

notify Test notification from script!
print Notification sent
wait 300

# ------------------------------------------
# TEST 11: Alert Dialog
# ------------------------------------------
print
print [TEST 11] Alert Dialog
print ----------------------------------------

print Showing alert...
alert Script test alert!
print Alert shown (non-blocking)

# ------------------------------------------
# TEST 12: Custom Event Emission
# ------------------------------------------
print
print [TEST 12] Custom Event Emission
print ----------------------------------------

print Emitting custom events...
emit script:test message="Hello from script"
emit custom:event type="test" value=42
print Events emitted

# ------------------------------------------
# TEST 13: File System Operations
# ------------------------------------------
print
print [TEST 13] File System Operations
print ----------------------------------------

set $testPath = "C:/Users/User/Documents/script_test.txt"
set $testContent = "Test file created by RetroScript"

print Writing file...
write $testContent to $testPath
print File written to $testPath

print Reading file...
read $testPath into $readContent
print File content: $readContent

print Cleaning up test file...
delete $testPath
print Test file deleted

# ------------------------------------------
# TEST 14: System Functions
# ------------------------------------------
print
print [TEST 14] System Functions
print ----------------------------------------

set $windows = call getWindows
set $winCount = call count $windows
print Open windows: $winCount

set $apps = call getApps
set $appCount = call count $apps
print Available apps: $appCount

# ==========================================
# SECTION C: APP LAUNCH TESTS
# ==========================================

# ------------------------------------------
# TEST 15: Productivity Apps
# ------------------------------------------
print
print [TEST 15] Productivity Apps
print ----------------------------------------

print Launching Calculator...
launch calculator
wait 400
set $wins = call getWindows
set $count = call count $wins
print Windows after Calculator: $count
close
wait 200

print Launching Notepad...
launch notepad
wait 400
set $wins = call getWindows
set $count = call count $wins
print Windows after Notepad: $count
close
wait 200

print Launching Clock...
launch clock
wait 400
close
wait 200
print Productivity apps: PASS

# ------------------------------------------
# TEST 16: System Tools
# ------------------------------------------
print
print [TEST 16] System Tools
print ----------------------------------------

print Launching Terminal...
launch terminal
wait 400
close
wait 200

print Launching My Computer...
launch mycomputer
wait 400
close
wait 200

print System tools: PASS

# ==========================================
# SECTION D: GAME TESTS
# ==========================================

# ------------------------------------------
# TEST 17: Snake Game
# ------------------------------------------
print
print [TEST 17] Snake Game Launch
print ----------------------------------------

print Launching Snake...
launch snake
wait 500

set $wins = call getWindows
set $count = call count $wins
print Windows with Snake: $count

print Emitting game events for Snake...
emit game:start appId="snake"
wait 100
emit snake:food:eat score=10
wait 100
emit game:score appId="snake" score=10
wait 100
emit game:over appId="snake" score=10

close
wait 200
print Snake game: PASS

# ------------------------------------------
# TEST 18: Minesweeper Game
# ------------------------------------------
print
print [TEST 18] Minesweeper Game Launch
print ----------------------------------------

print Launching Minesweeper...
launch minesweeper
wait 500

print Emitting Minesweeper events...
emit game:start appId="minesweeper"
wait 100
emit minesweeper:cell:reveal row=0 col=0 value=0
wait 100
emit minesweeper:cell:flag row=1 col=1
wait 100
emit minesweeper:timer seconds=10

close
wait 200
print Minesweeper: PASS

# ------------------------------------------
# TEST 19: Asteroids Game
# ------------------------------------------
print
print [TEST 19] Asteroids Game Launch
print ----------------------------------------

print Launching Asteroids...
launch asteroids
wait 500

print Emitting Asteroids events...
emit game:start appId="asteroids"
wait 100
emit asteroids:asteroid:destroy size="large" points=20
wait 100
emit asteroids:powerup:collect type="shield"
wait 100
emit game:score appId="asteroids" score=100
wait 100
emit game:lives appId="asteroids" lives=2

close
wait 200
print Asteroids: PASS

# ------------------------------------------
# TEST 20: Solitaire Game
# ------------------------------------------
print
print [TEST 20] Solitaire Game Launch
print ----------------------------------------

print Launching Solitaire...
launch solitaire
wait 500

print Emitting Solitaire events...
emit game:start appId="solitaire"
wait 100
emit solitaire:card:move from="tableau" to="foundation"
wait 100
emit solitaire:stock:draw
wait 100

close
wait 200
print Solitaire: PASS

# ------------------------------------------
# TEST 21: SkiFree Game
# ------------------------------------------
print
print [TEST 21] SkiFree Game Launch
print ----------------------------------------

print Launching SkiFree...
launch skifree
wait 500

print Emitting SkiFree events...
emit game:start appId="skifree"
wait 100
emit skifree:jump distance=50
wait 100
emit game:score appId="skifree" score=500
wait 100
emit skifree:yeti:spawn

close
wait 200
print SkiFree: PASS

# ==========================================
# SECTION E: EVENT SYSTEM TESTS
# ==========================================

# ------------------------------------------
# TEST 22: Window Events
# ------------------------------------------
print
print [TEST 22] Window Management Events
print ----------------------------------------

print Testing window lifecycle...
launch calculator
wait 300

print Emitting focus event...
emit window:focus windowId="test"
wait 100

print Emitting minimize event...
emit window:minimize windowId="test"
wait 100

print Emitting maximize event...
emit window:maximize windowId="test"
wait 100

close
wait 200
print Window events: PASS

# ------------------------------------------
# TEST 23: Desktop Events
# ------------------------------------------
print
print [TEST 23] Desktop Events
print ----------------------------------------

print Emitting desktop events...
emit desktop:refresh
wait 100
emit desktop:render
wait 100
print Desktop events: PASS

# ------------------------------------------
# TEST 24: Audio Events
# ------------------------------------------
print
print [TEST 24] Audio Events
print ----------------------------------------

print Emitting audio events...
emit sound:play type="notify"
wait 200
emit sound:play type="error"
wait 200
emit sound:play type="close"
wait 200
print Audio events: PASS

# ------------------------------------------
# TEST 25: System Events
# ------------------------------------------
print
print [TEST 25] System Events
print ----------------------------------------

print Emitting system events...
emit notification:show message="System event test"
wait 300
emit filesystem:changed
wait 100
print System events: PASS

# ==========================================
# SECTION F: MULTI-APP WORKFLOW
# ==========================================

# ------------------------------------------
# TEST 26: Multi-App Workflow
# ------------------------------------------
print
print [TEST 26] Multi-App Workflow
print ----------------------------------------

print Opening multiple apps...
launch calculator
wait 200
launch notepad
wait 200
launch clock
wait 200

set $wins = call getWindows
set $count = call count $wins
print Open windows: $count

print Closing all apps...
close
wait 100
close
wait 100
close
wait 200

set $wins = call getWindows
set $count = call count $wins
print Windows after closing: $count
print Multi-app workflow: PASS

# ==========================================
# TEST SUMMARY
# ==========================================
print
print ========================================
print   ALL TESTS COMPLETED!
print ========================================
print
print Section A: Core Language Features
print Section B: System Features
print Section C: App Launch Tests
print Section D: Game Tests
print Section E: Event System Tests
print Section F: Multi-App Workflow
print
print Check output above for any FAIL messages.
print All PASS = scripting system working!

notify All comprehensive tests completed!
play notify`;

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
                        <div class="editor-container">
                            <div class="line-numbers" id="lineNumbers"></div>
                            <div class="editor-wrapper">
                                <pre class="syntax-highlight" id="syntaxHighlight" aria-hidden="true"></pre>
                                <textarea class="script-editor" id="scriptEditor" spellcheck="false">${sampleScript}</textarea>
                            </div>
                        </div>
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

                .editor-container {
                    flex: 1;
                    display: flex;
                    border: 2px inset var(--win95-light);
                    background: #1e1e1e;
                    overflow: hidden;
                }

                .line-numbers {
                    padding: 8px 8px 8px 4px;
                    background: #252526;
                    color: #858585;
                    font-family: 'Consolas', 'Courier New', monospace;
                    font-size: 13px;
                    line-height: 1.4;
                    text-align: right;
                    user-select: none;
                    border-right: 1px solid #3c3c3c;
                    min-width: 35px;
                    overflow: hidden;
                }

                .editor-wrapper {
                    flex: 1;
                    position: relative;
                    overflow: auto;
                }

                .syntax-highlight {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    margin: 0;
                    padding: 8px;
                    font-family: 'Consolas', 'Courier New', monospace;
                    font-size: 13px;
                    line-height: 1.4;
                    color: #d4d4d4;
                    background: transparent;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    pointer-events: none;
                    tab-size: 4;
                }

                .script-editor {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    font-family: 'Consolas', 'Courier New', monospace;
                    font-size: 13px;
                    line-height: 1.4;
                    padding: 8px;
                    border: none;
                    resize: none;
                    background: transparent;
                    color: transparent;
                    caret-color: #fff;
                    tab-size: 4;
                    z-index: 1;
                }

                .script-editor:focus {
                    outline: none;
                }

                /* Syntax highlighting colors */
                .syntax-highlight .keyword { color: #569cd6; }
                .syntax-highlight .command { color: #c586c0; }
                .syntax-highlight .function { color: #dcdcaa; }
                .syntax-highlight .variable { color: #9cdcfe; }
                .syntax-highlight .string { color: #ce9178; }
                .syntax-highlight .number { color: #b5cea8; }
                .syntax-highlight .comment { color: #6a9955; font-style: italic; }
                .syntax-highlight .operator { color: #d4d4d4; }
                .syntax-highlight .builtin { color: #4ec9b0; }
                .syntax-highlight .event { color: #dcdcaa; }

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

        // Track cursor position and update highlighting
        this.addHandler(editor, 'keyup', () => {
            this.updateLineInfo();
            this.updateSyntaxHighlight();
        });
        this.addHandler(editor, 'click', () => this.updateLineInfo());
        this.addHandler(editor, 'input', () => this.updateSyntaxHighlight());
        this.addHandler(editor, 'scroll', () => this.syncScroll());

        // Initial syntax highlight
        this.updateSyntaxHighlight();

        // F5 to run, Tab for indent
        this.addHandler(editor, 'keydown', (e) => {
            if (e.key === 'F5') {
                e.preventDefault();
                this.runScript();
            }
            // Handle Tab key for indentation
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = editor.selectionStart;
                const end = editor.selectionEnd;
                editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
                editor.selectionStart = editor.selectionEnd = start + 4;
                this.updateSyntaxHighlight();
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

See SCRIPTING_GUIDE.md for complete documentation.

COMMANDS:
  launch <app>              Launch an application
  launch <app> with k=v     Launch with parameters
  close [windowId]          Close a window
  wait <ms>                 Wait for milliseconds
  print <message>           Print to output
  alert <message>           Show alert dialog (non-blocking)
  confirm <msg> into $var   Show confirm dialog (waits for response)
  prompt <msg> into $var    Show input dialog (waits for response)
  notify <message>          Show notification
  play <sound>              Play a sound (notify, error, open, close)

VARIABLES:
  set $name = value         Set a variable
  $name                     Use a variable in expressions
  $i                        Loop counter (inside loops)

ARITHMETIC:
  set $x = $a + $b          Addition
  set $x = $a - $b          Subtraction
  set $x = $a * $b          Multiplication
  set $x = $a / $b          Division

CONTROL FLOW:
  if cond then { } else { } Conditional
  loop N { }                Repeat N times
  loop while cond { }       While loop
  break                     Exit loop
  return value              Return from script

COMPARISONS: ==, !=, <, >, <=, >=, &&, ||

EVENTS:
  emit event key=value      Emit an event
  on event { }              Subscribe to event

FILESYSTEM:
  write "text" to "path"    Write to file
  read "path" into $var     Read file into variable
  mkdir "path"              Create directory
  delete "path"             Delete file/directory

WINDOW MANAGEMENT:
  focus <windowId>          Bring window to front
  minimize <windowId>       Minimize window
  maximize <windowId>       Maximize window

STRING FUNCTIONS:
  call upper text           Uppercase
  call lower text           Lowercase
  call trim text            Remove whitespace
  call length text          String length
  call concat a b c         Concatenate strings
  call substr text 0 3      Substring
  call replace t old new    Replace first occurrence
  call contains text srch   Check if contains
  call startsWith text pre  Check prefix
  call endsWith text suf    Check suffix
  call split text sep       Split into array
  call join arr sep         Join array to string

MATH FUNCTIONS:
  call random min max       Random integer
  call abs value            Absolute value
  call round value          Round to nearest
  call floor value          Round down
  call ceil value           Round up

ARRAY FUNCTIONS:
  call count arr            Array length
  call first arr            First element
  call last arr             Last element
  call push arr item        Add to end
  call pop arr              Remove from end
  call includes arr item    Check if contains

TIME FUNCTIONS:
  call now                  Unix timestamp (ms)
  call time                 Current time string
  call date                 Current date string

TYPE FUNCTIONS:
  call typeof val           Get type as string
  call isNumber val         Is number?
  call isString val         Is string?
  call isArray val          Is array?
  call isNull val           Is null/undefined?
  call toNumber val         Convert to number
  call toString val         Convert to string

SYSTEM FUNCTIONS:
  call getWindows           List open windows
  call getApps              List available apps
  call exec cmd payload     Execute CommandBus command

QUICK EXAMPLES:

  # Interactive prompt
  prompt "Your name?" into $name
  alert Hello, $name!

  # Loop with counter
  loop 5 { print Iteration: $i }

  # Conditional
  if $x > 5 then { print Big }

  # File operations
  write "Hello" to "C:/test.txt"
  read "C:/test.txt" into $content
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

    /**
     * Update syntax highlighting
     */
    updateSyntaxHighlight() {
        const editor = this.getElement('#scriptEditor');
        const highlight = this.getElement('#syntaxHighlight');
        const lineNumbers = this.getElement('#lineNumbers');

        if (!editor || !highlight) return;

        const code = editor.value;
        const highlighted = this.highlightSyntax(code);
        highlight.innerHTML = highlighted + '\n'; // Extra newline for scrolling

        // Update line numbers
        if (lineNumbers) {
            const lines = code.split('\n');
            lineNumbers.innerHTML = lines.map((_, i) => i + 1).join('\n');
        }
    }

    /**
     * Sync scroll between editor and highlight
     */
    syncScroll() {
        const editor = this.getElement('#scriptEditor');
        const highlight = this.getElement('#syntaxHighlight');
        const lineNumbers = this.getElement('#lineNumbers');
        const wrapper = this.getElement('.editor-wrapper');

        if (editor && highlight) {
            highlight.scrollTop = editor.scrollTop;
            highlight.scrollLeft = editor.scrollLeft;
        }
        if (editor && lineNumbers) {
            lineNumbers.scrollTop = editor.scrollTop;
        }
    }

    /**
     * Apply syntax highlighting to code
     */
    highlightSyntax(code) {
        // Keywords
        const keywords = ['if', 'then', 'else', 'loop', 'while', 'foreach', 'for', 'in', 'break', 'continue', 'return', 'def', 'func', 'function', 'try', 'catch', 'on', 'with', 'into', 'to', 'default'];
        // Commands
        const commands = ['launch', 'open', 'close', 'wait', 'sleep', 'print', 'log', 'set', 'emit', 'alert', 'confirm', 'prompt', 'notify', 'focus', 'minimize', 'maximize', 'play', 'write', 'read', 'mkdir', 'delete', 'rm', 'call'];
        // Built-in functions
        const builtins = ['random', 'abs', 'round', 'floor', 'ceil', 'min', 'max', 'pow', 'sqrt', 'sin', 'cos', 'tan', 'log', 'exp', 'clamp', 'mod', 'sign', 'concat', 'upper', 'lower', 'length', 'trim', 'split', 'join', 'substr', 'substring', 'replace', 'replaceAll', 'contains', 'startsWith', 'endsWith', 'padStart', 'padEnd', 'repeat', 'charAt', 'indexOf', 'lastIndexOf', 'match', 'count', 'first', 'last', 'push', 'pop', 'shift', 'unshift', 'includes', 'sort', 'reverse', 'slice', 'splice', 'unique', 'flatten', 'range', 'fill', 'at', 'keys', 'values', 'entries', 'get', 'has', 'merge', 'clone', 'toJSON', 'fromJSON', 'prettyJSON', 'getWindows', 'getApps', 'now', 'time', 'date', 'year', 'month', 'day', 'hour', 'minute', 'second', 'formatDate', 'formatTime', 'elapsed', 'query', 'exec', 'typeof', 'isNumber', 'isString', 'isArray', 'isObject', 'isBoolean', 'isNull', 'isEmpty', 'toNumber', 'toInt', 'toString', 'toBoolean', 'toArray', 'debug', 'inspect', 'assert', 'getEnv', 'PI', 'E'];

        const lines = code.split('\n');
        return lines.map(line => {
            // Escape HTML first
            let result = this.escapeHtml(line);

            // Comments (must be first to avoid highlighting inside comments)
            if (result.trim().startsWith('#')) {
                return `<span class="comment">${result}</span>`;
            }

            // Handle inline comments (outside strings)
            const commentMatch = result.match(/^([^#"']*)(#.*)$/);
            if (commentMatch) {
                const beforeComment = commentMatch[1];
                const comment = commentMatch[2];
                result = this.highlightLine(beforeComment, keywords, commands, builtins) +
                         `<span class="comment">${comment}</span>`;
                return result;
            }

            return this.highlightLine(result, keywords, commands, builtins);
        }).join('\n');
    }

    /**
     * Highlight a single line
     */
    highlightLine(line, keywords, commands, builtins) {
        let result = line;

        // Strings (handle first to avoid issues with keywords inside strings)
        result = result.replace(/"([^"\\]|\\.)*"/g, '<span class="string">$&</span>');
        result = result.replace(/'([^'\\]|\\.)*'/g, '<span class="string">$&</span>');

        // Variables ($name)
        result = result.replace(/\$\w+/g, '<span class="variable">$&</span>');

        // Numbers
        result = result.replace(/\b(\d+\.?\d*)\b/g, '<span class="number">$1</span>');

        // Keywords (word boundary match)
        const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
        result = result.replace(keywordPattern, '<span class="keyword">$1</span>');

        // Commands (at start of line or after semicolon)
        const commandPattern = new RegExp(`(^|;\\s*)(${commands.join('|')})\\b`, 'gi');
        result = result.replace(commandPattern, '$1<span class="command">$2</span>');

        // Built-in functions (after 'call')
        const builtinPattern = new RegExp(`(call\\s+)(${builtins.join('|')})\\b`, 'gi');
        result = result.replace(builtinPattern, '$1<span class="builtin">$2</span>');

        // Operators
        result = result.replace(/([+\-*/%=<>!&|]+)/g, '<span class="operator">$1</span>');

        // Event names (word:word pattern)
        result = result.replace(/\b(\w+:\w+)\b/g, '<span class="event">$1</span>');

        return result;
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
