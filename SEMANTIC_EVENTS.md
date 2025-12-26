# Semantic Event System

RetrOS features a **semantic event architecture** that enables typed, validated, and well-documented communication between all system components (apps, features, UI, system functions).

## Overview

The **SemanticEventBus** is an enhanced event system that provides:

- **Semantic event names** - Clear, namespace-based naming (e.g., `window:open`, `app:launch`, `system:ready`)
- **Event schema validation** - Automatic payload validation against defined schemas
- **Event documentation** - Self-documenting with descriptions and examples
- **Middleware support** - Intercept and transform events
- **Pattern matching** - Subscribe to multiple events with wildcards (`window:*`)
- **Priority system** - Control handler execution order
- **Event cancellation** - Prevent event propagation
- **Request/Response** - Async operations with promise-based responses
- **Channels** - Scoped communication between components
- **Throttling/Debouncing** - Rate-limit high-frequency events
- **Event streams** - Async iterators for event processing
- **100% Backward compatible** - All existing code continues to work

## Quick Start

### Basic Usage

```javascript
import EventBus, { Priority } from './core/EventBus.js';

// Subscribe to an event
EventBus.on('window:open', (payload) => {
    console.log('Window opened:', payload.id);
});

// Emit an event
EventBus.emit('window:open', {
    id: 'window-notepad-1',
    appId: 'notepad'
});

// Unsubscribe
EventBus.off('window:open', handler);
```

## Advanced Features

### 1. Priority-based Subscriptions

Control the order handlers are executed:

```javascript
// System-level handler runs first
EventBus.on('window:close', handler, { priority: Priority.SYSTEM });

// Normal priority (default)
EventBus.on('window:close', handler, { priority: Priority.NORMAL });

// User scripts run last
EventBus.on('window:close', handler, { priority: Priority.SCRIPT });
```

Priority levels:
- `SYSTEM: 1000` - System handlers (run first)
- `HIGH: 100` - High priority
- `NORMAL: 0` - Default
- `LOW: -100` - Low priority
- `SCRIPT: -500` - User scripts (run last)

### 2. Event Cancellation

Prevent events from propagating:

```javascript
// Emit a cancellable event
const event = EventBus.emit('window:close', { id }, { cancellable: true });

// Handler can cancel
EventBus.on('window:close', (payload, metadata, event) => {
    if (hasUnsavedChanges) {
        event.cancel(); // Prevent other handlers from running
    }
}, { priority: Priority.HIGH });

// Check if cancelled
if (event.cancelled) {
    console.log('Window close was prevented');
}
```

### 3. Request/Response Pattern

Async operations with promises:

```javascript
// Request a confirmation dialog
const response = await EventBus.request('dialog:confirm', {
    message: 'Delete this file?',
    title: 'Confirm Delete'
}, { timeout: 30000 });

if (response.confirmed) {
    deleteFile();
}

// Respond to a request
EventBus.on('dialog:confirm', (payload) => {
    // Show dialog, then respond
    EventBus.respond('dialog:confirm:response', payload.requestId, {
        confirmed: true
    });
});
```

### 4. Channels (Scoped Communication)

Isolated messaging between components:

```javascript
// Create/join a channel
const channel = EventBus.channel('notepad-sync', 'notepad-1');

// Send messages
channel.send({ action: 'update', content: 'Hello' });

// Receive messages
channel.receive((message, sender) => {
    console.log(`From ${sender}:`, message);
});

// Leave channel when done
channel.leave();

// Broadcast to all channel subscribers
EventBus.broadcast('notepad-sync', { action: 'refresh' });
```

### 5. Throttling & Debouncing

Rate-limit high-frequency events:

```javascript
// Throttled - max once per 16ms (60fps)
EventBus.emitThrottled('drag:move', { x, y }, 16);

// Debounced - wait until quiet
EventBus.emitDebounced('search:query', { query }, 300);
```

### 6. Event Streams & Promises

Modern async patterns:

```javascript
// Wait for a specific event
const { payload } = await EventBus.waitFor('app:launch', {
    timeout: 5000,
    filter: p => p.appId === 'notepad'
});

// Async iterator for event streams
for await (const { payload } of EventBus.stream('window:*')) {
    console.log('Window event:', payload);
    if (payload.id === 'done') break;
}
```

