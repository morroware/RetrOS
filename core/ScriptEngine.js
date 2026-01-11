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

/**
 * Environment - Lexical scope chain for variables
 * Proper scoping instead of Map copy/restore hack
 */
class Environment {
    constructor(parent = null) {
        this.parent = parent;
        this.vars = new Map();
    }

    /**
     * Get variable value from current or parent scope
     * Supports dot notation for nested properties (e.g., 'event.appId')
     */
    get(name) {
        // Handle dot notation for nested property access
        if (name.includes('.')) {
            const parts = name.split('.');
            const rootName = parts[0];
            let value = this.vars.has(rootName) ? this.vars.get(rootName) :
                        (this.parent ? this.parent.get(rootName) : undefined);

            // Traverse the property path
            for (let i = 1; i < parts.length && value != null; i++) {
                value = value[parts[i]];
            }
            return value;
        }

        if (this.vars.has(name)) {
            return this.vars.get(name);
        }
        if (this.parent) {
            return this.parent.get(name);
        }
        return undefined; // Return undefined instead of throwing for compatibility
    }

    /**
     * Set variable in current scope
     */
    set(name, value) {
        this.vars.set(name, value);
    }

    /**
     * Update variable in nearest scope that has it, or create in current scope
     */
    update(name, value) {
        if (this.vars.has(name)) {
            this.vars.set(name, value);
        } else if (this.parent && this.parent.has(name)) {
            this.parent.update(name, value);
        } else {
            // Variable doesn't exist anywhere, create in current scope
            this.vars.set(name, value);
        }
    }

    /**
     * Check if variable exists in current or parent scope
     */
    has(name) {
        return this.vars.has(name) || (this.parent ? this.parent.has(name) : false);
    }

    /**
     * Create child environment
     */
    extend() {
        return new Environment(this);
    }

    /**
     * Get all variables in current scope (for debugging)
     */
    getAllVars() {
        const vars = {};
        for (const [key, value] of this.vars) {
            vars[key] = value;
        }
        if (this.parent) {
            Object.assign(vars, this.parent.getAllVars());
        }
        return vars;
    }
}

class ScriptEngineClass {
    constructor() {
        // Safety limits to prevent resource exhaustion
        this.LIMITS = {
            MAX_RECURSION_DEPTH: 1000,
            MAX_LOOP_ITERATIONS: 100000,
            MAX_STRING_LENGTH: 1000000, // 1MB
            MAX_ARRAY_LENGTH: 100000,
            MAX_OBJECT_KEYS: 10000,
            MAX_EVENT_HANDLERS: 1000,
            DEFAULT_EXECUTION_TIMEOUT: 30000 // 30 seconds
        };

        this.globalEnv = new Environment(); // Use Environment instead of Map
        this.functions = new Map();
        this.userFunctions = new Map(); // User-defined functions
        this.eventHandlers = [];
        this.running = false;
        this.currentScript = null;
        this.scriptStack = [];
        this.breakRequested = false;
        this.loopBreakRequested = false;
        this.continueRequested = false; // For continue statement
        this.returnRequested = false; // For return statement propagation
        this.returnValue = null; // Value from return statement
        this.lastResult = null;
        this.executionTimeout = this.LIMITS.DEFAULT_EXECUTION_TIMEOUT;
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
        this.globalEnv.set('TRUE', true);
        this.globalEnv.set('FALSE', false);
        this.globalEnv.set('NULL', null);

        console.log('[ScriptEngine] Initialized');
    }

    /**
     * Legacy compatibility - keep variables property for backward compatibility
     */
    get variables() {
        // Return a Map-like object that delegates to globalEnv
        return {
            get: (name) => this.globalEnv.get(name),
            set: (name, value) => this.globalEnv.set(name, value),
            has: (name) => this.globalEnv.has(name),
            clear: () => { this.globalEnv = new Environment(); }
        };
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
        // Input validation
        if (!scriptText || typeof scriptText !== 'string') {
            return { success: false, error: 'Invalid script: script must be a non-empty string' };
        }

        const scriptId = `script_${Date.now()}`;
        this.running = true;
        this.breakRequested = false;
        this.continueRequested = false;
        this.returnRequested = false;
        this.returnValue = null;
        this.executionStartTime = Date.now();
        this.callStack = [];

        // Merge context variables into global environment
        try {
            for (const [key, value] of Object.entries(context)) {
                this.globalEnv.set(key, value);
            }
        } catch (error) {
            return { success: false, error: `Invalid context: ${error.message}` };
        }

        EventBus.emit('script:execute', { scriptId, source: 'inline' });

        try {
            // Parse script with error recovery
            let statements;
            try {
                statements = this._parse(scriptText);
            } catch (parseError) {
                // Add helpful context to parse errors
                const errorMsg = `Syntax error: ${parseError.message}`;
                const errorInfo = {
                    scriptId,
                    error: errorMsg,
                    line: parseError.line || 0,
                    stack: [],
                    type: 'parse'
                };
                EventBus.emit('script:error', errorInfo);
                return { success: false, error: errorMsg, line: parseError.line || 0, type: 'parse' };
            }

            // Execute statements
            const result = await this._execute(statements, this.globalEnv);

            EventBus.emit('script:complete', { scriptId, result });
            this.lastResult = result;
            return { success: true, result };
        } catch (error) {
            console.error('[ScriptEngine] Execution error:', error);
            const errorInfo = {
                scriptId,
                error: error.message,
                line: error.line || 0,
                stack: this.callStack.slice(),
                type: 'runtime'
            };
            EventBus.emit('script:error', errorInfo);
            return {
                success: false,
                error: error.message,
                line: error.line,
                stack: this.callStack.slice(),
                type: 'runtime'
            };
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
            trimmedLine = this._removeInlineComment(trimmedLine);

            // Track if we were already in a block before counting this line's braces
            // This ensures closing braces on their own line are included in the block
            const wasInBlock = braceDepth > 0;

            // Count braces to handle multi-line blocks (skip braces inside strings)
            let inQuote = false;
            let quoteType = '';
            for (let ci = 0; ci < trimmedLine.length; ci++) {
                const char = trimmedLine[ci];
                const prevChar = ci > 0 ? trimmedLine[ci - 1] : '';
                if ((char === '"' || char === "'") && prevChar !== '\\') {
                    if (!inQuote) {
                        inQuote = true;
                        quoteType = char;
                    } else if (char === quoteType) {
                        inQuote = false;
                        quoteType = '';
                    }
                } else if (!inQuote) {
                    if (char === '{') braceDepth++;
                    if (char === '}') braceDepth--;
                }
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
        // Split by semicolons for multiple statements per line (respecting quoted strings)
        const subStatements = this._splitBySemicolon(line);
        if (subStatements.length > 1) {
            return {
                type: 'block',
                statements: subStatements.map(s => this._parseLine(s, lineNum))
            };
        }
        if (subStatements.length === 1) {
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
                // Parse full expression after 'return' (handles 'return call funcName' etc.)
                const returnExpr = parts.slice(1).join(' ');
                return { type: 'return', value: returnExpr ? this._parseArithmeticExpression(returnExpr) : null };
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
                return { type: 'mkdir', path: this._parseValue(parts[1]) };
            case 'delete':
            case 'rm':
                return { type: 'delete', path: this._parseValue(parts[1]) };
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
                // Check if it's a variable assignment (but not comparison operators)
                // Look for a single '=' that's not part of '==', '!=', '<=', '>='
                if (this._isAssignment(line)) {
                    return this._parseAssignment(line);
                }
                // Treat as a command
                return { type: 'command', command, args: parts.slice(1) };
        }
    }

    /**
     * Check if a line is an assignment (not a comparison)
     * @private
     */
    _isAssignment(line) {
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const prevChar = i > 0 ? line[i - 1] : '';
            const nextChar = i < line.length - 1 ? line[i + 1] : '';

            if (char === '=') {
                // Skip if part of ==, !=, <=, >=
                if (prevChar === '=' || prevChar === '!' || prevChar === '<' || prevChar === '>') continue;
                if (nextChar === '=') continue;
                return true;
            }
        }
        return false;
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
            body = this._parseBody(bodyText);
        }

        return {
            type: 'foreach',
            varName,
            array: this._parseValue(arrayExpr),
            body
        };
    }

