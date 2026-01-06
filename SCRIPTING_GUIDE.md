# RetroScript Language Guide

 

RetroScript is the scripting language for RetrOS. It allows you to automate tasks, create interactive experiences, and build game-like challenges that interact with the operating system.

 

## Table of Contents

 

1. [Basic Syntax](#basic-syntax)

2. [Variables](#variables)

3. [Operators](#operators)

4. [Control Flow](#control-flow)

5. [Loops](#loops)

6. [Functions](#functions)

7. [Event Handlers](#event-handlers)

8. [Built-in Functions](#built-in-functions)

9. [File Operations](#file-operations)

10. [System Commands](#system-commands)

11. [Dialogs](#dialogs)

12. [Events Reference](#events-reference)

 

---

 

## Basic Syntax

 

### Comments

```retro

# This is a comment

print "Hello"  # Inline comments work too

```

 

### Multiple Statements

```retro

# Semicolons separate statements on one line

set $a = 1; set $b = 2; print $a + $b

 

# Or use separate lines

set $a = 1

set $b = 2

print $a + $b

```

 

---

 

## Variables

 

Variables are prefixed with `$` and can hold strings, numbers, booleans, arrays, and objects.

 

### Declaration and Assignment

```retro

# String

set $name = "Alice"

 

# Number

set $age = 25

set $pi = 3.14159

 

# Boolean

set $active = true

set $disabled = false

 

# Null

set $empty = null

 

# Assignment without 'set' also works

$count = 0

$message = "Hello"

```

 

### Arrays

```retro

set $numbers = [1, 2, 3, 4, 5]

set $names = ["Alice", "Bob", "Charlie"]

set $mixed = [1, "two", true, null]

 

# Access elements with get()

set $first = call get $numbers 0    # 1

set $second = call get $names 1     # "Bob"

```

 

### Objects

```retro

set $person = {name: "Alice", age: 25, active: true}

 

# Access properties with get()

set $personName = call get $person "name"  # "Alice"

 

# Set properties with set()

call set $person "email" "alice@example.com"

```

 

---

 

## Operators

 

### Arithmetic

```retro

set $sum = 10 + 5       # 15

set $diff = 10 - 5      # 5

set $product = 10 * 5   # 50

set $quotient = 10 / 5  # 2

set $remainder = 17 % 5 # 2

 

# Complex expressions with parentheses

set $result = (10 + 5) * 2 - 3  # 27

 

# Negative numbers

set $neg = -5 + 3  # -2

```

 

### Comparison

```retro

# Equal

if $a == $b then { print "equal" }

 

# Not equal

if $a != $b then { print "not equal" }

 

# Greater/Less than

if $a > $b then { print "greater" }

if $a < $b then { print "less" }

if $a >= $b then { print "greater or equal" }

if $a <= $b then { print "less or equal" }

```

 

### Logical

```retro

# AND

if $a > 5 && $a < 10 then { print "between 5 and 10" }

 

# OR

if $a < 0 || $a > 100 then { print "out of range" }

 

# Combined with parentheses

if ($a > 5 && $a < 10) || $a == 0 then { print "valid" }

```

 

### String Concatenation

```retro

set $greeting = "Hello, " + $name + "!"

print $greeting  # "Hello, Alice!"

```

 

---

 

## Control Flow

 

### If/Then/Else

```retro

# Simple if

if $score > 100 then {

    print "High score!"

}

 

# If/else

if $age >= 18 then {

    print "Adult"

} else {

    print "Minor"

}

 

# Nested if

if $score > 90 then {

    if $bonus == true then {

        print "Perfect with bonus!"

    }

}

 

# Single line

if $done == true then { print "Finished!" }

```

 

---

 

## Loops

 

### Count Loop

```retro

# Loop a specific number of times

loop 5 {

    print "Iteration: $i"  # $i is 0, 1, 2, 3, 4

}

 

# Loop with variable count

set $count = 10

loop $count {

    print "Count: $i"

}

```

 

### While Loop

```retro

set $counter = 0

loop while $counter < 5 {

    print "Counter: $counter"

    set $counter = $counter + 1

}

```

 

### For-Each Loop

```retro

set $fruits = ["apple", "banana", "cherry"]

foreach $fruit in $fruits {

    print "Fruit: $fruit (index $i)"

}

```

 

### Loop Control

```retro

# Break - exit loop early

loop 100 {

    if $i == 5 then { break }

    print $i

}

 

# Continue - skip to next iteration

loop 10 {

    if $i % 2 == 0 then { continue }

    print $i  # Only odd numbers

}

```

 

---

 

## Functions

 

### User-Defined Functions

```retro

# Define a function

def greet($name) {

    print "Hello, $name!"

}

 

# Call it

call greet "Alice"

 

# Function with return value

def add($a, $b) {

    return $a + $b

}

 

set $sum = call add 5 3

print $sum  # 8

 

# Recursive function

def factorial($n) {

    if $n <= 1 then {

        return 1

    }

    return $n * call factorial $n - 1

}

 

set $result = call factorial 5  # 120

```

 

### Calling Built-in Functions

```retro

# Call syntax

set $result = call functionName arg1 arg2

 

# Examples

set $len = call length "hello"           # 5

set $upper = call upper "hello"          # "HELLO"

set $rand = call random 1 100            # Random 1-100

set $abs = call abs -5                   # 5

 

# Parentheses syntax also works

set $result = call max(10, 20)           # 20

set $result = call min(5, 3, 8)          # 3

```

 

---

 

## Event Handlers

 

Listen for system events and react to them.

 

### Basic Event Handler

```retro

# React to window opening

on window:open {

    print "A window was opened!"

}

 

# React to app launching

on app:open {

    print "App opened: $event.appId"

}

```

 

### Game Events

```retro

# Minesweeper win

on minesweeper:win {

    print "You beat Minesweeper!"

    print "Time: $event.time seconds"

}

 

# Asteroids score update

on game:score {

    if $event.appId == "asteroids" then {

        print "Score: $event.score"

        if $event.score >= 1000 then {

            print "You reached 1000 points!"

        }

    }

}

 

# Game over

on game:over {

    if $event.won == true then {

        print "Victory in $event.appId!"

    } else {

        print "Game over in $event.appId"

    }

}

```

 

### Achievement Events

```retro

on achievement:unlock {

    print "Achievement unlocked: $event.id"

}

```

 

---

 

## Built-in Functions

 

### Math Functions

| Function | Description | Example |

|----------|-------------|---------|

| `random(min, max)` | Random integer | `call random 1 100` |

| `abs(n)` | Absolute value | `call abs -5` → 5 |

| `round(n)` | Round to nearest | `call round 3.7` → 4 |

| `floor(n)` | Round down | `call floor 3.9` → 3 |

| `ceil(n)` | Round up | `call ceil 3.1` → 4 |

| `min(...)` | Minimum value | `call min 5 3 8` → 3 |

| `max(...)` | Maximum value | `call max 5 3 8` → 8 |

| `pow(base, exp)` | Power | `call pow 2 8` → 256 |

| `sqrt(n)` | Square root | `call sqrt 16` → 4 |

| `clamp(val, min, max)` | Clamp value | `call clamp 15 0 10` → 10 |

| `mod(a, b)` | Modulo | `call mod 17 5` → 2 |

 

### String Functions

| Function | Description | Example |

|----------|-------------|---------|

| `length(s)` | String/array length | `call length "hello"` → 5 |

| `upper(s)` | Uppercase | `call upper "hello"` → "HELLO" |

| `lower(s)` | Lowercase | `call lower "HELLO"` → "hello" |

| `trim(s)` | Remove whitespace | `call trim "  hi  "` → "hi" |

| `split(s, sep)` | Split to array | `call split "a,b,c" ","` |

| `join(arr, sep)` | Join array | `call join $arr ", "` |

| `substr(s, start, len)` | Substring | `call substr "hello" 0 3` → "hel" |

| `replace(s, old, new)` | Replace first | `call replace "hello" "l" "L"` |

| `replaceAll(s, old, new)` | Replace all | `call replaceAll "hello" "l" "L"` |

| `contains(s, search)` | Contains check | `call contains "hello" "ell"` → true |

| `startsWith(s, prefix)` | Starts with | `call startsWith "hello" "he"` → true |

| `endsWith(s, suffix)` | Ends with | `call endsWith "hello" "lo"` → true |

| `indexOf(s, search)` | Find position | `call indexOf "hello" "l"` → 2 |

| `charAt(s, idx)` | Char at index | `call charAt "hello" 0` → "h" |

| `repeat(s, n)` | Repeat string | `call repeat "ab" 3` → "ababab" |

| `padStart(s, len, char)` | Pad start | `call padStart "5" 3 "0"` → "005" |

| `padEnd(s, len, char)` | Pad end | `call padEnd "5" 3 "0"` → "500" |

 

### Array Functions

| Function | Description | Example |

|----------|-------------|---------|

| `count(arr)` | Array length | `call count $arr` |

| `first(arr)` | First element | `call first $arr` |

| `last(arr)` | Last element | `call last $arr` |

| `push(arr, item)` | Add to end | `call push $arr "new"` |

| `pop(arr)` | Remove from end | `call pop $arr` |

| `shift(arr)` | Remove from start | `call shift $arr` |

| `unshift(arr, item)` | Add to start | `call unshift $arr "new"` |

| `includes(arr, item)` | Contains item | `call includes $arr "x"` |

| `sort(arr, desc)` | Sort array | `call sort $arr false` |

| `reverse(arr)` | Reverse array | `call reverse $arr` |

| `slice(arr, start, end)` | Slice array | `call slice $arr 1 3` |

| `unique(arr)` | Remove duplicates | `call unique $arr` |

| `flatten(arr)` | Flatten nested | `call flatten $arr` |

| `range(start, end, step)` | Generate range | `call range 0 10 2` → [0,2,4,6,8] |

| `fill(len, val)` | Create filled array | `call fill 5 0` → [0,0,0,0,0] |

| `sum(arr)` | Sum of numbers | `call sum [1,2,3]` → 6 |

| `avg(arr)` | Average | `call avg [1,2,3]` → 2 |

| `get(arr, idx)` | Get element | `call get $arr 0` |

| `at(arr, idx)` | Get element (neg ok) | `call at $arr -1` (last) |

 

### Object Functions

| Function | Description | Example |

|----------|-------------|---------|

| `keys(obj)` | Get keys | `call keys $obj` |

| `values(obj)` | Get values | `call values $obj` |

| `entries(obj)` | Get [key,val] pairs | `call entries $obj` |

| `get(obj, key, default)` | Get property | `call get $obj "name" "unknown"` |

| `set(obj, key, val)` | Set property | `call set $obj "age" 25` |

| `has(obj, key)` | Has property | `call has $obj "name"` |

| `merge(obj1, obj2)` | Merge objects | `call merge $a $b` |

| `clone(obj)` | Deep clone | `call clone $obj` |

 

### Type Functions

| Function | Description | Example |

|----------|-------------|---------|

| `typeof(val)` | Get type | `call typeof $x` → "string" |

| `isNumber(val)` | Is number | `call isNumber 5` → true |

| `isString(val)` | Is string | `call isString "hi"` → true |

| `isArray(val)` | Is array | `call isArray [1,2]` → true |

| `isObject(val)` | Is object | `call isObject {a:1}` → true |

| `isBoolean(val)` | Is boolean | `call isBoolean true` → true |

| `isNull(val)` | Is null/undefined | `call isNull $x` |

| `isEmpty(val)` | Is empty | `call isEmpty ""` → true |

| `toNumber(val)` | Convert to number | `call toNumber "42"` → 42 |

| `toInt(val)` | Convert to integer | `call toInt "3.9"` → 3 |

| `toString(val)` | Convert to string | `call toString 42` → "42" |

| `toBoolean(val)` | Convert to boolean | `call toBoolean 1` → true |

| `toArray(val)` | Convert to array | `call toArray "hi"` → ["h","i"] |

 

### JSON Functions

| Function | Description | Example |

|----------|-------------|---------|

| `toJSON(obj)` | Object to JSON string | `call toJSON $obj` |

| `fromJSON(str)` | JSON string to object | `call fromJSON $jsonStr` |

| `prettyJSON(obj)` | Formatted JSON | `call prettyJSON $obj` |

 

### Date/Time Functions

| Function | Description | Example |

|----------|-------------|---------|

| `now()` | Current timestamp (ms) | `call now` |

| `time()` | Current time string | `call time` |

| `date()` | Current date string | `call date` |

| `year()` | Current year | `call year` |

| `month()` | Current month (1-12) | `call month` |

| `day()` | Current day | `call day` |

| `hour()` | Current hour | `call hour` |

| `minute()` | Current minute | `call minute` |

| `second()` | Current second | `call second` |

| `elapsed(start)` | Ms since timestamp | `call elapsed $startTime` |

 

### Debug Functions

| Function | Description | Example |

|----------|-------------|---------|

| `debug(...)` | Log debug message | `call debug "value:" $x` |

| `inspect(val)` | Pretty print value | `call inspect $obj` |

| `assert(cond, msg)` | Assert condition | `call assert $x > 0 "Must be positive"` |

 

---

 

## File Operations

 

### Writing Files

```retro

# Write content to a file

write "Hello, World!" to "C:/Users/User/Desktop/hello.txt"

 

# Write variable content

set $content = "This is my document.\nLine 2."

write $content to "C:/Documents/notes.txt"

```

 

### Reading Files

```retro

# Read file into variable

read "C:/Users/User/Desktop/hello.txt" into $content

print $content

```

 

### Directory Operations

```retro

# Create directory

mkdir "C:/Users/User/Desktop/NewFolder"

 

# Delete file or directory

delete "C:/Users/User/Desktop/oldfile.txt"

```

 

---

 

## System Commands

 

### Launching Apps

```retro

# Launch by app ID

launch notepad

launch minesweeper

launch asteroids

launch terminal

 

# Launch with parameters

launch notepad with file="C:/readme.txt"

```

 

### Window Control

```retro

# Close windows

close           # Close most recent

close $windowId # Close specific window

 

# Window operations

focus $windowId

minimize $windowId

maximize $windowId

```

 

### Wait/Sleep

```retro

# Wait milliseconds

wait 1000    # Wait 1 second

wait 5000    # Wait 5 seconds

```

 

### Events

```retro

# Emit custom events

emit myEvent key1="value1" key2="value2"

 

# Play sounds

emit sound:play sound="notify"

emit sound:play sound="error"

emit sound:play sound="win"

```

 

---

 

## Dialogs

 

### Alert

```retro

emit dialog:alert message="Hello!" title="Greeting"

```

 

### Notification

```retro

notify "Task complete!"

```

 

---

 

## Events Reference

 

### Game Events

| Event | Properties | Description |

|-------|------------|-------------|

| `game:start` | appId, settings | Game started |

| `game:over` | appId, won, score | Game ended |

| `game:score` | appId, score, delta | Score changed |

| `game:level` | appId, level | Level changed |

| `game:lives` | appId, lives | Lives changed |

| `game:pause` | appId | Game paused |

| `game:resume` | appId | Game resumed |

| `game:highscore` | appId, score | New high score |

 

### Specific Game Events

| Event | Properties | Description |

|-------|------------|-------------|

| `minesweeper:win` | time, difficulty, gridSize, mines | Beat Minesweeper |

| `asteroids:ufo:destroy` | points | Destroyed UFO |

| `asteroids:combo` | combo, points | Combo achieved |

| `solitaire:win` | moves, time | Beat Solitaire |

| `freecell:win` | moves, time | Beat FreeCell |

| `snake:eat` | score | Snake ate food |

| `skifree:yeti` | - | Yeti appeared |

 

### Window Events

| Event | Properties | Description |

|-------|------------|-------------|

| `window:open` | windowId, appId | Window opened |

| `window:close` | windowId | Window closed |

| `window:focus` | windowId, appId | Window focused |

| `window:minimize` | windowId | Window minimized |

| `window:maximize` | windowId | Window maximized |

 

### App Events

| Event | Properties | Description |

|-------|------------|-------------|

| `app:open` | appId | App launched |

| `app:close` | appId | App closed |

 

### System Events

| Event | Properties | Description |

|-------|------------|-------------|

| `achievement:unlock` | id | Achievement unlocked |

| `clippy:show` | message | Show Clippy |

| `sound:play` | sound | Play sound effect |

| `notification:show` | message | Show notification |

 

---

 

## Example Scripts

 

### Hello World

```retro

print "Hello, RetrOS!"

```

 

### Simple Counter

```retro

set $count = 0

loop 10 {

    set $count = $count + 1

    print "Count: $count"

}

print "Final count: $count"

```

 

### FizzBuzz

```retro

loop 15 {

    set $n = $i + 1

    if $n % 15 == 0 then {

        print "FizzBuzz"

    } else {

        if $n % 3 == 0 then {

            print "Fizz"

        } else {

            if $n % 5 == 0 then {

                print "Buzz"

            } else {

                print $n

            }

        }

    }

}

```

 

### Game Score Monitor

```retro

print "Monitoring Asteroids score..."

launch asteroids

 

on game:score {

    if $event.appId == "asteroids" then {

        print "Score: $event.score"

        if $event.score >= 500 then {

            print "Halfway to 1000!"

        }

        if $event.score >= 1000 then {

            emit dialog:alert message="You reached 1000 points!" title="Congratulations!"

        }

    }

}

 

print "Event handler registered. Play the game!"

```

 

### File Logger

```retro

set $log = "Session Log - " + call date + "\n"

set $log = $log + "==================\n\n"

 

on app:open {

    set $entry = call time + " - Opened: $event.appId\n"

    set $log = $log + $entry

    write $log to "C:/Users/User/Desktop/session.log"

}

 

on window:close {

    set $entry = call time + " - Closed window\n"

    set $log = $log + $entry

    write $log to "C:/Users/User/Desktop/session.log"

}

 

print "Logging session to Desktop/session.log"

```

 

---

 

## Error Handling

 

### Try/Catch

```retro

try {

    # Code that might fail

    read "C:/nonexistent.txt" into $content

    print $content

} catch {

    # Handle the error

    print "Error occurred: $error"

}

```

 

---

 

## Tips and Best Practices

 

1. **Use descriptive variable names**: `$playerScore` instead of `$ps`

2. **Comment your code**: Explain complex logic

3. **Test incrementally**: Build scripts in small pieces

4. **Handle errors**: Use try/catch for risky operations

5. **Clean up**: Event handlers persist until the script runner closes

6. **Avoid infinite loops**: Always have an exit condition for while loops

 

---

 

## Running Scripts

 

Scripts can be run from:

1. **Script Runner app**: Open via Start Menu > Programs > Script Runner

2. **Terminal**: Use the `run` command with a `.retro` file path

3. **Double-click**: `.retro` files on the desktop

 

Script files use the `.retro` extension.
