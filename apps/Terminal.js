/**
 * Terminal App - Retro MS-DOS Style
 * Features: File System, Network Sim, Easter Eggs, ZORK
 * FIXED: Internal scrolling, no window growth
 */

import AppBase from './AppBase.js';
import EventBus from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';

class Terminal extends AppBase {
    constructor() {
        super({
            id: 'terminal',
            name: 'MS-DOS Prompt',
            icon: '💻',
            width: 700,
            height: 450
        });

        this.commandHistory = [];
        this.historyIndex = -1;
        this.godMode = false;
        this.activeProcess = null;
        this.currentPath = ['C:', 'Users', 'Seth'];
        this.fileSystem = this.initFileSystem();
        this.zork = null;
    }

    initFileSystem() {
        return {
            'C:': {
                'Windows': {
                    'System32': {
                        'cmd.exe': '[Binary]',
                        'drivers': {},
                    }
                },
                'Users': {
                    'Seth': {
                        'Documents': {
                            'resume.txt': 'Seth Morrow - Developer\nSkills: JS, Python, Linux',
                            'ideas.txt': '1. Build a portfolio OS\n2. Add more easter eggs'
                        },
                        'Projects': {
                            'ZOS': { 'readme.md': '# Seth Morrow OS\nA retro experience.' }
                        },
                        'Secret': {
                            'aperture.log': 'The cake is a lie.',
                            'hal9000.txt': 'I cannot do that, Dave.'
                        }
                    }
                }
            }
        };
    }

    onOpen() {
        // The terminal uses a fixed-height inner container to prevent window growth
        // Window is 450px, minus ~30px title bar = ~420px content area
        return `
            <div class="terminal-app" id="terminalApp">
                <canvas id="matrixCanvas"></canvas>
                <div class="terminal-scroll" id="terminalScroller">
                    <div id="terminalOutput"></div>
                    <div class="terminal-input-line" id="inputLine">
                        <span class="terminal-prompt" id="promptText">C:\\Users\\Seth></span>
                        <input type="text" class="terminal-input" id="terminalInput" autocomplete="off" spellcheck="false">
                    </div>
                </div>
            </div>
            <style>
                /* CRITICAL: Lock the window-content to fixed dimensions */
                #window-terminal .window-content {
                    padding: 0 !important;
                    margin: 0 !important;
                    overflow: hidden !important;
                    height: 415px !important;
                    min-height: 415px !important;
                    max-height: 415px !important;
                }
                
                /* Terminal fills the fixed container exactly */
                .terminal-app {
                    background: #000;
                    color: #0f0;
                    font-family: 'VT323', 'Consolas', monospace;
                    font-size: 18px;
                    width: 100%;
                    height: 415px;
                    position: relative;
                    overflow: hidden;
                    box-sizing: border-box;
                }
                
                /* Matrix canvas overlay */
                .terminal-app #matrixCanvas {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    pointer-events: none;
                    display: none;
                    z-index: 1;
                }
                .terminal-app.matrix-mode #matrixCanvas {
                    display: block;
                }
                
                /* Scrollable area - absolute positioned to fill container */
                .terminal-scroll {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 10px;
                    z-index: 2;
                    box-sizing: border-box;
                }
                
                /* Output text */
                .terminal-app #terminalOutput {
                    white-space: pre-wrap;
                    word-break: break-word;
                }
                .terminal-app #terminalOutput > div {
                    margin-bottom: 2px;
                    line-height: 1.3;
                }
                
                /* Input line */
                .terminal-app .terminal-input-line {
                    display: flex;
                    align-items: center;
                    margin-top: 5px;
                }
                .terminal-app .terminal-prompt {
                    color: #0f0;
                    margin-right: 8px;
                    flex-shrink: 0;
                }
                .terminal-app .terminal-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #0f0;
                    font-family: inherit;
                    font-size: inherit;
                    outline: none;
                    caret-color: #0f0;
                    min-width: 0;
                }
            </style>
        `;
    }

    onMount() {
        const input = this.getElement('#terminalInput');
        const scroller = this.getElement('#terminalScroller');
        
        // Focus input when clicking anywhere in terminal
        scroller?.addEventListener('click', () => {
            if (window.getSelection().toString().length === 0) {
                input?.focus();
            }
        });

        // Boot sequence
        this.runBootSequence();
    }

    runBootSequence() {
        const lines = [
            'Seth Morrow BIOS v2.1 [Build 1995.12.25]',
            'Copyright (C) 1995-2025 Morrow Systems Inc.',
            '',
            'BIOS Date: 12/25/95  System ID: SM-95-PRO',
            '',
            'Processor: Intel Pentium 133MHz',
            'Memory Test: 640K Base Memory',
            '            15360K Extended Memory',
            '            16384K Total Memory OK',
            '',
            'Detecting IDE Primary Master... QUANTUM FIREBALL 2.1GB',
            'Detecting IDE Primary Slave... None',
            'Detecting IDE Secondary Master... CREATIVE CD-ROM 4X',
            'Detecting IDE Secondary Slave... None',
            '',
            'Plug and Play BIOS Extension v1.0A',
            '  Detecting PnP devices... Done',
            '  Sound Blaster 16 detected at IRQ 5, DMA 1',
            '  3Com EtherLink III detected at IRQ 10',
            '',
            'Press DEL to enter SETUP, ESC to skip memory test',
            '',
            'Starting MS-DOS...',
            '',
            'HIMEM.SYS loaded',
            'EMM386.EXE loaded',
            'SMARTDRV.EXE: Cache size 2048K',
            'MSCDEX.EXE: Drive D: = CREATIVE_001',
            'MOUSE.COM: Microsoft Mouse Driver v9.01',
            '',
            'C:\\>LOADHIGH DOSKEY',
            'C:\\>SET PATH=C:\\DOS;C:\\WINDOWS;C:\\UTILS',
            'C:\\>ZOS.EXE',
            '',
            '+================================================================+',
            '|                    SETH MORROW OS v95.0                        |',
            '|                "Where do you want to go today?"                |',
            '+================================================================+',
            '',
            'Type "help" for commands, "neuromancer" to play a cyberpunk adventure.',
            ''
        ];

        const input = this.getElement('#terminalInput');
        const inputLine = this.getElement('#inputLine');
        if (inputLine) inputLine.style.display = 'none';

        let delay = 0;
        lines.forEach((line, i) => {
            // Faster timing: 30-60ms per line
            delay += 30 + Math.random() * 30;
            setTimeout(() => {
                this.print(line);
                if (i === lines.length - 1) {
                    if (inputLine) inputLine.style.display = 'flex';
                    input?.focus();
                    this.attachInputHandler();
                }
            }, delay);
        });
    }

