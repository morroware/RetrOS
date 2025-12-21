/**
 * Terminal App - Retro MS-DOS Style
 * Features: File System, Network Sim, Easter Eggs
 * Authentic DOS/IlluminatOS command prompt experience
 */

import AppBase from './AppBase.js';
import EventBus from '../core/EventBus.js';
import StateManager from '../core/StateManager.js';
import FileSystemManager from '../core/FileSystemManager.js';
import { PATHS } from '../core/Constants.js';

class Terminal extends AppBase {
    constructor() {
        super({
            id: 'terminal',
            name: 'MS-DOS Prompt',
            icon: '💻',
            width: 700,
            height: 450,
            category: 'systemtools'
        });

        this.commandHistory = [];
        this.historyIndex = -1;
        this.godMode = false;
        this.activeProcess = null;
        this.currentPath = [...PATHS.USER_HOME];

        // DOS-like environment variables
        this.envVars = {
            'PATH': 'C:\\WINDOWS;C:\\WINDOWS\\SYSTEM32;C:\\DOS',
            'PROMPT': '$P$G',
            'COMSPEC': 'C:\\WINDOWS\\SYSTEM32\\CMD.EXE',
            'TEMP': 'C:\\TEMP',
            'TMP': 'C:\\TEMP',
            'USERNAME': 'User',
            'COMPUTERNAME': 'RETROS-PC',
            'OS': 'IlluminatOS',
            'WINDIR': 'C:\\WINDOWS'
        };
    }

    onOpen() {
        return `
            <div class="terminal-app" id="terminalApp">
                <canvas id="matrixCanvas"></canvas>
                <div class="terminal-scroll" id="terminalScroller">
                    <div id="terminalOutput"></div>
                    <div class="terminal-input-line" id="inputLine">
                        <span class="terminal-prompt" id="promptText">C:\\Users\\User></span>
                        <input type="text" class="terminal-input" id="terminalInput" autocomplete="off" spellcheck="false">
                    </div>
                </div>
            </div>
            <style>
                #window-terminal .window-content {
                    padding: 0 !important;
                    margin: 0 !important;
                    overflow: hidden !important;
                }

                .terminal-app {
                    background: #000;
                    color: #c0c0c0;
                    font-family: 'Consolas', 'Courier New', monospace;
                    font-size: 14px;
                    width: 100%;
                    height: 100%;
                    position: relative;
                    overflow: hidden;
                    box-sizing: border-box;
                }

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

                .terminal-scroll {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding: 8px;
                    z-index: 2;
                    box-sizing: border-box;
                }

                .terminal-app #terminalOutput {
                    white-space: pre-wrap;
                    word-break: break-word;
                }
                .terminal-app #terminalOutput > div {
                    margin-bottom: 1px;
                    line-height: 1.4;
                }

                .terminal-app .terminal-input-line {
                    display: flex;
                    align-items: center;
                    margin-top: 2px;
                }
                .terminal-app .terminal-prompt {
                    color: #c0c0c0;
                    margin-right: 0;
                    flex-shrink: 0;
                }
                .terminal-app .terminal-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #c0c0c0;
                    font-family: inherit;
                    font-size: inherit;
                    outline: none;
                    caret-color: #c0c0c0;
                    min-width: 0;
                    padding-left: 0;
                }
            </style>
        `;
    }

    onMount() {
        const input = this.getElement('#terminalInput');
        const scroller = this.getElement('#terminalScroller');

        scroller?.addEventListener('click', () => {
            if (window.getSelection().toString().length === 0) {
                input?.focus();
            }
        });

        this.runBootSequence();
    }

