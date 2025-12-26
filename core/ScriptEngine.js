/**
 * ScriptEngine - Foundation for RetrOS scripting language
 *
 * Provides a simple scripting interface that uses semantic events to control
 * the operating system. This is the foundation for turning RetrOS into a game.
 *
 * Script Syntax (RetroScript):
 *   # Comments start with #
 *   launch notepad                     # Launch an app
 *   launch notepad with file="readme.txt"
 *   wait 1000                          # Wait 1 second
 *   set $myVar = "hello"               # Set a variable
 *   print $myVar                       # Print to console
 *   emit sound:play type="notify"      # Emit an event
 *   on window:open { print "opened!" } # Event handlers
 *   if $condition then { ... }         # Conditionals
 *   loop 5 { ... }                     # Loops
 *   call myFunction                    # Call a function
 *
 * Usage:
 *   import ScriptEngine from './ScriptEngine.js';
 *   ScriptEngine.run('launch notepad; wait 1000; close');
 *
 *   // Or from file:
 *   ScriptEngine.runFile('C:/Scripts/demo.retro');
 */

import EventBus from './EventBus.js';
import CommandBus from './CommandBus.js';
import FileSystemManager from './FileSystemManager.js';
import StateManager from './StateManager.js';

class ScriptEngineClass {
    constructor() {
        this.variables = new Map();
        this.functions = new Map();
        this.eventHandlers = [];
        this.running = false;
        this.currentScript = null;
        this.scriptStack = [];
        this.breakRequested = false;
        this.lastResult = null;

        // Built-in functions
        this._registerBuiltins();
    }

    /**
     * Initialize the script engine
     */
    initialize() {
        // Ensure CommandBus is initialized
        CommandBus.initialize();

        // Set up global variables
        this.variables.set('TRUE', true);
        this.variables.set('FALSE', false);
        this.variables.set('NULL', null);

        console.log('[ScriptEngine] Initialized');
    }

    /**
     * Run a script string
     * @param {string} scriptText - Script code
     * @param {object} context - Execution context (variables, etc.)
     * @returns {Promise<object>} Execution result
     */
    async run(scriptText, context = {}) {
        const scriptId = `script_${Date.now()}`;
        this.running = true;
        this.breakRequested = false;

        // Merge context variables
        for (const [key, value] of Object.entries(context)) {
            this.variables.set(key, value);
        }

        EventBus.emit('script:execute', { scriptId, source: 'inline' });

        try {
            const statements = this._parse(scriptText);
            const result = await this._execute(statements);

            EventBus.emit('script:complete', { scriptId, result });
            this.lastResult = result;
            return { success: true, result };
        } catch (error) {
            console.error('[ScriptEngine] Execution error:', error);
            EventBus.emit('script:error', {
                scriptId,
                error: error.message,
                line: error.line || 0
            });
            return { success: false, error: error.message };
        } finally {
            this.running = false;
        }
    }

    /**
     * Run a script from a file
     * @param {string|string[]} path - File path
     * @param {object} context - Execution context
     * @returns {Promise<object>} Execution result
     */
    async runFile(path, context = {}) {
        try {
            const content = FileSystemManager.readFile(path);
            return await this.run(content, context);
        } catch (error) {
            return { success: false, error: `Failed to load script: ${error.message}` };
        }
    }

    /**
     * Stop the currently running script
     */
    stop() {
        this.breakRequested = true;
        this.running = false;
    }

    /**
     * Define a function that can be called from scripts
     * @param {string} name - Function name
     * @param {Function} fn - Function implementation
     */
    defineFunction(name, fn) {
        this.functions.set(name, fn);
    }

    /**
     * Get a variable value
     * @param {string} name - Variable name
     * @returns {*} Variable value
     */
    getVariable(name) {
        return this.variables.get(name);
    }

    /**
     * Set a variable value
     * @param {string} name - Variable name
     * @param {*} value - Variable value
     */
    setVariable(name, value) {
        this.variables.set(name, value);
    }

    // ==========================================
    // PARSING
    // ==========================================