    /**
     * Parse a body of statements (respects strings and nested blocks)
     * @private
     */
    _parseBody(bodyText) {
        const statements = [];
        const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l);

        let blockBuffer = '';
        let braceDepth = 0;

        for (const line of lines) {
            // Skip empty lines and comments when not in a block
            if (braceDepth === 0 && (!line || line.startsWith('#'))) continue;

            // Track if we were already in a block
            const wasInBlock = braceDepth > 0;

            // Count braces in this line (skip braces inside strings)
            let inQuote = false;
            let quoteType = '';
            for (let ci = 0; ci < line.length; ci++) {
                const char = line[ci];
                const prevChar = ci > 0 ? line[ci - 1] : '';
                if ((char === '"' || char === "'") && prevChar !== '\\') {
                    if (!inQuote) {
                        inQuote = true;
                        quoteType = char;
                    } else if (char === quoteType) {
                        inQuote = false;
                        quoteType = '';
                    }
                } else if (!inQuote) {
                    if (char === '{') braceDepth++;
                    if (char === '}') braceDepth--;
                }
            }

            // Accumulate lines that are part of a block
            if (braceDepth > 0 || line.includes('{') || wasInBlock) {
                blockBuffer += (blockBuffer ? '\n' : '') + line;

                // If we've closed all braces, parse the complete block
                if (braceDepth === 0 && blockBuffer) {
                    const subStatements = this._splitBySemicolon(blockBuffer);
                    for (const subStmt of subStatements) {
                        const stmt = this._parseLine(subStmt, 0);
                        if (stmt) statements.push(stmt);
                    }
                    blockBuffer = '';
                }
            } else if (line && line !== '}') {
                // Regular line - parse it
                const subStatements = this._splitBySemicolon(line);
                for (const subStmt of subStatements) {
                    const stmt = this._parseLine(subStmt, 0);
                    if (stmt) statements.push(stmt);
                }
            }
        }

        // Handle any remaining buffer (shouldn't happen with well-formed code)
        if (blockBuffer) {
            const subStatements = this._splitBySemicolon(blockBuffer);
            for (const subStmt of subStatements) {
                const stmt = this._parseLine(subStmt, 0);
                if (stmt) statements.push(stmt);
            }
        }