### 7. Event Piping & Composition

Transform and combine events:

```javascript
// Pipe events with transformation
EventBus.pipe('drag:move', 'position:update', (payload) => ({
    x: Math.round(payload.x),
    y: Math.round(payload.y)
}));

// Filter events
EventBus.filter('window:*', p => p.appId === 'notepad', 'notepad:window');

// Combine multiple events
EventBus.combine(
    ['user:login', 'config:loaded'],
    'app:ready',
    (payloads) => ({ ...payloads['user:login'], ...payloads['config:loaded'] })
);
```

### 8. Wildcard Subscriptions

Subscribe to all events in a namespace:

```javascript
// Listen to ALL window events
EventBus.on('window:*', (payload, metadata) => {
    console.log('Window event:', metadata.name, payload);
});

// Listen to ALL app events
EventBus.on('app:*', (payload, metadata) => {
    console.log('App event:', metadata.name, payload);
});
```

### 9. Event Middleware

Intercept and transform events:

```javascript
// Add logging middleware
EventBus.use((event, next) => {
    console.log(`[${event.name}]`, event.payload);
    next(); // Continue to listeners
});

// Add analytics middleware
EventBus.use((event, next) => {
    if (event.name.startsWith('app:')) {
        analytics.track(event.name, event.payload);
    }
    next();
});
```

## Event Namespaces

Events are organized into semantic namespaces:

| Namespace | Description | Examples |
|-----------|-------------|----------|
| `window` | Window management | `window:open`, `window:close`, `window:focus`, `window:resize` |
| `app` | Application lifecycle | `app:launch`, `app:open`, `app:close`, `app:registered` |
| `system` | System events | `system:ready`, `system:shutdown`, `system:screensaver:*` |
| `ui` | UI interactions | `ui:menu:start:toggle`, `ui:menu:context:show`, `ui:taskbar:update` |
| `icon` | Desktop icons | `icon:click`, `icon:dblclick`, `icon:move`, `icon:delete` |
| `dialog` | System dialogs | `dialog:alert`, `dialog:confirm`, `dialog:prompt`, `dialog:file-*` |
| `state` | State changes | `state:change` |
| `sound` | System sounds | `sound:play`, `sound:volume` |
| `audio` | Media playback | `audio:play`, `audio:pause`, `audio:stop`, `audio:ended` |
| `feature` | Feature toggles | `feature:enable`, `feature:disable`, `feature:pet:toggle` |
| `achievement` | Achievements | `achievement:unlock` |
| `fs` | File system | `fs:file:create`, `fs:file:update`, `fs:file:delete` |
| `filesystem` | FS changes | `filesystem:changed` |
| `recyclebin` | Recycle bin | `recyclebin:update`, `recyclebin:recycle-file`, `recyclebin:restore` |
| `drag` | Drag & drop | `drag:start`, `drag:move`, `drag:end` |
| `notification` | Notifications | `notification:show`, `notification:dismiss` |
| `clipboard` | Clipboard | `clipboard:copy`, `clipboard:paste` |
| `keyboard` | Keyboard | `keyboard:shortcut` |
| `script` | Scripting | `script:execute`, `script:complete`, `script:error` |
| `channel` | Channels | `channel:message`, `channel:subscribe`, `channel:unsubscribe` |
| `setting` | Settings | `setting:changed` |
| `desktop` | Desktop | `desktop:render`, `desktop:refresh` |

## Debugging Tools

Access debugging tools via the browser console:

```javascript
// Enable event logging
__RETROS_DEBUG.enableLog();

// View recent events
__RETROS_DEBUG.showEventLog(20);

// List all available events (80+ events!)
__RETROS_DEBUG.listEvents();

// List all namespaces
__RETROS_DEBUG.listNamespaces();

// List events by namespace
__RETROS_DEBUG.listNamespace('window');

// Show event schema
__RETROS_DEBUG.describeEvent('window:open');

// Show statistics
__RETROS_DEBUG.showStats();

// Show active listeners
__RETROS_DEBUG.showListeners();

// Show active channels
__RETROS_DEBUG.showChannels();

// Show pending requests
__RETROS_DEBUG.showPendingRequests();

// Interactive testing
await __RETROS_DEBUG.request('dialog:confirm', { message: 'Test?' });
__RETROS_DEBUG.emit('sound:play', { type: 'click' });
```

