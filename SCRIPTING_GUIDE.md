# RetroScript Language Guide

RetroScript is the scripting language for RetrOS (IlluminatOS!). It allows you to automate tasks, create interactive experiences, and control the operating system programmatically.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Syntax](#basic-syntax)
3. [Variables](#variables)
4. [Commands](#commands)
5. [Control Flow](#control-flow)
6. [User-Defined Functions](#user-defined-functions)
7. [Error Handling](#error-handling)
8. [Events](#events)
9. [Dialogs](#dialogs)
10. [File System](#file-system)
11. [Built-in Functions](#built-in-functions)
12. [Window Management](#window-management)
13. [Sound](#sound)
14. [Advanced Features](#advanced-features)
15. [Examples](#examples)
16. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### Running Scripts

1. Open the **Script Runner** app from the Start Menu → Programs → System Tools
2. Write your script in the editor
3. Press **F5** or click **Run** to execute
4. View output in the Output panel

### Your First Script

```retroscript
# My first RetroScript!
print Hello, RetrOS!
alert Welcome to scripting!
```

---

## Basic Syntax

### Comments

Lines starting with `#` are comments and are ignored:

```retroscript
# This is a comment
print This will run  # Inline comments also work (outside quotes)
```

### Multiple Statements

You can put multiple statements on one line using semicolons:

```retroscript
print Hello; print World; print !
```

### Blocks

Code blocks are enclosed in curly braces `{ }`:

```retroscript
loop 3 {
    print Inside the loop
}
```

---

## Variables

### Setting Variables

Use `set` to create or modify variables. Variable names start with `$`:

```retroscript
set $name = "John"
set $count = 0
set $active = true
```

### Using Variables

Reference variables with `$` prefix:

```retroscript
set $greeting = "Hello"
print $greeting World!
```

### Arithmetic

Perform math operations:

```retroscript
set $a = 10
set $b = 5
set $sum = $a + $b      # 15
set $diff = $a - $b     # 5
set $product = $a * $b  # 50
set $quotient = $a / $b # 2
set $remainder = $a % $b # 0 (modulo)
```

### Arrays

Create arrays using array literals:

```retroscript
set $numbers = [1, 2, 3, 4, 5]
set $names = ["Alice", "Bob", "Charlie"]
set $mixed = [1, "hello", true]
```

### Objects

Create objects using object literals:

```retroscript
set $person = {name: "John", age: 30, active: true}
set $config = {timeout: 5000, retries: 3}
```

### Built-in Constants

```retroscript
$TRUE   # Boolean true
$FALSE  # Boolean false
$NULL   # Null value
```

### Loop Counter

Inside loops, `$i` contains the current iteration (0-indexed):

```retroscript
loop 5 {
    print Iteration: $i
}
# Output: 0, 1, 2, 3, 4
```

---

## Commands

### Application Commands

| Command | Description | Example |
|---------|-------------|---------|
| `launch <app>` | Launch an application | `launch notepad` |
| `launch <app> with key=value` | Launch with parameters | `launch browser with url="https://example.com"` |
| `close` | Close most recent window | `close` |
| `close <windowId>` | Close specific window | `close notepad-1` |

**Available Apps:**
- `notepad`, `calculator`, `paint`, `terminal`, `browser`
- `minesweeper`, `snake`, `asteroids`, `solitaire`, `freecell`, `skifree`, `doom`
- `mycomputer`, `controlpanel`, `taskmgr`, `scriptrunner`
- `mediaplayer`, `imageviewer`, `help`

### Output Commands

| Command | Description | Example |
|---------|-------------|---------|
| `print <message>` | Print to console | `print Hello World` |
| `log <message>` | Alias for print | `log Debug info` |

### Timing Commands

| Command | Description | Example |
|---------|-------------|---------|
| `wait <ms>` | Pause execution | `wait 1000` (1 second) |
| `sleep <ms>` | Alias for wait | `sleep 500` |

---

## Control Flow

### Conditionals (if/then/else)

```retroscript
set $score = 85

if $score >= 90 then {
    print Grade: A
} else {
    print Grade: B or lower
}
```

**Comparison Operators:**
- `==` Equal
- `!=` Not equal
- `>` Greater than
- `<` Less than
- `>=` Greater than or equal
- `<=` Less than or equal

**Logical Operators:**
- `&&` AND
- `||` OR

### Loops

**Count Loop:**
```retroscript
loop 5 {
    print Iteration $i
}
```

**While Loop:**
```retroscript
set $count = 0
loop while $count < 5 {
    print Count: $count
    set $count = $count + 1
}
```

**For-Each Loop:**
```retroscript
set $names = ["Alice", "Bob", "Charlie"]
foreach $name in $names {
    print Hello, $name!
}

# With index
set $items = ["apple", "banana", "cherry"]
foreach $item in $items {
    print Item $i: $item
}
```

### Break and Continue

Exit a loop early with `break`:

```retroscript
loop 100 {
    print $i
    if $i == 5 then {
        break
    }
}
# Only prints 0-5
```

Skip to the next iteration with `continue`:

```retroscript
loop 10 {
    if $i % 2 == 0 then {
        continue  # Skip even numbers
    }
    print Odd: $i
}
# Prints: 1, 3, 5, 7, 9
```

### Return

Return a value from a script:

```retroscript
set $result = 42
return $result
```

---

## User-Defined Functions

Create your own reusable functions with `def` or `func`:

### Defining Functions

```retroscript
# Simple function
def greet($name) {
    print Hello, $name!
}

# Function with return value
def add($a, $b) {
    return $a + $b
}

# Function with multiple parameters
func calculateArea($width, $height) {
    set $area = $width * $height
    return $area
}
```

### Calling User Functions

```retroscript
# Define the function
def double($x) {
    return $x * 2
}

# Call it
set $result = call double 5
print Result: $result  # Prints: 10

# Use in expressions
set $value = call double 10
set $final = $value + 5  # 25
```

### Example: Factorial Function

```retroscript
def factorial($n) {
    if $n <= 1 then {
        return 1
    }
    set $prev = call factorial $n - 1
    return $n * $prev
}

set $result = call factorial 5
print 5! = $result  # 120
```

---

## Error Handling

Handle errors gracefully with `try/catch`:

### Basic Try/Catch

```retroscript
try {
    # Code that might fail
    read "nonexistent.txt" into $content
    print File content: $content
} catch {
    print File could not be read
}
```

### Accessing Error Message

```retroscript
try {
    # Intentionally cause an error
    set $result = call unknownFunction
} catch $err {
    print Error occurred: $err
}
```

### Example: Safe File Operations

```retroscript
def safeRead($path) {
    try {
        read $path into $content
        return $content
    } catch $err {
        print Warning: Could not read $path - $err
        return null
    }
}

set $data = call safeRead "config.txt"
if $data then {
    print Config loaded successfully
} else {
    print Using default configuration
}
```

---

## Events

### Emitting Events

Trigger system events:

```retroscript
emit sound:play type="notify"
emit achievement:unlock achievementId="scripter"
emit desktop:refresh
```

### Subscribing to Events

React to system events:

```retroscript
on window:open {
    print A window was opened!
}

on app:launched {
    print App launched: $event
}
```

The `$event` variable contains the event payload inside handlers.

---

## Dialogs

### Alert (Fire and Forget)

Show an alert message (does not wait):

```retroscript
alert Hello, User!
```

### Confirm (Wait for Response)

Show a Yes/No dialog and wait for response:

```retroscript
confirm "Do you want to continue?" into $result
if $result then {
    print User clicked Yes
} else {
    print User clicked No
}
```

### Prompt (Wait for Input)

Show an input dialog and wait for user input:

```retroscript
prompt "Enter your name:" into $name
print Hello, $name!

# With default value
prompt "Enter value:" default "42" into $value
```

### Notifications

Show a notification (non-blocking):

```retroscript
notify Task completed successfully!
```

---

## File System

### Writing Files

```retroscript
write "Hello, World!" to "C:/Users/User/Documents/hello.txt"

# Using variables
set $content = "File content here"
set $path = "C:/Users/User/Documents/myfile.txt"
write $content to $path
```

### Reading Files

```retroscript
read "C:/Users/User/Documents/hello.txt" into $content
print File contains: $content
```

### Creating Directories

```retroscript
mkdir "C:/Users/User/Documents/MyFolder"
```

### Deleting Files/Directories

```retroscript
delete "C:/Users/User/Documents/temp.txt"
rm "C:/Users/User/Documents/OldFolder"  # rm is alias for delete
```

---

## Built-in Functions

Call functions using the `call` command:

```retroscript
set $result = call functionName arg1 arg2
```

### Math Functions

| Function | Description | Example |
|----------|-------------|---------|
| `random min max` | Random integer | `call random 1 100` |
| `abs value` | Absolute value | `call abs -5` → 5 |
| `round value` | Round to nearest | `call round 3.7` → 4 |
| `floor value` | Round down | `call floor 3.9` → 3 |
| `ceil value` | Round up | `call ceil 3.1` → 4 |
| `min a b ...` | Minimum value | `call min 5 3 8` → 3 |
| `max a b ...` | Maximum value | `call max 5 3 8` → 8 |
| `pow base exp` | Power | `call pow 2 3` → 8 |
| `sqrt value` | Square root | `call sqrt 16` → 4 |
| `sin value` | Sine | `call sin 0` → 0 |
| `cos value` | Cosine | `call cos 0` → 1 |
| `tan value` | Tangent | `call tan 0` → 0 |
| `log value` | Natural log | `call log 2.718` → ~1 |
| `exp value` | e^value | `call exp 1` → ~2.718 |
| `clamp val min max` | Clamp to range | `call clamp 15 0 10` → 10 |
| `mod a b` | Modulo | `call mod 10 3` → 1 |
| `sign value` | Sign (-1, 0, 1) | `call sign -5` → -1 |
| `PI` | Pi constant | `call PI` → 3.14159... |
| `E` | Euler's number | `call E` → 2.71828... |

### String Functions

| Function | Description | Example |
|----------|-------------|---------|
| `concat a b c` | Concatenate strings | `call concat "Hello" " " "World"` |
| `upper text` | Uppercase | `call upper "hello"` → "HELLO" |
| `lower text` | Lowercase | `call lower "HELLO"` → "hello" |
| `length text` | String/array length | `call length "hello"` → 5 |
| `trim text` | Remove whitespace | `call trim "  hi  "` → "hi" |
| `trimStart text` | Remove leading space | `call trimStart "  hi"` → "hi" |
| `trimEnd text` | Remove trailing space | `call trimEnd "hi  "` → "hi" |
| `split text sep` | Split into array | `call split "a,b,c" ","` |
| `join arr sep` | Join array | `call join $arr ","` |
| `substr text start len` | Substring | `call substr "hello" 0 3` → "hel" |
| `substring text start end` | Substring by indices | `call substring "hello" 1 4` → "ell" |
| `replace text old new` | Replace first | `call replace "hello" "l" "L"` |
| `replaceAll text old new` | Replace all | `call replaceAll "hello" "l" "L"` → "heLLo" |
| `contains text search` | Contains check | `call contains "hello" "ell"` → true |
| `startsWith text prefix` | Starts with | `call startsWith "hello" "hel"` → true |
| `endsWith text suffix` | Ends with | `call endsWith "hello" "lo"` → true |
| `padStart str len char` | Pad start | `call padStart "5" 3 "0"` → "005" |
| `padEnd str len char` | Pad end | `call padEnd "5" 3 "0"` → "500" |
| `repeat str count` | Repeat string | `call repeat "ab" 3` → "ababab" |
| `charAt str idx` | Character at index | `call charAt "hello" 1` → "e" |
| `indexOf str search` | Find index | `call indexOf "hello" "l"` → 2 |
| `lastIndexOf str search` | Find last index | `call lastIndexOf "hello" "l"` → 3 |
| `match str pattern` | Regex match | `call match "hello" "[aeiou]"` |

### Array Functions

| Function | Description | Example |
|----------|-------------|---------|
| `count arr` | Array/object length | `call count $myArray` |
| `first arr` | First element | `call first $arr` |
| `last arr` | Last element | `call last $arr` |
| `push arr item` | Add to end | `call push $arr "new"` |
| `pop arr` | Remove from end | `call pop $arr` |
| `shift arr` | Remove from start | `call shift $arr` |
| `unshift arr item` | Add to start | `call unshift $arr "first"` |
| `includes arr item` | Contains check | `call includes $arr "find"` |
| `sort arr desc` | Sort array | `call sort $arr` or `call sort $arr true` |
| `reverse arr` | Reverse array | `call reverse $arr` |
| `slice arr start end` | Extract portion | `call slice $arr 1 3` |
| `splice arr start n items` | Modify array | `call splice $arr 1 2 "x"` |
| `concat_arrays a b` | Merge arrays | `call concat_arrays $a $b` |
| `unique arr` | Remove duplicates | `call unique $arr` |
| `flatten arr depth` | Flatten nested | `call flatten $arr 2` |
| `range start end step` | Generate range | `call range 0 10 2` → [0,2,4,6,8] |
| `fill length value` | Create filled array | `call fill 5 0` → [0,0,0,0,0] |
| `at arr idx` | Get by index (neg ok) | `call at $arr -1` → last element |

### Object Functions

| Function | Description | Example |
|----------|-------------|---------|
| `keys obj` | Get object keys | `call keys $person` |
| `values obj` | Get object values | `call values $person` |
| `entries obj` | Get key-value pairs | `call entries $person` |
| `get obj key default` | Get property | `call get $obj "name" "unknown"` |
| `set obj key value` | Set property | `call set $obj "age" 30` |
| `has obj key` | Check property exists | `call has $obj "name"` |
| `merge obj1 obj2` | Merge objects | `call merge $defaults $config` |
| `clone obj` | Deep clone | `call clone $original` |

### JSON Functions

| Function | Description | Example |
|----------|-------------|---------|
| `toJSON obj` | Convert to JSON | `call toJSON $data` |
| `fromJSON str` | Parse JSON | `call fromJSON $jsonStr` |
| `prettyJSON obj indent` | Pretty print | `call prettyJSON $data 2` |

### Time Functions

| Function | Description | Example |
|----------|-------------|---------|
| `now` | Unix timestamp (ms) | `call now` |
| `time` | Current time string | `call time` → "10:30:45 AM" |
| `date` | Current date string | `call date` → "1/15/2024" |
| `year` | Current year | `call year` → 2024 |
| `month` | Current month (1-12) | `call month` → 12 |
| `day` | Current day (1-31) | `call day` → 25 |
| `weekday` | Day of week (0-6) | `call weekday` → 3 (Wed) |
| `hour` | Current hour (0-23) | `call hour` → 14 |
| `minute` | Current minute (0-59) | `call minute` → 30 |
| `second` | Current second (0-59) | `call second` → 45 |
| `formatDate ts format` | Format date | `call formatDate $ts "iso"` |
| `formatTime ts format` | Format time | `call formatTime $ts "long"` |
| `elapsed startMs` | Time since start | `call elapsed $startTime` |

### Type Functions

| Function | Description | Example |
|----------|-------------|---------|
| `typeof value` | Get type | `call typeof $var` → "string", "number", "array", "object" |
| `isNumber value` | Is number? | `call isNumber 42` → true |
| `isString value` | Is string? | `call isString "hi"` → true |
| `isArray value` | Is array? | `call isArray $arr` → true |
| `isObject value` | Is object? | `call isObject $obj` → true |
| `isBoolean value` | Is boolean? | `call isBoolean true` → true |
| `isNull value` | Is null/undefined? | `call isNull $var` |
| `isEmpty value` | Is empty? | `call isEmpty ""` → true |
| `toNumber value` | Convert to number | `call toNumber "42"` → 42 |
| `toInt value` | Convert to integer | `call toInt "42.7"` → 42 |
| `toString value` | Convert to string | `call toString 42` → "42" |
| `toBoolean value` | Convert to boolean | `call toBoolean 1` → true |
| `toArray value` | Convert to array | `call toArray "abc"` → ["a","b","c"] |

### Debug Functions

| Function | Description | Example |
|----------|-------------|---------|
| `debug args...` | Print debug message | `call debug "Value:" $x` |
| `inspect value` | Pretty-print value | `call inspect $object` |
| `assert cond msg` | Assert condition | `call assert $x > 0 "x must be positive"` |
| `getEnv key` | Get environment info | `call getEnv "version"` |

### System Functions

| Function | Description |
|----------|-------------|
| `getWindows` | Get list of open windows |
| `getApps` | Get list of available apps |
| `query event payload` | Query system state |
| `exec command payload` | Execute CommandBus command |

### Dialog Functions (Async)

These are available as functions for use in advanced scripts:

| Function | Description |
|----------|-------------|
| `alert message title icon` | Show alert |
| `confirm message title` | Show confirm, returns true/false |
| `prompt message default title` | Show prompt, returns input or null |

---

## Window Management

### Focus

Bring a window to front:

```retroscript
focus notepad-1
```

### Minimize

```retroscript
minimize notepad-1
```

### Maximize

```retroscript
maximize notepad-1
```

---

## Sound

Play system sounds:

```retroscript
play notify
play error
play startup
play shutdown
play open
play close
```

---

## Advanced Features

### Script Timeout

Scripts have a default 30-second timeout to prevent infinite loops. The script engine will automatically stop execution if it runs too long.

```retroscript
# This will be stopped after 30 seconds
loop while true {
    print Still running...
    wait 100
}
```

While loops also have a maximum iteration count (100,000) to prevent runaway scripts.

### Array Iteration Patterns

```retroscript
# Using foreach with arrays
set $fruits = ["apple", "banana", "cherry"]

# Basic iteration
foreach $fruit in $fruits {
    print Fruit: $fruit
}

# With index ($i is available)
foreach $fruit in $fruits {
    print $i: $fruit
}

# Processing with accumulator
set $total = 0
set $prices = [10, 20, 30]
foreach $price in $prices {
    set $total = $total + $price
}
print Total: $total
```

### Working with Objects

```retroscript
# Create an object
set $user = {name: "John", age: 30, role: "admin"}

# Access properties
set $name = call get $user "name"
print User: $name

# Get all keys
set $props = call keys $user
foreach $prop in $props {
    set $val = call get $user $prop
    print $prop: $val
}

# Merge objects
set $defaults = {theme: "dark", language: "en"}
set $settings = {theme: "light"}
set $config = call merge $defaults $settings
# Result: {theme: "light", language: "en"}
```

### Timing and Performance

```retroscript
# Measure execution time
set $start = call now

# ... do some work ...
loop 1000 {
    set $x = call sqrt $i
}

set $elapsed = call elapsed $start
print Execution took $elapsed ms
```

### Debugging Scripts

```retroscript
# Use debug to output diagnostic info
set $data = [1, 2, 3]
call debug "Data array:" $data

# Use inspect for detailed view
set $obj = {a: 1, b: {c: 2}}
call inspect $obj

# Use assert for validation
set $count = call count $data
call assert $count > 0 "Data should not be empty"
```

### String Interpolation in Print

Variables are automatically interpolated in print statements:

```retroscript
set $name = "Alice"
set $score = 95

print Hello, $name! Your score is $score.
# Output: Hello, Alice! Your score is 95.
```

### Modular Scripts with Functions

```retroscript
# Define utility functions
def log_info($msg) {
    set $ts = call time
    print [$ts] INFO: $msg
}

def log_error($msg) {
    set $ts = call time
    print [$ts] ERROR: $msg
    play error
}

# Use them throughout your script
call log_info "Script started"
# ... do work ...
call log_info "Processing complete"
```

---

## Examples

### Example 1: Interactive Greeter

```retroscript
# Interactive Greeter
prompt "What is your name?" into $name

if $name then {
    set $greeting = call concat "Hello, " $name "!"
    alert $greeting
    notify Welcome to RetrOS!
} else {
    alert You didn't enter a name!
}
```

### Example 2: App Launcher with Confirmation

```retroscript
# App Launcher
confirm "Would you like to open the Calculator?" into $openCalc

if $openCalc then {
    launch calculator
    wait 500
    notify Calculator is ready!
    play notify
}
```

### Example 3: File Operations

```retroscript
# Create a log file
set $timestamp = call time
set $logEntry = call concat "Script ran at: " $timestamp
write $logEntry to "C:/Users/User/Documents/script.log"
print Log file created!

# Read it back
read "C:/Users/User/Documents/script.log" into $content
print Log says: $content
```

### Example 4: Loop with User Input

```retroscript
# Number guessing game
set $target = call random 1 10
set $guesses = 0

loop 5 {
    prompt "Guess a number (1-10):" into $guess
    set $guesses = $guesses + 1

    if $guess == $target then {
        set $msg = call concat "Correct! You got it in " $guesses " tries!"
        alert $msg
        break
    }

    if $guess < $target then {
        notify Too low! Try again.
    } else {
        notify Too high! Try again.
    }
}
```

### Example 5: Multi-App Automation

```retroscript
# Open multiple apps and arrange them
print Opening applications...

launch notepad
wait 300
launch calculator
wait 300
launch paint
wait 300

notify All apps are open!
play notify

# Wait for user
confirm "Close all apps?" into $closeAll
if $closeAll then {
    close
    wait 100
    close
    wait 100
    close
    notify Apps closed!
}
```

### Example 6: System Information

```retroscript
# Get system info
print === System Information ===
print Current time: (call time)
print Current date: (call date)

set $windows = call getWindows
set $windowCount = call count $windows
print Open windows: $windowCount

set $apps = call getApps
set $appCount = call count $apps
print Available apps: $appCount
```

### Example 7: Event-Driven Script

```retroscript
# React to window events
print Monitoring window events...

on window:open {
    notify Window opened!
}

on window:close {
    notify Window closed!
}

# Keep script running
loop 10 {
    wait 1000
    print Still monitoring... ($i)
}
```

### Comprehensive Test Script

This script tests all major features:

```retroscript
# ========================================
# RetroScript Comprehensive Test
# ========================================

print === Starting RetroScript Tests ===

# --- Variable Tests ---
print
print [1] Variable Tests
set $string = "Hello"
set $number = 42
set $bool = true
print String: $string
print Number: $number
print Boolean: $bool

# --- Math Tests ---
print
print [2] Math Tests
set $a = 10
set $b = 3
set $sum = $a + $b
set $diff = $a - $b
set $prod = $a * $b
set $quot = $a / $b
print 10 + 3 = $sum
print 10 - 3 = $diff
print 10 * 3 = $prod
print 10 / 3 = $quot

# --- String Functions ---
print
print [3] String Function Tests
set $text = "  Hello World  "
set $upper = call upper $text
set $lower = call lower $text
set $trimmed = call trim $text
set $len = call length $trimmed
print Original: $text
print Upper: $upper
print Lower: $lower
print Trimmed: $trimmed
print Length: $len

# --- Control Flow ---
print
print [4] Control Flow Tests
set $x = 5
if $x > 3 then {
    print $x is greater than 3
}

print Loop test:
loop 3 {
    print   Iteration $i
}

# --- Time Functions ---
print
print [5] Time Functions
print Current time: (call time)
print Current date: (call date)

# --- Random ---
print
print [6] Random Number
set $rand = call random 1 100
print Random (1-100): $rand

# --- Sound ---
print
print [7] Sound Test
play notify

# --- Notification ---
print
print [8] Notification Test
notify This is a test notification!
wait 500

# --- Tests Complete ---
print
print === All Tests Complete! ===
alert RetroScript is working correctly!
```

---

## Tips & Best Practices

1. **Use Comments**: Document your scripts for future reference
   ```retroscript
   # This script does XYZ
   # Author: Your Name
   ```

2. **Use Meaningful Variable Names**:
   ```retroscript
   set $userName = "John"  # Good
   set $x = "John"         # Not descriptive
   ```

3. **Add Waits After Launches**: Apps need time to open
   ```retroscript
   launch notepad
   wait 500  # Give it time to open
   ```

4. **Handle User Cancellation**: Check for null on prompts
   ```retroscript
   prompt "Enter name:" into $name
   if $name then {
       # User entered something
   } else {
       # User cancelled
   }
   ```

5. **Use Loops for Retries**:
   ```retroscript
   loop 3 {
       # Try something
       if $success then {
           break
       }
       wait 1000
   }
   ```

6. **Test Incrementally**: Run small parts of your script to debug

7. **Use the Events Tab**: In Script Runner, check the Events tab to see what events are firing

---

## Troubleshooting

### Script Not Running
- Check for syntax errors (mismatched braces, typos)
- Look at the Output panel for error messages
- Make sure you clicked Run or pressed F5

### Dialogs Not Appearing
- Check that SystemDialogs feature is enabled
- Wait for previous dialogs to close

### Variables Not Working
- Make sure variable names start with `$`
- Check spelling matches exactly
- Variables are case-sensitive

### App Not Launching
- Verify the app ID is correct (lowercase)
- Check if the app is already open

---

## Quick Reference Card

```
VARIABLES      set $var = value
OUTPUT         print message | log message
APPS           launch app | close [id]
TIMING         wait ms | sleep ms
DIALOGS        alert msg | confirm msg into $var | prompt msg into $var
NOTIFY         notify message
CONTROL        if cond then { } else { } | loop N { } | break | return
EVENTS         emit event key=val | on event { }
FILES          write txt to path | read path into $var | mkdir path | delete path
SOUND          play soundType
WINDOWS        focus id | minimize id | maximize id
FUNCTIONS      call funcName args...
COMMENTS       # comment
```

---

*Happy Scripting!*
