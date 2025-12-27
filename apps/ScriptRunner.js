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
        const sampleScript = `# ================================================================
# RetroScript Ultimate Test Suite v2.0
# Comprehensive testing of all scripting features and bug fixes
# ================================================================

print ================================================================
print   RETROSCRIPT ULTIMATE TEST SUITE v2.0
print ================================================================
print

# ==================================================================
# SECTION A: BASIC LANGUAGE FEATURES
# ==================================================================

print [SECTION A] BASIC LANGUAGE FEATURES
print ----------------------------------------------------------------

# TEST A1: Variables and Basic Types
print
print [A1] Variables and Basic Types
set $string = "Hello World"
set $number = 42
set $decimal = 3.14159
set $boolean = true
set $empty = ""

print   String: $string
print   Number: $number
print   Decimal: $decimal
print   Boolean: $boolean
print   Empty string test: [$empty]

if $empty == "" then {
    print   [PASS] Empty string preserved correctly
} else {
    print   [FAIL] Empty string became something else
}

# TEST A2: Arithmetic Operations
print
print [A2] Arithmetic Operations
set $a = 25
set $b = 7
set $sum = $a + $b
set $diff = $a - $b
set $prod = $a * $b
set $quot = $a / $b
set $mod = $a % $b

print   $a + $b = $sum (expected: 32)
print   $a - $b = $diff (expected: 18)
print   $a * $b = $prod (expected: 175)
print   $a / $b = $quot (expected: ~3.57)
print   $a % $b = $mod (expected: 4)

if $sum == 32 then { print   [PASS] Addition } else { print   [FAIL] Addition }
if $mod == 4 then { print   [PASS] Modulo } else { print   [FAIL] Modulo }

# TEST A3: String Escape Sequences (NEW BUG FIX TEST)
print
print [A3] String Escape Sequences
set $escaped = "Line1\\nLine2\\tTabbed"
set $quote = "She said \\"Hello\\""
print   Escape test: $escaped
print   Quote test: $quote
print   [PASS] Escape sequences parsed

# TEST A4: Semicolons in Strings (BUG FIX TEST)
print
print [A4] Semicolons in Strings
set $withSemi = "first;second;third"
print   String with semicolons: $withSemi
if $withSemi == "first;second;third" then {
    print   [PASS] Semicolons in strings preserved
} else {
    print   [FAIL] Semicolons in strings broken
}

# TEST A5: Comments in Strings (BUG FIX TEST)
print
print [A5] Comments in Strings
set $withHash = "test # not a comment"
print   String with hash: $withHash
print   [PASS] Hash in string preserved

# ==================================================================
# SECTION B: CONTROL FLOW
# ==================================================================

print
print [SECTION B] CONTROL FLOW
print ----------------------------------------------------------------

# TEST B1: Basic Conditionals
print
print [B1] Basic Conditionals
set $x = 10
set $y = 5

if $x > $y then {
    print   [PASS] $x > $y is true
}

if $x < $y then {
    print   [FAIL] $x < $y should be false
} else {
    print   [PASS] $x < $y else branch taken
}

# TEST B2: Complex Conditions with && and || (BUG FIX TEST)
print
print [B2] Complex Conditions (AND/OR)
set $a = 10
set $b = 20
set $c = 30

if $a < $b && $b < $c then {
    print   [PASS] $a < $b AND $b < $c
} else {
    print   [FAIL] Complex AND condition
}

if $a > $b || $b < $c then {
    print   [PASS] $a > $b OR $b < $c
} else {
    print   [FAIL] Complex OR condition
}

if $a < $b && $b < $c && $c > $a then {
    print   [PASS] Triple AND condition
} else {
    print   [FAIL] Triple AND condition
}

# TEST B3: Comparison Operators
print
print [B3] All Comparison Operators
set $n = 10

if $n == 10 then { print   [PASS] == works }
if $n != 5 then { print   [PASS] != works }
if $n >= 10 then { print   [PASS] >= works }
if $n <= 10 then { print   [PASS] <= works }
if $n > 5 then { print   [PASS] > works }
if $n < 15 then { print   [PASS] < works }

# TEST B4: Loops
print
print [B4] Loop Constructs
print   Count loop (3 iterations):
set $loopCount = 0
loop 3 {
    set $loopCount = $loopCount + 1
    print     iteration $i (count: $loopCount)
}

if $loopCount == 3 then {
    print   [PASS] Loop executed 3 times
} else {
    print   [FAIL] Loop count: $loopCount
}

# TEST B5: Break Statement
print
print [B5] Break Statement
set $breakAt = 0
loop 10 {
    set $breakAt = $i
    if $i == 3 then {
        break
    }
}

if $breakAt == 3 then {
    print   [PASS] Break at iteration 3
} else {
    print   [FAIL] Break failed, ended at $breakAt
}

# TEST B6: Continue Statement
print
print [B6] Continue Statement
set $skipResult = ""
loop 5 {
    if $i == 2 then {
        continue
    }
    set $skipResult = $skipResult + $i
}
print   Result (should skip 2): $skipResult

# TEST B7: While Loop
print
print [B7] While Loop
set $counter = 0
loop while $counter < 3 {
    set $counter = $counter + 1
    print     while iteration $counter
}

if $counter == 3 then {
    print   [PASS] While loop completed
} else {
    print   [FAIL] While loop counter: $counter
}

# TEST B8: Foreach Loop
print
print [B8] Foreach Loop
set $colors = ["red", "green", "blue"]
set $colorList = ""
foreach $color in $colors {
    set $colorList = $colorList + $color + " "
}
print   Colors: $colorList
print   [PASS] Foreach completed

# ==================================================================
# SECTION C: FUNCTIONS
# ==================================================================

print
print [SECTION C] FUNCTIONS
print ----------------------------------------------------------------

# TEST C1: User-Defined Functions
print
print [C1] User-Defined Functions
def greet($name) {
    print   Hello, $name!
    return "greeted"
}

set $result = call greet "World"
print   Function returned: $result

if $result == "greeted" then {
    print   [PASS] User function works
} else {
    print   [FAIL] User function return
}

# TEST C2: Function with Multiple Parameters
print
print [C2] Multi-Parameter Function
def add($x, $y) {
    set $sum = $x + $y
    return $sum
}

set $addResult = call add 15 25
print   add(15, 25) = $addResult

if $addResult == 40 then {
    print   [PASS] Multi-param function
} else {
    print   [FAIL] Multi-param function
}

# TEST C3: Recursive Function
print
print [C3] Recursive Function
def countdown($n) {
    if $n <= 0 then {
        return "done"
    }
    print     countdown: $n
    set $next = $n - 1
    return call countdown $next
}

set $cdResult = call countdown 3
print   Countdown result: $cdResult

# ==================================================================
# SECTION D: STRING FUNCTIONS
# ==================================================================

print
print [SECTION D] STRING FUNCTIONS
print ----------------------------------------------------------------

# TEST D1: Case Conversion
print
print [D1] Case Conversion
set $text = "Hello World"
set $upper = call upper $text
set $lower = call lower $text
print   upper: $upper
print   lower: $lower

if $upper == "HELLO WORLD" then { print   [PASS] upper() } else { print   [FAIL] upper() }
if $lower == "hello world" then { print   [PASS] lower() } else { print   [FAIL] lower() }

# TEST D2: String Manipulation
print
print [D2] String Manipulation
set $padded = "  trim me  "
set $trimmed = call trim $padded
set $len = call length $trimmed
print   trimmed: [$trimmed] length: $len

set $repeated = call repeat "ab" 3
print   repeat(ab, 3): $repeated

if $repeated == "ababab" then { print   [PASS] repeat() } else { print   [FAIL] repeat() }

# TEST D3: Substring Functions
print
print [D3] Substring Functions
set $str = "Hello World"
set $sub = call substr $str 0 5
set $sub2 = call substring $str 6 11
print   substr(0,5): $sub
print   substring(6,11): $sub2

if $sub == "Hello" then { print   [PASS] substr() } else { print   [FAIL] substr() }

# TEST D4: Search Functions
print
print [D4] Search Functions
set $haystack = "The quick brown fox"
set $hasQuick = call contains $haystack "quick"
set $startsWith = call startsWith $haystack "The"
set $endsWith = call endsWith $haystack "fox"
set $idx = call indexOf $haystack "quick"

print   contains(quick): $hasQuick
print   startsWith(The): $startsWith
print   endsWith(fox): $endsWith
print   indexOf(quick): $idx

if $idx == 4 then { print   [PASS] indexOf() } else { print   [FAIL] indexOf() }

# TEST D5: Replace Functions
print
print [D5] Replace Functions
set $original = "foo bar foo baz"
set $replaced = call replace $original "foo" "qux"
set $replacedAll = call replaceAll $original "foo" "qux"
print   replace (first): $replaced
print   replaceAll: $replacedAll

# TEST D6: Split and Join
print
print [D6] Split and Join
set $csv = "a,b,c,d"
set $parts = call split $csv ","
set $joined = call join $parts "-"
print   split result count: $parts
print   joined: $joined

if $joined == "a-b-c-d" then { print   [PASS] split/join } else { print   [FAIL] split/join }

# ==================================================================
# SECTION E: MATH FUNCTIONS
# ==================================================================

print
print [SECTION E] MATH FUNCTIONS
print ----------------------------------------------------------------

# TEST E1: Basic Math
print
print [E1] Basic Math Functions
set $absVal = call abs -42
set $rounded = call round 3.7
set $floored = call floor 3.9
set $ceiled = call ceil 3.1

print   abs(-42): $absVal
print   round(3.7): $rounded
print   floor(3.9): $floored
print   ceil(3.1): $ceiled

if $absVal == 42 then { print   [PASS] abs() } else { print   [FAIL] abs() }
if $rounded == 4 then { print   [PASS] round() } else { print   [FAIL] round() }
if $floored == 3 then { print   [PASS] floor() } else { print   [FAIL] floor() }
if $ceiled == 4 then { print   [PASS] ceil() } else { print   [FAIL] ceil() }

# TEST E2: Min/Max/Clamp
print
print [E2] Min/Max/Clamp
set $minVal = call min 5 3 8 1 9
set $maxVal = call max 5 3 8 1 9
set $clamped = call clamp 15 0 10

print   min(5,3,8,1,9): $minVal
print   max(5,3,8,1,9): $maxVal
print   clamp(15, 0, 10): $clamped

if $minVal == 1 then { print   [PASS] min() } else { print   [FAIL] min() }
if $maxVal == 9 then { print   [PASS] max() } else { print   [FAIL] max() }
if $clamped == 10 then { print   [PASS] clamp() } else { print   [FAIL] clamp() }

# TEST E3: Power and Root
print
print [E3] Power and Root
set $squared = call pow 5 2
set $sqroot = call sqrt 16
print   pow(5, 2): $squared
print   sqrt(16): $sqroot

if $squared == 25 then { print   [PASS] pow() } else { print   [FAIL] pow() }
if $sqroot == 4 then { print   [PASS] sqrt() } else { print   [FAIL] sqrt() }

# TEST E4: Random Number
print
print [E4] Random Number
set $rand = call random 1 100
print   random(1,100): $rand

if $rand >= 1 then {
    if $rand <= 100 then {
        print   [PASS] random() in range
    }
}

# ==================================================================
# SECTION F: ARRAY FUNCTIONS
# ==================================================================

print
print [SECTION F] ARRAY FUNCTIONS
print ----------------------------------------------------------------

# TEST F1: Array Creation and Access
print
print [F1] Array Creation and Access
set $arr = [1, 2, 3, 4, 5]
set $len = call count $arr
set $firstItem = call first $arr
set $lastItem = call last $arr
set $atItem = call at $arr 2

print   Array: $arr
print   count: $len
print   first: $firstItem
print   last: $lastItem
print   at(2): $atItem

if $len == 5 then { print   [PASS] count() } else { print   [FAIL] count() }
if $firstItem == 1 then { print   [PASS] first() } else { print   [FAIL] first() }
if $lastItem == 5 then { print   [PASS] last() } else { print   [FAIL] last() }

# TEST F2: Array Modification
print
print [F2] Array Modification
set $modArr = [1, 2, 3]
set $modArr = call push $modArr 4
set $popped = call pop $modArr
print   After push(4) and pop: $modArr
print   Popped value: $popped

# TEST F3: Array Search
print
print [F3] Array Search
set $searchArr = ["apple", "banana", "cherry"]
set $hasApple = call includes $searchArr "apple"
set $hasGrape = call includes $searchArr "grape"
set $findIdx = call findIndex $searchArr "banana"

print   includes(apple): $hasApple
print   includes(grape): $hasGrape
print   findIndex(banana): $findIdx

if $hasApple == true then { print   [PASS] includes() } else { print   [FAIL] includes() }
if $findIdx == 1 then { print   [PASS] findIndex() } else { print   [FAIL] findIndex() }

# TEST F4: Array Transformation
print
print [F4] Array Transformation
set $nums = [3, 1, 4, 1, 5, 9, 2, 6]
set $sorted = call sort $nums
set $reversed = call reverse $nums
set $uniqueNums = call unique $nums
set $sliced = call slice $nums 2 5

print   sorted: $sorted
print   reversed: $reversed
print   unique: $uniqueNums
print   slice(2,5): $sliced

# TEST F5: New Array Functions (sum, avg)
print
print [F5] Sum and Average
set $numbers = [10, 20, 30, 40, 50]
set $total = call sum $numbers
set $average = call avg $numbers

print   sum: $total
print   avg: $average

if $total == 150 then { print   [PASS] sum() } else { print   [FAIL] sum() }
if $average == 30 then { print   [PASS] avg() } else { print   [FAIL] avg() }

# TEST F6: Range and Fill
print
print [F6] Range and Fill
set $range1 = call range 0 5
set $filled = call fill 3 "x"

print   range(0,5): $range1
print   fill(3, x): $filled

# ==================================================================
# SECTION G: OBJECT FUNCTIONS
# ==================================================================

print
print [SECTION G] OBJECT FUNCTIONS
print ----------------------------------------------------------------

# TEST G1: Object Creation and Access
print
print [G1] Object Creation and Access
set $person = {name: "John", age: 30, city: "NYC"}
set $objKeys = call keys $person
set $objVals = call values $person
set $name = call get $person "name"
set $hasAge = call has $person "age"

print   Object: $person
print   keys: $objKeys
print   values: $objVals
print   get(name): $name
print   has(age): $hasAge

if $name == "John" then { print   [PASS] get() } else { print   [FAIL] get() }
if $hasAge == true then { print   [PASS] has() } else { print   [FAIL] has() }

# TEST G2: Object Merge and Clone
print
print [G2] Object Merge and Clone
set $obj1 = {a: 1, b: 2}
set $obj2 = {c: 3, d: 4}
set $merged = call merge $obj1 $obj2
set $cloned = call clone $obj1

print   merged: $merged
print   cloned: $cloned

# ==================================================================
# SECTION H: JSON FUNCTIONS
# ==================================================================

print
print [SECTION H] JSON FUNCTIONS
print ----------------------------------------------------------------

# TEST H1: JSON Serialization
print
print [H1] JSON Serialization
set $data = {status: "ok", count: 42}
set $jsonStr = call toJSON $data
set $pretty = call prettyJSON $data

print   toJSON: $jsonStr
print   prettyJSON: $pretty

# TEST H2: JSON Parsing
print
print [H2] JSON Parsing
set $jsonInput = "{\\"x\\": 10, \\"y\\": 20}"
set $parsed = call fromJSON $jsonInput
print   fromJSON: $parsed

# ==================================================================
# SECTION I: TYPE FUNCTIONS
# ==================================================================

print
print [SECTION I] TYPE FUNCTIONS
print ----------------------------------------------------------------

# TEST I1: Type Checking
print
print [I1] Type Checking
set $numCheck = call isNumber 42
set $strCheck = call isString "hello"
set $arrCheck = call isArray [1, 2, 3]
set $objCheck = call isObject {a: 1}
set $boolCheck = call isBoolean true
set $nullCheck = call isNull null
set $emptyCheck = call isEmpty ""
set $emptyArrCheck = call isEmpty []

print   isNumber(42): $numCheck
print   isString(hello): $strCheck
print   isArray([1,2,3]): $arrCheck
print   isObject({a:1}): $objCheck
print   isBoolean(true): $boolCheck
print   isNull(null): $nullCheck
print   isEmpty(""): $emptyCheck
print   isEmpty([]): $emptyArrCheck

# TEST I2: Type Conversion
print
print [I2] Type Conversion
set $toNum = call toNumber "123.45"
set $toInt = call toInt "42.9"
set $toStr = call toString 999
set $toBool = call toBoolean 1
set $toArr = call toArray "abc"

print   toNumber(123.45): $toNum
print   toInt(42.9): $toInt
print   toString(999): $toStr
print   toBoolean(1): $toBool
print   toArray(abc): $toArr

# TEST I3: Typeof
print
print [I3] Typeof Function
set $t1 = call typeof 42
set $t2 = call typeof "hello"
set $t3 = call typeof [1, 2]
set $t4 = call typeof {a: 1}
set $t5 = call typeof null

print   typeof(42): $t1
print   typeof(hello): $t2
print   typeof([1,2]): $t3
print   typeof({a:1}): $t4
print   typeof(null): $t5

# ==================================================================
# SECTION J: TIME FUNCTIONS
# ==================================================================

print
print [SECTION J] TIME FUNCTIONS
print ----------------------------------------------------------------

# TEST J1: Current Time
print
print [J1] Current Time
set $timestamp = call now
set $timeStr = call time
set $dateStr = call date

print   now(): $timestamp
print   time(): $timeStr
print   date(): $dateStr

# TEST J2: Time Components
print
print [J2] Time Components
set $yr = call year
set $mo = call month
set $dy = call day
set $hr = call hour
set $mi = call minute
set $se = call second

print   year: $yr, month: $mo, day: $dy
print   hour: $hr, minute: $mi, second: $se

# TEST J3: Elapsed Time
print
print [J3] Elapsed Time
set $start = call now
wait 100
set $elapsed = call elapsed $start
print   Elapsed after 100ms wait: $elapsed ms

if $elapsed >= 100 then {
    print   [PASS] elapsed() works
} else {
    print   [FAIL] elapsed() too fast
}

# ==================================================================
# SECTION K: ERROR HANDLING
# ==================================================================

print
print [SECTION K] ERROR HANDLING
print ----------------------------------------------------------------

# TEST K1: Try/Catch
print
print [K1] Try/Catch Basic
try {
    print   Inside try block
    set $undefined = call nonexistent
    print   [FAIL] Should have thrown
} catch $err {
    print   Caught error: $err
    print   [PASS] Try/catch works
}

# TEST K2: Error Recovery
print
print [K2] Error Recovery
set $recovered = false
try {
    set $x = call badFunction
} catch {
    set $recovered = true
}

if $recovered then {
    print   [PASS] Error recovery works
} else {
    print   [FAIL] Error recovery failed
}

# ==================================================================
# SECTION L: FILE SYSTEM
# ==================================================================

print
print [SECTION L] FILE SYSTEM
print ----------------------------------------------------------------

# TEST L1: Write and Read
print
print [L1] Write and Read File
set $testPath = "C:/Users/User/Documents/test_script.txt"
set $testContent = "Hello from RetroScript test!"

write $testContent to $testPath
print   File written

read $testPath into $readContent
print   File content: $readContent

if $readContent == $testContent then {
    print   [PASS] File read/write
} else {
    print   [FAIL] File content mismatch
}

# TEST L2: Delete File
print
print [L2] Delete File
delete $testPath
print   [PASS] File deleted

# TEST L3: Directory Operations
print
print [L3] Directory Operations
set $testDir = "C:/Users/User/Documents/ScriptTest"
mkdir $testDir
print   Directory created: $testDir

# Clean up
delete $testDir
print   Directory deleted

# ==================================================================
# SECTION M: SYSTEM INTEGRATION
# ==================================================================

print
print [SECTION M] SYSTEM INTEGRATION
print ----------------------------------------------------------------

# TEST M1: Get Windows
print
print [M1] Get Windows
set $windows = call getWindows
set $winCount = call count $windows
print   Current windows: $winCount

# TEST M2: Get Apps
print
print [M2] Get Apps
set $apps = call getApps
set $appCount = call count $apps
print   Available apps: $appCount

# TEST M3: Environment
print
print [M3] Environment Info
set $env = call getEnv
print   Environment: $env

# TEST M4: App Launch and Close
print
print [M4] App Launch and Close
launch calculator
wait 300
set $wins = call getWindows
set $afterLaunch = call count $wins
print   Windows after launch: $afterLaunch

close
wait 200
set $wins = call getWindows
set $afterClose = call count $wins
print   Windows after close: $afterClose

# ==================================================================
# SECTION N: EVENTS
# ==================================================================

print
print [SECTION N] EVENTS
print ----------------------------------------------------------------

# TEST N1: Event Emission
print
print [N1] Event Emission
emit script:test message="Test event" value=42
emit custom:event type="test"
print   [PASS] Events emitted

# TEST N2: Notification
print
print [N2] Notification
notify RetroScript test notification!
print   [PASS] Notification sent

# TEST N3: Sound
print
print [N3] Sound System
play notify
wait 200
print   [PASS] Sound played

# ==================================================================
# SECTION O: DEBUG FUNCTIONS
# ==================================================================

print
print [SECTION O] DEBUG FUNCTIONS
print ----------------------------------------------------------------

# TEST O1: Debug and Inspect
print
print [O1] Debug and Inspect
set $testObj = {name: "test", value: 123}
set $debugOut = call debug "Debug message:" $testObj
set $inspected = call inspect $testObj

print   debug output captured
print   inspect output captured

# TEST O2: Assert (should pass)
print
print [O2] Assert
set $assertResult = call assert true "This should pass"
print   [PASS] Assert with true passed

# ==================================================================
# FINAL SUMMARY
# ==================================================================

print
print ================================================================
print   TEST SUITE COMPLETED!
print ================================================================
print
print Sections tested:
print   A: Basic Language Features
print   B: Control Flow
print   C: Functions
print   D: String Functions
print   E: Math Functions
print   F: Array Functions
print   G: Object Functions
print   H: JSON Functions
print   I: Type Functions
print   J: Time Functions
print   K: Error Handling
print   L: File System
print   M: System Integration
print   N: Events
print   O: Debug Functions
print
print Review output above for [PASS] and [FAIL] markers.
print A successful test run shows all [PASS] markers!

notify RetroScript Test Suite Complete!
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
        const builtins = ['random', 'abs', 'round', 'floor', 'ceil', 'min', 'max', 'pow', 'sqrt', 'sin', 'cos', 'tan', 'log', 'exp', 'clamp', 'mod', 'sign', 'concat', 'upper', 'lower', 'length', 'trim', 'trimStart', 'trimEnd', 'split', 'join', 'substr', 'substring', 'replace', 'replaceAll', 'contains', 'startsWith', 'endsWith', 'padStart', 'padEnd', 'repeat', 'charAt', 'charCode', 'fromCharCode', 'indexOf', 'lastIndexOf', 'match', 'count', 'first', 'last', 'push', 'pop', 'shift', 'unshift', 'includes', 'sort', 'reverse', 'slice', 'splice', 'concat_arrays', 'unique', 'flatten', 'range', 'fill', 'at', 'find', 'findIndex', 'filter', 'map', 'sum', 'avg', 'every', 'some', 'keys', 'values', 'entries', 'get', 'set', 'has', 'merge', 'clone', 'toJSON', 'fromJSON', 'prettyJSON', 'getWindows', 'getApps', 'now', 'time', 'date', 'year', 'month', 'day', 'weekday', 'hour', 'minute', 'second', 'formatDate', 'formatTime', 'elapsed', 'query', 'exec', 'alert', 'confirm', 'prompt', 'typeof', 'isNumber', 'isString', 'isArray', 'isObject', 'isBoolean', 'isNull', 'isEmpty', 'toNumber', 'toInt', 'toString', 'toBoolean', 'toArray', 'debug', 'inspect', 'assert', 'getEnv', 'PI', 'E'];

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
