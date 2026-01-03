# Script Engine Critical Review & Recommendations

## Executive Summary

The RetrOS script engine (ScriptEngine.js, 1,963 lines) is **fundamentally broken** due to poor architectural decisions. While it demonstrates impressive ambition with 130+ built-in functions and comprehensive language features, the implementation is:

- ❌ **Unmaintainable**: Monolithic parser/interpreter in one file
- ❌ **Fragile**: String-based parsing without proper lexer/parser separation
- ❌ **Over-engineered**: Trying to be a full programming language instead of a simple scripting DSL
- ❌ **Buggy**: Complex parsing logic prone to edge cases and failures
- ❌ **Performance issues**: No caching, re-parses on every run
- ❌ **Poor debugging**: Limited error information, no source maps

**Recommendation**: Either **drastically simplify** or **complete rewrite** with proper architecture.

---

## Critical Problems

### 1. Parser Architecture is Fundamentally Broken

#### Current Approach (Lines 584-614)
```javascript
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
        } else if ((char === ' ' || char === '\n'...) && !inQuotes) {
            if (current) {
                tokens.push(current);
                current = '';
            }
        } else {
            current += char;
        }
    }
    // ... more logic
}
```

**Problems:**
- ✗ Manual character-by-character parsing
- ✗ No proper token types (everything is just strings)
- ✗ No position tracking for error reporting
- ✗ Doesn't handle escape sequences properly
- ✗ Brittle - easy to break with edge cases
- ✗ Hard to extend with new syntax

#### Example Failures
The tokenizer fails or behaves unexpectedly with:
- Nested quotes: `"He said \"hello\""`
- Mixed operators: `$x = $y > 5 && $z < 10`
- Complex expressions: `set $result = call abs ($a - $b) * 2`
- Unicode/emoji: `set $msg = "Hello 👋 World"`

### 2. No Proper Abstract Syntax Tree (AST)

The "parsed" output is just nested JavaScript objects with no formal structure:

```javascript
{
    type: 'if',
    condition: { type: 'comparison', operator: '>', left: {type: 'variable', name: 'x'}, right: 5 },
    thenBody: [...],
    elseBody: [...]
}
```

**Problems:**
- ✗ No validation of structure
- ✗ No type checking
- ✗ No optimization passes possible
- ✗ Can't generate better error messages
- ✗ Can't implement source maps or debugging

### 3. Execution Model is Broken

#### Variable Scoping Hack (Lines 1329-1347)
```javascript
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

    // ... execute ...

    finally {
        // Restore variables (basic scoping)
        this.variables = savedVars;
        this.callStack.pop();
    }
}
```

**Problems:**
- ✗ No real scoping - just copy/restore the entire variable map
- ✗ Closures impossible
- ✗ Memory inefficient (copies entire variable set on every function call)
- ✗ Can't have nested scopes
- ✗ Breaks variable references across function boundaries

#### Type Coercion is Ad-hoc (Lines 1492-1511)
```javascript
if (value.type === 'expression') {
    const left = await this._resolveValue(value.left);
    const right = await this._resolveValue(value.right);

    // Handle string concatenation with +
    if (value.operator === '+' && (typeof left === 'string' || typeof right === 'string')) {
        return String(left) + String(right);
    }

    const numLeft = typeof left === 'number' ? left : parseFloat(left) || 0;
    const numRight = typeof right === 'number' ? right : parseFloat(right) || 0;

    // ... perform operation
}
```

**Problems:**
- ✗ Implicit coercion rules are unclear
- ✗ `parseFloat(left) || 0` means empty string becomes 0 (sometimes fixed, sometimes not)
- ✗ No way to enforce types
- ✗ Hard to debug type errors

### 4. Language Design Issues