    /**
     * Parse script text into statements
     * @private
     */
    _parse(scriptText) {
        const lines = scriptText.split('\n');
        const statements = [];
        let lineNum = 0;

        for (let line of lines) {
            lineNum++;
            line = line.trim();

            // Skip empty lines and comments
            if (!line || line.startsWith('#')) continue;

            // Remove inline comments
            const commentIdx = line.indexOf('#');
            if (commentIdx > 0) {
                line = line.substring(0, commentIdx).trim();
            }

            try {
                const statement = this._parseLine(line, lineNum);
                if (statement) {
                    statements.push(statement);
                }
            } catch (error) {
                error.line = lineNum;
                throw error;
            }
        }

        return statements;
    }

    /**
     * Parse a single line into a statement
     * @private
     */
    _parseLine(line, lineNum) {
        // Split by semicolons for multiple statements per line
        if (line.includes(';') && !line.includes('"')) {
            const subStatements = line.split(';').map(s => s.trim()).filter(s => s);
            if (subStatements.length > 1) {
                return {
                    type: 'block',
                    statements: subStatements.map(s => this._parseLine(s, lineNum))
                };
            }
            line = subStatements[0];
        }

        const parts = this._tokenize(line);
        if (parts.length === 0) return null;

        const command = parts[0].toLowerCase();

        switch (command) {
            case 'launch':
            case 'open':
                return this._parseLaunch(parts);
            case 'close':
                return this._parseClose(parts);
            case 'wait':
            case 'sleep':
                return this._parseWait(parts);
            case 'set':
                return this._parseSet(parts);
            case 'print':
            case 'log':
                return this._parsePrint(parts);
            case 'emit':
                return this._parseEmit(parts);
            case 'on':
                return this._parseOn(parts, line);
            case 'if':
                return this._parseIf(parts, line);
            case 'loop':
            case 'repeat':
                return this._parseLoop(parts, line);
            case 'call':
                return this._parseCall(parts);
            case 'return':
                return { type: 'return', value: parts[1] ? this._parseValue(parts[1]) : null };
            case 'break':
                return { type: 'break' };
            case 'alert':
                return { type: 'alert', message: parts.slice(1).join(' ') };
            case 'notify':
                return { type: 'notify', message: parts.slice(1).join(' ') };
            case 'focus':
                return { type: 'focus', target: parts[1] };
            case 'minimize':
                return { type: 'minimize', target: parts[1] };
            case 'maximize':
                return { type: 'maximize', target: parts[1] };
            case 'play':
                return { type: 'play', sound: parts[1] };
            case 'write':
                return this._parseWrite(parts);
            case 'read':
                return this._parseRead(parts);
            case 'mkdir':
                return { type: 'mkdir', path: parts[1] };
            case 'delete':
            case 'rm':
                return { type: 'delete', path: parts[1] };
            default:
                // Check if it's a function call or variable assignment
                if (line.includes('=')) {
                    return this._parseAssignment(line);
                }
                // Treat as a command
                return { type: 'command', command, args: parts.slice(1) };
        }
    }

