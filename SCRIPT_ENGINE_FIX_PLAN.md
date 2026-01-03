# Script Engine Fix Plan - Game-Focused Improvements

## Context

**Purpose**: Script puzzle/mystery games in RetrOS
**Requirements**:
- ✅ Read app states (StateManager integration)
- ✅ Handle all events (EventBus integration)
- ✅ File system access (save games, progress)
- ✅ Event-driven game logic
- ✅ Conditionals and variables (puzzle mechanics)
- ✅ Functions (reusable game logic)

**Constraints**:
- ❌ Cannot break existing functionality
- ❌ Must work within OS architecture (EventBus, StateManager, CommandBus, FileSystemManager)
- ✅ Can simplify/optimize internals as long as API stays compatible

## Strategy: **Internal Refactor + Bug Fixes** (Not Complete Rewrite)

Keep the same language syntax and API, but fix the broken internals.

---

## Phase 1: Critical Bug Fixes (Priority 1)

### 1.1 Fix Tokenizer Escape Handling
**Problem**: Line 596-597 doesn't handle escape sequences properly
```javascript
// Current (broken)
} else if (char === quoteChar && inQuotes) {
    inQuotes = false;

// Fixed
} else if (char === quoteChar && inQuotes && line[i-1] !== '\\') {
    inQuotes = false;
```

**Test case**: `set $msg = "He said \"hello\""`

### 1.2 Fix Expression Parsing
**Problem**: Line 668-686 uses fragile regex that fails on:
- Parentheses: `(a + b) * c`
- Nested expressions: `a + b * c + d`
- Function calls in expressions: `abs(-42) + 10`

**Solution**: Implement proper expression parser with operator precedence

### 1.3 Fix Variable Scoping
**Problem**: Line 1345 replaces entire variable map instead of proper lexical scope
```javascript
// Current (broken)
this.variables = savedVars;  // Loses all changes!

// Fixed - use Environment chain (see implementation below)
```

### 1.4 Fix Type Coercion
**Problem**: Line 1500 - empty strings coerced to 0 inconsistently

**Solution**: Explicit type checking and clear coercion rules

### 1.5 Fix Loop Variable Collision
**Problem**: Line 1104 - `$i` overwrites user variables

**Solution**: Use scoped loop variable

---

## Phase 2: Architecture Improvements (Priority 2)

### 2.1 Proper Environment Scoping
Replace Map copy/restore with proper Environment chain:

```javascript
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
        // Set in current scope
        this.vars.set(name, value);
    }

    update(name, value) {
        // Update in parent scope if exists
        if (this.vars.has(name)) {
            this.vars.set(name, value);
        } else if (this.parent) {
            this.parent.update(name, value);
        } else {
            this.vars.set(name, value);
        }
    }
}
```

### 2.2 Better Expression Parser
Implement recursive descent parser for expressions:

```javascript
_parseExpression(expr) {
    return this._parseLogicalOr(expr);
}

_parseLogicalOr(expr) {
    // Parse: && has higher precedence than ||
    const parts = this._splitByOperator(expr, '||');
    if (parts.length > 1) {
        return {
            type: 'logical',
            operator: '||',
            left: this._parseLogicalAnd(parts[0]),
            right: this._parseLogicalOr(parts.slice(1).join('||'))
        };
    }
    return this._parseLogicalAnd(expr);
}

_parseLogicalAnd(expr) {
    const parts = this._splitByOperator(expr, '&&');
    if (parts.length > 1) {
        return {
            type: 'logical',
            operator: '&&',
            left: this._parseComparison(parts[0]),
            right: this._parseLogicalAnd(parts.slice(1).join('&&'))
        };
    }
    return this._parseComparison(expr);
}

_parseComparison(expr) {
    for (const op of ['==', '!=', '>=', '<=', '>', '<']) {
        const parts = this._splitByOperator(expr, op);
        if (parts.length === 2) {
            return {
                type: 'comparison',
                operator: op,
                left: this._parseArithmetic(parts[0]),
                right: this._parseArithmetic(parts[1])
            };
        }
    }
    return this._parseArithmetic(expr);
}

_parseArithmetic(expr) {
    // Handle +, -, *, /, % with proper precedence
    // Multiplication/division first, then addition/subtraction
    // ...implementation...
}
```