## Event Schema

All events are defined in `core/EventSchema.js` with complete documentation:

```javascript
'window:open': {
    namespace: 'window',
    action: 'open',
    description: 'Triggered after window is opened and rendered in DOM',
    payload: {
        id: 'string',          // Required: Window ID
        appId: 'string?',      // Optional: App ID
        element: 'HTMLElement?' // Optional: DOM element
    },
    example: {
        id: 'window-notepad-1',
        appId: 'notepad'
    }
}
```

### Payload Types

- `string` - String value
- `number` - Numeric value
- `boolean` - Boolean value
- `object` - Object/dictionary
- `array` - Array/list
- `any` - Any type
- `HTMLElement` - DOM element
- Add `?` suffix for optional fields (e.g., `string?`)

## Statistics

Track event bus usage:

```javascript
EventBus.getStats();
// => {
//   emitted: 1234,
//   validated: 1200,
//   validationErrors: 5,
//   validationWarnings: 0,
//   middlewareErrors: 0,
//   requestsTotal: 50,
//   requestsResolved: 48,
//   requestsTimedOut: 2,
//   eventsCancelled: 3
// }

EventBus.resetStats(); // Reset counters
```

## Best Practices

### 1. Use Priority Wisely

```javascript
// System handlers for critical logic
EventBus.on('window:close', saveState, { priority: Priority.SYSTEM });

// User scripts for customization
EventBus.on('window:close', userScript, { priority: Priority.SCRIPT });
```

### 2. Use Request/Response for Async

```javascript
// Instead of fire-and-forget
EventBus.emit('dialog:confirm', { message: 'OK?' });

// Use request/response
const result = await EventBus.request('dialog:confirm', { message: 'OK?' });
```

### 3. Use Channels for App Communication

```javascript
// Instead of global events
EventBus.emit('notepad:update', { content });

// Use channels for isolation
const channel = EventBus.channel('notepad-sync', this.id);
channel.send({ content });
```

### 4. Throttle High-Frequency Events

```javascript
// Instead of flooding listeners
EventBus.emit('drag:move', { x, y }); // Every mousemove!

// Throttle to 60fps
EventBus.emitThrottled('drag:move', { x, y }, 16);
```

### 5. Clean Up Listeners

```javascript
// AppBase and FeatureBase handle this automatically!
class MyApp extends AppBase {
    onMount() {
        this.onEvent('window:open', this.handleOpen); // Auto-cleanup on close!
    }
}
```

## Scripting Integration

The event system is designed to support a scripting layer:

```javascript
// Script execution flow
EventBus.on('script:execute', async ({ scriptId, params, requestId }) => {
    try {
        const result = await executeScript(scriptId, params);
        EventBus.respond('script:complete', requestId, { result });
    } catch (error) {
        EventBus.emit('script:error', { scriptId, error: error.message });
    }
});

// Scripts can use all event features
const script = {
    async run() {
        // Wait for conditions
        await EventBus.waitFor('system:ready');

        // Use channels for communication
        const channel = EventBus.channel('my-script', 'script-1');

        // React to events
        EventBus.on('window:open', (payload) => {
            // Script logic
        }, { priority: Priority.SCRIPT });
    }
};
```

## Architecture Benefits

The semantic event system provides:

1. **Type Safety** - Payloads are validated automatically
2. **Priority Control** - Deterministic handler execution order
3. **Cancellation** - Prevent unwanted event propagation
4. **Async Support** - Request/response for complex interactions
5. **Isolation** - Channels for scoped communication
6. **Performance** - Throttling and debouncing built-in
7. **Discoverability** - 80+ documented events
8. **Debuggability** - Rich introspection tools
9. **Scriptability** - Ready for automation and scripting
10. **Backward Compatible** - All existing code works unchanged

---

**Built for RetrOS**