        return statements;
    }

    /**
     * Parse function definition: def funcName($arg1, $arg2) { ... }
     * @private
     */
    _parseFunction(parts, line) {
        // def funcName($arg1, $arg2) { statements }
        // Handle case where funcName() has no space before parentheses
        let funcName = parts[1];

        // Strip parentheses and anything after from function name
        const parenIdx = funcName.indexOf('(');
        if (parenIdx !== -1) {
            funcName = funcName.substring(0, parenIdx);
        }

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
     * Remove inline comment from a line (respecting quoted strings)
     * @private
     */
    _removeInlineComment(line) {
        let inQuotes = false;
        let quoteChar = '';

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar && inQuotes && line[i - 1] !== '\\') {
                inQuotes = false;
                quoteChar = '';
            } else if (char === '#' && !inQuotes) {
                return line.substring(0, i).trim();
            }
        }

        return line;
    }

    /**
     * Split line by semicolons (respecting quoted strings)
     * @private
     */
    _splitBySemicolon(line) {
        const parts = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        let braceDepth = 0;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
                current += char;
            } else if (char === quoteChar && inQuotes && line[i - 1] !== '\\') {
                inQuotes = false;
                quoteChar = '';
                current += char;
            } else if (char === '{' && !inQuotes) {
                braceDepth++;
                current += char;
            } else if (char === '}' && !inQuotes) {
                braceDepth--;
                current += char;
            } else if (char === ';' && !inQuotes && braceDepth === 0) {
                const trimmed = current.trim();
                if (trimmed) parts.push(trimmed);
                current = '';
            } else {
                current += char;
            }
        }

        const trimmed = current.trim();
        if (trimmed) parts.push(trimmed);

        return parts;
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
            const prevChar = i > 0 ? line[i - 1] : '';

            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
                current += char;
            } else if (char === quoteChar && inQuotes && prevChar !== '\\') {
                inQuotes = false;
                current += char;
                quoteChar = '';
            } else if ((char === ' ' || char === '\n' || char === '\t' || char === '\r') && !inQuotes) {
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

    /**
     * Combine tokens that form array or object literals (split by spaces)
     * e.g., ['[1,', '2,', '3]'] -> ['[1, 2, 3]']
     * @private
     */
    _combineArrayObjectTokens(tokens) {
        const result = [];
        let combining = '';
        let bracketDepth = 0;
        let braceDepth = 0;

        for (const token of tokens) {
            // Count brackets and braces in this token
            for (const char of token) {
                if (char === '[') bracketDepth++;
                else if (char === ']') bracketDepth--;
                else if (char === '{') braceDepth++;
                else if (char === '}') braceDepth--;
            }

            if (combining) {
                // We're in the middle of an array/object literal
                combining += ' ' + token;
                if (bracketDepth === 0 && braceDepth === 0) {
                    // Finished the literal
                    result.push(combining);
                    combining = '';
                }
            } else if (bracketDepth > 0 || braceDepth > 0) {
                // Starting a new array/object literal
                combining = token;
            } else {
                // Regular token
                result.push(token);
            }
        }

        // If we still have an unclosed literal, add it anyway
        if (combining) {
            result.push(combining);
        }

        return result;
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

        // Use the new expression parser which handles all cases properly
        return { type: 'set', varName, value: this._parseArithmeticExpression(valueStr) };
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

        console.log(`[ScriptEngine._parseOn] eventName: ${eventName}`);
        console.log(`[ScriptEngine._parseOn] braceStart: ${braceStart}, braceEnd: ${braceEnd}`);
        console.log(`[ScriptEngine._parseOn] line length: ${line.length}`);

        if (braceStart > 0 && braceEnd > braceStart) {
            const body = line.substring(braceStart + 1, braceEnd).trim();
            console.log(`[ScriptEngine._parseOn] body length: ${body.length}`);
            console.log(`[ScriptEngine._parseOn] body preview: ${body.substring(0, 100)}...`);
            const parsedBody = this._parse(body);
            console.log(`[ScriptEngine._parseOn] parsedBody statements: ${parsedBody.length}`);
            return {
                type: 'on',
                eventName,
                body: parsedBody
            };
        }

        console.log(`[ScriptEngine._parseOn] WARNING: No body found for event handler!`);
        return { type: 'on', eventName, body: [] };
    }

    _parseIf(parts, line) {
        // if condition then { statements } else { statements }
        const thenIdx = line.indexOf('then');

        let condition = line.substring(2, thenIdx > 0 ? thenIdx : line.indexOf('{')).trim();
        condition = this._parseCondition(condition);

        // Find the matching braces for then block
        const thenStart = line.indexOf('{');
        let braceCount = 0;
        let thenEnd = -1;
        let inQuotes = false;
        let quoteChar = '';

        // Only search if we found an opening brace
        if (thenStart >= 0) {
            for (let i = thenStart; i < line.length; i++) {
                const char = line[i];
                if ((char === '"' || char === "'") && !inQuotes) {
                    inQuotes = true;
                    quoteChar = char;
                } else if (char === quoteChar && inQuotes && line[i - 1] !== '\\') {
                    inQuotes = false;
                    quoteChar = '';
                } else if (!inQuotes) {
                    if (char === '{') braceCount++;
                    else if (char === '}') {
                        braceCount--;
                        if (braceCount === 0) {
                            thenEnd = i;
                            break;
                        }
                    }
                }
            }
        }

        let thenBody = [];
        let elseBody = [];

        if (thenStart >= 0 && thenEnd > thenStart) {
            thenBody = this._parse(line.substring(thenStart + 1, thenEnd).trim());
        }

        // Look for 'else' after the then block's closing brace
        const afterThen = thenEnd > 0 ? line.substring(thenEnd + 1).trim() : '';
        if (afterThen.startsWith('else')) {
            const elseStart = line.indexOf('{', thenEnd);
            // Only search if we found an opening brace
            if (elseStart >= 0) {
                // Find matching brace for else block
                braceCount = 0;
                let elseEnd = -1;
                inQuotes = false;
                quoteChar = '';

                for (let i = elseStart; i < line.length; i++) {
                    const char = line[i];
                    if ((char === '"' || char === "'") && !inQuotes) {
                        inQuotes = true;
                        quoteChar = char;
                    } else if (char === quoteChar && inQuotes && line[i - 1] !== '\\') {
                        inQuotes = false;
                        quoteChar = '';
                    } else if (!inQuotes) {
                        if (char === '{') braceCount++;
                        else if (char === '}') {
                            braceCount--;
                            if (braceCount === 0) {
                                elseEnd = i;
                                break;
                            }
                        }
                    }
                }

                if (elseEnd > elseStart) {
                    elseBody = this._parse(line.substring(elseStart + 1, elseEnd).trim());
                }
            }
        }

        return { type: 'if', condition, thenBody, elseBody };
    }

    _parseLoop(parts, line) {
        // loop 5 { statements }
        // loop $count { statements }
        // loop while condition { statements }

        // Find the body between { and }
        const braceStart = line.indexOf('{');
        const braceEnd = line.lastIndexOf('}');

        let body = [];
        if (braceStart > 0 && braceEnd > braceStart) {
            const bodyText = line.substring(braceStart + 1, braceEnd).trim();
            body = this._parseBody(bodyText);
        }

        // Check for explicit "while" keyword first
        const whileIdx = parts.indexOf('while');
        if (whileIdx !== -1) {
            // While loop: loop while condition { statements }
            const condition = parts.slice(whileIdx + 1).join(' ').replace(/\{.*/, '').trim();
            return { type: 'while', condition: this._parseCondition(condition), body };
        }

        // Parse the count - can be a number or variable
        const countToken = parts[1];
        const numericCount = parseInt(countToken);

        if (!isNaN(numericCount)) {
            // Literal number: loop 5 { ... }
            return { type: 'loop', count: numericCount, body };
        }

        // Variable or expression: loop $count { ... }
        // Parse it as a value to be resolved at runtime
        return { type: 'loop', count: this._parseValue(countToken), body };
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
        return { type: 'set', varName, value: this._parseArithmeticExpression(value) };
    }

    /**
     * Parse arithmetic expression with proper operator precedence
     * @private
     */
    _parseArithmeticExpression(expr) {
        if (!expr || typeof expr !== 'string') {
            return this._parseValue(expr);
        }

        expr = expr.trim();

        // Check for array or object literals first - return proper type objects
        if (expr.startsWith('[') && expr.endsWith(']')) {
            return { type: 'array_literal', content: expr };
        }
        if (expr.startsWith('{') && expr.endsWith('}') && expr.includes(':')) {
            return { type: 'object_literal', content: expr };
        }

        // Parse addition and subtraction (lowest precedence) - check BEFORE function calls
        for (const op of ['+', '-']) {
            const idx = this._findOperatorOutsideParens(expr, op);
            if (idx !== -1) {
                const left = expr.substring(0, idx).trim();
                const right = expr.substring(idx + op.length).trim();

                // Skip if this is a negative number at the start
                if (op === '-' && idx === 0) continue;

                // Skip if left side is empty (negative number)
                if (!left && op === '-') continue;

                // Handle ambiguous case: 'call funcName -5' should be a call with arg -5
                // not a subtraction. Check if left is 'call funcName' (two words only)
                if (op === '-' && left.startsWith('call ')) {
                    const leftTokens = this._tokenize(left);
                    // If left is just 'call funcName' with no args, treat '-number' as arg
                    if (leftTokens.length === 2 && /^-?\d/.test(right)) {
                        continue; // Skip this operator, let call parsing handle it
                    }
                }

                return {
                    type: 'expression',
                    operator: op,
                    left: this._parseArithmeticExpression(left),
                    right: this._parseArithmeticExpression(right)
                };
            }
        }

        // Parse multiplication, division, modulo (higher precedence)
        for (const op of ['*', '/', '%']) {
            const idx = this._findOperatorOutsideParens(expr, op);
            if (idx !== -1) {
                const left = expr.substring(0, idx).trim();
                const right = expr.substring(idx + op.length).trim();

                return {
                    type: 'expression',
                    operator: op,
                    left: this._parseArithmeticExpression(left),
                    right: this._parseArithmeticExpression(right)
                };
            }
        }

        // Handle parenthesized expressions
        if (expr.startsWith('(') && expr.endsWith(')')) {
            return this._parseArithmeticExpression(expr.slice(1, -1));
        }

        // Check for function call: call funcName args...
        // (after operators, so 'call abs -5 + 3' splits at '+' first)
        if (expr.startsWith('call ')) {
            const parts = this._tokenize(expr);
            let funcName = parts[1];
            let args = [];

            // Handle funcName(args) syntax like 'call abs(-5)' or 'call max(3, 7)'
            const parenIdx = funcName.indexOf('(');
            if (parenIdx !== -1) {
                // Check if this is a complete parenthesized expression
                if (funcName.endsWith(')')) {
                    // Complete: funcName(arg1,arg2)
                    const argStr = funcName.slice(parenIdx + 1, -1);
                    funcName = funcName.slice(0, parenIdx);
                    if (argStr.trim()) {
                        const argParts = argStr.split(',').map(a => a.trim());
                        args = argParts.map(a => this._parseArithmeticExpression(a));
                    }
                } else {
                    // Partial: funcName(arg1, was split - rejoin tokens until we find closing )
                    funcName = funcName.slice(0, parenIdx);
                    let argStr = parts[1].slice(parenIdx + 1);
                    for (let i = 2; i < parts.length; i++) {
                        const token = parts[i];
                        argStr += ' ' + token;
                        if (token.endsWith(')')) {
                            argStr = argStr.slice(0, -1); // Remove trailing )
                            break;
                        }
                    }
                    if (argStr.trim()) {
                        const argParts = argStr.split(',').map(a => a.trim());
                        args = argParts.map(a => this._parseArithmeticExpression(a));
                    }
                }
            } else {
                // Parse remaining tokens as arguments, handling array/object literals with spaces
                const rawArgs = parts.slice(2);
                const combinedArgs = this._combineArrayObjectTokens(rawArgs);
                args = combinedArgs.map(a => this._parseArithmeticExpression(a));
            }

            return { type: 'call', funcName, args };
        }

        // Base case: parse as value
        return this._parseValue(expr);
    }

    _parseValue(value) {
        if (value === undefined || value === null) return null;

        value = String(value).trim();

        // Empty string stays as empty string
        if (value === '' || value === '""' || value === "''") return '';

        // Remove quotes and handle escape sequences
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            return value.slice(1, -1)
                .replace(/\\n/g, '\n')
                .replace(/\\t/g, '\t')
                .replace(/\\"/g, '"')
                .replace(/\\'/g, "'")
                .replace(/\\\\/g, '\\');
        }

        // Variables
        if (value.startsWith('$')) {
            return { type: 'variable', name: value.slice(1) };
        }

        // Numbers (but not empty strings - they would falsely match)
        if (value !== '' && !isNaN(value) && value.trim() !== '') {
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

        // Handle logical operators first (lowest precedence) - parse right to left for left associativity
        // Check for || first, then &&
        for (const logicalOp of ['||', '&&']) {
            const idx = this._findOperatorOutsideParens(condition, logicalOp);
            if (idx !== -1) {
                const left = condition.substring(0, idx).trim();
                const right = condition.substring(idx + logicalOp.length).trim();
                return {
                    type: 'logical',
                    operator: logicalOp,
                    left: this._parseCondition(left),
                    right: this._parseCondition(right)
                };
            }
        }

        // Handle comparison operators
        const comparisonOps = ['==', '!=', '>=', '<=', '>', '<'];
        for (const op of comparisonOps) {
            const idx = this._findOperatorOutsideParens(condition, op);
            if (idx !== -1) {
                const left = condition.substring(0, idx).trim();
                const right = condition.substring(idx + op.length).trim();
                return {
                    type: 'comparison',
                    operator: op,
                    left: this._parseValue(left),
                    right: this._parseValue(right)
                };
            }
        }

        // Handle parenthesized conditions
        if (condition.startsWith('(') && condition.endsWith(')')) {
            return this._parseCondition(condition.slice(1, -1));
        }

        // Handle negation
        if (condition.startsWith('!')) {
            return {
                type: 'negation',
                value: this._parseCondition(condition.slice(1).trim())
            };
        }

        return this._parseValue(condition);
    }

    /**
     * Find an operator in a string, but not inside parentheses or quotes
     * @private
     */
    _findOperatorOutsideParens(str, op) {
        let parenDepth = 0;
        let inQuotes = false;
        let quoteChar = '';

        // Search from right to left for left-associative parsing
        // Start from the very end to properly track quote state, but only check
        // for operators at valid positions (where the full operator fits)
        for (let i = str.length - 1; i >= 0; i--) {
            const char = str[i];

            // Track quote state (going right-to-left, we see closing quotes first)
            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = '';
            } else if (!inQuotes) {
                // Track parentheses (going right-to-left, ')' increases depth)
                if (char === ')') parenDepth++;
                else if (char === '(') parenDepth--;
            }

            // Only check for operator if there's room for the full operator string
            if (i <= str.length - op.length) {
                if (parenDepth === 0 && !inQuotes && str.substring(i, i + op.length) === op) {
                    // Make sure we're not matching part of a longer operator
                    // e.g., don't match '=' in '==' or '<' in '<='
                    const before = i > 0 ? str[i - 1] : '';
                    const after = i + op.length < str.length ? str[i + op.length] : '';

                    // For single-char operators, check they're not part of multi-char ones
                    if (op === '>' && (before === '>' || after === '=' || before === '-')) continue;
                    if (op === '<' && (after === '=' || after === '<')) continue;
                    if (op === '=' && (before === '=' || before === '!' || before === '<' || before === '>' || after === '=')) continue;

                    return i;
                }
            }
        }

        return -1;
    }

    // ==========================================
    // EXECUTION
    // ==========================================

    /**
     * Execute a list of statements
     * @private
     */
    async _execute(statements, env = this.globalEnv) {
        let result = null;

        for (const statement of statements) {
            if (this.breakRequested || this.loopBreakRequested || this.returnRequested) break;

            result = await this._executeStatement(statement, env);

            // Check if a return was executed (either directly or in a nested block)
            if (this.returnRequested) {
                return this.returnValue;
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
    async _executeStatement(statement, env = this.globalEnv) {
        if (!statement) return null;

        switch (statement.type) {
            case 'block':
                return await this._execute(statement.statements, env);

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
                const value = await this._resolveValue(statement.value, env);
                // Use update to properly handle variables in parent scopes (loops, functions)
                env.update(statement.varName, value);
                return value;

            case 'print':
                const message = await this._resolveValue(statement.message, env);
                console.log('[Script]', message);
                EventBus.emit('script:output', { message });
                return message;

            case 'emit':
                const payload = {};
                for (const [key, val] of Object.entries(statement.payload)) {
                    payload[key] = await this._resolveValue(val, env);
                }
                EventBus.emit(statement.eventName, payload);
                return { event: statement.eventName, payload };

            case 'on':
                // Prevent event handler memory leaks
                if (this.eventHandlers.length >= this.LIMITS.MAX_EVENT_HANDLERS) {
                    throw new Error(`Maximum event handlers (${this.LIMITS.MAX_EVENT_HANDLERS}) exceeded. Call cleanup() to remove old handlers.`);
                }
                console.log(`[ScriptEngine] Registering handler for: ${statement.eventName}, body statements:`, statement.body?.length || 0);
                const unsubscribe = EventBus.on(statement.eventName, async (eventPayload) => {
                    console.log(`[ScriptEngine] Event received: ${statement.eventName}`, eventPayload);
                    try {
                        env.set('event', eventPayload);
                        await this._execute(statement.body, env);
                    } catch (err) {
                        console.error(`[ScriptEngine] Error in event handler for ${statement.eventName}:`, err);
                    }
                });
                this.eventHandlers.push(unsubscribe);
                return { subscribed: statement.eventName };

            case 'if':
                const condition = await this._evaluateCondition(statement.condition, env);
                if (condition) {
                    return await this._execute(statement.thenBody, env);
                } else if (statement.elseBody.length > 0) {
                    return await this._execute(statement.elseBody, env);
                }
                return null;

            case 'loop':
                let loopResult = null;
                this.loopBreakRequested = false;
                // Resolve count - can be a number or a variable
                let loopCount = statement.count;
                if (typeof loopCount === 'object' && loopCount !== null) {
                    loopCount = await this._resolveValue(loopCount, env);
                }
                loopCount = parseInt(loopCount) || 0;
                // Apply max iterations limit for safety
                if (loopCount > this.LIMITS.MAX_LOOP_ITERATIONS) {
                    console.warn(`[ScriptEngine] Loop count ${loopCount} exceeds maximum (${this.LIMITS.MAX_LOOP_ITERATIONS}), truncating`);
                    loopCount = this.LIMITS.MAX_LOOP_ITERATIONS;
                }
                // Create loop scope to prevent $i collision with user variables
                const loopEnv = env.extend();
                for (let i = 0; i < loopCount && !this.breakRequested && !this.loopBreakRequested && !this.returnRequested; i++) {
                    this._checkTimeout();
                    loopEnv.set('i', i);
                    this.continueRequested = false;

                    for (const stmt of statement.body) {
                        if (this.continueRequested) break;
                        if (this.loopBreakRequested) break;
                        if (this.returnRequested) break;
                        loopResult = await this._executeStatement(stmt, loopEnv);
                    }
                }
                this.loopBreakRequested = false;
                this.continueRequested = false;
                return loopResult;

            case 'while':
                let whileResult = null;
                this.loopBreakRequested = false;
                let whileIterations = 0;
                // Create loop scope for while loops too
                const whileEnv = env.extend();

                while (await this._evaluateCondition(statement.condition, whileEnv) && !this.breakRequested && !this.loopBreakRequested && !this.returnRequested) {
                    this._checkTimeout();
                    whileIterations++;
                    if (whileIterations > this.LIMITS.MAX_LOOP_ITERATIONS) {
                        throw new Error(`While loop exceeded maximum iterations (${this.LIMITS.MAX_LOOP_ITERATIONS})`);
                    }

                    this.continueRequested = false;
                    for (const stmt of statement.body) {
                        if (this.continueRequested) break;
                        if (this.loopBreakRequested) break;
                        if (this.returnRequested) break;
                        whileResult = await this._executeStatement(stmt, whileEnv);
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
                        args.push(await this._resolveValue(arg, env));
                    }
                    return await func(...args);
                }
                throw new Error(`Unknown function: ${statement.funcName}`);

            case 'alert':
                EventBus.emit('dialog:alert', {
                    message: await this._resolveValue(statement.message, env)
                });
                return null;

            case 'confirm':
                // Use request/response pattern to wait for user response
                try {
                    const confirmResult = await EventBus.request('dialog:confirm', {
                        message: await this._resolveValue(statement.message, env)
                    }, { timeout: 60000 }); // 60 second timeout for user input
                    const confirmed = confirmResult.confirmed || confirmResult.result || false;
                    env.set(statement.varName, confirmed);
                    return confirmed;
                } catch (e) {
                    // Timeout or error - treat as cancelled
                    env.set(statement.varName, false);
                    return false;
                }

            case 'prompt':
                // Use request/response pattern to wait for user input
                try {
                    const promptResult = await EventBus.request('dialog:prompt', {
                        message: await this._resolveValue(statement.message, env),
                        defaultValue: (await this._resolveValue(statement.defaultValue, env)) || ''
                    }, { timeout: 120000 }); // 2 minute timeout for user input
                    const promptValue = promptResult.cancelled ? null : (promptResult.value || '');
                    env.set(statement.varName, promptValue);
                    return promptValue;
                } catch (e) {
                    // Timeout or error - treat as cancelled
                    env.set(statement.varName, null);
                    return null;
                }

            case 'notify':
                EventBus.emit('notification:show', {
                    message: await this._resolveValue(statement.message, env)
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
                const content = await this._resolveValue(statement.content, env);
                const writePath = await this._resolveValue(statement.path, env);
                FileSystemManager.writeFile(writePath, content);
                return { written: writePath };

            case 'read':
                try {
                    const readPath = await this._resolveValue(statement.path, env);
                    const fileContent = FileSystemManager.readFile(readPath);
                    env.set(statement.varName, fileContent);
                    return fileContent;
                } catch (e) {
                    env.set(statement.varName, null);
                    return null;
                }

            case 'mkdir':
                FileSystemManager.createDirectory(await this._resolveValue(statement.path, env));
                return { created: statement.path };

            case 'delete':
                try {
                    const deletePath = await this._resolveValue(statement.path, env);
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
                    cmdArgs.push(await this._resolveValue(arg, env));
                }
                return await CommandBus.execute(statement.command, { args: cmdArgs });

            case 'return':
                this.returnRequested = true;
                this.returnValue = await this._resolveValue(statement.value, env);
                return this.returnValue;

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
                const arrayValue = await this._resolveValue(statement.array, env);
                // Create foreach scope to prevent variable collision
                const foreachEnv = env.extend();

                if (Array.isArray(arrayValue)) {
                    const iterationLimit = Math.min(arrayValue.length, this.LIMITS.MAX_LOOP_ITERATIONS);
                    for (let idx = 0; idx < iterationLimit && !this.breakRequested && !this.loopBreakRequested && !this.returnRequested; idx++) {
                        this._checkTimeout();
                        foreachEnv.set(statement.varName, arrayValue[idx]);
                        foreachEnv.set('i', idx);
                        this.continueRequested = false;

                        for (const stmt of statement.body) {
                            if (this.continueRequested) break;
                            if (this.loopBreakRequested) break;
                            if (this.returnRequested) break;
                            foreachResult = await this._executeStatement(stmt, foreachEnv);
                        }
                    }
                    if (arrayValue.length > this.LIMITS.MAX_LOOP_ITERATIONS) {
                        console.warn(`[ScriptEngine] Foreach loop truncated at ${this.LIMITS.MAX_LOOP_ITERATIONS} iterations`);
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
                    return await this._callUserFunction(statement.funcName, args, env);
                });
                return { defined: statement.funcName };

            case 'try':
                // Try/catch error handling
                try {
                    return await this._execute(statement.tryBody, env);
                } catch (error) {
                    env.set(statement.errorVar, error.message);
                    return await this._execute(statement.catchBody, env);
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
    async _callUserFunction(funcName, args, env = this.globalEnv) {
        const func = this.userFunctions.get(funcName);
        if (!func) {
            throw new Error(`Unknown function: ${funcName}`);
        }

        // Create child environment for function scope (proper lexical scoping!)
        const funcEnv = env.extend();

        // Set parameters as local variables in function scope
        for (let i = 0; i < func.params.length; i++) {
            funcEnv.set(func.params[i], args[i] !== undefined ? args[i] : null);
        }

        // Track call stack with recursion depth limit
        if (this.callStack.length >= this.LIMITS.MAX_RECURSION_DEPTH) {
            throw new Error(`Maximum recursion depth exceeded (${this.LIMITS.MAX_RECURSION_DEPTH}) - possible infinite recursion in function: ${funcName}`);
        }
        this.callStack.push(funcName);

        try {
            const result = await this._execute(func.body, funcEnv);
            return result;
        } finally {
            this.callStack.pop();
            // Clear return flag after function completes (it was consumed by this function)
            this.returnRequested = false;
            this.returnValue = null;
            // No need to restore environment - child environment is automatically discarded!
        }
    }

    /**
     * Parse array literal: [1, 2, 3] or ["a", "b", "c"]
     * @private
     */
    _parseArrayLiteral(content, env = this.globalEnv) {
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
                return env.get(item.name);
            }
            return item;
        });
    }

    /**
     * Parse object literal: {key: value, key2: value2}
     * @private
     */
    _parseObjectLiteral(content, env = this.globalEnv) {
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
                    parsedValue = env.get(parsedValue.name);
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
    async _resolveValue(value, env = this.globalEnv) {
        if (value === null || value === undefined) return null;

        if (typeof value === 'object') {
            if (value.type === 'variable') {
                return env.get(value.name);
            }

            if (value.type === 'call') {
                // Execute function call and return result
                const func = this.functions.get(value.funcName);
                if (func) {
                    const args = [];
                    for (const arg of value.args) {
                        args.push(await this._resolveValue(arg, env));
                    }
                    return await func(...args);
                }
                throw new Error(`Unknown function: ${value.funcName}`);
            }

            if (value.type === 'expression') {
                const left = await this._resolveValue(value.left, env);
                const right = await this._resolveValue(value.right, env);

                // Handle string concatenation with +
                if (value.operator === '+' && (typeof left === 'string' || typeof right === 'string')) {
                    return String(left) + String(right);
                }

                // Fix type coercion: be more explicit about empty strings
                const numLeft = typeof left === 'number' ? left :
                    (left === '' ? 0 : parseFloat(left) || 0);
                const numRight = typeof right === 'number' ? right :
                    (right === '' ? 0 : parseFloat(right) || 0);

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
                return this._parseArrayLiteral(value.content, env);
            }

            // Object literal: {key: value}
            if (value.type === 'object_literal') {
                return this._parseObjectLiteral(value.content, env);
            }
        }

        if (typeof value === 'string') {
            // Replace $variables in strings
            return value.replace(/\$(\w+)/g, (match, varName) => {
                const v = env.get(varName);
                return v !== undefined ? String(v) : match;
            });
        }

        return value;
    }

    /**
     * Evaluate a condition
     * @private
     */
    async _evaluateCondition(condition, env = this.globalEnv) {
        if (condition === null || condition === undefined) return false;

        if (typeof condition === 'boolean') return condition;

        if (typeof condition === 'object') {
            if (condition.type === 'variable') {
                return !!env.get(condition.name);
            }

            if (condition.type === 'logical') {
                const left = await this._evaluateCondition(condition.left, env);
                // Short-circuit evaluation
                if (condition.operator === '||' && left) return true;
                if (condition.operator === '&&' && !left) return false;
                const right = await this._evaluateCondition(condition.right, env);
                return condition.operator === '||' ? (left || right) : (left && right);
            }

            if (condition.type === 'negation') {
                return !(await this._evaluateCondition(condition.value, env));
            }

            if (condition.type === 'comparison') {
                const left = await this._resolveValue(condition.left, env);
                const right = await this._resolveValue(condition.right, env);

                switch (condition.operator) {
                    case '==': return left == right;
                    case '!=': return left != right;
                    case '>': return left > right;
                    case '<': return left < right;
                    case '>=': return left >= right;
                    case '<=': return left <= right;
                }
            }
        }

        return !!(await this._resolveValue(condition, env));
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
            // Validate step to prevent infinite loops
            if (step === 0 || !Number.isFinite(step)) return result;
            if (step > 0) {
                for (let i = start; i < end && result.length < this.LIMITS.MAX_ARRAY_LENGTH; i += step) result.push(i);
            } else if (step < 0) {
                for (let i = start; i > end && result.length < this.LIMITS.MAX_ARRAY_LENGTH; i += step) result.push(i);
            }
            return result;
        });
        this.defineFunction('fill', (length, value) => {
            const safeLength = Math.min(Math.max(0, Math.floor(length)), this.LIMITS.MAX_ARRAY_LENGTH);
            return Array(safeLength).fill(value);
        });
        this.defineFunction('at', (arr, idx) => {
            if (Array.isArray(arr)) return arr.at(idx);
            return String(arr).at(idx);
        });
        this.defineFunction('find', (arr, value) => {
            if (Array.isArray(arr)) return arr.find(item => item === value) ?? null;
            return null;
        });
        this.defineFunction('findIndex', (arr, value) => {
            if (Array.isArray(arr)) return arr.findIndex(item => item === value);
            return -1;
        });
        this.defineFunction('filter', (arr, key, value) => {
            // Simple filter: filter items where item[key] == value, or if no value, where item == key
            if (!Array.isArray(arr)) return [];
            if (value === undefined) {
                // Filter by truthy value or equality
                return arr.filter(item => item === key || (typeof item === 'object' && item && item[key]));
            }
            return arr.filter(item => typeof item === 'object' && item && item[key] === value);
        });
        this.defineFunction('map', (arr, key) => {
            // Extract a key from each object, or return array as-is if no key
            if (!Array.isArray(arr)) return [];
            if (key === undefined) return arr;
            return arr.map(item => typeof item === 'object' && item ? item[key] : item);
        });
        this.defineFunction('sum', (arr) => {
            if (!Array.isArray(arr)) return 0;
            return arr.reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
        });
        this.defineFunction('avg', (arr) => {
            if (!Array.isArray(arr) || arr.length === 0) return 0;
            const sum = arr.reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
            return sum / arr.length;
        });
        this.defineFunction('every', (arr, key, value) => {
            if (!Array.isArray(arr)) return false;
            if (value === undefined) {
                return arr.every(item => item === key || !!item);
            }
            return arr.every(item => typeof item === 'object' && item && item[key] === value);
        });
        this.defineFunction('some', (arr, key, value) => {
            if (!Array.isArray(arr)) return false;
            if (value === undefined) {
                return arr.some(item => item === key || !!item);
            }
            return arr.some(item => typeof item === 'object' && item && item[key] === value);
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

        // ==========================================
        // TERMINAL FUNCTIONS
        // ==========================================

        /**
         * Helper to get Terminal instance
         */
        const getTerminal = async () => {
            const AppRegistry = (await import('../apps/AppRegistry.js')).default;
            const terminal = AppRegistry.get('terminal');
            if (terminal && terminal.openWindows && terminal.openWindows.size > 0) {
                const firstWindowId = terminal.openWindows.keys().next().value;
                terminal._currentWindowId = firstWindowId;
                return terminal;
            }
            return null;
        };

        /**
         * Ensure terminal is open
         */
        const ensureTerminal = async () => {
            let terminal = await getTerminal();
            if (!terminal) {
                const AppRegistry = (await import('../apps/AppRegistry.js')).default;
                AppRegistry.launch('terminal');
                await new Promise(resolve => setTimeout(resolve, 200));
                terminal = await getTerminal();
            }
            return terminal;
        };

        // Check if terminal is open
        this.defineFunction('isTerminalOpen', async () => {
            const terminal = await getTerminal();
            return terminal !== null && terminal.openWindows && terminal.openWindows.size > 0;
        });

        // Open terminal (launch if not open)
        this.defineFunction('terminalOpen', async (initialCommand = null) => {
            const terminal = await ensureTerminal();
            if (!terminal) {
                return { success: false, error: 'Failed to open terminal' };
            }

            await new Promise(resolve => setTimeout(resolve, 100));

            if (initialCommand) {
                terminal.executeCommand(String(initialCommand));
            }

            return { success: true, windowId: terminal._currentWindowId };
        });

        // Close terminal window
        this.defineFunction('terminalClose', async () => {
            const terminal = await getTerminal();
            if (!terminal) return false;
            terminal.close();
            return true;
        });

        // Focus terminal window
        this.defineFunction('terminalFocus', async () => {
            const terminal = await getTerminal();
            if (!terminal || !terminal._currentWindowId) return false;
            EventBus.emit('window:focus', { windowId: terminal._currentWindowId });
            return true;
        });

        // Minimize terminal window
        this.defineFunction('terminalMinimize', async () => {
            const terminal = await getTerminal();
            if (!terminal || !terminal._currentWindowId) return false;
            EventBus.emit('window:minimize', { windowId: terminal._currentWindowId });
            return true;
        });

        // Print text to terminal
        this.defineFunction('terminalPrint', async (text, color = null) => {
            const terminal = await getTerminal();
            if (!terminal) {
                console.warn('[TerminalBuiltins] No terminal open');
                return false;
            }
            terminal.print(String(text), color);
            return true;
        });

        // Print HTML to terminal
        this.defineFunction('terminalPrintHtml', async (html) => {
            const terminal = await getTerminal();
            if (!terminal) return false;
            terminal.printHtml(String(html));
            return true;
        });

        // Clear terminal screen
        this.defineFunction('terminalClear', async () => {
            const terminal = await getTerminal();
            if (!terminal) return false;
            terminal.cmdClear();
            return true;
        });

        // Execute a terminal command
        this.defineFunction('terminalExecute', async (command) => {
            const terminal = await getTerminal();
            if (!terminal) {
                return { success: false, error: 'No terminal open' };
            }
            terminal.executeCommand(String(command));
            return {
                success: true,
                output: terminal.lastOutput,
                path: terminal.currentPath.join('\\')
            };
        });

        // Execute multiple terminal commands
        this.defineFunction('terminalExecuteSequence', async (commands) => {
            const terminal = await getTerminal();
            if (!terminal) {
                return { success: false, error: 'No terminal open' };
            }
            if (!Array.isArray(commands)) {
                commands = [String(commands)];
            }
            const outputs = [];
            for (const cmd of commands) {
                terminal.executeCommand(String(cmd));
                outputs.push(terminal.lastOutput);
            }
            return { success: true, outputs };
        });

        // Change directory
        this.defineFunction('terminalCd', async (path) => {
            const terminal = await getTerminal();
            if (!terminal) {
                return { success: false, error: 'No terminal open' };
            }
            terminal.cmdCd([String(path)]);
            return { success: true, path: terminal.currentPath.join('\\') };
        });

        // Get current path
        this.defineFunction('terminalGetPath', async () => {
            const terminal = await getTerminal();
            if (!terminal) return null;
            return terminal.currentPath.join('\\');
        });

        // Get last output
        this.defineFunction('terminalGetOutput', async () => {
            const terminal = await getTerminal();
            if (!terminal) return null;
            return terminal.lastOutput;
        });

        // Get all terminal output
        this.defineFunction('terminalGetAllOutput', async () => {
            const terminal = await getTerminal();
            if (!terminal) return null;
            const output = terminal.getElement('#terminalOutput');
            return output ? output.textContent : '';
        });

        // Get command history
        this.defineFunction('terminalGetHistory', async () => {
            const terminal = await getTerminal();
            if (!terminal) return [];
            return [...terminal.commandHistory];
        });

        // Get terminal state
        this.defineFunction('terminalGetState', async () => {
            const terminal = await getTerminal();
            if (!terminal) return null;
            return {
                currentPath: terminal.currentPath,
                pathString: terminal.currentPath.join('\\'),
                godMode: terminal.godMode,
                hasActiveProcess: terminal.activeProcess !== null,
                activeProcessType: terminal.activeProcess,
                historyCount: terminal.commandHistory.length,
                windowId: terminal._currentWindowId
            };
        });

        // Get all environment variables
        this.defineFunction('terminalGetEnvVars', async () => {
            const terminal = await getTerminal();
            if (!terminal) return {};
            return { ...terminal.envVars };
        });

        // Get environment variable
        this.defineFunction('terminalGetEnvVar', async (name) => {
            const terminal = await getTerminal();
            if (!terminal) return null;
            return terminal.envVars[String(name).toUpperCase()] || null;
        });

        // Set environment variable
        this.defineFunction('terminalSetEnvVar', async (name, value) => {
            const terminal = await getTerminal();
            if (!terminal) return false;
            terminal.envVars[String(name).toUpperCase()] = String(value);
            return true;
        });

        // Create alias
        this.defineFunction('terminalAlias', async (name, command) => {
            const terminal = await getTerminal();
            if (!terminal) return false;
            terminal.aliases[String(name).toLowerCase()] = String(command);
            return true;
        });

        // Get all aliases
        this.defineFunction('terminalGetAliases', async () => {
            const terminal = await getTerminal();
            if (!terminal) return {};
            return { ...terminal.aliases };
        });

        // Directory listing
        this.defineFunction('terminalDir', async (path = null) => {
            const terminal = await getTerminal();
            if (!terminal) return [];
            let resolvedPath;
            if (path) {
                resolvedPath = terminal.resolvePath(String(path));
            } else {
                resolvedPath = terminal.currentPath;
            }
            try {
                return FileSystemManager.listDirectory(resolvedPath);
            } catch (e) {
                return [];
            }
        });

        // Read file from terminal perspective
        this.defineFunction('terminalReadFile', async (filePath) => {
            const terminal = await getTerminal();
            let resolvedPath;
            if (terminal) {
                resolvedPath = terminal.resolvePath(String(filePath));
            } else {
                resolvedPath = FileSystemManager.parsePath(String(filePath));
            }
            try {
                return FileSystemManager.readFile(resolvedPath);
            } catch (e) {
                return null;
            }
        });

        // Write file from terminal perspective
        this.defineFunction('terminalWriteFile', async (filePath, content) => {
            const terminal = await getTerminal();
            let resolvedPath;
            if (terminal) {
                resolvedPath = terminal.resolvePath(String(filePath));
            } else {
                resolvedPath = FileSystemManager.parsePath(String(filePath));
            }
            try {
                const extension = String(filePath).split('.').pop() || 'txt';
                FileSystemManager.writeFile(resolvedPath, String(content), extension);
                return true;
            } catch (e) {
                return false;
            }
        });

        // Check if file exists
        this.defineFunction('terminalFileExists', async (filePath) => {
            const terminal = await getTerminal();
            let resolvedPath;
            if (terminal) {
                resolvedPath = terminal.resolvePath(String(filePath));
            } else {
                resolvedPath = FileSystemManager.parsePath(String(filePath));
            }
            return FileSystemManager.exists(resolvedPath);
        });

        // Run RetroScript file
        this.defineFunction('terminalRunScript', async (scriptPath) => {
            const terminal = await getTerminal();
            if (!terminal) return false;
            const filePath = terminal.resolvePath(String(scriptPath));
            terminal.executeRetroScript(filePath);
            return true;
        });

        // Enable god mode
        this.defineFunction('terminalGodMode', async () => {
            const terminal = await getTerminal();
            if (!terminal) return false;
            terminal.godMode = true;
            terminal.print('*** GOD MODE ACTIVATED ***', '#ff00ff');
            return true;
        });

        // Check god mode
        this.defineFunction('terminalIsGodMode', async () => {
            const terminal = await getTerminal();
            if (!terminal) return false;
            return terminal.godMode;
        });

        // Start matrix effect
        this.defineFunction('terminalMatrix', async () => {
            const terminal = await getTerminal();
            if (!terminal) return false;
            terminal.startMatrix();
            return true;
        });

        // Cowsay
        this.defineFunction('terminalCowsay', async (message) => {
            const terminal = await getTerminal();
            if (!terminal) return false;
            const output = terminal.cmdCowsay([String(message)]);
            if (output) terminal.print(output);
            return true;
        });

        // Fortune
        this.defineFunction('terminalFortune', async () => {
            const terminal = await getTerminal();
            if (!terminal) return null;
            const fortune = terminal.cmdFortune();
            terminal.print(fortune);
            return fortune;
        });

        // Set terminal color
        this.defineFunction('terminalColor', async (colorCode) => {
            const terminal = await getTerminal();
            if (!terminal) return false;
            terminal.cmdColor([String(colorCode)]);
            return true;
        });
    }

    /**
     * Cleanup event handlers and user-defined functions
     * Call this after script execution to prevent memory leaks
     */
    cleanup() {
        // Unsubscribe all event handlers
        for (const unsubscribe of this.eventHandlers) {
            if (typeof unsubscribe === 'function') {
                try {
                    unsubscribe();
                } catch (e) {
                    console.warn('[ScriptEngine] Error unsubscribing handler:', e);
                }
            }
        }
        this.eventHandlers = [];

        // Clear user-defined functions from both maps
        for (const funcName of this.userFunctions.keys()) {
            this.functions.delete(funcName);
        }
        this.userFunctions.clear();

        // Reset global environment
        this.globalEnv = new Environment();
        this.globalEnv.set('TRUE', true);
        this.globalEnv.set('FALSE', false);
        this.globalEnv.set('NULL', null);

        // Reset execution state
        this.callStack = [];
        this.breakRequested = false;
        this.loopBreakRequested = false;
        this.continueRequested = false;
        this.returnRequested = false;
        this.returnValue = null;
        this.running = false;
        this.executionStartTime = null;

        // Re-register built-in functions (they were cleared with the global env)
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
