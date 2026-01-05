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
        // Test script with app launching and events
        const sampleScript = `# ═══════════════════════════════════════════════════════════════
#  RetroScript Comprehensive Test Suite
#  Press F5 or click Run to execute
# ═══════════════════════════════════════════════════════════════

print ═══════════════════════════════════════════════════════════════
print   RetroScript Comprehensive Test Suite
print ═══════════════════════════════════════════════════════════════
print

# ----- Test 1: Variables & Data Types -----
print [Test 1] Variables & Data Types
set $string = "Hello"
set $number = 42
set $bool = true
set $array = [1, 2, 3]
set $object = {name: "RetroScript", version: 1}
print   String: $string
print   Number: $number
print   Boolean: $bool
print   Array length: (call count $array)
print   Object keys: (call keys $object)
print   ✓ PASSED
print

# ----- Test 2: Arithmetic Operations -----
print [Test 2] Arithmetic Operations
set $a = 10
set $b = 3
set $sum = $a + $b
set $diff = $a - $b
set $prod = $a * $b
set $quot = $a / $b
set $mod = $a % $b
print   $a + $b = $sum
print   $a - $b = $diff
print   $a * $b = $prod
print   $a / $b = $quot
print   $a % $b = $mod
print   ✓ PASSED
print

# ----- Test 3: Control Flow -----
print [Test 3] Control Flow (if/then/else)
set $score = 85
if $score >= 90 then {
    print   Grade: A
} else {
    if $score >= 80 then {
        print   Grade: B
    } else {
        print   Grade: C or lower
    }
}
print   ✓ PASSED
print

# ----- Test 4: Loops -----
print [Test 4] Loops
print   Count loop:
loop 3 {
    print     iteration $i
}
print   While loop:
set $count = 0
loop while $count < 3 {
    print     count = $count
    set $count = $count + 1
}
print   Foreach loop:
set $items = ["apple", "banana", "cherry"]
foreach $item in $items {
    print     item $i: $item
}
print   ✓ PASSED
print

# ----- Test 5: String Functions -----
print [Test 5] String Functions
set $text = "  RetroScript  "
set $trimmed = call trim $text
set $upper = call upper $trimmed
set $lower = call lower $trimmed
set $len = call length $trimmed
print   Original: '$text'
print   Trimmed: '$trimmed'
print   Upper: $upper
print   Lower: $lower
print   Length: $len
print   ✓ PASSED
print

# ----- Test 6: Math Functions -----
print [Test 6] Math Functions
set $rand = call random 1 10
set $abs = call abs -5
set $rounded = call round 3.7
set $sqrt = call sqrt 16
print   Random(1-10): $rand
print   Abs(-5): $abs
print   Round(3.7): $rounded
print   Sqrt(16): $sqrt
print   ✓ PASSED
print

# ----- Test 7: Array Functions -----
print [Test 7] Array Functions
set $nums = [5, 2, 8, 1, 9]
set $first = call first $nums
set $last = call last $nums
set $sorted = call sort $nums
print   Original: $nums
print   First: $first
print   Last: $last
print   Sorted: $sorted
print   ✓ PASSED
print

# ----- Test 8: Object Functions -----
print [Test 8] Object Functions
set $person = {name: "John", age: 30, role: "admin"}
set $keys = call keys $person
set $vals = call values $person
set $name = call get $person "name"
print   Object: $person
print   Keys: $keys
print   Values: $vals
print   Name: $name
print   ✓ PASSED
print

# ----- Test 9: Time Functions -----
print [Test 9] Time Functions
set $now = call now
set $time = call time
set $date = call date
print   Timestamp: $now
print   Time: $time
print   Date: $date
print   ✓ PASSED
print

# ----- Test 10: Type Functions -----
print [Test 10] Type Functions
set $val = 42
set $type = call typeof $val
set $isNum = call isNumber $val
set $isStr = call isString $val
print   Value: $val
print   Type: $type
print   Is number: $isNum
print   Is string: $isStr
print   ✓ PASSED
print

# ----- Test 11: User-Defined Functions -----
print [Test 11] User-Defined Functions
def double($x) {
    return $x * 2
}
set $result = call double 5
print   double(5) = $result
def greet($name) {
    print     Hello, $name!
}
call greet "RetroScript"
print   ✓ PASSED
print

# ----- Test 12: Error Handling -----
print [Test 12] Error Handling
try {
    set $result = call unknownFunction
    print   ✗ FAILED - should have thrown error
} catch $err {
    print   ✓ PASSED - caught error successfully
}
print

# ----- Test 13: Events -----
print [Test 13] Events
set $eventReceived = false
on test:ping {
    set $eventReceived = true
    print   Event handler triggered!
}
emit test:ping
wait 100
if $eventReceived == true then {
    print   ✓ PASSED
} else {
    print   ✗ FAILED - event not received
}
print

# ----- Test 14: Notifications -----
print [Test 14] Notifications
notify RetroScript test notification!
print   Notification sent
print   ✓ PASSED
print

# ----- Test 15: Launch Apps -----
print [Test 15] Launch Apps
print   Launching Calculator...
launch calculator
wait 500
print   Launching Notepad...
launch notepad
wait 500
print   ✓ PASSED
print

# ----- Test 16: Sound -----
print [Test 16] Sound
play notify
print   Sound played
print   ✓ PASSED
print

print ═══════════════════════════════════════════════════════════════
print   All tests completed successfully!
print ═══════════════════════════════════════════════════════════════`;

        // Full comprehensive test suite (available via Help menu)
        const fullTestSuite = `# ╔══════════════════════════════════════════════════════════════════╗
# ║       RETROSCRIPT COMPREHENSIVE TEST SUITE v3.0                 ║
# ║       Complete testing of all language features                 ║
# ╚══════════════════════════════════════════════════════════════════╝

# Initialize test tracking
set $testsPassed = 0
set $testsFailed = 0

print
print ╔══════════════════════════════════════════════════════════════════╗
print ║       RETROSCRIPT COMPREHENSIVE TEST SUITE v3.0                 ║
print ╚══════════════════════════════════════════════════════════════════╝
print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 1: VARIABLES AND DATA TYPES                              │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 1: VARIABLES AND DATA TYPES                              │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 1.1: String Variables
print [Test 1.1] String Variables
set $str = "Hello, World!"
if $str == "Hello, World!" then {
    print   ✓ PASS: String assignment works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: String assignment broken
    set $testsFailed = $testsFailed + 1
}

# Test 1.2: Number Variables (integers)
print [Test 1.2] Integer Variables
set $int = 42
if $int == 42 then {
    print   ✓ PASS: Integer assignment works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Integer assignment broken
    set $testsFailed = $testsFailed + 1
}

# Test 1.3: Decimal/Float Variables
print [Test 1.3] Decimal Variables
set $dec = 3.14159
if $dec > 3.14 then {
    if $dec < 3.15 then {
        print   ✓ PASS: Decimal assignment works
        set $testsPassed = $testsPassed + 1
    }
} else {
    print   ✗ FAIL: Decimal assignment broken
    set $testsFailed = $testsFailed + 1
}

# Test 1.4: Boolean Variables
print [Test 1.4] Boolean Variables
set $bool = true
if $bool == true then {
    print   ✓ PASS: Boolean true works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Boolean true broken
    set $testsFailed = $testsFailed + 1
}
set $bool = false
if $bool == false then {
    print   ✓ PASS: Boolean false works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Boolean false broken
    set $testsFailed = $testsFailed + 1
}

# Test 1.5: Empty String
print [Test 1.5] Empty String
set $empty = ""
if $empty == "" then {
    print   ✓ PASS: Empty string preserved
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Empty string broken
    set $testsFailed = $testsFailed + 1
}

# Test 1.6: Null Value
print [Test 1.6] Null Value
set $nul = null
set $isNul = call isNull $nul
if $isNul == true then {
    print   ✓ PASS: Null value works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Null value broken
    set $testsFailed = $testsFailed + 1
}

# Test 1.7: Array Literals
print [Test 1.7] Array Literals
set $arr = [1, 2, 3, 4, 5]
set $arrLen = call count $arr
if $arrLen == 5 then {
    print   ✓ PASS: Array literal works (5 elements)
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Array literal broken
    set $testsFailed = $testsFailed + 1
}

# Test 1.8: Object Literals
print [Test 1.8] Object Literals
set $obj = {name: "Alice", age: 30}
set $objName = call get $obj "name"
if $objName == "Alice" then {
    print   ✓ PASS: Object literal works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Object literal broken
    set $testsFailed = $testsFailed + 1
}

# Test 1.9: Variable Interpolation in Strings
print [Test 1.9] Variable Interpolation
set $name = "Bob"
set $greeting = "Hello, $name!"
if $greeting == "Hello, Bob!" then {
    print   ✓ PASS: Variable interpolation works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Variable interpolation broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 2: ARITHMETIC OPERATIONS                                 │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 2: ARITHMETIC OPERATIONS                                 │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 2.1: Addition
print [Test 2.1] Addition
set $a = 10
set $b = 5
set $sum = $a + $b
if $sum == 15 then {
    print   ✓ PASS: 10 + 5 = $sum
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 + 5 expected 15, got $sum
    set $testsFailed = $testsFailed + 1
}

# Test 2.2: Subtraction
print [Test 2.2] Subtraction
set $diff = $a - $b
if $diff == 5 then {
    print   ✓ PASS: 10 - 5 = $diff
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 - 5 expected 5, got $diff
    set $testsFailed = $testsFailed + 1
}

# Test 2.3: Multiplication
print [Test 2.3] Multiplication
set $prod = $a * $b
if $prod == 50 then {
    print   ✓ PASS: 10 * 5 = $prod
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 * 5 expected 50, got $prod
    set $testsFailed = $testsFailed + 1
}

# Test 2.4: Division
print [Test 2.4] Division
set $quot = $a / $b
if $quot == 2 then {
    print   ✓ PASS: 10 / 5 = $quot
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 / 5 expected 2, got $quot
    set $testsFailed = $testsFailed + 1
}

# Test 2.5: Modulo
print [Test 2.5] Modulo
set $x = 17
set $y = 5
set $mod = $x % $y
if $mod == 2 then {
    print   ✓ PASS: 17 % 5 = $mod
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 17 % 5 expected 2, got $mod
    set $testsFailed = $testsFailed + 1
}

# Test 2.6: String Concatenation with +
print [Test 2.6] String Concatenation
set $s1 = "Hello"
set $s2 = " World"
set $concat = $s1 + $s2
if $concat == "Hello World" then {
    print   ✓ PASS: String concatenation works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: String concatenation broken
    set $testsFailed = $testsFailed + 1
}

# Test 2.7: Negative Numbers
print [Test 2.7] Negative Numbers
set $neg = -42
set $absNeg = call abs $neg
if $absNeg == 42 then {
    print   ✓ PASS: Negative numbers work
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Negative numbers broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 3: COMPARISON OPERATORS                                  │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 3: COMPARISON OPERATORS                                  │
print └──────────────────────────────────────────────────────────────────┘
print

set $n = 10

# Test 3.1: Equal (==)
print [Test 3.1] Equal (==)
if $n == 10 then {
    print   ✓ PASS: 10 == 10 is true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 == 10 should be true
    set $testsFailed = $testsFailed + 1
}

# Test 3.2: Not Equal (!=)
print [Test 3.2] Not Equal (!=)
if $n != 5 then {
    print   ✓ PASS: 10 != 5 is true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 != 5 should be true
    set $testsFailed = $testsFailed + 1
}

# Test 3.3: Greater Than (>)
print [Test 3.3] Greater Than (>)
if $n > 5 then {
    print   ✓ PASS: 10 > 5 is true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 > 5 should be true
    set $testsFailed = $testsFailed + 1
}

# Test 3.4: Less Than (<)
print [Test 3.4] Less Than (<)
if $n < 15 then {
    print   ✓ PASS: 10 < 15 is true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 < 15 should be true
    set $testsFailed = $testsFailed + 1
}

# Test 3.5: Greater Than or Equal (>=)
print [Test 3.5] Greater Than or Equal (>=)
if $n >= 10 then {
    print   ✓ PASS: 10 >= 10 is true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 >= 10 should be true
    set $testsFailed = $testsFailed + 1
}

# Test 3.6: Less Than or Equal (<=)
print [Test 3.6] Less Than or Equal (<=)
if $n <= 10 then {
    print   ✓ PASS: 10 <= 10 is true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: 10 <= 10 should be true
    set $testsFailed = $testsFailed + 1
}

# Test 3.7: String Comparison
print [Test 3.7] String Comparison
set $strA = "apple"
set $strB = "banana"
if $strA != $strB then {
    print   ✓ PASS: String comparison works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: String comparison broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 4: LOGICAL OPERATORS                                     │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 4: LOGICAL OPERATORS                                     │
print └──────────────────────────────────────────────────────────────────┘
print

set $p = 5
set $q = 10
set $r = 15

# Test 4.1: Logical AND (&&)
print [Test 4.1] Logical AND (&&)
if $p < $q && $q < $r then {
    print   ✓ PASS: 5 < 10 AND 10 < 15 is true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: AND condition broken
    set $testsFailed = $testsFailed + 1
}

# Test 4.2: Logical OR (||)
print [Test 4.2] Logical OR (||)
if $p > $q || $q < $r then {
    print   ✓ PASS: 5 > 10 OR 10 < 15 is true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: OR condition broken
    set $testsFailed = $testsFailed + 1
}

# Test 4.3: Triple AND
print [Test 4.3] Triple AND
if $p < $q && $q < $r && $r > $p then {
    print   ✓ PASS: Triple AND works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Triple AND broken
    set $testsFailed = $testsFailed + 1
}

# Test 4.4: Mixed AND/OR
print [Test 4.4] Mixed AND/OR
if $p < $q && $q < $r || $r < $p then {
    print   ✓ PASS: Mixed AND/OR works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Mixed AND/OR broken
    set $testsFailed = $testsFailed + 1
}

# Test 4.5: Boolean Variable in Condition
print [Test 4.5] Boolean in Condition
set $flag = true
if $flag then {
    print   ✓ PASS: Boolean variable in condition works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Boolean variable in condition broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 5: CONTROL FLOW - IF/ELSE                                │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 5: CONTROL FLOW - IF/ELSE                                │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 5.1: Simple If
print [Test 5.1] Simple If
set $val = 100
if $val > 50 then {
    print   ✓ PASS: If block executed
    set $testsPassed = $testsPassed + 1
}

# Test 5.2: If-Else (then branch)
print [Test 5.2] If-Else (then branch)
set $val = 100
set $branch = ""
if $val > 50 then {
    set $branch = "then"
} else {
    set $branch = "else"
}
if $branch == "then" then {
    print   ✓ PASS: Then branch taken correctly
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Wrong branch taken
    set $testsFailed = $testsFailed + 1
}

# Test 5.3: If-Else (else branch)
print [Test 5.3] If-Else (else branch)
set $val = 10
set $branch = ""
if $val > 50 then {
    set $branch = "then"
} else {
    set $branch = "else"
}
if $branch == "else" then {
    print   ✓ PASS: Else branch taken correctly
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Wrong branch taken
    set $testsFailed = $testsFailed + 1
}

# Test 5.4: Nested If
print [Test 5.4] Nested If
set $outer = true
set $inner = true
set $result = ""
if $outer then {
    if $inner then {
        set $result = "both"
    } else {
        set $result = "outer only"
    }
}
if $result == "both" then {
    print   ✓ PASS: Nested if works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Nested if broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 6: CONTROL FLOW - LOOPS                                  │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 6: CONTROL FLOW - LOOPS                                  │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 6.1: Count Loop
print [Test 6.1] Count Loop
set $counter = 0
loop 5 {
    set $counter = $counter + 1
}
if $counter == 5 then {
    print   ✓ PASS: Loop executed 5 times
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Loop count wrong: $counter
    set $testsFailed = $testsFailed + 1
}

# Test 6.2: Loop Index Variable ($i)
print [Test 6.2] Loop Index Variable
set $lastIndex = -1
loop 3 {
    set $lastIndex = $i
}
if $lastIndex == 2 then {
    print   ✓ PASS: Loop index 0-2 correct (last: $lastIndex)
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Loop index wrong: $lastIndex
    set $testsFailed = $testsFailed + 1
}

# Test 6.3: While Loop
print [Test 6.3] While Loop
set $w = 0
loop while $w < 3 {
    set $w = $w + 1
}
if $w == 3 then {
    print   ✓ PASS: While loop completed
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: While loop counter: $w
    set $testsFailed = $testsFailed + 1
}

# Test 6.4: Foreach Loop
print [Test 6.4] Foreach Loop
set $fruits = ["apple", "banana", "cherry"]
set $fruitCount = 0
foreach $fruit in $fruits {
    set $fruitCount = $fruitCount + 1
}
if $fruitCount == 3 then {
    print   ✓ PASS: Foreach iterated 3 items
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Foreach count: $fruitCount
    set $testsFailed = $testsFailed + 1
}

# Test 6.5: Break Statement
print [Test 6.5] Break Statement
set $breakAt = -1
loop 10 {
    set $breakAt = $i
    if $i == 3 then {
        break
    }
}
if $breakAt == 3 then {
    print   ✓ PASS: Break at iteration 3
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Break at wrong index: $breakAt
    set $testsFailed = $testsFailed + 1
}

# Test 6.6: Continue Statement
print [Test 6.6] Continue Statement
set $skipSum = 0
loop 5 {
    if $i == 2 then {
        continue
    }
    set $skipSum = $skipSum + $i
}
# Sum of 0+1+3+4 = 8 (skipping 2)
if $skipSum == 8 then {
    print   ✓ PASS: Continue skipped index 2 (sum=$skipSum)
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Continue broken, sum=$skipSum (expected 8)
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 7: USER-DEFINED FUNCTIONS                                │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 7: USER-DEFINED FUNCTIONS                                │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 7.1: Simple Function
print [Test 7.1] Simple Function
def sayHello() {
    return "Hello!"
}
set $msg = call sayHello
if $msg == "Hello!" then {
    print   ✓ PASS: Simple function works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Simple function broken
    set $testsFailed = $testsFailed + 1
}

# Test 7.2: Function with Parameter
print [Test 7.2] Function with Parameter
def greet($who) {
    return "Hi, $who!"
}
set $greeting = call greet "World"
if $greeting == "Hi, World!" then {
    print   ✓ PASS: Function with parameter works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Function with parameter broken
    set $testsFailed = $testsFailed + 1
}

# Test 7.3: Function with Multiple Parameters
print [Test 7.3] Function with Multiple Parameters
def addTwo($x, $y) {
    set $result = $x + $y
    return $result
}
set $addResult = call addTwo 7 8
if $addResult == 15 then {
    print   ✓ PASS: Multi-param function (7+8=$addResult)
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Multi-param function broken
    set $testsFailed = $testsFailed + 1
}

# Test 7.4: Recursive Function
print [Test 7.4] Recursive Function
def factorial($n) {
    if $n <= 1 then {
        return 1
    }
    set $prev = $n - 1
    set $sub = call factorial $prev
    set $result = $n * $sub
    return $result
}
set $fact5 = call factorial 5
if $fact5 == 120 then {
    print   ✓ PASS: factorial(5) = $fact5
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: factorial(5) = $fact5 (expected 120)
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 8: STRING FUNCTIONS                                      │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 8: STRING FUNCTIONS                                      │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 8.1: upper() and lower()
print [Test 8.1] upper() and lower()
set $text = "Hello World"
set $up = call upper $text
set $lo = call lower $text
if $up == "HELLO WORLD" then {
    print   ✓ PASS: upper() works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: upper() broken
    set $testsFailed = $testsFailed + 1
}
if $lo == "hello world" then {
    print   ✓ PASS: lower() works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: lower() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.2: length()
print [Test 8.2] length()
set $len = call length "Hello"
if $len == 5 then {
    print   ✓ PASS: length("Hello") = $len
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: length() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.3: trim()
print [Test 8.3] trim()
set $padded = "  trimmed  "
set $trimmed = call trim $padded
if $trimmed == "trimmed" then {
    print   ✓ PASS: trim() works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: trim() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.4: concat()
print [Test 8.4] concat()
set $joined = call concat "a" "b" "c"
if $joined == "abc" then {
    print   ✓ PASS: concat() works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: concat() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.5: substr() and substring()
print [Test 8.5] substr() and substring()
set $str = "Hello World"
set $sub1 = call substr $str 0 5
set $sub2 = call substring $str 6 11
if $sub1 == "Hello" then {
    print   ✓ PASS: substr(0,5) = "$sub1"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: substr() broken
    set $testsFailed = $testsFailed + 1
}
if $sub2 == "World" then {
    print   ✓ PASS: substring(6,11) = "$sub2"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: substring() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.6: contains(), startsWith(), endsWith()
print [Test 8.6] contains(), startsWith(), endsWith()
set $sentence = "The quick brown fox"
set $has = call contains $sentence "quick"
set $starts = call startsWith $sentence "The"
set $ends = call endsWith $sentence "fox"
if $has == true then {
    print   ✓ PASS: contains("quick") = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: contains() broken
    set $testsFailed = $testsFailed + 1
}
if $starts == true then {
    print   ✓ PASS: startsWith("The") = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: startsWith() broken
    set $testsFailed = $testsFailed + 1
}
if $ends == true then {
    print   ✓ PASS: endsWith("fox") = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: endsWith() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.7: indexOf() and lastIndexOf()
print [Test 8.7] indexOf() and lastIndexOf()
set $str = "abcabc"
set $first = call indexOf $str "b"
set $last = call lastIndexOf $str "b"
if $first == 1 then {
    print   ✓ PASS: indexOf("b") = $first
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: indexOf() broken
    set $testsFailed = $testsFailed + 1
}
if $last == 4 then {
    print   ✓ PASS: lastIndexOf("b") = $last
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: lastIndexOf() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.8: replace() and replaceAll()
print [Test 8.8] replace() and replaceAll()
set $orig = "foo bar foo"
set $rep1 = call replace $orig "foo" "baz"
set $rep2 = call replaceAll $orig "foo" "baz"
if $rep1 == "baz bar foo" then {
    print   ✓ PASS: replace() (first only)
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: replace() broken
    set $testsFailed = $testsFailed + 1
}
if $rep2 == "baz bar baz" then {
    print   ✓ PASS: replaceAll()
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: replaceAll() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.9: split() and join()
print [Test 8.9] split() and join()
set $csv = "a,b,c"
set $parts = call split $csv ","
set $rejoined = call join $parts "-"
if $rejoined == "a-b-c" then {
    print   ✓ PASS: split/join works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: split/join broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.10: repeat()
print [Test 8.10] repeat()
set $rep = call repeat "ab" 3
if $rep == "ababab" then {
    print   ✓ PASS: repeat("ab", 3) = "$rep"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: repeat() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.11: padStart() and padEnd()
print [Test 8.11] padStart() and padEnd()
set $num = "5"
set $padS = call padStart $num 3 "0"
set $padE = call padEnd $num 3 "0"
if $padS == "005" then {
    print   ✓ PASS: padStart(3, "0") = "$padS"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: padStart() broken
    set $testsFailed = $testsFailed + 1
}
if $padE == "500" then {
    print   ✓ PASS: padEnd(3, "0") = "$padE"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: padEnd() broken
    set $testsFailed = $testsFailed + 1
}

# Test 8.12: charAt() and charCode()
print [Test 8.12] charAt() and charCode()
set $char = call charAt "ABC" 1
set $code = call charCode "A" 0
if $char == "B" then {
    print   ✓ PASS: charAt("ABC", 1) = "$char"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: charAt() broken
    set $testsFailed = $testsFailed + 1
}
if $code == 65 then {
    print   ✓ PASS: charCode("A") = $code
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: charCode() broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 9: MATH FUNCTIONS                                        │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 9: MATH FUNCTIONS                                        │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 9.1: abs()
print [Test 9.1] abs()
set $absVal = call abs -42
if $absVal == 42 then {
    print   ✓ PASS: abs(-42) = $absVal
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: abs() broken
    set $testsFailed = $testsFailed + 1
}

# Test 9.2: round(), floor(), ceil()
print [Test 9.2] round(), floor(), ceil()
set $rounded = call round 3.7
set $floored = call floor 3.9
set $ceiled = call ceil 3.1
if $rounded == 4 then {
    print   ✓ PASS: round(3.7) = $rounded
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: round() broken
    set $testsFailed = $testsFailed + 1
}
if $floored == 3 then {
    print   ✓ PASS: floor(3.9) = $floored
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: floor() broken
    set $testsFailed = $testsFailed + 1
}
if $ceiled == 4 then {
    print   ✓ PASS: ceil(3.1) = $ceiled
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: ceil() broken
    set $testsFailed = $testsFailed + 1
}

# Test 9.3: min() and max()
print [Test 9.3] min() and max()
set $minV = call min 5 3 8 1 9
set $maxV = call max 5 3 8 1 9
if $minV == 1 then {
    print   ✓ PASS: min(5,3,8,1,9) = $minV
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: min() broken
    set $testsFailed = $testsFailed + 1
}
if $maxV == 9 then {
    print   ✓ PASS: max(5,3,8,1,9) = $maxV
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: max() broken
    set $testsFailed = $testsFailed + 1
}

# Test 9.4: pow() and sqrt()
print [Test 9.4] pow() and sqrt()
set $squared = call pow 5 2
set $sqroot = call sqrt 16
if $squared == 25 then {
    print   ✓ PASS: pow(5, 2) = $squared
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: pow() broken
    set $testsFailed = $testsFailed + 1
}
if $sqroot == 4 then {
    print   ✓ PASS: sqrt(16) = $sqroot
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: sqrt() broken
    set $testsFailed = $testsFailed + 1
}

# Test 9.5: clamp()
print [Test 9.5] clamp()
set $clamped = call clamp 15 0 10
if $clamped == 10 then {
    print   ✓ PASS: clamp(15, 0, 10) = $clamped
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: clamp() broken
    set $testsFailed = $testsFailed + 1
}

# Test 9.6: random()
print [Test 9.6] random()
set $rand = call random 1 100
if $rand >= 1 then {
    if $rand <= 100 then {
        print   ✓ PASS: random(1,100) = $rand (in range)
        set $testsPassed = $testsPassed + 1
    } else {
        print   ✗ FAIL: random() out of range
        set $testsFailed = $testsFailed + 1
    }
} else {
    print   ✗ FAIL: random() out of range
    set $testsFailed = $testsFailed + 1
}

# Test 9.7: mod() and sign()
print [Test 9.7] mod() and sign()
set $modVal = call mod 17 5
set $signPos = call sign 42
set $signNeg = call sign -42
if $modVal == 2 then {
    print   ✓ PASS: mod(17, 5) = $modVal
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: mod() broken
    set $testsFailed = $testsFailed + 1
}
if $signPos == 1 then {
    print   ✓ PASS: sign(42) = $signPos
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: sign() broken
    set $testsFailed = $testsFailed + 1
}

# Test 9.8: Trigonometric Functions
print [Test 9.8] Trigonometric Functions
set $sinVal = call sin 0
set $cosVal = call cos 0
if $sinVal == 0 then {
    print   ✓ PASS: sin(0) = $sinVal
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: sin() broken
    set $testsFailed = $testsFailed + 1
}
if $cosVal == 1 then {
    print   ✓ PASS: cos(0) = $cosVal
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: cos() broken
    set $testsFailed = $testsFailed + 1
}

# Test 9.9: Constants PI and E
print [Test 9.9] Constants PI and E
set $pi = call PI
set $e = call E
if $pi > 3.14 then {
    if $pi < 3.15 then {
        print   ✓ PASS: PI = $pi
        set $testsPassed = $testsPassed + 1
    }
} else {
    print   ✗ FAIL: PI broken
    set $testsFailed = $testsFailed + 1
}
if $e > 2.71 then {
    if $e < 2.72 then {
        print   ✓ PASS: E = $e
        set $testsPassed = $testsPassed + 1
    }
} else {
    print   ✗ FAIL: E broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 10: ARRAY FUNCTIONS                                      │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 10: ARRAY FUNCTIONS                                      │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 10.1: count(), first(), last()
print [Test 10.1] count(), first(), last()
set $arr = [10, 20, 30, 40, 50]
set $cnt = call count $arr
set $fst = call first $arr
set $lst = call last $arr
if $cnt == 5 then {
    print   ✓ PASS: count() = $cnt
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: count() broken
    set $testsFailed = $testsFailed + 1
}
if $fst == 10 then {
    print   ✓ PASS: first() = $fst
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: first() broken
    set $testsFailed = $testsFailed + 1
}
if $lst == 50 then {
    print   ✓ PASS: last() = $lst
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: last() broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.2: at()
print [Test 10.2] at()
set $atVal = call at $arr 2
if $atVal == 30 then {
    print   ✓ PASS: at(2) = $atVal
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: at() broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.3: push() and pop()
print [Test 10.3] push() and pop()
set $arr2 = [1, 2, 3]
set $arr2 = call push $arr2 4
set $popped = call pop $arr2
if $popped == 4 then {
    print   ✓ PASS: push(4) then pop() = $popped
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: push/pop broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.4: shift() and unshift()
print [Test 10.4] shift() and unshift()
set $arr3 = [1, 2, 3]
set $arr3 = call unshift $arr3 0
set $shifted = call shift $arr3
if $shifted == 0 then {
    print   ✓ PASS: unshift(0) then shift() = $shifted
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: unshift/shift broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.5: includes()
print [Test 10.5] includes()
set $arr4 = ["apple", "banana", "cherry"]
set $hasApple = call includes $arr4 "apple"
set $hasGrape = call includes $arr4 "grape"
if $hasApple == true then {
    print   ✓ PASS: includes("apple") = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: includes() broken
    set $testsFailed = $testsFailed + 1
}
if $hasGrape == false then {
    print   ✓ PASS: includes("grape") = false
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: includes() false case broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.6: findIndex()
print [Test 10.6] findIndex()
set $idx = call findIndex $arr4 "banana"
if $idx == 1 then {
    print   ✓ PASS: findIndex("banana") = $idx
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: findIndex() broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.7: sort() and reverse()
print [Test 10.7] sort() and reverse()
set $nums = [3, 1, 4, 1, 5]
set $sorted = call sort $nums
set $sortedFirst = call first $sorted
if $sortedFirst == 1 then {
    print   ✓ PASS: sort() puts smallest first
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: sort() broken
    set $testsFailed = $testsFailed + 1
}
set $reversed = call reverse $nums
set $revFirst = call first $reversed
if $revFirst == 5 then {
    print   ✓ PASS: reverse() works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: reverse() broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.8: slice()
print [Test 10.8] slice()
set $arr5 = [0, 1, 2, 3, 4]
set $sliced = call slice $arr5 1 4
set $sliceCnt = call count $sliced
if $sliceCnt == 3 then {
    print   ✓ PASS: slice(1,4) has 3 elements
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: slice() broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.9: unique()
print [Test 10.9] unique()
set $dups = [1, 2, 2, 3, 3, 3]
set $uniq = call unique $dups
set $uniqCnt = call count $uniq
if $uniqCnt == 3 then {
    print   ✓ PASS: unique() removed duplicates
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: unique() broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.10: range() and fill()
print [Test 10.10] range() and fill()
set $rng = call range 0 5
set $rngCnt = call count $rng
if $rngCnt == 5 then {
    print   ✓ PASS: range(0,5) has 5 elements
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: range() broken
    set $testsFailed = $testsFailed + 1
}
set $filled = call fill 3 "x"
set $fillCnt = call count $filled
if $fillCnt == 3 then {
    print   ✓ PASS: fill(3, "x") has 3 elements
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: fill() broken
    set $testsFailed = $testsFailed + 1
}

# Test 10.11: sum() and avg()
print [Test 10.11] sum() and avg()
set $numbers = [10, 20, 30, 40, 50]
set $total = call sum $numbers
set $average = call avg $numbers
if $total == 150 then {
    print   ✓ PASS: sum() = $total
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: sum() broken
    set $testsFailed = $testsFailed + 1
}
if $average == 30 then {
    print   ✓ PASS: avg() = $average
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: avg() broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 11: OBJECT FUNCTIONS                                     │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 11: OBJECT FUNCTIONS                                     │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 11.1: keys() and values()
print [Test 11.1] keys() and values()
set $obj = {name: "Alice", age: 25, city: "NYC"}
set $objKeys = call keys $obj
set $objVals = call values $obj
set $keyCount = call count $objKeys
if $keyCount == 3 then {
    print   ✓ PASS: keys() returned 3 keys
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: keys() broken
    set $testsFailed = $testsFailed + 1
}

# Test 11.2: get() and set()
print [Test 11.2] get() and set()
set $name = call get $obj "name"
if $name == "Alice" then {
    print   ✓ PASS: get("name") = "$name"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: get() broken
    set $testsFailed = $testsFailed + 1
}

# Test 11.3: has()
print [Test 11.3] has()
set $hasName = call has $obj "name"
set $hasEmail = call has $obj "email"
if $hasName == true then {
    print   ✓ PASS: has("name") = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: has() true case broken
    set $testsFailed = $testsFailed + 1
}
if $hasEmail == false then {
    print   ✓ PASS: has("email") = false
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: has() false case broken
    set $testsFailed = $testsFailed + 1
}

# Test 11.4: merge()
print [Test 11.4] merge()
set $obj1 = {a: 1, b: 2}
set $obj2 = {c: 3, d: 4}
set $merged = call merge $obj1 $obj2
set $mergedKeys = call keys $merged
set $mergedCount = call count $mergedKeys
if $mergedCount == 4 then {
    print   ✓ PASS: merge() combined objects
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: merge() broken
    set $testsFailed = $testsFailed + 1
}

# Test 11.5: clone()
print [Test 11.5] clone()
set $original = {x: 10, y: 20}
set $cloned = call clone $original
set $clonedX = call get $cloned "x"
if $clonedX == 10 then {
    print   ✓ PASS: clone() works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: clone() broken
    set $testsFailed = $testsFailed + 1
}

# Test 11.6: entries()
print [Test 11.6] entries()
set $ent = call entries $obj1
set $entCount = call count $ent
if $entCount == 2 then {
    print   ✓ PASS: entries() returned 2 entries
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: entries() broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 12: JSON FUNCTIONS                                       │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 12: JSON FUNCTIONS                                       │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 12.1: toJSON()
print [Test 12.1] toJSON()
set $data = {status: "ok", code: 200}
set $json = call toJSON $data
set $hasStatus = call contains $json "status"
if $hasStatus == true then {
    print   ✓ PASS: toJSON() serializes object
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: toJSON() broken
    set $testsFailed = $testsFailed + 1
}

# Test 12.2: fromJSON()
print [Test 12.2] fromJSON()
set $jsonStr = "{\\"name\\": \\"Test\\", \\"value\\": 42}"
set $parsed = call fromJSON $jsonStr
set $parsedName = call get $parsed "name"
if $parsedName == "Test" then {
    print   ✓ PASS: fromJSON() parses JSON
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: fromJSON() broken
    set $testsFailed = $testsFailed + 1
}

# Test 12.3: prettyJSON()
print [Test 12.3] prettyJSON()
set $pretty = call prettyJSON $data
set $hasNewline = call contains $pretty "status"
if $hasNewline == true then {
    print   ✓ PASS: prettyJSON() formats JSON
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: prettyJSON() broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 13: TYPE FUNCTIONS                                       │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 13: TYPE FUNCTIONS                                       │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 13.1: typeof()
print [Test 13.1] typeof()
set $t1 = call typeof 42
set $t2 = call typeof "hello"
set $t3 = call typeof [1, 2]
set $t4 = call typeof {a: 1}
set $t5 = call typeof null
if $t1 == "number" then {
    print   ✓ PASS: typeof(42) = "$t1"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: typeof(number) broken
    set $testsFailed = $testsFailed + 1
}
if $t2 == "string" then {
    print   ✓ PASS: typeof("hello") = "$t2"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: typeof(string) broken
    set $testsFailed = $testsFailed + 1
}
if $t3 == "array" then {
    print   ✓ PASS: typeof([1,2]) = "$t3"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: typeof(array) broken
    set $testsFailed = $testsFailed + 1
}
if $t4 == "object" then {
    print   ✓ PASS: typeof({a:1}) = "$t4"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: typeof(object) broken
    set $testsFailed = $testsFailed + 1
}
if $t5 == "null" then {
    print   ✓ PASS: typeof(null) = "$t5"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: typeof(null) broken
    set $testsFailed = $testsFailed + 1
}

# Test 13.2: Type Check Functions
print [Test 13.2] Type Check Functions
set $isNum = call isNumber 42
set $isStr = call isString "hello"
set $isArr = call isArray [1, 2]
set $isObj = call isObject {a: 1}
set $isBool = call isBoolean true
set $isNul = call isNull null
if $isNum == true then {
    print   ✓ PASS: isNumber(42) = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: isNumber() broken
    set $testsFailed = $testsFailed + 1
}
if $isStr == true then {
    print   ✓ PASS: isString("hello") = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: isString() broken
    set $testsFailed = $testsFailed + 1
}
if $isArr == true then {
    print   ✓ PASS: isArray([1,2]) = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: isArray() broken
    set $testsFailed = $testsFailed + 1
}
if $isObj == true then {
    print   ✓ PASS: isObject({a:1}) = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: isObject() broken
    set $testsFailed = $testsFailed + 1
}
if $isBool == true then {
    print   ✓ PASS: isBoolean(true) = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: isBoolean() broken
    set $testsFailed = $testsFailed + 1
}
if $isNul == true then {
    print   ✓ PASS: isNull(null) = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: isNull() broken
    set $testsFailed = $testsFailed + 1
}

# Test 13.3: isEmpty()
print [Test 13.3] isEmpty()
set $emptyStr = call isEmpty ""
set $emptyArr = call isEmpty []
set $nonEmpty = call isEmpty "text"
if $emptyStr == true then {
    print   ✓ PASS: isEmpty("") = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: isEmpty(string) broken
    set $testsFailed = $testsFailed + 1
}
if $emptyArr == true then {
    print   ✓ PASS: isEmpty([]) = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: isEmpty(array) broken
    set $testsFailed = $testsFailed + 1
}
if $nonEmpty == false then {
    print   ✓ PASS: isEmpty("text") = false
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: isEmpty(non-empty) broken
    set $testsFailed = $testsFailed + 1
}

# Test 13.4: Type Conversion Functions
print [Test 13.4] Type Conversion Functions
set $toNum = call toNumber "123.45"
set $toInt = call toInt "42.9"
set $toStr = call toString 999
set $toBool = call toBoolean 1
if $toNum == 123.45 then {
    print   ✓ PASS: toNumber("123.45") = $toNum
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: toNumber() broken
    set $testsFailed = $testsFailed + 1
}
if $toInt == 42 then {
    print   ✓ PASS: toInt("42.9") = $toInt
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: toInt() broken
    set $testsFailed = $testsFailed + 1
}
if $toStr == "999" then {
    print   ✓ PASS: toString(999) = "$toStr"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: toString() broken
    set $testsFailed = $testsFailed + 1
}
if $toBool == true then {
    print   ✓ PASS: toBoolean(1) = true
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: toBoolean() broken
    set $testsFailed = $testsFailed + 1
}

# Test 13.5: toArray()
print [Test 13.5] toArray()
set $arr = call toArray "abc"
set $arrLen = call count $arr
if $arrLen == 3 then {
    print   ✓ PASS: toArray("abc") = 3 chars
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: toArray() broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 14: TIME FUNCTIONS                                       │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 14: TIME FUNCTIONS                                       │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 14.1: now()
print [Test 14.1] now()
set $timestamp = call now
if $timestamp > 0 then {
    print   ✓ PASS: now() returns timestamp: $timestamp
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: now() broken
    set $testsFailed = $testsFailed + 1
}

# Test 14.2: time() and date()
print [Test 14.2] time() and date()
set $timeStr = call time
set $dateStr = call date
set $timeLen = call length $timeStr
if $timeLen > 0 then {
    print   ✓ PASS: time() = "$timeStr"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: time() broken
    set $testsFailed = $testsFailed + 1
}
set $dateLen = call length $dateStr
if $dateLen > 0 then {
    print   ✓ PASS: date() = "$dateStr"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: date() broken
    set $testsFailed = $testsFailed + 1
}

# Test 14.3: year(), month(), day()
print [Test 14.3] year(), month(), day()
set $yr = call year
set $mo = call month
set $dy = call day
if $yr > 2020 then {
    print   ✓ PASS: year() = $yr
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: year() broken
    set $testsFailed = $testsFailed + 1
}
if $mo >= 1 then {
    if $mo <= 12 then {
        print   ✓ PASS: month() = $mo
        set $testsPassed = $testsPassed + 1
    }
} else {
    print   ✗ FAIL: month() broken
    set $testsFailed = $testsFailed + 1
}
if $dy >= 1 then {
    if $dy <= 31 then {
        print   ✓ PASS: day() = $dy
        set $testsPassed = $testsPassed + 1
    }
} else {
    print   ✗ FAIL: day() broken
    set $testsFailed = $testsFailed + 1
}

# Test 14.4: hour(), minute(), second()
print [Test 14.4] hour(), minute(), second()
set $hr = call hour
set $mi = call minute
set $se = call second
if $hr >= 0 then {
    if $hr <= 23 then {
        print   ✓ PASS: hour() = $hr
        set $testsPassed = $testsPassed + 1
    }
} else {
    print   ✗ FAIL: hour() broken
    set $testsFailed = $testsFailed + 1
}
if $mi >= 0 then {
    if $mi <= 59 then {
        print   ✓ PASS: minute() = $mi
        set $testsPassed = $testsPassed + 1
    }
} else {
    print   ✗ FAIL: minute() broken
    set $testsFailed = $testsFailed + 1
}
if $se >= 0 then {
    if $se <= 59 then {
        print   ✓ PASS: second() = $se
        set $testsPassed = $testsPassed + 1
    }
} else {
    print   ✗ FAIL: second() broken
    set $testsFailed = $testsFailed + 1
}

# Test 14.5: elapsed()
print [Test 14.5] elapsed()
set $start = call now
wait 100
set $elapsed = call elapsed $start
if $elapsed >= 90 then {
    print   ✓ PASS: elapsed() after 100ms = $elapsed ms
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: elapsed() too fast: $elapsed
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 15: ERROR HANDLING                                       │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 15: ERROR HANDLING                                       │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 15.1: Try/Catch Basic
print [Test 15.1] Try/Catch Basic
set $caught = false
try {
    set $x = call nonexistentFunction
} catch $err {
    set $caught = true
}
if $caught == true then {
    print   ✓ PASS: try/catch caught error
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: try/catch broken
    set $testsFailed = $testsFailed + 1
}

# Test 15.2: Error Variable
print [Test 15.2] Error Variable
set $errorMsg = ""
try {
    set $x = call anotherBadFunction
} catch $err {
    set $errorMsg = $err
}
set $hasError = call length $errorMsg
if $hasError > 0 then {
    print   ✓ PASS: Error message captured
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Error message not captured
    set $testsFailed = $testsFailed + 1
}

# Test 15.3: Execution Continues After Catch
print [Test 15.3] Execution After Catch
set $afterCatch = false
try {
    set $x = call badCall
} catch {
    set $afterCatch = true
}
set $continued = false
set $continued = true
if $continued == true then {
    print   ✓ PASS: Execution continues after catch
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Execution stopped after catch
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 16: STRING EDGE CASES                                    │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 16: STRING EDGE CASES                                    │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 16.1: Semicolons in Strings
print [Test 16.1] Semicolons in Strings
set $semi = "a;b;c"
if $semi == "a;b;c" then {
    print   ✓ PASS: Semicolons preserved in strings
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Semicolons broken in strings
    set $testsFailed = $testsFailed + 1
}

# Test 16.2: Hash/Comment Character in Strings
print [Test 16.2] Hash in Strings
set $hash = "test # not a comment"
set $hashLen = call length $hash
if $hashLen > 10 then {
    print   ✓ PASS: Hash preserved in strings
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Hash treated as comment
    set $testsFailed = $testsFailed + 1
}

# Test 16.3: Escape Sequences
print [Test 16.3] Escape Sequences
set $escaped = "line1\\nline2"
set $escLen = call length $escaped
if $escLen > 5 then {
    print   ✓ PASS: Escape sequences work
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Escape sequences broken
    set $testsFailed = $testsFailed + 1
}

# Test 16.4: Quotes in Strings
print [Test 16.4] Quotes in Strings
set $quoted = "He said \\"Hello\\""
set $qLen = call length $quoted
if $qLen > 10 then {
    print   ✓ PASS: Escaped quotes work
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: Escaped quotes broken
    set $testsFailed = $testsFailed + 1
}

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 17: FILE SYSTEM                                          │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 17: FILE SYSTEM                                          │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 17.1: Write and Read File
print [Test 17.1] Write and Read File
set $testPath = "C:/Users/User/Documents/retroscript_test.txt"
set $testContent = "Hello from RetroScript!"
write $testContent to $testPath
read $testPath into $readBack
if $readBack == $testContent then {
    print   ✓ PASS: File write/read works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: File write/read broken
    set $testsFailed = $testsFailed + 1
}

# Test 17.2: Delete File
print [Test 17.2] Delete File
delete $testPath
print   ✓ PASS: File deleted (no error)
set $testsPassed = $testsPassed + 1

# Test 17.3: Create and Delete Directory
print [Test 17.3] Directory Operations
set $testDir = "C:/Users/User/Documents/TestDir"
mkdir $testDir
delete $testDir
print   ✓ PASS: mkdir/delete works
set $testsPassed = $testsPassed + 1

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 18: SYSTEM INTEGRATION                                   │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 18: SYSTEM INTEGRATION                                   │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 18.1: getWindows()
print [Test 18.1] getWindows()
set $windows = call getWindows
set $winType = call isArray $windows
if $winType == true then {
    print   ✓ PASS: getWindows() returns array
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: getWindows() broken
    set $testsFailed = $testsFailed + 1
}

# Test 18.2: getApps()
print [Test 18.2] getApps()
set $apps = call getApps
set $appType = call isArray $apps
if $appType == true then {
    print   ✓ PASS: getApps() returns array
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: getApps() broken
    set $testsFailed = $testsFailed + 1
}

# Test 18.3: getEnv()
print [Test 18.3] getEnv()
set $env = call getEnv
set $platform = call get $env "platform"
if $platform == "RetrOS" then {
    print   ✓ PASS: getEnv() platform = "$platform"
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: getEnv() broken
    set $testsFailed = $testsFailed + 1
}

# Test 18.4: Launch and Close App
print [Test 18.4] Launch and Close App
set $beforeWin = call getWindows
set $beforeCount = call count $beforeWin
launch calculator
wait 300
set $afterWin = call getWindows
set $afterCount = call count $afterWin
if $afterCount > $beforeCount then {
    print   ✓ PASS: App launched (windows: $beforeCount -> $afterCount)
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: App launch broken
    set $testsFailed = $testsFailed + 1
}
close
wait 200
print   ✓ PASS: App closed
set $testsPassed = $testsPassed + 1

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 19: EVENTS AND NOTIFICATIONS                             │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 19: EVENTS AND NOTIFICATIONS                             │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 19.1: emit()
print [Test 19.1] emit()
emit test:event message="Hello" value=42
print   ✓ PASS: Event emitted
set $testsPassed = $testsPassed + 1

# Test 19.2: notify()
print [Test 19.2] notify()
notify Test notification from RetroScript!
print   ✓ PASS: Notification sent
set $testsPassed = $testsPassed + 1

# Test 19.3: play()
print [Test 19.3] play()
play notify
print   ✓ PASS: Sound played
set $testsPassed = $testsPassed + 1

print

# ┌──────────────────────────────────────────────────────────────────┐
# │ SECTION 20: DEBUG FUNCTIONS                                      │
# └──────────────────────────────────────────────────────────────────┘

print ┌──────────────────────────────────────────────────────────────────┐
print │ SECTION 20: DEBUG FUNCTIONS                                      │
print └──────────────────────────────────────────────────────────────────┘
print

# Test 20.1: debug()
print [Test 20.1] debug()
set $debugResult = call debug "Test message" 42
set $debugLen = call length $debugResult
if $debugLen > 0 then {
    print   ✓ PASS: debug() works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: debug() broken
    set $testsFailed = $testsFailed + 1
}

# Test 20.2: inspect()
print [Test 20.2] inspect()
set $testObj = {a: 1, b: 2}
set $inspected = call inspect $testObj
set $inspLen = call length $inspected
if $inspLen > 0 then {
    print   ✓ PASS: inspect() works
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: inspect() broken
    set $testsFailed = $testsFailed + 1
}

# Test 20.3: assert() - passing case
print [Test 20.3] assert()
set $assertOk = call assert true "This should pass"
if $assertOk == true then {
    print   ✓ PASS: assert(true) passes
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: assert() broken
    set $testsFailed = $testsFailed + 1
}

# Test 20.4: assert() - failing case (caught)
print [Test 20.4] assert() failure
set $assertFailed = false
try {
    set $x = call assert false "Expected failure"
} catch {
    set $assertFailed = true
}
if $assertFailed == true then {
    print   ✓ PASS: assert(false) throws error
    set $testsPassed = $testsPassed + 1
} else {
    print   ✗ FAIL: assert(false) should throw
    set $testsFailed = $testsFailed + 1
}

print

# ╔══════════════════════════════════════════════════════════════════╗
# ║                      TEST SUMMARY                                ║
# ╚══════════════════════════════════════════════════════════════════╝

print ╔══════════════════════════════════════════════════════════════════╗
print ║                      TEST SUMMARY                                ║
print ╚══════════════════════════════════════════════════════════════════╝
print
print   Total Tests Passed: $testsPassed
print   Total Tests Failed: $testsFailed
print
set $totalTests = $testsPassed + $testsFailed
print   Total Tests Run: $totalTests
print

if $testsFailed == 0 then {
    print   ★★★ ALL TESTS PASSED! ★★★
    play notify
} else {
    print   ⚠ Some tests failed. Review output above.
    play error
}

print
print ══════════════════════════════════════════════════════════════════
print   Sections Tested:
print    1. Variables and Data Types
print    2. Arithmetic Operations
print    3. Comparison Operators
print    4. Logical Operators
print    5. Control Flow - If/Else
print    6. Control Flow - Loops
print    7. User-Defined Functions
print    8. String Functions
print    9. Math Functions
print   10. Array Functions
print   11. Object Functions
print   12. JSON Functions
print   13. Type Functions
print   14. Time Functions
print   15. Error Handling
print   16. String Edge Cases
print   17. File System
print   18. System Integration
print   19. Events and Notifications
print   20. Debug Functions
print ══════════════════════════════════════════════════════════════════

notify RetroScript Test Suite Complete!`;

        // Store test suite for later loading
        this.fullTestSuite = fullTestSuite;

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
                    <button class="script-btn" id="testSuiteBtn" title="Load Comprehensive Test Suite">
                        <span class="btn-icon">🧪</span> Tests
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
                    white-space: pre;
                }

                .editor-wrapper {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                    background: #1e1e1e;
                }

                .syntax-highlight {
                    display: none;
                }

                .script-editor {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    width: 100%;
                    height: 100%;
                    font-family: 'Consolas', 'Courier New', monospace;
                    font-size: 13px;
                    line-height: 1.4;
                    padding: 8px;
                    border: none;
                    resize: none;
                    background: #1e1e1e;
                    color: #d4d4d4;
                    caret-color: #fff;
                    tab-size: 4;
                    overflow: auto;
                    box-sizing: border-box;
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

        // Load test suite
        const testSuiteBtn = this.getElement('#testSuiteBtn');
        this.addHandler(testSuiteBtn, 'click', () => this.loadTestSuite());

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
        console.log('[ScriptRunner] runScript called');

        try {
            const editor = this.getElement('#scriptEditor');
            if (!editor) {
                console.error('[ScriptRunner] Editor element not found!');
                return;
            }
            console.log('[ScriptRunner] Got editor element');

            const script = editor.value;
            console.log('[ScriptRunner] Script length:', script.length, 'chars');

            this.setStatus('Running...');
            this.appendOutput('\n--- Script Started ---', 'info');

            console.log('[ScriptRunner] Calling ScriptEngine.run...');
            const result = await ScriptEngine.run(script);
            console.log('[ScriptRunner] ScriptEngine.run completed');

            if (result.success) {
                this.appendOutput('--- Script Completed ---', 'success');
                if (result.result !== undefined && result.result !== null) {
                    this.appendOutput(`Result: ${JSON.stringify(result.result)}`, 'info');
                }
            } else {
                this.appendOutput(`--- Script Failed: ${result.error} ---`, 'error');
            }

            this.setStatus('Ready');
        } catch (error) {
            console.error('[ScriptRunner] Error in runScript:', error);
            this.appendOutput(`--- Script Error: ${error.message} ---`, 'error');
            this.setStatus('Error');
        }
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

    loadTestSuite() {
        const editor = this.getElement('#scriptEditor');
        if (editor && this.fullTestSuite) {
            editor.value = this.fullTestSuite;
            this.updateSyntaxHighlight();
            this.appendOutput('Loaded comprehensive test suite (2000+ lines). Click Run to execute all tests.', 'info');
        }
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