    /**
     * Tokenize a line respecting quoted strings
     * @private
     */
    _tokenize(line) {
        const tokens = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = '';
            } else if (char === ' ' && !inQuotes) {
                if (current) {
                    tokens.push(current);
                    current = '';
                }
            } else {
                current += char;
            }
        }

        if (current) {
            tokens.push(current);
        }

        return tokens;
    }

    _parseLaunch(parts) {
        const appId = parts[1];
        const params = {};

        // Parse "with" clause: launch notepad with file="readme.txt"
        const withIdx = parts.indexOf('with');
        if (withIdx > 0) {
            for (let i = withIdx + 1; i < parts.length; i++) {
                const param = parts[i];
                if (param.includes('=')) {
                    const [key, value] = param.split('=');
                    params[key] = this._parseValue(value);
                }
            }
        }

        return { type: 'launch', appId, params };
    }

    _parseClose(parts) {
        return { type: 'close', target: parts[1] || null };
    }

    _parseWait(parts) {
        const duration = parseInt(parts[1]) || 1000;
        return { type: 'wait', duration };
    }

    _parseSet(parts) {
        // set $varName = value
        const varName = parts[1].replace(/^\$/, '');
        const eqIdx = parts.indexOf('=');
        const value = parts.slice(eqIdx + 1).join(' ');
        return { type: 'set', varName, value: this._parseValue(value) };
    }

    _parsePrint(parts) {
        const message = parts.slice(1).join(' ');
        return { type: 'print', message };
    }

    _parseEmit(parts) {
        // emit eventName key1=val1 key2=val2
        const eventName = parts[1];
        const payload = {};

        for (let i = 2; i < parts.length; i++) {
            if (parts[i].includes('=')) {
                const [key, value] = parts[i].split('=');
                payload[key] = this._parseValue(value);
            }
        }

        return { type: 'emit', eventName, payload };
    }

    _parseOn(parts, line) {
        // on eventName { statements }
        const eventName = parts[1];
        const braceStart = line.indexOf('{');
        const braceEnd = line.lastIndexOf('}');

        if (braceStart > 0 && braceEnd > braceStart) {
            const body = line.substring(braceStart + 1, braceEnd).trim();
            return {
                type: 'on',
                eventName,
                body: this._parse(body)
            };
        }

        return { type: 'on', eventName, body: [] };
    }

    _parseIf(parts, line) {
        // if condition then { statements } else { statements }
        const thenIdx = line.indexOf('then');
        const elseIdx = line.indexOf('else');

        let condition = line.substring(2, thenIdx > 0 ? thenIdx : line.indexOf('{')).trim();
        condition = this._parseCondition(condition);

        // Extract then block
        const thenStart = line.indexOf('{');
        const thenEnd = elseIdx > 0
            ? line.lastIndexOf('}', elseIdx)
            : line.lastIndexOf('}');

        let thenBody = [];
        let elseBody = [];

        if (thenStart > 0 && thenEnd > thenStart) {
            thenBody = this._parse(line.substring(thenStart + 1, thenEnd).trim());
        }

        // Extract else block
        if (elseIdx > 0) {
            const elseStart = line.indexOf('{', elseIdx);
            const elseEnd = line.lastIndexOf('}');
            if (elseStart > 0 && elseEnd > elseStart) {
                elseBody = this._parse(line.substring(elseStart + 1, elseEnd).trim());
            }
        }

        return { type: 'if', condition, thenBody, elseBody };
    }

    _parseLoop(parts, line) {
        // loop 5 { statements }
        // loop while condition { statements }
        const count = parseInt(parts[1]);

        const braceStart = line.indexOf('{');
        const braceEnd = line.lastIndexOf('}');

        let body = [];
        if (braceStart > 0 && braceEnd > braceStart) {
            body = this._parse(line.substring(braceStart + 1, braceEnd).trim());
        }

        if (isNaN(count)) {
            // While loop
            const condition = parts.slice(2, parts.indexOf('{')).join(' ');
            return { type: 'while', condition: this._parseCondition(condition), body };
        }

        return { type: 'loop', count, body };
    }

    _parseCall(parts) {
        const funcName = parts[1];
        const args = parts.slice(2).map(a => this._parseValue(a));
        return { type: 'call', funcName, args };
    }

    _parseWrite(parts) {
        // write "content" to "path"
        const toIdx = parts.indexOf('to');
        const content = parts.slice(1, toIdx).join(' ');
        const path = parts[toIdx + 1];
        return { type: 'write', content: this._parseValue(content), path: this._parseValue(path) };
    }

    _parseRead(parts) {
        // read "path" into $variable
        const path = parts[1];
        const intoIdx = parts.indexOf('into');
        const varName = intoIdx > 0 ? parts[intoIdx + 1].replace('$', '') : 'result';
        return { type: 'read', path: this._parseValue(path), varName };
    }

    _parseAssignment(line) {
        const eqIdx = line.indexOf('=');
        const varName = line.substring(0, eqIdx).trim().replace(/^\$/, '');
        const value = line.substring(eqIdx + 1).trim();
        return { type: 'set', varName, value: this._parseValue(value) };
    }

    _parseValue(value) {
        if (value === undefined || value === null) return null;

        value = String(value).trim();

        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            return value.slice(1, -1);
        }

        // Variables
        if (value.startsWith('$')) {
            return { type: 'variable', name: value.slice(1) };
        }

        // Numbers
        if (!isNaN(value)) {
            return parseFloat(value);
        }

        // Booleans
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
        if (value.toLowerCase() === 'null') return null;

        return value;
    }

    _parseCondition(condition) {
        condition = condition.trim();

        // Handle comparison operators
        const operators = ['==', '!=', '>=', '<=', '>', '<', '&&', '||'];
        for (const op of operators) {
            if (condition.includes(op)) {
                const [left, right] = condition.split(op).map(s => s.trim());
                return {
                    type: 'comparison',
                    operator: op,
                    left: this._parseValue(left),
                    right: this._parseValue(right)
                };
            }
        }

        return this._parseValue(condition);
    }

    // ==========================================
    // EXECUTION
    // ==========================================

    /**
     * Execute a list of statements
     * @private
     */
    async _execute(statements) {
        let result = null;

        for (const statement of statements) {
            if (this.breakRequested) break;

            result = await this._executeStatement(statement);

            if (statement.type === 'return') {
                return result;
            }
            if (statement.type === 'break') {
                break;
            }
        }

        return result;
    }

    /**
     * Execute a single statement
     * @private
     */
    async _executeStatement(statement) {
        if (!statement) return null;

        switch (statement.type) {
            case 'block':
                return await this._execute(statement.statements);

            case 'launch':
                return await CommandBus.execute('app:launch', {
                    appId: statement.appId,
                    params: statement.params
                });

            case 'close':
                if (statement.target) {
                    return await CommandBus.execute('window:close', { windowId: statement.target });
                }
                // Close most recent window
                const windows = StateManager.getState('windows') || [];
                if (windows.length > 0) {
                    return await CommandBus.execute('window:close', {
                        windowId: windows[windows.length - 1].id
                    });
                }
                return null;

            case 'wait':
                await new Promise(resolve => setTimeout(resolve, statement.duration));
                return statement.duration;

            case 'set':
                const value = this._resolveValue(statement.value);
                this.variables.set(statement.varName, value);
                return value;

            case 'print':
                const message = this._resolveValue(statement.message);
                console.log('[Script]', message);
                EventBus.emit('script:output', { message });
                return message;

            case 'emit':
                const payload = {};
                for (const [key, val] of Object.entries(statement.payload)) {
                    payload[key] = this._resolveValue(val);
                }
                EventBus.emit(statement.eventName, payload);
                return { event: statement.eventName, payload };

            case 'on':
                const unsubscribe = EventBus.on(statement.eventName, async (eventPayload) => {
                    this.variables.set('event', eventPayload);
                    await this._execute(statement.body);
                });
                this.eventHandlers.push(unsubscribe);
                return { subscribed: statement.eventName };

            case 'if':
                const condition = this._evaluateCondition(statement.condition);
                if (condition) {
                    return await this._execute(statement.thenBody);
                } else if (statement.elseBody.length > 0) {
                    return await this._execute(statement.elseBody);
                }
                return null;

            case 'loop':
                let loopResult = null;
                for (let i = 0; i < statement.count && !this.breakRequested; i++) {
                    this.variables.set('i', i);
                    loopResult = await this._execute(statement.body);
                }
                return loopResult;

            case 'while':
                let whileResult = null;
                while (this._evaluateCondition(statement.condition) && !this.breakRequested) {
                    whileResult = await this._execute(statement.body);
                }
                return whileResult;

            case 'call':
                const func = this.functions.get(statement.funcName);
                if (func) {
                    const args = statement.args.map(a => this._resolveValue(a));
                    return await func(...args);
                }
                throw new Error(`Unknown function: ${statement.funcName}`);

            case 'alert':
                EventBus.emit('dialog:alert', {
                    message: this._resolveValue(statement.message)
                });
                return null;

            case 'notify':
                EventBus.emit('notification:show', {
                    message: this._resolveValue(statement.message)
                });
                return null;

            case 'focus':
                return await CommandBus.execute('window:focus', {
                    windowId: statement.target
                });

            case 'minimize':
                return await CommandBus.execute('window:minimize', {
                    windowId: statement.target
                });

            case 'maximize':
                return await CommandBus.execute('window:maximize', {
                    windowId: statement.target
                });

            case 'play':
                EventBus.emit('sound:play', { type: statement.sound });
                return null;

            case 'write':
                const content = this._resolveValue(statement.content);
                const path = this._resolveValue(statement.path);
                FileSystemManager.writeFile(path, content);
                return { written: path };

            case 'read':
                try {
                    const fileContent = FileSystemManager.readFile(
                        this._resolveValue(statement.path)
                    );
                    this.variables.set(statement.varName, fileContent);
                    return fileContent;
                } catch (e) {
                    this.variables.set(statement.varName, null);
                    return null;
                }

            case 'mkdir':
                FileSystemManager.createDirectory(this._resolveValue(statement.path));
                return { created: statement.path };

            case 'delete':
                try {
                    const deletePath = this._resolveValue(statement.path);
                    const node = FileSystemManager.getNode(deletePath);
                    if (node?.type === 'directory') {
                        FileSystemManager.deleteDirectory(deletePath);
                    } else {
                        FileSystemManager.deleteFile(deletePath);
                    }
                    return { deleted: deletePath };
                } catch (e) {
                    return { error: e.message };
                }

            case 'command':
                // Generic command execution
                return await CommandBus.execute(statement.command, {
                    args: statement.args.map(a => this._resolveValue(a))
                });

            case 'return':
                return this._resolveValue(statement.value);

            case 'break':
                return null;

            default:
                console.warn('[ScriptEngine] Unknown statement type:', statement.type);
                return null;
        }
    }

    /**
     * Resolve a value (handle variables)
     * @private
     */
    _resolveValue(value) {
        if (value === null || value === undefined) return null;

        if (typeof value === 'object' && value.type === 'variable') {
            return this.variables.get(value.name);
        }

        if (typeof value === 'string') {
            // Replace $variables in strings
            return value.replace(/\$(\w+)/g, (match, varName) => {
                const v = this.variables.get(varName);
                return v !== undefined ? String(v) : match;
            });
        }

        return value;
    }

    /**
     * Evaluate a condition
     * @private
     */
    _evaluateCondition(condition) {
        if (condition === null || condition === undefined) return false;

        if (typeof condition === 'boolean') return condition;

        if (typeof condition === 'object') {
            if (condition.type === 'variable') {
                return !!this.variables.get(condition.name);
            }

            if (condition.type === 'comparison') {
                const left = this._resolveValue(condition.left);
                const right = this._resolveValue(condition.right);

                switch (condition.operator) {
                    case '==': return left == right;
                    case '!=': return left != right;
                    case '>': return left > right;
                    case '<': return left < right;
                    case '>=': return left >= right;
                    case '<=': return left <= right;
                    case '&&': return left && right;
                    case '||': return left || right;
                }
            }
        }

        return !!this._resolveValue(condition);
    }

    // ==========================================
    // BUILT-IN FUNCTIONS
    // ==========================================

    _registerBuiltins() {
        // Math functions
        this.defineFunction('random', (min = 0, max = 1) => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        });

        this.defineFunction('abs', Math.abs);
        this.defineFunction('round', Math.round);
        this.defineFunction('floor', Math.floor);
        this.defineFunction('ceil', Math.ceil);

        // String functions
        this.defineFunction('concat', (...args) => args.join(''));
        this.defineFunction('upper', (s) => String(s).toUpperCase());
        this.defineFunction('lower', (s) => String(s).toLowerCase());
        this.defineFunction('length', (s) => String(s).length);

        // Array functions
        this.defineFunction('count', (arr) => Array.isArray(arr) ? arr.length : 0);

        // System functions
        this.defineFunction('getWindows', () => StateManager.getState('windows') || []);
        this.defineFunction('getApps', async () => {
            const AppRegistry = (await import('../apps/AppRegistry.js')).default;
            return AppRegistry.getAll().map(a => ({ id: a.id, name: a.name }));
        });

        // Time functions
        this.defineFunction('now', () => Date.now());
        this.defineFunction('time', () => new Date().toLocaleTimeString());
        this.defineFunction('date', () => new Date().toLocaleDateString());

        // Query helpers
        this.defineFunction('query', async (queryEvent, payload = {}) => {
            return await EventBus.request(`query:${queryEvent}`, payload);
        });

        // Execute helpers
        this.defineFunction('exec', async (command, payload = {}) => {
            return await CommandBus.execute(command, payload);
        });
    }

    /**
     * Cleanup event handlers
     */
    cleanup() {
        for (const unsubscribe of this.eventHandlers) {
            unsubscribe();
        }
        this.eventHandlers = [];
        this.variables.clear();
        this._registerBuiltins();
    }
}

// Create singleton instance
const ScriptEngine = new ScriptEngineClass();

// Add to global debug object
if (typeof window !== 'undefined') {
    window.__RETROS_DEBUG = window.__RETROS_DEBUG || {};
    window.__RETROS_DEBUG.scriptEngine = ScriptEngine;

    // Expose run function globally for console testing
    window.runScript = (script) => ScriptEngine.run(script);
}

export default ScriptEngine;