#### Too Many Features
The language tries to support:
- Variables and data types (strings, numbers, booleans, arrays, objects, null)
- Arithmetic expressions (+, -, *, /, %)
- Comparison operators (==, !=, >, <, >=, <=)
- Logical operators (&&, ||, !)
- Control flow (if/else, loops, while, foreach, break, continue)
- Functions (definition, calls, return, recursion)
- Events (emit, on)
- Dialogs (alert, confirm, prompt)
- File system (read, write, mkdir, delete)
- Window management (focus, minimize, maximize)
- 130+ built-in functions across 10+ categories
- Try/catch error handling
- User-defined functions with parameters
- Array and object literals
- String interpolation

**This is TOO MUCH for a "simple scripting language"!**

#### Inconsistent Syntax
Compare these statements:
- `launch notepad` - keyword-based command
- `set $var = 10` - assignment with keyword
- `$var = 10` - assignment without keyword
- `if $x > 5 then { ... }` - control flow with `then`
- `loop 5 { ... }` - control flow without `then`
- `call funcName arg1` - function call with keyword
- `set $result = call funcName arg1` - function call in expression

**Too many inconsistencies and special cases!**

#### Unclear Use Case
What is RetroScript actually for?
- Automation? (then why 130+ functions?)
- Game scripting? (then why file system access?)
- General programming? (then why keyword-based syntax?)
- Event handling? (then why arithmetic expressions?)

**The language tries to be everything and ends up being confusing.**

### 5. Maintenance Nightmare

#### Monolithic Structure
```
ScriptEngine.js (1,963 lines)
├── Constructor & Initialization (52 lines)
├── Parsing (571 lines)
│   ├── _parse() - main parser
│   ├── _parseLine() - statement parser
│   ├── _parseIf(), _parseLoop(), _parseFunction() - 15+ parse methods
│   ├── _tokenize() - tokenizer
│   ├── _splitBySemicolon() - splitter
│   └── _removeInlineComment() - comment remover
├── Execution (575 lines)
│   ├── _execute() - main executor
│   ├── _executeStatement() - statement executor (280 lines!)
│   ├── _callUserFunction() - function caller
│   ├── _resolveValue() - value resolver
│   └── _evaluateCondition() - condition evaluator
└── Built-in Functions (325 lines)
    ├── Math (20+ functions)
    ├── String (25+ functions)
    ├── Array (25+ functions)
    ├── Object (8 functions)
    ├── JSON (3 functions)
    ├── Time (15+ functions)
    ├── Type (11 functions)
    └── Debug (3 functions)
```

**Problems:**
- ✗ Can't test parser independently of executor
- ✗ Can't swap out parser for a better one
- ✗ Adding a new statement type requires changes in 3-5 places
- ✗ No clear separation of concerns
- ✗ Hard to understand control flow

#### _executeStatement() is 280 Lines!
A single switch statement with 25+ cases handling all statement types. This is a **code smell** indicating poor design.

### 6. Testing & Debugging Issues

#### Poor Error Messages
Current error output:
```
Script execution error: Unknown function: myFunc
Line: 42
```

What you actually need:
```
Error: Unknown function 'myFunc'
  at line 42, column 8
  42 | set $result = call myFunc $arg1
     |                    ^^^^^^

  Did you mean: myFunc1, myFn, yourFunc?

  Call stack:
    main script (line 42)
    in function 'calculate' (line 30)
```

#### No Source Maps
- Can't step through code in debugger
- Can't set breakpoints
- Can't inspect variables at specific points
- Can't profile performance

#### Test Suite Issues
The test suite (embedded in ScriptRunner) is good for validating behavior, but:
- ✗ Tests are in a string template, not proper test files
- ✗ No unit tests for parser components
- ✗ No automated test runner
- ✗ Tests can't be run in CI/CD
- ✗ Hard to debug failing tests

---

## Recommended Solutions

I'm presenting **two options**: a simple fix vs. a proper solution.

### Option 1: DRASTICALLY SIMPLIFY (Recommended for Quick Fix)

**Goal**: Turn RetroScript into a **simple event-based automation language** - nothing more.

#### New Language Design

**Only support:**
1. **Commands** (launch, close, wait, print, emit)
2. **Simple variables** (strings and numbers only)
3. **Basic conditionals** (if/then/else with simple comparisons)
4. **Simple loops** (loop N times)
5. **Event handlers** (on event { ... })
6. **~20 essential built-in functions** (not 130!)