### 2.3 Improved Error Messages
Add line/column tracking and better context:

```javascript
class ScriptError extends Error {
    constructor(message, line, column, context) {
        super(message);
        this.line = line;
        this.column = column;
        this.context = context;
    }

    toString() {
        return `Error: ${this.message}
  at line ${this.line}, column ${this.column}
  ${this.line} | ${this.context}
     |${' '.repeat(this.column)}^`;
    }
}
```

---

## Phase 3: Streamline Built-in Functions (Priority 3)

### Reduce from 130 to ~40 Game-Relevant Functions

**Keep (Game Essential - 40 functions):**

**String Functions (10)**:
- `upper`, `lower`, `trim`, `length`, `concat`
- `split`, `join`, `contains`, `replace`, `substring`

**Array Functions (10)**:
- `count`, `first`, `last`, `push`, `pop`
- `includes`, `at`, `slice`, `join`, `sort`

**Math Functions (8)**:
- `random`, `abs`, `round`, `floor`, `ceil`
- `min`, `max`, `clamp`

**Type Functions (5)**:
- `typeof`, `isNumber`, `isString`, `isArray`, `isNull`

**Time Functions (3)**:
- `now`, `time`, `date`

**Debug Functions (2)**:
- `debug`, `inspect`

**JSON Functions (2)**:
- `toJSON`, `fromJSON`

**Remove (Not Game-Relevant - 90 functions)**:
- Advanced math: `sin`, `cos`, `tan`, `log`, `exp`, `pow`, `sqrt`, `sign`, `PI`, `E`
- Advanced string: `charCode`, `fromCharCode`, `match`, `padStart`, `padEnd`, `repeat`, `replaceAll`
- Advanced array: `shift`, `unshift`, `splice`, `unique`, `flatten`, `range`, `fill`, `find`, `findIndex`, `filter`, `map`, `sum`, `avg`, `every`, `some`, `reverse`
- Object functions: `keys`, `values`, `entries`, `get`, `set`, `has`, `merge`, `clone`
- Extended time: `year`, `month`, `day`, `weekday`, `hour`, `minute`, `second`, `formatDate`, `formatTime`, `elapsed`
- Type conversions: `toNumber`, `toInt`, `toString`, `toBoolean`, `toArray`
- Advanced type checks: `isObject`, `isBoolean`, `isEmpty`

---

## Phase 4: Game-Specific Enhancements (Priority 4)

### 4.1 Game State Helpers
Add game-specific built-in functions:

```javascript
// Get app state by ID
this.defineFunction('getAppState', (appId) => {
    const windows = StateManager.getState('windows') || [];
    const window = windows.find(w => w.appId === appId);
    return window?.appState || null;
});

// Set app state
this.defineFunction('setAppState', async (appId, state) => {
    await CommandBus.execute('app:state:set', { appId, state });
    return true;
});

// Query system state
this.defineFunction('getState', (key) => {
    return StateManager.getState(key);
});

// Save game state to file
this.defineFunction('saveGame', (filename, data) => {
    const path = ['C:', 'Games', 'Saves', filename];
    FileSystemManager.writeFile(path, JSON.stringify(data));
    return true;
});

// Load game state from file
this.defineFunction('loadGame', (filename) => {
    const path = ['C:', 'Games', 'Saves', filename];
    try {
        const content = FileSystemManager.readFile(path);
        return JSON.parse(content);
    } catch (e) {
        return null;
    }
});
```

### 4.2 Event Wildcards for Games
Games need to listen to multiple events:

```javascript
// Listen to all window events
on window:* {
    print Window event: $event
}

// Listen to all app events for specific app
on app:notepad:* {
    print Notepad event: $event
}
```

This already works with EventBus wildcards!

---

## Implementation Plan

### Week 1: Critical Fixes
- ✅ **Day 1-2**: Fix tokenizer escape handling (1.1)
- ✅ **Day 2-3**: Implement proper expression parser (1.2)
- ✅ **Day 3-4**: Implement Environment scoping (1.3, 2.1)
- ✅ **Day 4-5**: Fix type coercion and loop variables (1.4, 1.5)

