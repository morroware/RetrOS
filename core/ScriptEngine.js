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
        this.userFunctions = new Map(); // User-defined functions
        this.eventHandlers = [];
        this.running = false;
        this.currentScript = null;
        this.scriptStack = [];
        this.breakRequested = false;
        this.loopBreakRequested = false;
        this.continueRequested = false; // For continue statement
        this.lastResult = null;
        this.executionTimeout = 30000; // 30 second default timeout
        this.executionStartTime = null;
        this.callStack = []; // Track call stack for better errors

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
     * Set execution timeout
     * @param {number} ms - Timeout in milliseconds (0 = no timeout)
     */
    setTimeout(ms) {
        this.executionTimeout = ms;
    }

    /**
     * Check if execution has timed out
     * @private
     */
    _checkTimeout() {
        if (this.executionTimeout > 0 && this.executionStartTime) {
            if (Date.now() - this.executionStartTime > this.executionTimeout) {
                throw new Error(`Script execution timed out after ${this.executionTimeout}ms`);
            }
        }
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
        this.continueRequested = false;
        this.executionStartTime = Date.now();
        this.callStack = [];

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
            const errorInfo = {
                scriptId,
                error: error.message,
                line: error.line || 0,
                stack: this.callStack.slice()
            };
            EventBus.emit('script:error', errorInfo);
            return { success: false, error: error.message, line: error.line, stack: this.callStack.slice() };
        } finally {
            this.running = false;
            this.executionStartTime = null;
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
        const statements = [];
        const lines = scriptText.split('\n');
        let lineNum = 0;
        let blockBuffer = '';
        let braceDepth = 0;
        let blockStartLine = 0;

        for (let line of lines) {
            lineNum++;
            let trimmedLine = line.trim();

            // Skip empty lines and comments (but not if we're in a block)
            if (braceDepth === 0 && (!trimmedLine || trimmedLine.startsWith('#'))) continue;

            // Remove inline comments (but not inside strings)
            if (!trimmedLine.includes('"') && !trimmedLine.includes("'")) {
                const commentIdx = trimmedLine.indexOf('#');
                if (commentIdx > 0) {
                    trimmedLine = trimmedLine.substring(0, commentIdx).trim();
                }
            }

            // Track if we were already in a block before counting this line's braces
            // This ensures closing braces on their own line are included in the block
            const wasInBlock = braceDepth > 0;

            // Count braces to handle multi-line blocks
            for (const char of trimmedLine) {
                if (char === '{') braceDepth++;
                if (char === '}') braceDepth--;
            }

            // Include line in block if: we're entering a block, still in a block, OR were in a block
            if (braceDepth > 0 || trimmedLine.includes('{') || wasInBlock) {
                if (blockBuffer === '') blockStartLine = lineNum;
                blockBuffer += (blockBuffer ? '\n' : '') + trimmedLine;

                // If we've closed all braces, parse the complete block
                if (braceDepth === 0 && blockBuffer) {
                    try {
                        const statement = this._parseLine(blockBuffer, blockStartLine);
                        if (statement) {
                            statements.push(statement);
                        }
                    } catch (error) {
                        error.line = blockStartLine;
                        throw error;
                    }
                    blockBuffer = '';
                }
            } else if (braceDepth === 0 && trimmedLine) {
                try {
                    const statement = this._parseLine(trimmedLine, lineNum);
                    if (statement) {
                        statements.push(statement);
                    }
                } catch (error) {
                    error.line = lineNum;
                    throw error;
                }
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

        // Skip structural tokens - these are not statements
        if (command === '{' || command === '}') {
            return null;
        }

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
            case 'confirm':
                return this._parseConfirm(parts);
            case 'prompt':
                return this._parsePrompt(parts);
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
            case 'continue':
                return { type: 'continue' };
            case 'foreach':
            case 'for':
                return this._parseForEach(parts, line);
            case 'def':
            case 'func':
            case 'function':
                return this._parseFunction(parts, line);
            case 'try':
                return this._parseTry(parts, line);
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
     * Parse for-each loop: foreach $item in $array { ... }
     * @private
     */
    _parseForEach(parts, line) {
        // foreach $item in $array { statements }
        // for $item in $array { statements }
        const varName = parts[1].replace(/^\$/, '');
        const inIdx = parts.indexOf('in');

        if (inIdx === -1) {
            throw new Error('foreach requires "in" keyword: foreach $item in $array { }');
        }

        const arrayExpr = parts.slice(inIdx + 1).join(' ').replace(/\{.*/, '').trim();

        // Find the body between { and }
        const braceStart = line.indexOf('{');
        const braceEnd = line.lastIndexOf('}');

        let body = [];
        if (braceStart > 0 && braceEnd > braceStart) {
            const bodyText = line.substring(braceStart + 1, braceEnd).trim();
            const bodyLines = bodyText.split(/[\n;]/).map(l => l.trim()).filter(l => l && l !== '}');
            for (const bodyLine of bodyLines) {
                const stmt = this._parseLine(bodyLine, 0);
                if (stmt) body.push(stmt);
            }
        }

        return {
            type: 'foreach',
            varName,
            array: this._parseValue(arrayExpr),
            body
        };
    }

    /**
     * Parse function definition: def funcName($arg1, $arg2) { ... }
     * @private
     */
    _parseFunction(parts, line) {
        // def funcName($arg1, $arg2) { statements }
        const funcName = parts[1];

        // Extract parameters from parentheses
        const params = [];
        const parenStart = line.indexOf('(');
        const parenEnd = line.indexOf(')');

        if (parenStart > 0 && parenEnd > parenStart) {
            const paramStr = line.substring(parenStart + 1, parenEnd);
            if (paramStr.trim()) {
                const paramParts = paramStr.split(',').map(p => p.trim().replace(/^\$/, ''));
                params.push(...paramParts);
            }
        }

        // Find the body between { and }
        const braceStart = line.indexOf('{');
        const braceEnd = line.lastIndexOf('}');

        let body = [];
        if (braceStart > 0 && braceEnd > braceStart) {
            body = this._parse(line.substring(braceStart + 1, braceEnd).trim());
        }

        return {
            type: 'function_def',
            funcName,
            params,
            body
        };
    }

    /**
     * Parse try/catch: try { ... } catch { ... }
     * @private
     */
    _parseTry(parts, line) {
        const catchIdx = line.indexOf('catch');

        // Extract try block
        const tryStart = line.indexOf('{');
        const tryEnd = catchIdx > 0 ? line.lastIndexOf('}', catchIdx) : line.indexOf('}');

        let tryBody = [];
        if (tryStart > 0 && tryEnd > tryStart) {
            tryBody = this._parse(line.substring(tryStart + 1, tryEnd).trim());
        }

        // Extract catch block
        let catchBody = [];
        let errorVar = 'error';

        if (catchIdx > 0) {
            // Check for error variable: catch $err { }
            const catchParts = line.substring(catchIdx + 5).trim();
            const catchVarMatch = catchParts.match(/^\$(\w+)/);
            if (catchVarMatch) {
                errorVar = catchVarMatch[1];
            }

            const catchStart = line.indexOf('{', catchIdx);
            const catchEnd = line.lastIndexOf('}');
            if (catchStart > 0 && catchEnd > catchStart) {
                catchBody = this._parse(line.substring(catchStart + 1, catchEnd).trim());
            }
        }

        return {
            type: 'try',
            tryBody,
            catchBody,
            errorVar
        };
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
        // set $varName = $other + 1
        // set $varName = call funcName args...
        const varName = parts[1].replace(/^\$/, '');
        const eqIdx = parts.indexOf('=');
        const valueParts = parts.slice(eqIdx + 1);
        const valueStr = valueParts.join(' ').trim();

        // Check for function call: set $var = call funcName args...
        if (valueParts[0] === 'call') {
            const funcName = valueParts[1];
            const args = valueParts.slice(2).map(a => this._parseValue(a));
            return {
                type: 'set',
                varName,
                value: { type: 'call', funcName, args }
            };
        }

        // Check for arithmetic expression, but NOT just a negative number
        // Only match if there's an operator with operands on both sides
        // and the left side contains a variable or number (not just text like "call abs")
        // Now supports: + - * / % (modulo)
        const mathMatch = valueStr.match(/^(.+?)\s*([+\-*/%])\s*(.+)$/);
        if (mathMatch) {
            const [, left, op, right] = mathMatch;
            const leftTrimmed = left.trim();
            // Only treat as arithmetic if left side is a variable or ends with a number
            // This prevents "call abs -42" from being parsed as "call abs" - "42"
            if (leftTrimmed.startsWith('$') || /\d$/.test(leftTrimmed)) {
                return {
                    type: 'set',
                    varName,
                    value: {
                        type: 'expression',
                        operator: op,
                        left: this._parseValue(leftTrimmed),
                        right: this._parseValue(right.trim())
                    }
                };
            }
        }

        // Check for array literal: [1, 2, 3]
        if (valueStr.startsWith('[') && valueStr.endsWith(']')) {
            return {
                type: 'set',
                varName,
                value: { type: 'array_literal', content: valueStr }
            };
        }

        // Check for object literal: {key: value}
        if (valueStr.startsWith('{') && valueStr.endsWith('}') && valueStr.includes(':')) {
            return {
                type: 'set',
                varName,
                value: { type: 'object_literal', content: valueStr }
            };
        }

        return { type: 'set', varName, value: this._parseValue(valueStr) };
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

        // Find the body between { and }
        const braceStart = line.indexOf('{');
        const braceEnd = line.lastIndexOf('}');

        let body = [];
        if (braceStart > 0 && braceEnd > braceStart) {
            const bodyText = line.substring(braceStart + 1, braceEnd).trim();
            // Split body by newlines or semicolons
            const bodyLines = bodyText.split(/[\n;]/).map(l => l.trim()).filter(l => l && l !== '}');
            for (const bodyLine of bodyLines) {
                const stmt = this._parseLine(bodyLine, 0);
                if (stmt) body.push(stmt);
            }
        }

        if (isNaN(count)) {
            // While loop
            const whileIdx = parts.indexOf('while');
            const condition = parts.slice(whileIdx + 1).join(' ').replace(/\{.*/, '').trim();
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

    _parseConfirm(parts) {
        // confirm "message" into $variable
        // confirm "message" (stores in $confirmed)
        const message = parts.slice(1).join(' ').replace(/\s+into\s+\$\w+$/, '');
        const intoIdx = parts.indexOf('into');
        const varName = intoIdx > 0 ? parts[intoIdx + 1].replace('$', '') : 'confirmed';
        return { type: 'confirm', message: this._parseValue(message), varName };
    }

    _parsePrompt(parts) {
        // prompt "message" into $variable
        // prompt "message" default "value" into $variable
        const defaultIdx = parts.indexOf('default');
        const intoIdx = parts.indexOf('into');

        let message, defaultValue = '';
        if (defaultIdx > 0) {
            message = parts.slice(1, defaultIdx).join(' ');
            if (intoIdx > 0) {
                defaultValue = parts.slice(defaultIdx + 1, intoIdx).join(' ');
            } else {
                defaultValue = parts.slice(defaultIdx + 1).join(' ');
            }
        } else if (intoIdx > 0) {
            message = parts.slice(1, intoIdx).join(' ');
        } else {
            message = parts.slice(1).join(' ');
        }

        const varName = intoIdx > 0 ? parts[intoIdx + 1].replace('$', '') : 'input';
        return {
            type: 'prompt',
            message: this._parseValue(message),
            defaultValue: this._parseValue(defaultValue),
            varName
        };
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
            if (this.breakRequested || this.loopBreakRequested) break;

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
                const value = await this._resolveValue(statement.value);
                this.variables.set(statement.varName, value);
                return value;

            case 'print':
                const message = await this._resolveValue(statement.message);
                console.log('[Script]', message);
                EventBus.emit('script:output', { message });
                return message;

            case 'emit':
                const payload = {};
                for (const [key, val] of Object.entries(statement.payload)) {
                    payload[key] = await this._resolveValue(val);
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
                const condition = await this._evaluateCondition(statement.condition);
                if (condition) {
                    return await this._execute(statement.thenBody);
                } else if (statement.elseBody.length > 0) {
                    return await this._execute(statement.elseBody);
                }
                return null;

            case 'loop':
                let loopResult = null;
                this.loopBreakRequested = false;
                for (let i = 0; i < statement.count && !this.breakRequested && !this.loopBreakRequested; i++) {
                    this._checkTimeout();
                    this.variables.set('i', i);
                    this.continueRequested = false;

                    for (const stmt of statement.body) {
                        if (this.continueRequested) break;
                        if (this.loopBreakRequested) break;
                        loopResult = await this._executeStatement(stmt);
                    }
                }
                this.loopBreakRequested = false;
                this.continueRequested = false;
                return loopResult;

            case 'while':
                let whileResult = null;
                this.loopBreakRequested = false;
                let whileIterations = 0;
                const maxIterations = 100000; // Prevent infinite loops

                while (await this._evaluateCondition(statement.condition) && !this.breakRequested && !this.loopBreakRequested) {
                    this._checkTimeout();
                    whileIterations++;
                    if (whileIterations > maxIterations) {
                        throw new Error(`While loop exceeded maximum iterations (${maxIterations})`);
                    }

                    this.continueRequested = false;
                    for (const stmt of statement.body) {
                        if (this.continueRequested) break;
                        if (this.loopBreakRequested) break;
                        whileResult = await this._executeStatement(stmt);
                    }
                }
                this.loopBreakRequested = false;
                this.continueRequested = false;
                return whileResult;

            case 'call':
                const func = this.functions.get(statement.funcName);
                if (func) {
                    const args = [];
                    for (const arg of statement.args) {
                        args.push(await this._resolveValue(arg));
                    }
                    return await func(...args);
                }
                throw new Error(`Unknown function: ${statement.funcName}`);

            case 'alert':
                EventBus.emit('dialog:alert', {
                    message: await this._resolveValue(statement.message)
                });
                return null;

            case 'confirm':
                // Use request/response pattern to wait for user response
                try {
                    const confirmResult = await EventBus.request('dialog:confirm', {
                        message: await this._resolveValue(statement.message)
                    }, { timeout: 60000 }); // 60 second timeout for user input
                    const confirmed = confirmResult.confirmed || confirmResult.result || false;
                    this.variables.set(statement.varName, confirmed);
                    return confirmed;
                } catch (e) {
                    // Timeout or error - treat as cancelled
                    this.variables.set(statement.varName, false);
                    return false;
                }

            case 'prompt':
                // Use request/response pattern to wait for user input
                try {
                    const promptResult = await EventBus.request('dialog:prompt', {
                        message: await this._resolveValue(statement.message),
                        defaultValue: (await this._resolveValue(statement.defaultValue)) || ''
                    }, { timeout: 120000 }); // 2 minute timeout for user input
                    const promptValue = promptResult.cancelled ? null : (promptResult.value || '');
                    this.variables.set(statement.varName, promptValue);
                    return promptValue;
                } catch (e) {
                    // Timeout or error - treat as cancelled
                    this.variables.set(statement.varName, null);
                    return null;
                }

            case 'notify':
                EventBus.emit('notification:show', {
                    message: await this._resolveValue(statement.message)
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
                const content = await this._resolveValue(statement.content);
                const writePath = await this._resolveValue(statement.path);
                FileSystemManager.writeFile(writePath, content);
                return { written: writePath };

            case 'read':
                try {
                    const readPath = await this._resolveValue(statement.path);
                    const fileContent = FileSystemManager.readFile(readPath);
                    this.variables.set(statement.varName, fileContent);
                    return fileContent;
                } catch (e) {
                    this.variables.set(statement.varName, null);
                    return null;
                }

            case 'mkdir':
                FileSystemManager.createDirectory(await this._resolveValue(statement.path));
                return { created: statement.path };

            case 'delete':
                try {
                    const deletePath = await this._resolveValue(statement.path);
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
                const cmdArgs = [];
                for (const arg of statement.args) {
                    cmdArgs.push(await this._resolveValue(arg));
                }
                return await CommandBus.execute(statement.command, { args: cmdArgs });

            case 'return':
                return await this._resolveValue(statement.value);

            case 'break':
                this.loopBreakRequested = true;
                return null;

            case 'continue':
                this.continueRequested = true;
                return null;

            case 'foreach':
                // For-each loop over array
                let foreachResult = null;
                this.loopBreakRequested = false;
                const arrayValue = await this._resolveValue(statement.array);

                if (Array.isArray(arrayValue)) {
                    for (let idx = 0; idx < arrayValue.length && !this.breakRequested && !this.loopBreakRequested; idx++) {
                        this._checkTimeout();
                        this.variables.set(statement.varName, arrayValue[idx]);
                        this.variables.set('i', idx);
                        this.continueRequested = false;

                        for (const stmt of statement.body) {
                            if (this.continueRequested) break;
                            if (this.loopBreakRequested) break;
                            foreachResult = await this._executeStatement(stmt);
                        }
                    }
                }
                this.loopBreakRequested = false;
                this.continueRequested = false;
                return foreachResult;

            case 'function_def':
                // Register user-defined function
                this.userFunctions.set(statement.funcName, {
                    params: statement.params,
                    body: statement.body
                });
                // Also register as a callable function
                this.functions.set(statement.funcName, async (...args) => {
                    return await this._callUserFunction(statement.funcName, args);
                });
                return { defined: statement.funcName };

            case 'try':
                // Try/catch error handling
                try {
                    return await this._execute(statement.tryBody);
                } catch (error) {
                    this.variables.set(statement.errorVar, error.message);
                    return await this._execute(statement.catchBody);
                }

            default:
                console.warn('[ScriptEngine] Unknown statement type:', statement.type);
                return null;
        }
    }

    /**
     * Call a user-defined function
     * @private
     */
    async _callUserFunction(funcName, args) {
        const func = this.userFunctions.get(funcName);
        if (!func) {
            throw new Error(`Unknown function: ${funcName}`);
        }

        // Save current variables (for scope)
        const savedVars = new Map(this.variables);

        // Set parameters as local variables
        for (let i = 0; i < func.params.length; i++) {
            this.variables.set(func.params[i], args[i] !== undefined ? args[i] : null);
        }

        // Track call stack
        this.callStack.push(funcName);

        try {
            const result = await this._execute(func.body);
            return result;
        } finally {
            // Restore variables (basic scoping)
            this.variables = savedVars;
            this.callStack.pop();
        }
    }

    /**
     * Parse array literal: [1, 2, 3] or ["a", "b", "c"]
     * @private
     */
    _parseArrayLiteral(content) {
        const inner = content.slice(1, -1).trim();
        if (!inner) return [];

        const items = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        let depth = 0;

        for (let i = 0; i < inner.length; i++) {
            const char = inner[i];

            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
                current += char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                current += char;
            } else if (char === '[' || char === '{') {
                depth++;
                current += char;
            } else if (char === ']' || char === '}') {
                depth--;
                current += char;
            } else if (char === ',' && !inQuotes && depth === 0) {
                const trimmed = current.trim();
                if (trimmed) items.push(this._parseValue(trimmed));
                current = '';
            } else {
                current += char;
            }
        }

        const trimmed = current.trim();
        if (trimmed) items.push(this._parseValue(trimmed));

        // Resolve any variable references
        return items.map(item => {
            if (typeof item === 'object' && item?.type === 'variable') {
                return this.variables.get(item.name);
            }
            return item;
        });
    }

    /**
     * Parse object literal: {key: value, key2: value2}
     * @private
     */
    _parseObjectLiteral(content) {
        const inner = content.slice(1, -1).trim();
        if (!inner) return {};

        const obj = {};
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        let depth = 0;

        const pairs = [];

        for (let i = 0; i < inner.length; i++) {
            const char = inner[i];

            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
                current += char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                current += char;
            } else if (char === '[' || char === '{') {
                depth++;
                current += char;
            } else if (char === ']' || char === '}') {
                depth--;
                current += char;
            } else if (char === ',' && !inQuotes && depth === 0) {
                pairs.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        if (current.trim()) pairs.push(current.trim());

        for (const pair of pairs) {
            const colonIdx = pair.indexOf(':');
            if (colonIdx > 0) {
                let key = pair.substring(0, colonIdx).trim();
                const value = pair.substring(colonIdx + 1).trim();

                // Remove quotes from key if present
                if ((key.startsWith('"') && key.endsWith('"')) ||
                    (key.startsWith("'") && key.endsWith("'"))) {
                    key = key.slice(1, -1);
                }

                let parsedValue = this._parseValue(value);
                if (typeof parsedValue === 'object' && parsedValue?.type === 'variable') {
                    parsedValue = this.variables.get(parsedValue.name);
                }
                obj[key] = parsedValue;
            }
        }

        return obj;
    }

    /**
     * Resolve a value (handle variables, expressions, and function calls)
     * @private
     */
    async _resolveValue(value) {
        if (value === null || value === undefined) return null;

        if (typeof value === 'object') {
            if (value.type === 'variable') {
                return this.variables.get(value.name);
            }

            if (value.type === 'call') {
                // Execute function call and return result
                const func = this.functions.get(value.funcName);
                if (func) {
                    const args = [];
                    for (const arg of value.args) {
                        args.push(await this._resolveValue(arg));
                    }
                    return await func(...args);
                }
                throw new Error(`Unknown function: ${value.funcName}`);
            }

            if (value.type === 'expression') {
                const left = await this._resolveValue(value.left);
                const right = await this._resolveValue(value.right);

                // Handle string concatenation with +
                if (value.operator === '+' && (typeof left === 'string' || typeof right === 'string')) {
                    return String(left) + String(right);
                }

                const numLeft = typeof left === 'number' ? left : parseFloat(left) || 0;
                const numRight = typeof right === 'number' ? right : parseFloat(right) || 0;

                switch (value.operator) {
                    case '+': return numLeft + numRight;
                    case '-': return numLeft - numRight;
                    case '*': return numLeft * numRight;
                    case '/': return numRight !== 0 ? numLeft / numRight : 0;
                    case '%': return numRight !== 0 ? numLeft % numRight : 0;
                    default: return numLeft;
                }
            }

            // Array literal: [1, 2, 3]
            if (value.type === 'array_literal') {
                return this._parseArrayLiteral(value.content);
            }

            // Object literal: {key: value}
            if (value.type === 'object_literal') {
                return this._parseObjectLiteral(value.content);
            }
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
    async _evaluateCondition(condition) {
        if (condition === null || condition === undefined) return false;

        if (typeof condition === 'boolean') return condition;

        if (typeof condition === 'object') {
            if (condition.type === 'variable') {
                return !!this.variables.get(condition.name);
            }

            if (condition.type === 'comparison') {
                const left = await this._resolveValue(condition.left);
                const right = await this._resolveValue(condition.right);

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

        return !!(await this._resolveValue(condition));
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
        this.defineFunction('min', (...args) => Math.min(...args.flat()));
        this.defineFunction('max', (...args) => Math.max(...args.flat()));
        this.defineFunction('pow', (base, exp) => Math.pow(base, exp));
        this.defineFunction('sqrt', Math.sqrt);
        this.defineFunction('sin', Math.sin);
        this.defineFunction('cos', Math.cos);
        this.defineFunction('tan', Math.tan);
        this.defineFunction('log', Math.log);
        this.defineFunction('exp', Math.exp);
        this.defineFunction('clamp', (val, min, max) => Math.min(Math.max(val, min), max));
        this.defineFunction('mod', (a, b) => b !== 0 ? a % b : 0);
        this.defineFunction('sign', Math.sign);
        this.defineFunction('PI', () => Math.PI);
        this.defineFunction('E', () => Math.E);

        // String functions
        this.defineFunction('concat', (...args) => args.join(''));
        this.defineFunction('upper', (s) => String(s).toUpperCase());
        this.defineFunction('lower', (s) => String(s).toLowerCase());
        this.defineFunction('length', (s) => {
            if (Array.isArray(s)) return s.length;
            return String(s).length;
        });
        this.defineFunction('trim', (s) => String(s).trim());
        this.defineFunction('trimStart', (s) => String(s).trimStart());
        this.defineFunction('trimEnd', (s) => String(s).trimEnd());
        this.defineFunction('split', (s, sep = ' ') => String(s).split(sep));
        this.defineFunction('join', (arr, sep = '') => Array.isArray(arr) ? arr.join(sep) : String(arr));
        this.defineFunction('substr', (s, start, len) => String(s).substring(start, len !== undefined ? start + len : undefined));
        this.defineFunction('substring', (s, start, end) => String(s).substring(start, end));
        this.defineFunction('replace', (s, search, replace) => String(s).replace(search, replace));
        this.defineFunction('replaceAll', (s, search, replace) => String(s).split(search).join(replace));
        this.defineFunction('contains', (s, search) => String(s).includes(search));
        this.defineFunction('startsWith', (s, search) => String(s).startsWith(search));
        this.defineFunction('endsWith', (s, search) => String(s).endsWith(search));
        this.defineFunction('padStart', (s, len, char = ' ') => String(s).padStart(len, char));
        this.defineFunction('padEnd', (s, len, char = ' ') => String(s).padEnd(len, char));
        this.defineFunction('repeat', (s, count) => String(s).repeat(count));
        this.defineFunction('charAt', (s, idx) => String(s).charAt(idx));
        this.defineFunction('charCode', (s, idx = 0) => String(s).charCodeAt(idx));
        this.defineFunction('fromCharCode', (...codes) => String.fromCharCode(...codes));
        this.defineFunction('indexOf', (s, search, start = 0) => {
            if (Array.isArray(s)) return s.indexOf(search, start);
            return String(s).indexOf(search, start);
        });
        this.defineFunction('lastIndexOf', (s, search) => {
            if (Array.isArray(s)) return s.lastIndexOf(search);
            return String(s).lastIndexOf(search);
        });
        this.defineFunction('match', (s, pattern) => {
            const matches = String(s).match(new RegExp(pattern, 'g'));
            return matches || [];
        });

        // Array functions
        this.defineFunction('count', (arr) => Array.isArray(arr) ? arr.length : (typeof arr === 'object' && arr ? Object.keys(arr).length : 0));
        this.defineFunction('first', (arr) => Array.isArray(arr) ? arr[0] : null);
        this.defineFunction('last', (arr) => Array.isArray(arr) ? arr[arr.length - 1] : null);
        this.defineFunction('push', (arr, item) => { if (Array.isArray(arr)) arr.push(item); return arr; });
        this.defineFunction('pop', (arr) => Array.isArray(arr) ? arr.pop() : null);
        this.defineFunction('shift', (arr) => Array.isArray(arr) ? arr.shift() : null);
        this.defineFunction('unshift', (arr, item) => { if (Array.isArray(arr)) arr.unshift(item); return arr; });
        this.defineFunction('includes', (arr, item) => Array.isArray(arr) ? arr.includes(item) : false);
        this.defineFunction('sort', (arr, desc = false) => {
            if (!Array.isArray(arr)) return arr;
            const sorted = [...arr].sort((a, b) => {
                if (typeof a === 'string') return a.localeCompare(b);
                return a - b;
            });
            return desc ? sorted.reverse() : sorted;
        });
        this.defineFunction('reverse', (arr) => Array.isArray(arr) ? [...arr].reverse() : arr);
        this.defineFunction('slice', (arr, start, end) => {
            if (Array.isArray(arr)) return arr.slice(start, end);
            return String(arr).slice(start, end);
        });
        this.defineFunction('splice', (arr, start, deleteCount, ...items) => {
            if (!Array.isArray(arr)) return arr;
            const result = [...arr];
            result.splice(start, deleteCount, ...items);
            return result;
        });
        this.defineFunction('concat_arrays', (...arrays) => {
            return arrays.flat();
        });
        this.defineFunction('unique', (arr) => Array.isArray(arr) ? [...new Set(arr)] : arr);
        this.defineFunction('flatten', (arr, depth = 1) => Array.isArray(arr) ? arr.flat(depth) : arr);
        this.defineFunction('range', (start, end, step = 1) => {
            const result = [];
            if (step > 0) {
                for (let i = start; i < end; i += step) result.push(i);
            } else if (step < 0) {
                for (let i = start; i > end; i += step) result.push(i);
            }
            return result;
        });
        this.defineFunction('fill', (length, value) => Array(length).fill(value));
        this.defineFunction('at', (arr, idx) => {
            if (Array.isArray(arr)) return arr.at(idx);
            return String(arr).at(idx);
        });

        // Object functions
        this.defineFunction('keys', (obj) => {
            if (typeof obj === 'object' && obj) return Object.keys(obj);
            return [];
        });
        this.defineFunction('values', (obj) => {
            if (typeof obj === 'object' && obj) return Object.values(obj);
            return [];
        });
        this.defineFunction('entries', (obj) => {
            if (typeof obj === 'object' && obj) return Object.entries(obj);
            return [];
        });
        this.defineFunction('get', (obj, key, defaultVal = null) => {
            if (Array.isArray(obj)) return obj[key] !== undefined ? obj[key] : defaultVal;
            if (typeof obj === 'object' && obj) return obj[key] !== undefined ? obj[key] : defaultVal;
            return defaultVal;
        });
        this.defineFunction('set', (obj, key, value) => {
            if (typeof obj === 'object' && obj) {
                obj[key] = value;
            }
            return obj;
        });
        this.defineFunction('has', (obj, key) => {
            if (Array.isArray(obj)) return key >= 0 && key < obj.length;
            if (typeof obj === 'object' && obj) return key in obj;
            return false;
        });
        this.defineFunction('merge', (...objs) => Object.assign({}, ...objs));
        this.defineFunction('clone', (obj) => JSON.parse(JSON.stringify(obj)));

        // JSON functions
        this.defineFunction('toJSON', (obj) => JSON.stringify(obj));
        this.defineFunction('fromJSON', (str) => {
            try { return JSON.parse(str); } catch { return null; }
        });
        this.defineFunction('prettyJSON', (obj, indent = 2) => JSON.stringify(obj, null, indent));

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

        // Dialog helpers (async - use with await in scripts)
        this.defineFunction('alert', async (message, title = 'Alert', icon = 'info') => {
            EventBus.emit('dialog:alert', { message, title, icon });
            return true;
        });

        this.defineFunction('confirm', async (message, title = 'Confirm') => {
            try {
                const result = await EventBus.request('dialog:confirm', { message, title }, { timeout: 60000 });
                return result.confirmed || result.result || false;
            } catch (e) {
                return false;
            }
        });

        this.defineFunction('prompt', async (message, defaultValue = '', title = 'Input') => {
            try {
                const result = await EventBus.request('dialog:prompt', { message, title, defaultValue }, { timeout: 120000 });
                return result.cancelled ? null : (result.value || '');
            } catch (e) {
                return null;
            }
        });

        // Utility functions
        this.defineFunction('typeof', (val) => {
            if (val === null) return 'null';
            if (Array.isArray(val)) return 'array';
            return typeof val;
        });
        this.defineFunction('isNumber', (val) => typeof val === 'number' && !isNaN(val));
        this.defineFunction('isString', (val) => typeof val === 'string');
        this.defineFunction('isArray', (val) => Array.isArray(val));
        this.defineFunction('isObject', (val) => typeof val === 'object' && val !== null && !Array.isArray(val));
        this.defineFunction('isBoolean', (val) => typeof val === 'boolean');
        this.defineFunction('isNull', (val) => val === null || val === undefined);
        this.defineFunction('isEmpty', (val) => {
            if (val === null || val === undefined) return true;
            if (typeof val === 'string') return val.length === 0;
            if (Array.isArray(val)) return val.length === 0;
            if (typeof val === 'object') return Object.keys(val).length === 0;
            return false;
        });
        this.defineFunction('toNumber', (val) => parseFloat(val) || 0);
        this.defineFunction('toInt', (val) => parseInt(val, 10) || 0);
        this.defineFunction('toString', (val) => String(val));
        this.defineFunction('toBoolean', (val) => Boolean(val));
        this.defineFunction('toArray', (val) => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') return val.split('');
            return [val];
        });

        // Date/Time functions (extended)
        this.defineFunction('year', () => new Date().getFullYear());
        this.defineFunction('month', () => new Date().getMonth() + 1);
        this.defineFunction('day', () => new Date().getDate());
        this.defineFunction('weekday', () => new Date().getDay());
        this.defineFunction('hour', () => new Date().getHours());
        this.defineFunction('minute', () => new Date().getMinutes());
        this.defineFunction('second', () => new Date().getSeconds());
        this.defineFunction('formatDate', (timestamp, format = 'short') => {
            const d = new Date(timestamp);
            if (format === 'iso') return d.toISOString();
            if (format === 'long') return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            return d.toLocaleDateString();
        });
        this.defineFunction('formatTime', (timestamp, format = 'short') => {
            const d = new Date(timestamp);
            if (format === 'long') return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            return d.toLocaleTimeString();
        });
        this.defineFunction('elapsed', (startMs) => Date.now() - startMs);

        // Debugging/output helpers
        this.defineFunction('debug', (...args) => {
            const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
            console.log('[Script Debug]', msg);
            EventBus.emit('script:output', { message: `[DEBUG] ${msg}`, type: 'debug' });
            return msg;
        });
        this.defineFunction('inspect', (val) => {
            const result = JSON.stringify(val, null, 2);
            console.log('[Script Inspect]', result);
            EventBus.emit('script:output', { message: result, type: 'inspect' });
            return result;
        });
        this.defineFunction('assert', (condition, message = 'Assertion failed') => {
            if (!condition) {
                throw new Error(message);
            }
            return true;
        });

        // Environment info
        this.defineFunction('getEnv', (key) => {
            const env = {
                platform: 'RetrOS',
                version: '1.0',
                scriptEngine: 'RetroScript',
                timeout: this.executionTimeout
            };
            return key ? env[key] : env;
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
        this.userFunctions.clear();
        this.callStack = [];
        this.breakRequested = false;
        this.loopBreakRequested = false;
        this.continueRequested = false;
        this._registerBuiltins();
    }

    /**
     * Get script engine statistics
     */
    getStats() {
        return {
            variableCount: this.variables.size,
            functionCount: this.functions.size,
            userFunctionCount: this.userFunctions.size,
            eventHandlerCount: this.eventHandlers.length,
            running: this.running,
            timeout: this.executionTimeout
        };
    }

    /**
     * List all available functions
     */
    listFunctions() {
        return {
            builtin: [...this.functions.keys()].filter(name => !this.userFunctions.has(name)),
            userDefined: [...this.userFunctions.keys()]
        };
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