    runBootSequence() {
        const lines = [
            'IlluminatOS',
            '   (C)Copyright IlluminatOS 1995.',
            '',
            'C:\\>ver',
            '',
            'IlluminatOS [Version 95.0.1995]',
            '',
            'C:\\>cd Users\\User',
            ''
        ];

        const input = this.getElement('#terminalInput');
        const inputLine = this.getElement('#inputLine');
        if (inputLine) inputLine.style.display = 'none';

        let delay = 0;
        lines.forEach((line, i) => {
            delay += 20 + Math.random() * 20;
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

            // If a process is running, block input
            if (this.activeProcess && this.activeProcess !== 'more') {
                e.preventDefault();
                return;
            }

            // Handle 'more' process
            if (this.activeProcess === 'more') {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.continueMore();
                } else if (e.key === 'q' || e.key === 'Q') {
                    e.preventDefault();
                    this.killProcess();
                }
                return;
            }

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

    print(text, color = '#c0c0c0') {
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
        this.print(this.getPrompt() + trimmed);

        if (!trimmed) return;

        // Add to history
        this.commandHistory.push(trimmed);
        this.historyIndex = -1;

        // Parse command and arguments (handle quoted strings)
        const parts = this.parseCommandLine(trimmed);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Konami code easter egg
        if (trimmed.replace(/\s/g, '').toLowerCase() === 'uuddlrlrba') {
            this.godMode = true;
            this.print('*** GOD MODE ACTIVATED ***', '#ff00ff');
            return;
        }

        const commands = {
            // File system commands
            'help': () => this.cmdHelp(),
            '?': () => this.cmdHelp(),
            'cls': () => this.cmdClear(),
            'clear': () => this.cmdClear(),
            'dir': () => this.cmdDir(args),
            'ls': () => this.cmdDir(args),
            'cd': () => this.cmdCd(args),
            'chdir': () => this.cmdCd(args),
            'type': () => this.cmdType(args),
            'cat': () => this.cmdType(args),
            'more': () => this.cmdMore(args),
            'mkdir': () => this.cmdMkdir(args),
            'md': () => this.cmdMkdir(args),
            'rmdir': () => this.cmdRmdir(args),
            'rd': () => this.cmdRmdir(args),
            'del': () => this.cmdDel(args),
            'rm': () => this.cmdDel(args),
            'erase': () => this.cmdDel(args),
            'copy': () => this.cmdCopy(args),
            'cp': () => this.cmdCopy(args),
            'move': () => this.cmdMove(args),
            'mv': () => this.cmdMove(args),
            'ren': () => this.cmdRename(args),
            'rename': () => this.cmdRename(args),
            'tree': () => this.cmdTree(args),
            'find': () => this.cmdFind(args),
            'attrib': () => this.cmdAttrib(args),
            'edit': () => this.cmdEdit(args),
            'notepad': () => this.cmdEdit(args),
            'start': () => this.cmdStart(args),
            'open': () => this.cmdStart(args),

            // System commands
            'ver': () => this.cmdVer(),
            'vol': () => this.cmdVol(args),
            'label': () => this.cmdLabel(args),
            'date': () => this.cmdDate(),
            'time': () => this.cmdTime(),
            'whoami': () => this.cmdWhoami(),
            'hostname': () => 'RETROS-PC',
            'set': () => this.cmdSet(args),
            'path': () => this.cmdPath(args),
            'prompt': () => this.cmdPrompt(args),
            'echo': () => this.cmdEcho(args, trimmed),
            'mem': () => this.cmdMem(),
            'chkdsk': () => this.cmdChkdsk(args),
            'format': () => this.cmdFormat(args),
            'sys': () => this.cmdSys(),
            'systeminfo': () => this.cmdSystemInfo(),

            // Network commands
            'ipconfig': () => this.cmdIpConfig(),
            'ifconfig': () => this.cmdIpConfig(),
            'ping': () => this.cmdPing(args),
            'netstat': () => this.cmdNetstat(),
            'tracert': () => this.cmdTracert(args),
            'nslookup': () => this.cmdNslookup(args),

            // Fun commands
            'matrix': () => this.startMatrix(),
            'cowsay': () => this.cmdCowsay(args),
            'fortune': () => this.cmdFortune(),
            'disco': () => this.startDisco(),
            'party': () => this.startParty(),
            'color': () => this.cmdColor(args),

            // Other commands
            'sudo': () => this.cmdSudo(args),
            'bsod': () => this.triggerBSOD(),
            'exit': () => { this.close(); return null; },
            'quit': () => { this.close(); return null; },
            'about': () => this.cmdAbout(),
            'credits': () => this.cmdCredits(),
            'xyzzy': () => 'Nothing happens.',
            '42': () => 'The Answer to Life, the Universe, and Everything.',
        };

        // Handle drive switching (e.g., "C:" or "D:")
        if (cmd.match(/^[a-z]:$/)) {
            return this.cmdSwitchDrive(cmd.toUpperCase());
        }

        if (commands[cmd]) {
            const result = commands[cmd]();
            if (result) this.print(result);
        } else {
            // Try to open the command as a file in the current directory
            const fileResult = this.tryOpenFile(trimmed);
            if (!fileResult) {
                this.print(`'${cmd}' is not recognized as an internal or external command,`);
                this.print('operable program or batch file.');
            }
        }
    }

    /**
     * Try to open a file by name in the current directory
     * Supports .lnk (shortcuts), .exe (executables), .txt/.md/.log (text), images
     * @param {string} fileName - The filename to try to open
     * @returns {boolean} True if file was found and opened
     */
    tryOpenFile(fileName) {
        // Try to resolve the file path
        const filePath = this.resolvePath(fileName);

        // Check if file exists
        const node = FileSystemManager.getNode(filePath);
        if (!node) return false;

        // If it's a directory, cd into it
        if (node.type === 'directory') {
            this.currentPath = filePath;
            this.updatePrompt();
            return true;
        }

        // Must be a file
        if (node.type !== 'file') return false;

        const extension = node.extension || fileName.split('.').pop().toLowerCase();

        // Handle different file types
        if (extension === 'lnk') {
            // Shortcut file - open the target
            return this.openShortcut(node);
        } else if (extension === 'exe') {
            // Executable - launch the app
            return this.openExecutable(node);
        } else if (['txt', 'md', 'log'].includes(extension)) {
            // Text file - open in Notepad
            this.openInNotepad(filePath);
            return true;
        } else if (['png', 'jpg', 'bmp', 'gif'].includes(extension)) {
            // Image file - open in Paint
            this.openInPaint(filePath);
            return true;
        }

        return false;
    }

    /**
     * Open a shortcut (.lnk) file
     * @param {Object} node - The file node
     * @returns {boolean} True if opened successfully
     */
    openShortcut(node) {
        if (node.shortcutType === 'link' && node.shortcutTarget) {
            // External link - open in browser
            this.print(`Opening ${node.shortcutTarget}...`);
            import('./AppRegistry.js').then(module => {
                const AppRegistry = module.default;
                AppRegistry.launch('browser', { url: node.shortcutTarget });
            });
            return true;
        } else if (node.shortcutTarget) {
            // App shortcut - launch the app
            this.print(`Launching ${node.shortcutTarget}...`);
            import('./AppRegistry.js').then(module => {
                const AppRegistry = module.default;
                AppRegistry.launch(node.shortcutTarget);
            });
            return true;
        }
        return false;
    }

    /**
     * Open an executable (.exe) file
     * @param {Object} node - The file node
     * @returns {boolean} True if opened successfully
     */
    openExecutable(node) {
        if (node.appId) {
            this.print(`Launching ${node.appId}...`);
            import('./AppRegistry.js').then(module => {
                const AppRegistry = module.default;
                AppRegistry.launch(node.appId);
            });
            return true;
        }
        return false;
    }

    /**
     * Open a text file in Notepad
     * @param {string[]} filePath - The file path array
     */
    openInNotepad(filePath) {
        this.print(`Opening in Notepad...`);
        import('./AppRegistry.js').then(module => {
            const AppRegistry = module.default;
            AppRegistry.launch('notepad', { filePath });
        });
    }

    /**
     * Open an image file in Paint
     * @param {string[]} filePath - The file path array
     */
    openInPaint(filePath) {
        this.print(`Opening in Paint...`);
        import('./AppRegistry.js').then(module => {
            const AppRegistry = module.default;
            AppRegistry.launch('paint', { filePath });
        });
    }

    /**
     * START command - opens a file or launches an application
     * @param {string[]} args - Command arguments
     * @returns {string} Result message
     */
    cmdStart(args) {
        if (args.length === 0) {
            return 'Usage: START <filename or app name>';
        }

        const target = args.join(' ');

        // Try to open as a file first
        if (this.tryOpenFile(target)) {
            return null;
        }

        // Try to launch as an app by name (case-insensitive)
        const appId = target.toLowerCase().replace(/\s+/g, '').replace('.exe', '');
        import('./AppRegistry.js').then(module => {
            const AppRegistry = module.default;
            const apps = AppRegistry.getAll();
            const app = apps.find(a =>
                a.id.toLowerCase() === appId ||
                a.name.toLowerCase() === target.toLowerCase()
            );

            if (app) {
                this.print(`Launching ${app.name}...`);
                AppRegistry.launch(app.id);
            } else {
                this.print(`Cannot find '${target}'`);
            }
        });

        return null;
    }

    parseCommandLine(line) {
        const parts = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ' ' && !inQuotes) {
                if (current) {
                    parts.push(current);
                    current = '';
                }
            } else {
                current += char;
            }
        }
        if (current) parts.push(current);
        return parts;
    }