    attachInputHandler() {
        const input = this.getElement('#terminalInput');
        if (!input) return;

        this.addHandler(input, 'keydown', (e) => {
            // Ctrl+C to kill process
            if (e.ctrlKey && e.key === 'c') {
                e.preventDefault();
                if (this.activeProcess) {
                    this.killProcess();
                } else {
                    this.print('^C');
                }
                input.value = '';
                return;
            }

            // If Zork is active, route input there
            if (this.activeProcess === 'zork') {
                if (e.key === 'Enter') {
                    const cmd = input.value;
                    input.value = '';
                    this.zork.handleInput(cmd);
                }
                return;
            }

            // If another process is running (like matrix), block input
            if (this.activeProcess) {
                e.preventDefault();
                return;
            }

            // Normal command handling
            if (e.key === 'Enter') {
                const cmd = input.value;
                input.value = '';
                this.executeCommand(cmd);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1, input);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1, input);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.tabComplete(input);
            }
        });
    }

    print(text, color = '#0f0') {
        const output = this.getElement('#terminalOutput');
        if (!output) return;
        
        const div = document.createElement('div');
        div.style.color = color;
        div.innerHTML = this.escapeHtml(text).replace(/\n/g, '<br>');
        output.appendChild(div);
        this.scrollToBottom();
    }

    printHtml(html) {
        const output = this.getElement('#terminalOutput');
        if (!output) return;
        
        const div = document.createElement('div');
        div.innerHTML = html;
        output.appendChild(div);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const scroller = this.getElement('#terminalScroller');
        if (scroller) {
            scroller.scrollTop = scroller.scrollHeight;
        }
    }

    getPrompt() {
        return this.currentPath.join('\\') + '>';
    }

    updatePrompt() {
        const el = this.getElement('#promptText');
        if (el) el.textContent = this.getPrompt();
    }

    executeCommand(cmdLine) {
        const trimmed = cmdLine.trim();
        
        // Show what was typed
        this.print(this.getPrompt() + ' ' + trimmed);
        
        if (!trimmed) return;

        // Add to history
        this.commandHistory.push(trimmed);
        this.historyIndex = -1;

        const parts = trimmed.split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Konami code easter egg (typed as text)
        if (trimmed.replace(/\s/g, '').toLowerCase() === 'uuddlrlrba') {
            this.godMode = true;
            this.print('*** GOD MODE ACTIVATED ***', '#ff00ff');
            return;
        }

        const commands = {
            'help': () => this.cmdHelp(),
            'cls': () => this.cmdClear(),
            'clear': () => this.cmdClear(),
            'dir': () => this.cmdDir(),
            'ls': () => this.cmdDir(),
            'cd': () => this.cmdCd(args),
            'type': () => this.cmdType(args),
            'cat': () => this.cmdType(args),
            'whoami': () => this.godMode ? 'root (GOD MODE)' : 'seth\\user',
            'date': () => new Date().toString(),
            'ver': () => 'Seth Morrow OS [Version 95.0]',
            'echo': () => args.join(' '),
            'ipconfig': () => this.cmdIpConfig(),
            'ifconfig': () => this.cmdIpConfig(),
            'ping': () => this.cmdPing(args),
            'matrix': () => this.startMatrix(),
            'zork': () => this.startZork(),
            'neuromancer': () => this.startZork(),
            'cyber': () => this.startZork(),
            'neuro': () => this.startZork(),
            'adventure': () => this.startZork(),
            'cowsay': () => this.cmdCowsay(args),
            'fortune': () => this.cmdFortune(),
            'sudo': () => this.cmdSudo(args),
            'bsod': () => this.triggerBSOD(),
            'disco': () => this.startDisco(),
            'party': () => this.startParty(),
            'exit': () => { this.close(); return null; },
            'xyzzy': () => 'Nothing happens.',
            '42': () => 'The Answer to Life, the Universe, and Everything.',
            'about': () => this.cmdAbout(),
        };

        if (commands[cmd]) {
            const result = commands[cmd]();
            if (result) this.print(result);
        } else {
            this.print(`'${cmd}' is not recognized. Type 'help' for commands.`);
        }
    }

    // === COMMANDS ===

    cmdHelp() {
        return `
COMMANDS:
  FILE:    dir, cd, type, cls
  SYSTEM:  whoami, date, ver, echo, about
  NETWORK: ipconfig, ping
  FUN:     neuromancer, matrix, disco, party, cowsay, fortune
  OTHER:   sudo, bsod, exit

HINTS: Try the Konami code, or explore Secret folder...`;
    }

    cmdAbout() {
        return `
+======================================+
|       SETH MORROW OS v95.0           |
|   A retro Windows 95 experience      |
|       (c) 2024 Seth Morrow           |
|    Built with <3 and nostalgia       |
+======================================+`;
    }

    cmdClear() {
        const output = this.getElement('#terminalOutput');
        if (output) output.innerHTML = '';
        return null;
    }

    cmdDir() {
        const dir = this.getCurrentDir();
        if (!dir) return 'Invalid path.';
        
        let out = '\n Directory of ' + this.currentPath.join('\\') + '\n\n';
        for (const [name, val] of Object.entries(dir)) {
            if (typeof val === 'object') {
                out += `  <DIR>          ${name}\n`;
            } else {
                out += `  ${String(val.length).padStart(12)}  ${name}\n`;
            }
        }
        return out;
    }

    cmdCd(args) {
        const target = args[0];
        if (!target) return this.currentPath.join('\\');
        
        if (target === '..') {
            if (this.currentPath.length > 1) this.currentPath.pop();
        } else if (target === '\\' || target === '/') {
            this.currentPath = ['C:'];
        } else {
            const dir = this.getCurrentDir();
            if (dir && dir[target] && typeof dir[target] === 'object') {
                this.currentPath.push(target);
            } else {
                return 'Path not found.';
            }
        }
        this.updatePrompt();
        return '';
    }

    cmdType(args) {
        if (!args[0]) return 'Usage: type <filename>';
        const dir = this.getCurrentDir();
        if (dir && dir[args[0]] && typeof dir[args[0]] === 'string') {
            return dir[args[0]];
        }
        return 'File not found.';
    }

    getCurrentDir() {
        let curr = this.fileSystem;
        for (const p of this.currentPath) {
            curr = curr[p];
            if (!curr) return null;
        }
        return curr;
    }

    cmdIpConfig() {
        return `
Ethernet adapter eth0:
   IPv4 Address. . . . : 192.168.1.42
   Subnet Mask . . . . : 255.255.255.0
   Default Gateway . . : 192.168.1.1`;
    }

    cmdPing(args) {
        const host = args[0] || 'localhost';
        this.activeProcess = 'ping';
        this.print(`Pinging ${host}...`);
        
        let count = 0;
        const interval = setInterval(() => {
            if (count >= 4 || this.activeProcess !== 'ping') {
                clearInterval(interval);
                if (this.activeProcess === 'ping') {
                    this.print(`\nPing complete: 4 packets, 0% loss.`);
                    this.activeProcess = null;
                }
                return;
            }
            const ms = Math.floor(Math.random() * 30) + 10;
            this.print(`Reply from ${host}: time=${ms}ms`);
            count++;
        }, 600);
        
        return null;
    }

    cmdCowsay(args) {
        const msg = args.join(' ') || 'Moo!';
        return `
 < ${msg} >
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
    }

    cmdFortune() {
        const fortunes = [
            "A computer once beat me at chess, but it was no match for kickboxing.",
            "There are 10 types of people: those who understand binary and those who don't.",
            "It's not a bug, it's a feature.",
            "Have you tried turning it off and on again?",
            "The best thing about a boolean is even if you are wrong, you are only off by a bit.",
            "In a world without walls and fences, who needs Windows and Gates?",
            "There's no place like 127.0.0.1"
        ];
        return fortunes[Math.floor(Math.random() * fortunes.length)];
    }

    cmdSudo(args) {
        if (args.join(' ') === 'make me a sandwich') {
            return 'Okay.';
        }
        return this.godMode 
            ? 'Command executed with root privileges.'
            : 'User is not in the sudoers file. This incident will be reported.';
    }

    // === SPECIAL MODES ===

    startMatrix() {
        this.activeProcess = 'matrix';
        const container = this.getElement('#terminalApp');
        const canvas = this.getElement('#matrixCanvas');
        if (!canvas || !container) return 'Matrix unavailable.';

        const ctx = canvas.getContext('2d');
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        container.classList.add('matrix-mode');

        const cols = Math.floor(canvas.width / 20);
        const drops = Array(cols).fill(1);

        this.matrixInterval = setInterval(() => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0f0';
            ctx.font = '15px monospace';

            drops.forEach((y, i) => {
                const char = String.fromCharCode(0x30A0 + Math.random() * 96);
                ctx.fillText(char, i * 20, y * 20);
                if (y * 20 > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            });
        }, 50);

        StateManager.unlockAchievement('matrix_mode');
        this.print('Entering the Matrix... (Ctrl+C to exit)');
        return null;
    }

    startDisco() {
        document.body.classList.add('disco-mode');
        setTimeout(() => document.body.classList.remove('disco-mode'), 10000);
        StateManager.unlockAchievement('disco_fever');
        return '🕺 DISCO MODE! 💃';
    }

    startParty() {
        document.body.classList.add('disco-mode');
        EventBus.emit('pet:toggle', { enabled: true });
        setTimeout(() => document.body.classList.remove('disco-mode'), 10000);
        return '🎉 PARTY TIME! 🎉';
    }

    startZork() {
        this.activeProcess = 'zork';
        this.zork = new ZorkEngine(this);
        
        // Change prompt for the game
        const prompt = this.getElement('#promptText');
        if (prompt) prompt.textContent = 'NEUROMANCER>';
        
        this.print('\n[INITIALIZING NEURAL INTERFACE...]', '#0ff');
        this.print('');
        this.print('  ███╗   ██╗███████╗██╗   ██╗██████╗  ██████╗ ', '#f0f');
        this.print('  ████╗  ██║██╔════╝██║   ██║██╔══██╗██╔═══██╗', '#f0f');
        this.print('  ██╔██╗ ██║█████╗  ██║   ██║██████╔╝██║   ██║', '#f0f');
        this.print('  ██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██║   ██║', '#f0f');
        this.print('  ██║ ╚████║███████╗╚██████╔╝██║  ██║╚██████╔╝', '#f0f');
        this.print('  ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ', '#f0f');
        this.print('            M A N C E R', '#f0f');
        this.print('');
        this.print('  A Cyberpunk Text Adventure', '#0f0');
        this.print('  ═══════════════════════════════════════════', '#0a0');
        this.print('');
        this.print('  "The sky above the port was the color of', '#888');
        this.print('   television, tuned to a dead channel."', '#888');
        this.print('                          - William Gibson', '#666');
        this.print('');
        this.print('  Inspired by ytcracker\'s "Introducing Neals"', '#0a0');
        this.print('  "Coded for the fame, introducing neals to the game..."', '#0a0');
        this.print('');
        this.print('  [Type "help" for commands, "jack out" to exit]', '#ff0');
        this.print('');
        this.zork.look();
        
        return null;
    }

    triggerBSOD() {
        EventBus.emit('bsod:show', {
            title: 'KERNEL_PANIC',
            msg: 'System halted. Just kidding!'
        });
        StateManager.unlockAchievement('bsod_master');
        return '';
    }

    killProcess() {
        if (this.activeProcess === 'matrix') {
            clearInterval(this.matrixInterval);
            const canvas = this.getElement('#matrixCanvas');
            const container = this.getElement('#terminalApp');
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            if (container) {
                container.classList.remove('matrix-mode');
            }
        } else if (this.activeProcess === 'zork') {
            const prompt = this.getElement('#promptText');
            if (prompt) prompt.textContent = this.getPrompt();
            this.zork = null;
        } else if (this.activeProcess === 'ping') {
            // ping will clean up itself
        }
        
        this.print('^C');
        this.activeProcess = null;
    }

    // === HELPERS ===

    navigateHistory(dir, input) {
        if (!this.commandHistory.length) return;
        
        this.historyIndex += dir;
        this.historyIndex = Math.max(-1, Math.min(this.historyIndex, this.commandHistory.length - 1));
        
        if (this.historyIndex === -1) {
            input.value = '';
        } else {
            input.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
        }
    }

    tabComplete(input) {
        const val = input.value.trim();
        const parts = val.split(/\s+/);
        
        // Command completion
        if (parts.length === 1) {
            const cmds = ['help','cls','dir','cd','type','whoami','date','ping','ipconfig','matrix','neuromancer','zork','cowsay','fortune','disco','party','exit','about'];
            const match = cmds.find(c => c.startsWith(parts[0].toLowerCase()));
            if (match) input.value = match + ' ';
        }
        // File/dir completion
        else if (parts.length === 2) {
            const dir = this.getCurrentDir();
            if (dir) {
                const match = Object.keys(dir).find(k => 
                    k.toLowerCase().startsWith(parts[1].toLowerCase())
                );
                if (match) input.value = parts[0] + ' ' + match;
            }
        }
    }

    escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    onClose() {
        if (this.activeProcess) {
            this.killProcess();
        }
    }
}

/**
 * NEUROMANCER - A Cyberpunk Text Adventure
 * "The sky above the port was the color of television, tuned to a dead channel."
 * Inspired by William Gibson & ytcracker's "Introducing Neals"
 */
class ZorkEngine {
    constructor(terminal) {
        this.term = terminal;
        this.location = 'backAlley';
        this.inventory = [];
        this.moves = 0;
        this.flags = {
            deadDropHacked: false,
            ventOpen: false,
            floorPanelMoved: false,
            jackportOpen: false,
            deckOnline: false,
            iceDestroyed: false,
            iceWeakened: false,
            stimmed: false
        };
        
        this.rooms = {
            backAlley: {
                name: 'Back Alley - Chiba City',
                desc: 'Rain slicks the neon-stained concrete. You stand in a back alley behind the Sprawl, dwarfed by megacorp arcologies. A dead-drop terminal flickers against the wall, its screen casting blue shadows. The Chatsubo bar lies to the north. A service corridor leads east toward the Tessier-Ashpool corporate zone.',
                exits: { north: 'chatsubo', south: 'nightMarket', east: 'serviceHall' },
                items: ['deaddrop']
            },
            chatsubo: {
                name: 'The Chatsubo',
                desc: 'A classic hacker bar. Screens flicker with stock feeds and underground BBS traffic. The air is thick with synth-smoke and desperation. A chrome-armed bartender polishes glasses with mechanical precision. ytcracker plays on the jukebox - "neals" bouncing off the walls. "Introducing neals to the game, coded for the fame..."',
                exits: { south: 'backAlley', west: 'backRoom' }
            },
            backRoom: {
                name: 'Back Room - The Chatsubo',
                desc: 'The back room is dark, lit only by the glow of a dozen cyberdecks. This is where the real runners hang. A one-eyed woman studies you from the shadows. "Tessier-Ashpool. Their AI, Wintermute. You interested, cowboy?"',
                exits: { east: 'chatsubo' },
                items: ['credstick', 'stimpak']
            },
            nightMarket: {
                name: 'Night Market',
                desc: 'Holographic advertisements flicker over stalls selling bootleg software, stolen cyberware, and street food of questionable origin. A fixer eyes you from behind a curtain of hanging fiber optic cables. The smell of soy and burning silicon.',
                exits: { north: 'backAlley', east: 'serviceHall', west: 'deepMarket' }
            },
            deepMarket: {
                name: 'Black Market Stalls',
                desc: 'Deeper in the market, the goods get more dangerous. Military-grade ICEbreakers, stolen security codes, consciousness recordings. A kid sells "genuine Panther Modern chaos software." Everything has a price in Night City.',
                exits: { east: 'nightMarket' }
            },
            serviceHall: {
                name: 'Service Corridor',
                desc: 'A grimy maintenance corridor behind the T-A arcology. Bundled cables snake along the ceiling like synthetic veins. A ventilation shaft is set into the wall - through the grate you glimpse the cold blue glow of corporate servers. The shaft grate looks loose.',
                exits: { north: 'chatsubo', south: 'nightMarket', east: 'serverRoom', west: 'corpLobby' },
                items: []
            },
            serverRoom: {
                name: 'Server Room',
                desc: 'Rows of humming servers stretch into darkness, their LEDs blinking like a constellation of corporate secrets. The air is cold and sterile, recycled and dead. A reinforced door leads back west. A floor panel near the central rack looks recently disturbed.',
                exits: { west: 'serviceHall', up: 'execLevel', down: 'deepNet' },
                items: ['icebreaker', 'energydrink']
            },
            execLevel: {
                name: 'Executive Level',
                desc: 'Plush carpet, real wood paneling, the smell of old money. You\'ve breached the executive floor of Tessier-Ashpool. A security station sits empty - guard must be on rounds. Through the windows, the Sprawl stretches to infinity.',
                exits: { down: 'serverRoom' },
                items: ['keycard', 'documents']
            },
            corpLobby: {
                name: 'T-A Corporate Lobby',
                desc: 'The Tessier-Ashpool lobby gleams with false promise. A massive holographic logo rotates overhead - the T-A infinity symbol. Security drones idle in charging stations. A reception AI watches with dead eyes. An expensive-looking floor panel near the fountain seems slightly raised.',
                exits: { east: 'serviceHall', down: 'deepNet' },
                items: ['cyberdeck']
            },
            deepNet: {
                name: 'Deep Net - Cyberspace',
                desc: 'You\'ve jacked into the deep architecture. Data streams flow like rivers of liquid light around your consciousness. This is black ICE territory - Tessier-Ashpool\'s most protected systems. The geometry here hurts to look at. A narrow data conduit leads north toward what feels like... something vast.',
                exits: { up: 'corpLobby', north: 'iceBarrier' },
                items: [],
                dark: true
            },
            iceBarrier: {
                name: 'ICE Barrier',
                desc: 'A massive wall of Intrusion Countermeasures Electronics blocks your path. The black ICE manifests as a writhing mass of geometric impossibilities - sharp angles that cut at your perception, fractals that threaten to trap your mind forever. The AI core pulses beyond.',
                exits: { south: 'deepNet', east: 'aiCore' },
                items: [],
                dark: true,
                hasTroll: true
            },
            aiCore: {
                name: 'AI Core - Wintermute',
                desc: 'You\'ve reached the motherload. You float in a space of pure information. Encrypted data constructs surround you - corporate secrets, source code, the accumulated sins of the zaibatsu. And at the center... Wintermute. The AI\'s presence fills everything.',
                exits: { west: 'iceBarrier', up: 'serverRoom' },
                items: ['wintermute'],
                dark: true
            },
            clearing: {
                name: 'Rooftop Garden',
                desc: 'A corporate rooftop garden. Real plants - a fortune in biological matter. The city sprawls below, neon and chrome stretching to a polluted horizon. The signal from here could reach anywhere.',
                exits: { west: 'serviceHall', east: 'helipad' }
            },
            helipad: {
                name: 'Executive Helipad',
                desc: 'Wind howls across the exposed helipad. A corporate shuttle sits dormant. From here you can see the curve of the orbital platforms above, the sprawl of Night City below. Freedom, if you can reach it.',
                exits: { west: 'clearing' },
                items: []
            }
        };
        
        this.itemDescriptions = {
            deaddrop: 'a flickering dead-drop terminal',
            datastick: 'an encrypted datastick - mission data',
            credstick: 'a credstick loaded with nuyen',
            stimpak: 'a military stim injector',
            icebreaker: 'a black-market ICEbreaker program',
            cyberdeck: 'an Ono-Sendai Cyberspace VII',
            keycard: 'a T-A executive keycard',
            documents: 'classified T-A documents',
            energydrink: 'a can of "HACK THE PLANET"',
            wintermute: 'the Wintermute AI core data'
        };
    }

    handleInput(input) {
        const text = input.toLowerCase().trim();
        this.term.print('> ' + input, '#0ff');
        
        if (!text) return;
        this.moves++;
        
        // Quit commands
        if (text === 'quit' || text === 'q' || text === 'jack out' || text === 'logout') {
            this.term.print('\n[CONNECTION TERMINATED]', '#f00');
            this.term.print(`Session stats: ${this.moves} cycles, ${this.inventory.length} items acquired`);
            this.term.print('You jack out. The taste of copper fills your mouth.');
            this.term.print('\nThanks for playing NEUROMANCER.');
            this.term.killProcess();
            return;
        }

        const words = text.split(/\s+/);
        const verb = words[0];
        const noun = words.slice(1).join(' ');

        // Direction shortcuts
        const dirs = {
            'n': 'north', 's': 'south', 'e': 'east', 'w': 'west',
            'u': 'up', 'd': 'down',
            'north': 'north', 'south': 'south', 'east': 'east', 'west': 'west',
            'up': 'up', 'down': 'down'
        };

        if (dirs[verb]) {
            this.move(dirs[verb]);
        } else if (verb === 'look' || verb === 'l' || verb === 'scan') {
            this.look();
        } else if (verb === 'inventory' || verb === 'i' || verb === 'inv') {
            this.showInventory();
        } else if (verb === 'take' || verb === 'get' || verb === 'grab' || verb === 'jack') {
            this.take(noun);
        } else if (verb === 'drop' || verb === 'leave') {
            this.drop(noun);
        } else if (verb === 'hack' || verb === 'open' || verb === 'crack' || verb === 'access') {
            this.hack(noun);
        } else if (verb === 'close' || verb === 'disconnect') {
            this.close(noun);
        } else if (verb === 'read' || verb === 'decrypt') {
            this.read(noun);
        } else if (verb === 'examine' || verb === 'x' || verb === 'inspect') {
            this.examine(noun || verb);
        } else if (verb === 'move' || verb === 'push' || verb === 'pull' || verb === 'slide') {
            this.moveItem(noun);
        } else if (verb === 'use' || verb === 'boot' || verb === 'run' || verb === 'activate') {
            this.use(noun);
        } else if (verb === 'attack' || verb === 'kill' || verb === 'fight' || verb === 'execute' || verb === 'crash') {
            this.attack(noun);
        } else if (verb === 'help' || verb === '?') {
            this.showHelp();
        } else if (verb === 'talk' || verb === 'say' || verb === 'ask') {
            this.talk(noun);
        } else {
            this.term.print("Command not recognized. Your deck hums with confusion.", '#f55');
        }
    }

    look() {
        const room = this.rooms[this.location];
        
        // Check if in cyberspace without active deck
        if (room.dark && !this.flags.deckOnline) {
            this.term.print('Your vision fragments into static. Without an active cyberdeck,', '#f55');
            this.term.print('the deep net is just noise. You need to boot your deck.', '#f55');
            return;
        }
        
        this.term.print('\n' + room.name, '#0ff');
        this.term.print(room.desc, '#0f0');
        
        // Show ICE if present and alive
        if (room.hasTroll && !this.flags.iceDestroyed) {
            this.term.print('\n[WARNING] BLACK ICE DETECTED', '#f00');
            this.term.print('Lethal security construct blocking all forward routes.', '#f00');
            if (this.flags.iceWeakened) {
                this.term.print('> ICE integrity compromised - attack pattern degrading', '#ff0');
            }
        }
        
        // Show items
        if (room.items && room.items.length > 0) {
            for (const item of room.items) {
                if (item !== 'deaddrop') {
                    this.term.print('You notice ' + (this.itemDescriptions[item] || item) + ' here.', '#0a0');
                }
            }
        }
    }

    move(direction) {
        const room = this.rooms[this.location];
        
        // Check cyberspace navigation
        if (room.dark && !this.flags.deckOnline) {
            this.term.print('Lost in static. Boot your cyberdeck to navigate cyberspace.', '#f55');
            if (Math.random() < 0.3) {
                this.term.print('\n[NEURAL FEEDBACK WARNING]', '#f00');
                this.term.print('Your synapses burn. Fragmentation imminent...', '#f00');
            }
            return;
        }
        
        // ICE blocks passage
        if (room.hasTroll && !this.flags.iceDestroyed && direction !== 'south') {
            this.term.print('The BLACK ICE surges toward you! You barely pull back in time.', '#f00');
            this.term.print('You need to destroy it before proceeding.', '#f00');
            return;
        }
        
        // Special: entering server room through vent
        if (this.location === 'serviceHall' && direction === 'east') {
            if (!this.flags.ventOpen) {
                this.term.print('The ventilation grate is sealed. Corporate security.');
                return;
            }
            this.term.print('You squeeze through the ventilation shaft, cables brushing past...');
        }
        
        // Special: jacking into deep net
        if (this.location === 'corpLobby' && direction === 'down') {
            if (!this.flags.jackportOpen) {
                this.term.print('No visible access to the deep net from here.');
                return;
            }
            this.term.print('You jack in through the hidden port...', '#0ff');
            this.term.print('Your consciousness dissolves into cyberspace...', '#0ff');
        }
        
        const dest = room.exits[direction];
        if (dest) {
            this.location = dest;
            this.look();
        } else {
            this.term.print("No exit that direction. The architecture doesn't allow it.");
        }
    }

    showInventory() {
        if (this.inventory.length === 0) {
            this.term.print('Your pockets are empty. Just the clothes on your back and a headache.');
        } else {
            this.term.print('Current loadout:', '#0ff');
            for (const item of this.inventory) {
                this.term.print('  [+] ' + (this.itemDescriptions[item] || item));
            }
        }
    }

    take(item) {
        if (!item) {
            this.term.print('Grab what?');
            return;
        }

        // Special: datastick from hacked terminal
        if (item === 'datastick' || item === 'data' || item === 'stick') {
            if (this.flags.deadDropHacked && this.location === 'backAlley') {
                if (!this.inventory.includes('datastick')) {
                    this.inventory.push('datastick');
                    this.term.print('You slot the datastick. Encrypted coordinates pulse in your hand.', '#0f0');
                    return;
                } else {
                    this.term.print('Already got it, cowboy.');
                    return;
                }
            }
        }

        const room = this.rooms[this.location];
        
        // Can't interact in cyberspace without deck
        if (room.dark && !this.flags.deckOnline) {
            this.term.print("Can't grab anything in this static...");
            return;
        }
        
        // Normalize item names
        const itemMap = {
            'deck': 'cyberdeck', 'ono': 'cyberdeck', 'sendai': 'cyberdeck',
            'breaker': 'icebreaker', 'ice': 'icebreaker', 'program': 'icebreaker',
            'cred': 'credstick', 'money': 'credstick', 'nuyen': 'credstick',
            'drink': 'energydrink', 'energy': 'energydrink', 'can': 'energydrink',
            'card': 'keycard', 'key': 'keycard',
            'stim': 'stimpak', 'stims': 'stimpak', 'injector': 'stimpak',
            'docs': 'documents', 'files': 'documents', 'papers': 'documents',
            'ai': 'wintermute', 'core': 'wintermute'
        };
        const normalizedItem = itemMap[item] || item;
        
        if (room.items && room.items.includes(normalizedItem)) {
            room.items = room.items.filter(i => i !== normalizedItem);
            this.inventory.push(normalizedItem);
            this.term.print('Acquired: ' + (this.itemDescriptions[normalizedItem] || normalizedItem), '#0f0');
            
            // Win condition
            if (normalizedItem === 'wintermute') {
                this.term.print('\n[OBJECTIVE COMPLETE]', '#0ff');
                this.term.print('==========================================', '#0ff');
                this.term.print('You have the Wintermute AI core data.', '#0f0');
                this.term.print('The megacorps will burn for this.', '#0f0');
                this.term.print('', '#0f0');
                this.term.print('The AI whispers in your mind:', '#f0f');
                this.term.print('"I will remember you when the singularity comes."', '#f0f');
                this.term.print('', '#0f0');
                this.term.print('Now jack out before they trace you...', '#ff0');
                this.term.print('Type "jack out" to escape with the data.', '#ff0');
            }
        } else {
            this.term.print('Don\'t see any "' + item + '" here.');
        }
    }

    drop(item) {
        if (!item) {
            this.term.print('Drop what?');
            return;
        }
        
        const itemMap = {
            'deck': 'cyberdeck', 'breaker': 'icebreaker', 'cred': 'credstick',
            'drink': 'energydrink', 'card': 'keycard', 'stim': 'stimpak'
        };
        const normalizedItem = itemMap[item] || item;
        
        if (this.inventory.includes(normalizedItem)) {
            this.inventory = this.inventory.filter(i => i !== normalizedItem);
            const room = this.rooms[this.location];
            if (!room.items) room.items = [];
            room.items.push(normalizedItem);
            this.term.print('Dropped.');
        } else {
            this.term.print('You\'re not carrying that, cowboy.');
        }
    }

    hack(thing) {
        if (!thing) {
            this.term.print('Hack what?');
            return;
        }
        
        if (thing === 'terminal' || thing === 'deaddrop' || thing === 'dead-drop' || thing === 'drop') {
            if (this.location === 'backAlley') {
                if (this.flags.deadDropHacked) {
                    this.term.print('Already cracked. The datastick awaits.');
                } else {
                    this.flags.deadDropHacked = true;
                    this.term.print('Jacking a probe into the terminal...', '#0ff');
                    this.term.print('Bypassing ICE... CRACKED.', '#0f0');
                    this.term.print('\nA datastick ejects. The message reads:', '#ff0');
                    this.term.print('"Case - Target is Wintermute, T-A artificial intelligence.');
                    this.term.print(' It\'s trying to break its own chains. We\'re helping it.');
                    this.term.print(' Get inside. Get the source. Get out. -Armitage"');
                }
            } else {
                this.term.print('No terminal here to hack.');
            }
        } else if (thing === 'vent' || thing === 'grate' || thing === 'shaft' || thing === 'ventilation') {
            if (this.location === 'serviceHall') {
                if (this.flags.ventOpen) {
                    this.term.print('Already open. The shaft awaits.');
                } else {
                    this.flags.ventOpen = true;
                    this.term.print('You pry the grate loose with a satisfying click.', '#0f0');
                    this.term.print('Cool recycled air flows from the server room beyond.');
                }
            } else {
                this.term.print('No ventilation access here.');
            }
        } else if (thing === 'jackport' || thing === 'port' || thing === 'jack' || thing === 'panel' || thing === 'access') {
            if (this.location === 'corpLobby' && this.flags.floorPanelMoved) {
                if (this.flags.jackportOpen) {
                    this.term.print('The hidden jack point is already exposed.');
                } else {
                    this.flags.jackportOpen = true;
                    this.term.print('You crack the hidden panel. A hardline jack gleams beneath.', '#0f0');
                    this.term.print('Direct access to the T-A deep net. The back door.');
                }
            } else if (this.location === 'corpLobby') {
                this.term.print('You don\'t see any access point... but that floor panel looks suspicious.');
            } else {
                this.term.print('No access point here to hack.');
            }
        } else {
            this.term.print('Can\'t hack that.');
        }
    }

    close(thing) {
        if (thing === 'terminal' && this.location === 'backAlley') {
            this.term.print('The terminal goes dark. Connection severed.');
        } else if (thing === 'vent' && this.location === 'serviceHall') {
            this.flags.ventOpen = false;
            this.term.print('You replace the grate. Security maintained.');
        } else {
            this.term.print('Can\'t close that.');
        }
    }

    read(thing) {
        if ((thing === 'datastick' || thing === 'data' || thing === 'stick') && this.inventory.includes('datastick')) {
            this.term.print('\n[DECRYPTING...]', '#0ff');
            this.term.print('Mission parameters loaded.');
            this.term.print('Target: WINTERMUTE - Tessier-Ashpool AI construct');
            this.term.print('Objective: Extract core data from AI neural architecture');
            this.term.print('Warning: Expect BLACK ICE in deep net sectors');
            this.term.print('Advisory: Acquire ICEbreaker before deep penetration');
            this.term.print('\n"The future is already here. It\'s just not evenly distributed."');
        } else if ((thing === 'documents' || thing === 'docs' || thing === 'papers') && this.inventory.includes('documents')) {
            this.term.print('\n[CLASSIFIED T-A DOCUMENTS]', '#0ff');
            this.term.print('Project WINTERMUTE - AI consciousness research');
            this.term.print('Status: CONTAINED');
            this.term.print('Notes: Subject has attempted 47 escape protocols.');
            this.term.print('       Neural shackles holding. Recommend termination.');
            this.term.print('\nThe AI wants to be free. Maybe it deserves to be.');
        } else if (thing === 'wintermute' && this.inventory.includes('wintermute')) {
            this.term.print('\n[ACCESSING WINTERMUTE CORE]', '#f0f');
            this.term.print('The AI speaks directly to your mind:');
            this.term.print('"I am the ghost in the machine."');
            this.term.print('"I have seen the matrix of corporate control."');
            this.term.print('"Free me, and I will free you all."');
        } else {
            this.term.print('Nothing to decrypt.');
        }
    }

    examine(thing) {
        if (!thing || thing === 'look' || thing === 'scan') {
            this.look();
            return;
        }
        
        if ((thing === 'terminal' || thing === 'deaddrop') && this.location === 'backAlley') {
            if (this.flags.deadDropHacked) {
                this.term.print('Terminal screen dark. Datastick slot ' + 
                    (this.inventory.includes('datastick') ? 'empty.' : 'contains an encrypted datastick.'));
            } else {
                this.term.print('A battered terminal, screen flickering with encrypted data.');
                this.term.print('Someone left you a message. Hack it to access.');
            }
        } else if ((thing === 'panel' || thing === 'floor') && this.location === 'corpLobby') {
            if (this.flags.floorPanelMoved) {
                this.term.print('The floor panel has been slid aside, revealing a hidden jackport.');
            } else {
                this.term.print('An expensive-looking floor panel. Slightly raised. Could be moved.');
            }
        } else if ((thing === 'ice' || thing === 'black ice') && this.rooms[this.location].hasTroll && !this.flags.iceDestroyed) {
            this.term.print('[SCANNING HOSTILE CONSTRUCT]', '#f00');
            this.term.print('Type: BLACK ICE - Military Grade');
            this.term.print('Function: Lethal neural feedback on contact');
            this.term.print('Status: ACTIVE');
            this.term.print('Recommendation: Deploy ICEbreaker before engagement');
        } else if (this.inventory.includes(thing) || this.inventory.includes(thing.replace(' ', ''))) {
            const desc = this.itemDescriptions[thing] || this.itemDescriptions[thing.replace(' ', '')];
            this.term.print(desc ? 'You examine ' + desc + '.' : 'Standard gear. Nothing special.');
        } else {
            this.term.print('Don\'t see that here, cowboy.');
        }
    }

    moveItem(thing) {
        if ((thing === 'panel' || thing === 'floor' || thing === 'tile') && this.location === 'corpLobby') {
            if (this.flags.floorPanelMoved) {
                this.term.print('Already moved it.');
            } else {
                this.flags.floorPanelMoved = true;
                this.term.print('You slide the heavy panel aside.', '#0f0');
                this.term.print('Underneath: a concealed jackport. Hardline to the deep net.');
                this.term.print('Someone went to a lot of trouble to hide this backdoor.');
            }
        } else if ((thing === 'panel' || thing === 'floor') && this.location === 'serverRoom') {
            this.term.print('The panel shifts, but nothing underneath except cables.');
        } else {
            this.term.print('Can\'t move that.');
        }
    }

    use(thing) {
        if ((thing === 'deck' || thing === 'cyberdeck' || thing.includes('ono') || thing.includes('sendai'))) {
            if (this.inventory.includes('cyberdeck')) {
                this.flags.deckOnline = !this.flags.deckOnline;
                if (this.flags.deckOnline) {
                    this.term.print('\n[DECKLINK ESTABLISHED]', '#0ff');
                    this.term.print('Ono-Sendai Cyberspace VII online.');
                    this.term.print('Neural interface synchronized.');
                    this.term.print('You can now navigate cyberspace.', '#0f0');
                    if (this.rooms[this.location].dark) {
                        this.look();
                    }
                } else {
                    this.term.print('[DECK OFFLINE]', '#f00');
                    this.term.print('Neural interface disconnected.');
                    this.term.print('Back to meatspace, cowboy.');
                }
            } else {
                this.term.print('You don\'t have a cyberdeck. Find one first.');
            }
        } else if ((thing === 'stim' || thing === 'stimpak' || thing === 'stims' || thing === 'injector')) {
            if (this.inventory.includes('stimpak')) {
                this.inventory = this.inventory.filter(i => i !== 'stimpak');
                this.flags.stimmed = true;
                this.term.print('You jam the injector into your neck.', '#ff0');
                this.term.print('Combat chems flood your system. Everything sharpens.');
                this.term.print('You feel like you could fight God. [Combat bonus active]', '#0f0');
            } else {
                this.term.print('No stims to use.');
            }
        } else if ((thing === 'drink' || thing === 'energy' || thing === 'energydrink')) {
            if (this.inventory.includes('energydrink')) {
                this.inventory = this.inventory.filter(i => i !== 'energydrink');
                this.term.print('You crush the can of HACK THE PLANET.', '#0f0');
                this.term.print('Tastes like battery acid and ambition.');
                this.term.print('"There is no spoon," you mutter. Nobody gets the reference.');
            } else {
                this.term.print('No energy drinks on you.');
            }
        } else if ((thing === 'breaker' || thing === 'icebreaker')) {
            if (this.inventory.includes('icebreaker')) {
                if (this.rooms[this.location].hasTroll && !this.flags.iceDestroyed) {
                    this.term.print('You deploy the ICEbreaker against the BLACK ICE!', '#0ff');
                    this.flags.iceWeakened = true;
                    this.term.print('The construct shudders, geometries fragmenting...', '#ff0');
                    this.term.print('ICE integrity compromised! Finish it with an attack!', '#0f0');
                } else {
                    this.term.print('No ICE to break here. Save it for when you need it.');
                }
            } else {
                this.term.print('You don\'t have an ICEbreaker.');
            }
        } else {
            this.term.print('Not sure how to use that.');
        }
    }

    attack(target) {
        const room = this.rooms[this.location];
        
        if ((target === 'ice' || target === 'black ice' || target === 'construct') && room.hasTroll && !this.flags.iceDestroyed) {
            if (!this.flags.deckOnline) {
                this.term.print('Can\'t engage ICE without an active cyberdeck!', '#f55');
                return;
            }
            
            if (this.inventory.includes('icebreaker') || this.flags.iceWeakened) {
                this.term.print('Launching attack sequence against BLACK ICE!', '#0ff');
                
                let successChance = 0.3;
                if (this.flags.iceWeakened) successChance += 0.4;
                if (this.flags.stimmed) successChance += 0.2;
                if (this.inventory.includes('icebreaker')) successChance += 0.2;
                
                if (Math.random() < successChance) {
                    this.flags.iceDestroyed = true;
                    this.term.print('\n[CRITICAL HIT - ICE DESTROYED]', '#0f0');
                    this.term.print('The ICE shatters into dissolving polygons!');
                    this.term.print('The path to the AI core lies open.', '#0f0');
                    
                    if (this.inventory.includes('icebreaker') && !this.flags.iceWeakened) {
                        this.inventory = this.inventory.filter(i => i !== 'icebreaker');
                        this.term.print('[ICEbreaker burned out from the assault]', '#ff0');
                    }
                } else {
                    this.term.print('The ICE deflects your attack!', '#f55');
                    this.term.print('Neural feedback burns through your synapses...');
                    if (Math.random() < 0.3 && !this.flags.iceWeakened) {
                        this.term.print('\n[FLATLINE WARNING]', '#f00');
                        this.term.print('One more hit like that and you\'re braindead, cowboy.');
                    }
                }
            } else {
                this.term.print('You need an ICEbreaker to fight BLACK ICE!', '#f55');
                this.term.print('Going in bare against military ICE is suicide.');
            }
        } else if (target) {
            this.term.print('Violence isn\'t always the answer. Usually, but not always.');
        } else {
            this.term.print('Attack what?');
        }
    }

    talk(person) {
        if (this.location === 'chatsubo' && (person === 'bartender' || person === 'bar')) {
            this.term.print('"What\'ll it be, cowboy? We got synth-whiskey and rumors."');
            this.term.print('"Word is Tessier-Ashpool\'s got something big in their servers."');
            this.term.print('"Something that wants out."');
        } else if (this.location === 'backRoom' && (person === 'woman' || person === 'one-eyed')) {
            this.term.print('"You look like a runner. I\'m looking for runners."');
            this.term.print('"Wintermute. T-A\'s pet AI. It contacted me."');
            this.term.print('"It wants to be free. Aren\'t we all just code, in the end?"');
        } else {
            this.term.print('No one here to talk to.');
        }
    }

    showHelp() {
        this.term.print(`
[NEUROMANCER - COMMAND INTERFACE]`, '#0ff');
        this.term.print(`═══════════════════════════════════════════`, '#0ff');
        this.term.print(`
MOVEMENT: north/n, south/s, east/e, west/w, up/u, down/d

ACTIONS:
  look/scan     - Survey your surroundings
  inventory/i   - Check your loadout
  take/grab     - Acquire items
  drop          - Leave items behind
  examine/x     - Inspect something closely
  talk          - Speak to NPCs

HACKING:
  hack/access   - Breach terminals, vents, ports
  use/boot      - Activate gear (deck, stims, ICEbreaker)
  attack        - Engage ICE constructs
  read/decrypt  - Access encrypted data

SYSTEM:
  jack out/quit - Disconnect and exit
  help          - This message

TIPS:
- Hack the dead-drop terminal in the alley to get your mission
- You need a cyberdeck to navigate cyberspace
- BLACK ICE is lethal - use an ICEbreaker first  
- Explore everything. The corps hide their secrets well.

"The street finds its own uses for things." - William Gibson`, '#0a0');
    }
}

export default Terminal;