### Week 2: Testing & Cleanup
- ✅ **Day 1-2**: Run comprehensive test suite, fix failures
- ✅ **Day 3**: Streamline built-in functions (remove 90, keep 40)
- ✅ **Day 4**: Add game-specific helpers
- ✅ **Day 5**: Improve error messages
- ✅ **Day 6-7**: Write game scripting examples and documentation

---

## Testing Strategy

### 1. Keep Existing Test Suite
The comprehensive test suite in ScriptRunner.js (v3.0) covers:
- Variables and data types (9 tests)
- Arithmetic operations (7 tests)
- Comparison operators (6 tests)
- Logical operators (3 tests)
- Control flow (4 tests)
- Loops (7 tests)
- Functions (4 tests)
- String/array/object functions (25 tests)
- Error handling (2 tests)
- File system (3 tests)
- System integration (3 tests)
- Events (3 tests)

**All tests must pass after refactor!**

### 2. Add Edge Case Tests
```retroscript
# Test escape sequences
set $msg = "He said \"hello\""
set $path = "C:\\Users\\Game"

# Test nested expressions
set $result = (5 + 3) * 2
set $complex = ($a > 5) && ($b < 10 || $c == 0)

# Test function calls in expressions
set $val = call abs (-42) + 10

# Test scope preservation
def outer() {
    set $x = 10
    def inner() {
        set $y = $x + 5
        return $y
    }
    return call inner
}
set $result = call outer
# $result should be 15, $x and $y should not exist outside
```

### 3. Game Scenario Tests
```retroscript
# Puzzle game example
set $puzzleSolved = false
set $attempts = 0

on window:open {
    if $event.appId == "puzzle" then {
        print Puzzle started!
    }
}

def checkSolution($answer) {
    set $attempts = $attempts + 1

    if $answer == "CIPHER" then {
        set $puzzleSolved = true
        emit achievement:unlock name="Puzzle Master"
        call saveGame "puzzle1.save" {progress: 100, solved: true}
        return true
    } else {
        print Wrong answer. Attempts: $attempts
        return false
    }
}
```

---

## API Compatibility Checklist

All existing functionality must continue to work:

- ✅ `launch app with params`
- ✅ `close`, `wait`, `print`
- ✅ `set $var = value`
- ✅ `if condition then { } else { }`
- ✅ `loop count { }`, `loop while condition { }`
- ✅ `foreach $item in $array { }`
- ✅ `def funcName($args) { }`, `call funcName args`
- ✅ `on event { }`, `emit event`
- ✅ `try { } catch $err { }`
- ✅ `alert`, `confirm`, `prompt`
- ✅ `read`, `write`, `mkdir`, `delete`
- ✅ `break`, `continue`, `return`
- ✅ Array literals: `[1, 2, 3]`
- ✅ Object literals: `{key: value}`
- ✅ String interpolation: `"Hello $name"`
- ✅ All built-in functions (reduced to 40 game-relevant ones)

---

## Success Criteria

1. ✅ All existing tests pass (100% pass rate)
2. ✅ New edge case tests pass
3. ✅ Game scenario examples work
4. ✅ No breaking changes to API
5. ✅ Better error messages with line/column info
6. ✅ Proper variable scoping (no global pollution)
7. ✅ ~40 game-relevant built-in functions (down from 130)
8. ✅ Expression parsing handles nested operators
9. ✅ Type coercion is consistent
10. ✅ Code is more maintainable (separated concerns)

---

## Risk Mitigation

**Risk**: Breaking existing scripts
**Mitigation**: Comprehensive test suite + no API changes

**Risk**: Performance regression
**Mitigation**: Benchmark before/after with large scripts

**Risk**: New bugs introduced
**Mitigation**: Incremental changes, test after each phase

**Risk**: Scope creep
**Mitigation**: Focus on bug fixes, not new features

---

## Next Steps

1. **Get approval** on this plan
2. **Start Phase 1** - Critical bug fixes
3. **Run tests continuously** - ensure no regressions
4. **Iterate** - fix issues as they arise
5. **Document** - update SCRIPTING_GUIDE.md with game examples
6. **Deploy** - merge when all tests pass

---

## Notes

- This is **NOT a rewrite** - it's internal refactoring
- All existing scripts should continue to work
- Focus is on **reliability for game scripting**
- Simplified from 130 to 40 functions (game-relevant only)
- Better error messages for debugging games
- Proper scoping for complex game logic