**Remove:**
- ❌ User-defined functions (too complex)
- ❌ Try/catch (too complex)
- ❌ Complex expressions (nested operators)
- ❌ Arrays and objects (too complex)
- ❌ While loops and foreach (too complex)
- ❌ Most built-in functions (keep only essential ones)

#### Example Simplified Syntax

**Before (complex):**
```retroscript
def fibonacci($n) {
    if $n <= 1 then {
        return $n
    } else {
        set $a = call fibonacci ($n - 1)
        set $b = call fibonacci ($n - 2)
        return $a + $b
    }
}

set $result = call fibonacci 10
print Fibonacci(10) = $result
```

**After (simple):**
```retroscript
# RetroScript is NOT a programming language!
# It's for simple automation only.

# Launch an app
launch notepad

# Wait and close
wait 1000
close

# Simple variables
set $count = 0
set $name = "User"

# Simple loop
loop 5 {
    print Hello $name! Count: $count
    set $count = $count + 1
}

# Simple conditional
if $count > 3 then {
    print Count exceeded!
}

# Event handling
on window:open {
    print Window opened!
}
```

#### Implementation Plan (Simplified Parser)

Replace the complex parser with a **line-based command parser**:

```javascript
class SimpleScriptEngine {
    parse(script) {
        const lines = script.split('\n');
        const commands = [];

        for (const line of lines) {
            const trimmed = line.trim();

            // Skip empty and comments
            if (!trimmed || trimmed.startsWith('#')) continue;

            // Parse based on first keyword
            const parts = trimmed.split(/\s+/);
            const keyword = parts[0];

            switch (keyword) {
                case 'launch':
                    commands.push({ type: 'launch', app: parts[1] });
                    break;
                case 'wait':
                    commands.push({ type: 'wait', ms: parseInt(parts[1]) });
                    break;
                case 'print':
                    commands.push({ type: 'print', text: parts.slice(1).join(' ') });
                    break;
                case 'set':
                    commands.push(this.parseSet(parts));
                    break;
                // ... handle other simple commands
            }
        }

        return commands;
    }

    async execute(commands) {
        for (const cmd of commands) {
            await this.executeCommand(cmd);
        }
    }
}
```

**Benefits:**
- ✅ Much simpler to understand
- ✅ Easy to maintain
- ✅ Fast to parse
- ✅ Clear error messages
- ✅ Focused on actual use case (automation)