    // === FILE SYSTEM COMMANDS ===

    cmdHelp() {
        return `
For more information on a specific command, type HELP command-name

ATTRIB     Displays file attributes.
CD         Displays or changes the current directory.
CHKDSK     Checks a disk and displays a status report.
CLS        Clears the screen.
COPY       Copies files to another location.
DATE       Displays the date.
DEL        Deletes files.
DIR        Displays a list of files and subdirectories.
ECHO       Displays messages, or turns command echoing on/off.
EDIT       Starts Notepad to edit a file.
FIND       Searches for a text string in a file.
FORMAT     Formats a disk (simulated).
HELP       Provides help information.
IPCONFIG   Displays network configuration.
MD         Creates a directory.
MEM        Displays memory usage.
MORE       Displays output one screen at a time.
MOVE       Moves files from one directory to another.
PATH       Displays or sets the search path.
PING       Tests network connectivity.
RD         Removes a directory.
REN        Renames a file or directory.
SET        Displays or sets environment variables.
START      Starts an application or opens a file.
SYSTEMINFO Displays system configuration.
TIME       Displays the system time.
TREE       Displays directory structure graphically.
TYPE       Displays the contents of a text file.
VER        Displays the operating system version.
VOL        Displays the disk volume label.

TIP: Type a filename to open it (e.g. "snake.lnk" or "welcome.txt")

FUN:       matrix, disco, party, cowsay, fortune, color`;
    }

    cmdClear() {
        const output = this.getElement('#terminalOutput');
        if (output) output.innerHTML = '';
        return null;
    }

    cmdDir(args) {
        try {
            // Parse options
            let showWide = false;
            let showBare = false;
            let targetPath = this.currentPath;

            for (const arg of args) {
                if (arg.toLowerCase() === '/w') showWide = true;
                else if (arg.toLowerCase() === '/b') showBare = true;
                else if (!arg.startsWith('/')) {
                    targetPath = this.resolvePath(arg);
                }
            }

            const items = FileSystemManager.listDirectory(targetPath);
            const pathStr = targetPath.join('\\');

            if (showBare) {
                // Bare format - just names
                let out = '';
                for (const item of items) {
                    out += item.name + '\n';
                }
                return out;
            }

            // Get volume info
            const drive = targetPath[0];
            const driveNode = FileSystemManager.getNode([drive]);
            const volumeLabel = driveNode?.label || 'LOCAL DISK';

            let out = `\n Volume in drive ${drive.charAt(0)} is ${volumeLabel.toUpperCase()}`;
            out += `\n Volume Serial Number is 1995-1225`;
            out += `\n\n Directory of ${pathStr}\n\n`;

            if (showWide) {
                // Wide format - multiple columns
                let col = 0;
                for (const item of items) {
                    const name = item.type === 'directory' ? `[${item.name}]` : item.name;
                    out += name.padEnd(20);
                    col++;
                    if (col >= 3) {
                        out += '\n';
                        col = 0;
                    }
                }
                if (col !== 0) out += '\n';
            } else {
                // Standard format with dates and sizes
                let fileCount = 0;
                let dirCount = 0;
                let totalSize = 0;

                for (const item of items) {
                    const date = item.modified ? new Date(item.modified) : new Date();
                    const dateStr = date.toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric'
                    }).replace(/\//g, '-');
                    const timeStr = date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });

                    if (item.type === 'directory' || item.type === 'drive') {
                        out += `${dateStr}  ${timeStr}    <DIR>          ${item.name}\n`;
                        dirCount++;
                    } else {
                        const sizeStr = String(item.size || 0).padStart(14);
                        out += `${dateStr}  ${timeStr} ${sizeStr} ${item.name}\n`;
                        fileCount++;
                        totalSize += item.size || 0;
                    }
                }