**Downsides:**
- ⚠️ Less powerful (but that's the point!)
- ⚠️ Existing complex scripts will break

---

### Option 2: PROPER REWRITE (Recommended for Long-term)

**Goal**: Build a **properly architected scripting language** with clean separation of concerns.

#### Architecture

```
┌─────────────────────────────────────────────────────┐
│                    ScriptEngine                      │
│  (Orchestrates parsing and execution)               │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
┌──────────────┐              ┌──────────────────┐
│    Lexer     │              │    Runtime       │
│ (Tokenize)   │              │  (Execute AST)   │
└──────┬───────┘              └────────┬─────────┘
       │                               │
       ▼                               ▼
┌──────────────┐              ┌──────────────────┐
│    Parser    │─────────────▶│   Environment    │
│ (Build AST)  │              │  (Variables,     │
└──────────────┘              │   Functions)     │
                              └──────────────────┘
```

#### Phase 1: Lexer (Tokenizer)

Convert source text into tokens with proper types:

```javascript
class Lexer {
    tokenize(source) {
        const tokens = [];
        let pos = 0;

        while (pos < source.length) {
            // Skip whitespace
            if (this.isWhitespace(source[pos])) {
                pos++;
                continue;
            }

            // Comments
            if (source[pos] === '#') {
                pos = this.skipComment(source, pos);
                continue;
            }

            // Strings
            if (source[pos] === '"' || source[pos] === "'") {
                const [token, newPos] = this.readString(source, pos);
                tokens.push(token);
                pos = newPos;
                continue;
            }

            // Numbers
            if (this.isDigit(source[pos])) {
                const [token, newPos] = this.readNumber(source, pos);
                tokens.push(token);
                pos = newPos;
                continue;
            }

            // Identifiers and keywords
            if (this.isAlpha(source[pos]) || source[pos] === '$') {
                const [token, newPos] = this.readIdentifier(source, pos);
                tokens.push(token);
                pos = newPos;
                continue;
            }

            // Operators
            const [token, newPos] = this.readOperator(source, pos);
            tokens.push(token);
            pos = newPos;
        }

        return tokens;
    }

    readString(source, start) {
        const quote = source[start];
        let pos = start + 1;
        let value = '';

        while (pos < source.length && source[pos] !== quote) {
            if (source[pos] === '\\') {
                // Handle escape sequences
                pos++;
                value += this.escapeChar(source[pos]);
            } else {
                value += source[pos];
            }
            pos++;
        }

        return [
            { type: 'STRING', value, line: this.line, col: this.col },
            pos + 1
        ];
    }

    // ... more methods
}
```

**Token types:**
- `KEYWORD` (launch, set, if, loop, etc.)
- `IDENTIFIER` ($varName, funcName)
- `STRING` ("hello")
- `NUMBER` (42, 3.14)
- `OPERATOR` (+, -, ==, &&, etc.)
- `LPAREN`, `RPAREN` ((), {})
- `COMMA`, `SEMICOLON`
- `NEWLINE`, `EOF`

#### Phase 2: Parser (AST Builder)

Convert tokens into a proper Abstract Syntax Tree:

```javascript
class Parser {
    parse(tokens) {
        this.tokens = tokens;
        this.pos = 0;

        const statements = [];
        while (!this.isAtEnd()) {
            statements.push(this.parseStatement());
        }

        return { type: 'Program', statements };
    }

    parseStatement() {
        const token = this.peek();

        switch (token.type) {
            case 'KEYWORD':
                switch (token.value) {
                    case 'set': return this.parseSet();
                    case 'if': return this.parseIf();
                    case 'loop': return this.parseLoop();
                    case 'launch': return this.parseLaunch();
                    // ... etc
                }
            default:
                throw this.error(`Unexpected token: ${token.type}`);
        }
    }

    parseSet() {
        this.expect('KEYWORD', 'set');
        const name = this.expect('IDENTIFIER');
        this.expect('OPERATOR', '=');
        const value = this.parseExpression();

        return {
            type: 'SetStatement',
            name: name.value,
            value
        };
    }

    parseExpression() {
        // Use Pratt parsing or recursive descent for proper operator precedence
        return this.parseLogicalOr();
    }

    parseLogicalOr() {
        let left = this.parseLogicalAnd();

        while (this.match('OPERATOR', '||')) {
            const operator = this.previous();
            const right = this.parseLogicalAnd();
            left = {
                type: 'BinaryExpression',
                operator: operator.value,
                left,
                right
            };
        }

        return left;
    }

    // ... more parsing methods
}
```

**AST Node Types:**
```typescript
type Node =
    | { type: 'Program', statements: Statement[] }
    | Statement

type Statement =
    | { type: 'SetStatement', name: string, value: Expression }
    | { type: 'IfStatement', condition: Expression, then: Statement[], else: Statement[] }
    | { type: 'LoopStatement', count: number, body: Statement[] }
    | { type: 'LaunchStatement', app: string, params: object }
    | { type: 'PrintStatement', message: Expression }
    // ... etc

type Expression =
    | { type: 'BinaryExpression', operator: string, left: Expression, right: Expression }
    | { type: 'UnaryExpression', operator: string, operand: Expression }
    | { type: 'Variable', name: string }
    | { type: 'Literal', value: string | number | boolean }
    | { type: 'CallExpression', callee: string, args: Expression[] }
```

#### Phase 3: Runtime (Interpreter)

Execute the AST with proper scoping:

```javascript
class Runtime {
    constructor() {
        this.globalEnv = new Environment();
        this.registerBuiltins();
    }

    async execute(ast) {
        const env = this.globalEnv;

        for (const stmt of ast.statements) {
            await this.executeStatement(stmt, env);
        }
    }

    async executeStatement(stmt, env) {
        switch (stmt.type) {
            case 'SetStatement':
                const value = await this.evaluateExpression(stmt.value, env);
                env.set(stmt.name, value);
                break;

            case 'IfStatement':
                const condition = await this.evaluateExpression(stmt.condition, env);
                if (this.isTruthy(condition)) {
                    await this.executeBlock(stmt.then, env);
                } else {
                    await this.executeBlock(stmt.else, env);
                }
                break;

            case 'LoopStatement':
                for (let i = 0; i < stmt.count; i++) {
                    const loopEnv = new Environment(env);
                    loopEnv.set('i', i);
                    await this.executeBlock(stmt.body, loopEnv);
                }
                break;

            // ... etc
        }
    }

    async evaluateExpression(expr, env) {
        switch (expr.type) {
            case 'Literal':
                return expr.value;

            case 'Variable':
                return env.get(expr.name);

            case 'BinaryExpression':
                const left = await this.evaluateExpression(expr.left, env);
                const right = await this.evaluateExpression(expr.right, env);
                return this.applyOperator(expr.operator, left, right);

            case 'CallExpression':
                const func = env.get(expr.callee);
                const args = await Promise.all(
                    expr.args.map(arg => this.evaluateExpression(arg, env))
                );
                return await func(...args);

            // ... etc
        }
    }
}

class Environment {
    constructor(parent = null) {
        this.parent = parent;
        this.vars = new Map();
    }

    get(name) {
        if (this.vars.has(name)) {
            return this.vars.get(name);
        }
        if (this.parent) {
            return this.parent.get(name);
        }
        throw new Error(`Undefined variable: ${name}`);
    }

    set(name, value) {
        this.vars.set(name, value);
    }
}
```

**Benefits:**
- ✅ Clean separation of concerns
- ✅ Proper scoping (lexical scope with Environment chain)
- ✅ Easy to test each component independently
- ✅ Can add optimizations (constant folding, etc.)
- ✅ Better error messages with line/column info
- ✅ Can implement source maps
- ✅ Easy to extend with new features

**Downsides:**
- ⚠️ More code upfront (but much cleaner)
- ⚠️ Requires complete rewrite

---

## Comparison Table

| Feature | Current | Option 1: Simplify | Option 2: Proper Rewrite |
|---------|---------|-------------------|-------------------------|
| **Lines of code** | 1,963 | ~400 | ~800 (but modular) |
| **Complexity** | Very High | Low | Medium |
| **Maintainability** | Poor | Good | Excellent |
| **Error messages** | Basic | Good | Excellent |
| **Performance** | Slow | Fast | Fast |
| **Extensibility** | Hard | Medium | Easy |
| **Testing** | Hard | Easy | Very Easy |
| **Debugging** | Poor | Good | Excellent |
| **Language features** | 100% | 30% | 100% (but clean) |
| **Time to implement** | N/A | 1-2 days | 1-2 weeks |
| **Breaking changes** | N/A | Yes | Yes |

---

## Specific Bugs & Issues in Current Implementation

### 1. Tokenizer Issues

**Line 596-597: Escape sequence handling is broken**
```javascript
} else if (char === quoteChar && inQuotes) {
    inQuotes = false;
```

Should be:
```javascript
} else if (char === quoteChar && inQuotes && prevChar !== '\\') {
    inQuotes = false;
```

### 2. Expression Parsing Issues

**Line 668-686: Arithmetic expression detection is fragile**
```javascript
const mathMatch = valueStr.match(/^(.+?)\s*([+\-*/%])\s*(.+)$/);
```

This regex doesn't handle:
- Parentheses: `(a + b) * c`
- Nested expressions: `a + b * c + d`
- Function calls: `abs(-42) + 10`
- Negative numbers: `-42` (partially fixed but still issues)

### 3. Comparison Operator Parsing

**Line 929-942: Operator precedence is wrong**

Currently searches for operators in order: `==`, `!=`, `>=`, `<=`, `>`, `<`

This fails for: `$a > 5 && $b < 10` because `>` might be found before `&&`

Should use proper precedence:
1. Logical OR (`||`)
2. Logical AND (`&&`)
3. Comparison (`==`, `!=`, `>`, `<`, `>=`, `<=`)
4. Arithmetic (`+`, `-`, `*`, `/`)

### 4. Variable Scope Issues

**Line 1345: Scope restoration is broken**
```javascript
this.variables = savedVars;
```

This **replaces** the entire variable map, which means:
- Any global variables set during function execution are lost
- Parent scope modifications are lost
- Memory inefficient

### 5. Type Coercion Bugs

**Line 1500: Empty string coercion**
```javascript
const numLeft = typeof left === 'number' ? left : parseFloat(left) || 0;
```

`parseFloat('') || 0` returns `0`, which means:
- Empty strings become 0 in math
- But this breaks string comparisons

### 6. Loop Variable Issues

**Line 1104: Loop variable overwrites user variables**
```javascript
this.variables.set('i', i);
```

If user has `$i` variable, it gets overwritten by loop counter!

---

## Recommendations

### Immediate Action (Choose One):

#### **OPTION A: Quick Fix (Recommended if time-constrained)**
1. Simplify language to 30% of current features
2. Remove all complex features (functions, try/catch, arrays, objects)
3. Rewrite parser as simple line-based command parser
4. Keep only ~20 essential built-in functions
5. Clear documentation that this is for automation only, not general programming

**Timeline**: 1-2 days
**Risk**: Low (simpler code = fewer bugs)
**Breaking**: Yes, but users can migrate easily

#### **OPTION B: Proper Rewrite (Recommended for long-term)**
1. Design clean architecture (Lexer → Parser → AST → Runtime)
2. Implement proper tokenizer with all token types
3. Build recursive descent parser with proper AST
4. Implement runtime with proper Environment scoping
5. Add 50-70% of current features (drop the rarely used ones)
6. Add comprehensive error messages and debugging

**Timeline**: 1-2 weeks
**Risk**: Medium (more code, but cleaner)
**Breaking**: Yes, but end result is much better

### Do NOT:
- ❌ Try to incrementally fix the current implementation
- ❌ Add more features to the current implementation
- ❌ Attempt to patch the parser without rewriting it
- ❌ Keep all 130+ built-in functions

The current code is beyond salvaging with small fixes.

---

## Next Steps

1. **Decide** which option to pursue (simplify vs. rewrite)
2. **Design** the new syntax (if simplifying) or architecture (if rewriting)
3. **Prototype** the new parser with a subset of features
4. **Test** against existing scripts to identify breaking changes
5. **Migrate** existing scripts to new syntax
6. **Document** the new language thoroughly
7. **Deprecate** the old implementation

---

## Questions to Answer Before Proceeding

1. **What is the primary use case for RetroScript?**
   - Automation of RetrOS tasks?
   - Game/quest scripting?
   - General-purpose programming?

2. **Who are the target users?**
   - Beginners learning to code?
   - Power users automating tasks?
   - Developers building apps?

3. **What's the acceptable complexity level?**
   - Very simple (like shell scripts)?
   - Medium (like Lua/AutoHotkey)?
   - Complex (like JavaScript)?

4. **What's the timeline?**
   - Need something working in days?
   - Can invest weeks for quality?

5. **What's the backwards compatibility requirement?**
   - Must support all existing scripts?
   - Can break scripts if we provide migration guide?
   - Starting fresh is OK?

---

## Conclusion

The current ScriptEngine implementation is **fundamentally broken** and **unmaintainable**. It attempts to be a full programming language but fails due to poor parser architecture, no proper scoping, and over-complexity.

**My recommendation**: **Option 1 (Simplify)** if you need something working quickly, or **Option 2 (Proper Rewrite)** if you have time for a quality solution.

**Do not** attempt to patch the current implementation - it's beyond repair.

I'm ready to help with either option. Let me know which direction you'd like to take!