                out += `\n               ${fileCount} File(s)    ${totalSize.toLocaleString()} bytes`;
                out += `\n               ${dirCount} Dir(s)   ${this.getFreeSpace(targetPath[0])} bytes free`;
            }

            return out;
        } catch (e) {
            return 'File Not Found';
        }
    }

    cmdCd(args) {
        if (!args[0]) {
            return this.currentPath.join('\\');
        }

        const target = args.join(' ');

        if (target === '..') {
            if (this.currentPath.length > 1) {
                this.currentPath.pop();
            }
        } else if (target === '\\' || target === '/') {
            this.currentPath = [this.currentPath[0]];
        } else if (target === '.') {
            // Stay in current directory
        } else {
            const newPath = this.resolvePath(target);
            const node = FileSystemManager.getNode(newPath);

            if (node && (node.type === 'directory' || node.type === 'drive' || node.children)) {
                this.currentPath = newPath;
            } else {
                return 'The system cannot find the path specified.';
            }
        }
        this.updatePrompt();
        return '';
    }

    cmdSwitchDrive(drive) {
        const node = FileSystemManager.getNode([drive]);
        if (node) {
            this.currentPath = [drive];
            this.updatePrompt();
            return '';
        }
        return 'The system cannot find the drive specified.';
    }

    cmdType(args) {
        if (!args[0]) return 'The syntax of the command is incorrect.';

        try {
            const filePath = this.resolvePath(args[0]);
            const content = FileSystemManager.readFile(filePath);
            return content;
        } catch (e) {
            return 'The system cannot find the file specified.';
        }
    }

    cmdMore(args) {
        if (!args[0]) return 'The syntax of the command is incorrect.';

        try {
            const filePath = this.resolvePath(args[0]);
            const content = FileSystemManager.readFile(filePath);
            const lines = content.split('\n');

            this.moreBuffer = lines;
            this.moreIndex = 0;
            this.activeProcess = 'more';

            this.showMorePage();
            return null;
        } catch (e) {
            return 'The system cannot find the file specified.';
        }
    }

    showMorePage() {
        const pageSize = 20;
        const endIndex = Math.min(this.moreIndex + pageSize, this.moreBuffer.length);

        for (let i = this.moreIndex; i < endIndex; i++) {
            this.print(this.moreBuffer[i]);
        }

        this.moreIndex = endIndex;

        if (this.moreIndex >= this.moreBuffer.length) {
            this.activeProcess = null;
            this.moreBuffer = null;
        } else {
            this.print('-- More -- (Press SPACE or ENTER for more, Q to quit)', '#ffff00');
        }
    }

    continueMore() {
        if (this.moreBuffer) {
            this.showMorePage();
        }
    }

    cmdMkdir(args) {
        if (!args[0]) return 'The syntax of the command is incorrect.';

        try {
            const dirPath = this.resolvePath(args[0]);
            FileSystemManager.createDirectory(dirPath);
            return '';
        } catch (e) {
            if (e.message.includes('already exists')) {
                return 'A subdirectory or file already exists.';
            }
            return `Unable to create directory - ${e.message}`;
        }
    }

    cmdRmdir(args) {
        if (!args[0]) return 'The syntax of the command is incorrect.';

        const recursive = args.includes('/s') || args.includes('/S');
        const target = args.find(a => !a.startsWith('/'));

        if (!target) return 'The syntax of the command is incorrect.';

        try {
            const dirPath = this.resolvePath(target);
            FileSystemManager.deleteDirectory(dirPath, recursive);
            return '';
        } catch (e) {
            if (e.message.includes('not empty')) {
                return 'The directory is not empty.';
            }
            return 'The system cannot find the file specified.';
        }
    }

    cmdDel(args) {
        if (!args[0]) return 'The syntax of the command is incorrect.';

        try {
            const filePath = this.resolvePath(args[0]);
            FileSystemManager.deleteFile(filePath);
            return '';
        } catch (e) {
            return 'The system cannot find the file specified.';
        }
    }

    cmdCopy(args) {
        if (args.length < 2) return 'The syntax of the command is incorrect.';

        try {
            const srcPath = this.resolvePath(args[0]);
            let destPath = this.resolvePath(args[1]);

            // Check if destination is a directory
            const destNode = FileSystemManager.getNode(destPath);
            if (destNode && (destNode.type === 'directory' || destNode.children)) {
                // Copy into directory
                FileSystemManager.copyItem(srcPath, destPath);
            } else {
                // Copy as new filename
                const content = FileSystemManager.readFile(srcPath);
                const srcInfo = FileSystemManager.getInfo(srcPath);
                FileSystemManager.writeFile(destPath, content, srcInfo.extension);
            }
            return '        1 file(s) copied.';
        } catch (e) {
            return 'The system cannot find the file specified.';
        }
    }

    cmdMove(args) {
        if (args.length < 2) return 'The syntax of the command is incorrect.';

        try {
            const srcPath = this.resolvePath(args[0]);
            const destPath = this.resolvePath(args[1]);

            // Check if destination is a directory
            const destNode = FileSystemManager.getNode(destPath);
            if (destNode && (destNode.type === 'directory' || destNode.children)) {
                FileSystemManager.moveItem(srcPath, destPath);
            } else {
                // Move as rename
                const content = FileSystemManager.readFile(srcPath);
                const srcInfo = FileSystemManager.getInfo(srcPath);
                FileSystemManager.writeFile(destPath, content, srcInfo.extension);
                FileSystemManager.deleteFile(srcPath);
            }
            return '        1 file(s) moved.';
        } catch (e) {
            return 'The system cannot find the file specified.';
        }
    }

    cmdRename(args) {
        if (args.length < 2) return 'The syntax of the command is incorrect.';

        try {
            const srcPath = this.resolvePath(args[0]);
            const newName = args[1];
            const parentPath = srcPath.slice(0, -1);
            const destPath = [...parentPath, newName];

            const content = FileSystemManager.readFile(srcPath);
            const srcInfo = FileSystemManager.getInfo(srcPath);
            FileSystemManager.writeFile(destPath, content, srcInfo.extension);
            FileSystemManager.deleteFile(srcPath);
            return '';
        } catch (e) {
            return 'The system cannot find the file specified.';
        }
    }

    cmdTree(args) {
        const targetPath = args[0] ? this.resolvePath(args[0]) : this.currentPath;

        try {
            let out = `Folder PATH listing for volume ${targetPath[0]}\n`;
            out += `${targetPath.join('\\')}\n`;
            out += this.buildTree(targetPath, '');
            return out;
        } catch (e) {
            return 'Invalid path';
        }
    }

    buildTree(path, prefix) {
        let out = '';
        try {
            const items = FileSystemManager.listDirectory(path);
            const dirs = items.filter(i => i.type === 'directory');

            for (let i = 0; i < dirs.length; i++) {
                const dir = dirs[i];
                const isLast = i === dirs.length - 1;
                const connector = isLast ? '└───' : '├───';
                const newPrefix = prefix + (isLast ? '    ' : '│   ');

                out += `${prefix}${connector}${dir.name}\n`;
                out += this.buildTree([...path, dir.name], newPrefix);
            }
        } catch (e) {
            // Directory access error, skip
        }
        return out;
    }

    cmdFind(args) {
        if (args.length < 1) return 'FIND: Parameter format not correct';

        // Parse: find "string" filename
        let searchStr = '';
        let fileName = '';

        for (const arg of args) {
            if (arg.startsWith('"') && arg.endsWith('"')) {
                searchStr = arg.slice(1, -1);
            } else if (!arg.startsWith('/')) {
                fileName = arg;
            }
        }

        if (!searchStr) return 'FIND: Parameter format not correct';
        if (!fileName) return 'FIND: Parameter format not correct';

        try {
            const filePath = this.resolvePath(fileName);
            const content = FileSystemManager.readFile(filePath);
            const lines = content.split('\n');

            let out = `\n---------- ${fileName}\n`;
            let found = false;

            for (const line of lines) {
                if (line.toLowerCase().includes(searchStr.toLowerCase())) {
                    out += line + '\n';
                    found = true;
                }
            }

            if (!found) {
                out += '(no matches found)\n';
            }

            return out;
        } catch (e) {
            return `File not found - ${fileName}`;
        }
    }

    cmdAttrib(args) {
        if (!args[0]) {
            // Show attributes for all files in current directory
            try {
                const items = FileSystemManager.listDirectory(this.currentPath);
                let out = '';
                for (const item of items) {
                    const attrs = item.type === 'directory' ? 'D' : 'A';
                    out += `     ${attrs}     ${this.currentPath.join('\\')}\\${item.name}\n`;
                }
                return out;
            } catch (e) {
                return 'File not found';
            }
        }

        const filePath = this.resolvePath(args[0]);
        try {
            const info = FileSystemManager.getInfo(filePath);
            const attrs = info.type === 'directory' ? 'D' : 'A';
            return `     ${attrs}     ${filePath.join('\\')}`;
        } catch (e) {
            return 'File not found - ' + args[0];
        }
    }

    cmdEdit(args) {
        if (!args[0]) return 'The syntax of the command is incorrect.';

        const filePath = this.resolvePath(args[0]);

        import('./AppRegistry.js').then(module => {
            const AppRegistry = module.default;
            AppRegistry.launch('notepad', { filePath });
        });

        return '';
    }

    // === SYSTEM COMMANDS ===

    cmdVer() {
        return `\nIlluminatOS [Version 95.0.1995]`;
    }

    cmdVol(args) {
        const drive = args[0] ? args[0].toUpperCase().replace(':', '') + ':' : this.currentPath[0];
        const node = FileSystemManager.getNode([drive]);

        if (!node) {
            return 'The system cannot find the drive specified.';
        }

        const label = node.label || 'NO NAME';
        return ` Volume in drive ${drive.charAt(0)} is ${label.toUpperCase()}\n Volume Serial Number is 1995-1225`;
    }

    cmdLabel(args) {
        return 'Access Denied - Volume label modification not supported.';
    }

    cmdDate() {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', {
            weekday: 'short',
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
        return `The current date is: ${dateStr}`;
    }

    cmdTime() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        return `The current time is: ${timeStr}`;
    }

    cmdWhoami() {
        if (this.godMode) {
            return 'ILLUMINAT-PC\\Administrator (GOD MODE)';
        }
        return 'ILLUMINAT-PC\\User';
    }

    cmdSet(args) {
        if (!args[0]) {
            // Show all environment variables
            let out = '';
            for (const [key, value] of Object.entries(this.envVars)) {
                out += `${key}=${value}\n`;
            }
            return out;
        }

        // Set a variable
        const match = args.join(' ').match(/^(\w+)=(.*)$/);
        if (match) {
            this.envVars[match[1].toUpperCase()] = match[2];
            return '';
        }

        // Show specific variable
        const varName = args[0].toUpperCase();
        if (this.envVars[varName]) {
            return `${varName}=${this.envVars[varName]}`;
        }
        return `Environment variable ${args[0]} not defined`;
    }

    cmdPath(args) {
        if (!args[0]) {
            return `PATH=${this.envVars.PATH}`;
        }
        this.envVars.PATH = args.join(' ');
        return '';
    }

    cmdPrompt(args) {
        if (!args[0]) {
            return `PROMPT=${this.envVars.PROMPT}`;
        }
        this.envVars.PROMPT = args.join(' ');
        return '';
    }

    cmdEcho(args, fullCommand) {
        // Check for output redirection
        const redirectMatch = fullCommand.match(/^echo\s+(.*?)\s*(?:(>>?)\s*(.+))$/i);

        if (redirectMatch) {
            const text = redirectMatch[1].trim();
            const appendMode = redirectMatch[2] === '>>';
            const fileName = redirectMatch[3].trim();

            try {
                const filePath = this.resolvePath(fileName);

                if (appendMode && FileSystemManager.exists(filePath)) {
                    const existingContent = FileSystemManager.readFile(filePath);
                    FileSystemManager.writeFile(filePath, existingContent + '\n' + text);
                } else {
                    FileSystemManager.writeFile(filePath, text);
                }
                return null;
            } catch (e) {
                return `The system cannot find the path specified.`;
            }
        }

        // Check for ECHO ON/OFF
        if (args[0]?.toLowerCase() === 'on' || args[0]?.toLowerCase() === 'off') {
            return `ECHO is ${args[0].toLowerCase()}.`;
        }

        // Just echo the text
        if (!args.length) {
            return 'ECHO is on.';
        }
        return args.join(' ');
    }

    cmdMem() {
        return `
Memory Type         Total      Used       Free
---------------  --------  --------  --------
Conventional         640K      425K      215K
Upper                  0K        0K        0K
Reserved               0K        0K        0K
Extended (XMS)    15,360K   12,288K    3,072K
---------------  --------  --------  --------
Total memory     16,000K   12,713K    3,287K

Total under 1 MB      640K      425K      215K

Largest executable program size        214K (219,648 bytes)
Largest free upper memory block          0K       (0 bytes)
MS-DOS is resident in the high memory area.`;
    }

    cmdChkdsk(args) {
        const drive = args[0] ? args[0].toUpperCase().replace(':', '') + ':' : this.currentPath[0];

        this.print(`\nChecking ${drive}...`);

        // Simulate disk check
        setTimeout(() => {
            const totalSize = this.getDriveSize(drive);
            const usedSize = FileSystemManager.getDirectorySize([drive]);
            const freeSize = totalSize - usedSize;

            this.print(`\n  Volume Serial Number is 1995-1225`);
            this.print(`\n  ${totalSize.toLocaleString()} bytes total disk space.`);
            this.print(`  ${usedSize.toLocaleString()} bytes in user files.`);
            this.print(`  ${freeSize.toLocaleString()} bytes available on disk.`);
            this.print(`\n  512 bytes in each allocation unit.`);
            this.print(`  ${Math.floor(totalSize / 512).toLocaleString()} total allocation units on disk.`);
            this.print(`  ${Math.floor(freeSize / 512).toLocaleString()} allocation units available on disk.`);
        }, 500);

        return null;
    }

    cmdFormat(args) {
        if (!args[0]) return 'Required parameter missing';

        const drive = args[0].toUpperCase();
        if (drive === 'C:') {
            return `\nFormat cannot be done on the system drive.\nThis is your main disk drive - formatting it would destroy the operating system!`;
        }

        return `\nWARNING: ALL DATA ON NON-REMOVABLE DISK\nDRIVE ${drive} WILL BE LOST!\nProceed with Format (Y/N)? _\n\n(Format simulation - no actual formatting will occur)`;
    }

    cmdSys() {
        return 'System transferred';
    }

    cmdSystemInfo() {
        const bootTime = new Date(Date.now() - Math.random() * 86400000);

        return `
Host Name:                 RETROS-PC
OS Name:                   IlluminatOS 95
OS Version:                95.0.1995 Build 1995
OS Manufacturer:           Morrow Systems Inc.
OS Configuration:          Standalone Workstation
OS Build Type:             Multiprocessor Free
Original Install Date:     12/25/1995, 12:00:00 AM
System Boot Time:          ${bootTime.toLocaleString()}
System Manufacturer:       Generic PC
System Model:              IBM Compatible
System Type:               x86-based PC
Processor(s):              1 Processor(s) Installed.
                           [01]: Intel Pentium 133MHz
BIOS Version:              Morrow Systems BIOS v2.1
System Directory:         C:\\WINDOWS
System Directory:          C:\\WINDOWS\\SYSTEM32
Boot Device:               \\Device\\HarddiskVolume1
System Locale:             en-us;English (United States)
Input Locale:              en-us;English (United States)
Time Zone:                 (UTC) Coordinated Universal Time
Total Physical Memory:     16,384 KB
Available Physical Memory: 12,288 KB
Virtual Memory: Max Size:  32,768 KB
Virtual Memory: Available: 24,576 KB
Virtual Memory: In Use:    8,192 KB`;
    }

    // === NETWORK COMMANDS ===

    cmdIpConfig() {
        return `
Windows IP Configuration

Ethernet adapter Local Area Connection:

   Connection-specific DNS Suffix  . :
   IPv4 Address. . . . . . . . . . . : 192.168.1.42
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1

Ethernet adapter Local Area Connection:

   Media State . . . . . . . . . . . : Media disconnected
   Connection-specific DNS Suffix  . :`;
    }

    cmdPing(args) {
        const host = args[0] || 'localhost';
        this.activeProcess = 'ping';
        this.print(`\nPinging ${host} with 32 bytes of data:\n`);

        let count = 0;
        const interval = setInterval(() => {
            if (count >= 4 || this.activeProcess !== 'ping') {
                clearInterval(interval);
                if (this.activeProcess === 'ping') {
                    this.print(`\nPing statistics for ${host}:`);
                    this.print('    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),');
                    this.print('Approximate round trip times in milli-seconds:');
                    this.print('    Minimum = 10ms, Maximum = 35ms, Average = 22ms');
                    this.activeProcess = null;
                }
                return;
            }
            const ms = Math.floor(Math.random() * 25) + 10;
            const ttl = host === 'localhost' || host === '127.0.0.1' ? 128 : 64 - Math.floor(Math.random() * 10);
            this.print(`Reply from ${host}: bytes=32 time=${ms}ms TTL=${ttl}`);
            count++;
        }, 600);

        return null;
    }

    cmdNetstat() {
        return `
Active Connections

  Proto  Local Address          Foreign Address        State
  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING
  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING
  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING
  TCP    192.168.1.42:139       0.0.0.0:0              LISTENING
  TCP    192.168.1.42:49234     142.250.80.46:443      ESTABLISHED
  TCP    192.168.1.42:49235     151.101.1.69:443       ESTABLISHED
  UDP    0.0.0.0:123            *:*
  UDP    0.0.0.0:500            *:*
  UDP    192.168.1.42:137       *:*
  UDP    192.168.1.42:138       *:*`;
    }

    cmdTracert(args) {
        if (!args[0]) return 'The syntax of the command is incorrect.';

        const host = args[0];
        this.activeProcess = 'tracert';
        this.print(`\nTracing route to ${host}`);
        this.print('over a maximum of 30 hops:\n');

        const hops = [
            '192.168.1.1',
            '10.0.0.1',
            '172.16.0.1',
            '209.85.143.1',
            host
        ];

        let hop = 0;
        const interval = setInterval(() => {
            if (hop >= hops.length || this.activeProcess !== 'tracert') {
                clearInterval(interval);
                if (this.activeProcess === 'tracert') {
                    this.print('\nTrace complete.');
                    this.activeProcess = null;
                }
                return;
            }
            const ms1 = Math.floor(Math.random() * 20) + 5;
            const ms2 = Math.floor(Math.random() * 20) + 5;
            const ms3 = Math.floor(Math.random() * 20) + 5;
            this.print(`  ${(hop + 1).toString().padStart(2)}    ${ms1} ms    ${ms2} ms    ${ms3} ms  ${hops[hop]}`);
            hop++;
        }, 400);

        return null;
    }

    cmdNslookup(args) {
        if (!args[0]) {
            return `Default Server:  dns.local\nAddress:  192.168.1.1\n\n> `;
        }

        const host = args[0];
        const fakeIP = `${Math.floor(Math.random() * 200) + 50}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

        return `Server:  dns.local\nAddress:  192.168.1.1\n\nNon-authoritative answer:\nName:    ${host}\nAddress: ${fakeIP}`;
    }

    // === FUN COMMANDS ===

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
        this.print('Entering the Matrix... (Ctrl+C to exit)', '#00ff00');
        return null;
    }

    cmdCowsay(args) {
        const msg = args.join(' ') || 'Moo!';
        const border = '-'.repeat(msg.length + 2);
        return `
 ${border}
< ${msg} >
 ${border}
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
            "In a world without walls and fences, who needs walls and gates?",
            "There's no place like 127.0.0.1",
            "To err is human... to really foul things up requires a computer.",
            "Artificial Intelligence usually beats natural stupidity.",
            "A user interface is like a joke. If you have to explain it, it's not that good.",
            "The cloud is just someone else's computer.",
            "I would love to change the world, but they won't give me the source code."
        ];
        return fortunes[Math.floor(Math.random() * fortunes.length)];
    }

    startDisco() {
        document.body.classList.add('disco-mode');
        setTimeout(() => document.body.classList.remove('disco-mode'), 10000);
        StateManager.unlockAchievement('disco_fever');
        return 'DISCO MODE ACTIVATED!';
    }

    startParty() {
        document.body.classList.add('disco-mode');
        EventBus.emit('pet:toggle', { enabled: true });
        setTimeout(() => document.body.classList.remove('disco-mode'), 10000);
        return 'PARTY TIME!';
    }

    cmdColor(args) {
        const colors = {
            '0': '#000000', '1': '#000080', '2': '#008000', '3': '#008080',
            '4': '#800000', '5': '#800080', '6': '#808000', '7': '#c0c0c0',
            '8': '#808080', '9': '#0000ff', 'a': '#00ff00', 'b': '#00ffff',
            'c': '#ff0000', 'd': '#ff00ff', 'e': '#ffff00', 'f': '#ffffff'
        };

        if (!args[0]) {
            return 'Sets the default console foreground and background colors.\n\nCOLOR [attr]\n\n  attr  Specifies color attribute of console output\n        0 = Black, 1 = Blue, 2 = Green, 3 = Aqua\n        4 = Red, 5 = Purple, 6 = Yellow, 7 = White\n        8-F = Bright versions';
        }

        const code = args[0].toLowerCase();
        if (code.length >= 1) {
            const fg = colors[code.charAt(code.length - 1)];
            if (fg) {
                const output = this.getElement('#terminalOutput');
                const input = this.getElement('#terminalInput');
                const prompt = this.getElement('#promptText');
                if (output) output.style.color = fg;
                if (input) input.style.color = fg;
                if (prompt) prompt.style.color = fg;
            }
        }
        return '';
    }

    // === OTHER COMMANDS ===

    cmdSudo(args) {
        if (args.join(' ') === 'make me a sandwich') {
            return 'Okay.';
        }
        return this.godMode
            ? 'Command executed with elevated privileges.'
            : "This incident will be reported.";
    }

    triggerBSOD() {
        EventBus.emit('bsod:show', {
            title: 'KERNEL_PANIC',
            msg: 'System halted. Just kidding!'
        });
        StateManager.unlockAchievement('bsod_master');
        return '';
    }

    cmdAbout() {
        return `
IlluminatOS [Version 95.0.1995]
(C) Copyright Morrow Systems Inc. 1995-2025

A retro IlluminatOS experience built with love and nostalgia.
Visit: https://example.com`;
    }

    cmdCredits() {
        return `
SETH MORROW OS - CREDITS
========================

Created by: IlluminatOS Team
Engine: Vanilla JavaScript
Inspiration: IlluminatOS, MS-DOS

Special Thanks:
- Retro computing nostalgia
- Everyone who remembers the 90s
- Coffee

"Where do you want to go today?"`;
    }

    // === HELPER METHODS ===

    resolvePath(pathStr) {
        if (!pathStr) return [...this.currentPath];

        // Handle absolute paths
        if (pathStr.match(/^[A-Za-z]:/)) {
            return FileSystemManager.parsePath(pathStr);
        }

        // Handle root
        if (pathStr === '\\' || pathStr === '/') {
            return [this.currentPath[0]];
        }

        // Handle relative paths
        const parts = pathStr.replace(/\\/g, '/').split('/').filter(p => p.length > 0);
        let result = [...this.currentPath];

        for (const part of parts) {
            if (part === '..') {
                if (result.length > 1) result.pop();
            } else if (part !== '.') {
                result.push(part);
            }
        }

        return result;
    }

    getCurrentDir() {
        try {
            const items = FileSystemManager.listDirectory(this.currentPath);
            const dir = {};
            for (const item of items) {
                dir[item.name] = item.type === 'file' ? item.content : {};
            }
            return dir;
        } catch (e) {
            return null;
        }
    }

    getDriveSize(drive) {
        const sizes = {
            'C:': 2147483648,  // 2GB
            'D:': 681574400,   // 650MB
            'A:': 1474560      // 1.44MB
        };
        return sizes[drive] || 1073741824;
    }

    getFreeSpace(drive) {
        const total = this.getDriveSize(drive);
        const used = FileSystemManager.getDirectorySize([drive]);
        return (total - used).toLocaleString();
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
        } else if (this.activeProcess === 'more') {
            this.moreBuffer = null;
            this.moreIndex = 0;
        } else if (this.activeProcess === 'ping' || this.activeProcess === 'tracert') {
            // These will clean up on next interval tick
        }

        this.print('^C');
        this.activeProcess = null;
    }

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
        if (parts.length === 1 && !val.includes('\\') && !val.includes('/')) {
            const cmds = ['help','cls','dir','cd','type','more','whoami','date','time','ping','ipconfig',
                         'tree','copy','move','del','mkdir','rmdir','ren','find','attrib','set','path',
                         'ver','vol','mem','chkdsk','systeminfo','netstat','tracert','nslookup',
                         'matrix','cowsay','fortune','disco','color','exit','about'];
            const match = cmds.find(c => c.startsWith(parts[0].toLowerCase()));
            if (match) input.value = match + ' ';
            return;
        }

        // File/directory completion
        const lastPart = parts[parts.length - 1];
        const dirPath = lastPart.includes('\\') || lastPart.includes('/')
            ? this.resolvePath(lastPart.substring(0, lastPart.lastIndexOf(/[\\\/]/) + 1))
            : this.currentPath;

        const searchTerm = lastPart.includes('\\') || lastPart.includes('/')
            ? lastPart.substring(lastPart.lastIndexOf(/[\\\/]/) + 1)
            : lastPart;

        try {
            const items = FileSystemManager.listDirectory(dirPath);
            const match = items.find(item =>
                item.name.toLowerCase().startsWith(searchTerm.toLowerCase())
            );
            if (match) {
                const prefix = parts.slice(0, -1).join(' ');
                input.value = (prefix ? prefix + ' ' : '') + match.name;
            }
        } catch (e) {
            // Tab complete failed, ignore
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

export default Terminal;
