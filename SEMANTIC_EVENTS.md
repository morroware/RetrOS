# Semantic Event System

IlluminatOS now features a **semantic event architecture** that enables typed, validated, and well-documented communication between all system components (apps, features, UI, system functions).

## Overview

The **SemanticEventBus** is an enhanced event system that provides:

- ✅ **Semantic event names** - Clear, namespace-based naming (e.g., `window:open`, `app:launch`, `system:ready`)
- ✅ **Event schema validation** - Automatic payload validation against defined schemas
- ✅ **Event documentation** - Self-documenting with descriptions and examples
- ✅ **Middleware support** - Intercept and transform events
- ✅ **Pattern matching** - Subscribe to multiple events with wildcards (`window:*`)
- ✅ **Event metadata** - Automatic timestamps and source tracking
- ✅ **Debugging tools** - Event logs, statistics, and introspection
- ✅ **100% Backward compatible** - All existing code continues to work

## Quick Start

### Basic Usage (Same as before!)

```javascript
import EventBus from './core/EventBus.js';

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

### New Features

#### 1. Wildcard Subscriptions

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

#### 2. Event Middleware

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
        // Track app events
        analytics.track(event.name, event.payload);
    }
    next();
});
```

#### 3. Event Introspection

Explore the event system:

```javascript
// Get all registered events
EventBus.getRegisteredEvents();
// => ['window:open', 'window:close', 'app:launch', ...]

// Get events by namespace
EventBus.getEventsByNamespace('window');
// => ['window:open', 'window:close', 'window:focus', ...]

// Get event schema
EventBus.getEventSchema('window:open');
// => { namespace: 'window', action: 'open', description: '...', payload: {...} }

// View event history
EventBus.getEventLog(10); // Last 10 events
```

#### 4. Debugging Tools

Access debugging tools via the browser console:

```javascript
// Enable event logging
__ILLUMINATOS_DEBUG.enableLog();

// View recent events
__ILLUMINATOS_DEBUG.showEventLog(20);

// List all available events
__ILLUMINATOS_DEBUG.listEvents();

// List events by namespace
__ILLUMINATOS_DEBUG.listNamespace('window');

// Show event schema
__ILLUMINATOS_DEBUG.describeEvent('window:open');

// Show statistics
__ILLUMINATOS_DEBUG.showStats();

// Show active listeners
__ILLUMINATOS_DEBUG.showListeners();
```

## Event Namespaces

Events are organized into semantic namespaces:

| Namespace | Description | Examples |
|-----------|-------------|----------|
| `window` | Window management | `window:open`, `window:close`, `window:focus`, `window:minimize`, `window:maximize` |
| `app` | Application lifecycle | `app:launch`, `app:open`, `app:close`, `app:registered` |
| `system` | System events | `system:ready`, `system:shutdown`, `system:screensaver:start` |
| `ui` | UI interactions | `ui:menu:start:toggle`, `ui:menu:context:show`, `ui:taskbar:update` |
| `icon` | Desktop icons | `icon:click`, `icon:dblclick`, `icon:move`, `icon:delete` |
| `state` | State changes | `state:change` |
| `sound` | System sounds | `sound:play`, `sound:volume` |
| `audio` | Media playback | `audio:play`, `audio:pause`, `audio:stop`, `audio:ended` |
| `feature` | Feature toggles | `feature:enable`, `feature:disable`, `feature:pet:toggle` |
| `achievement` | Achievements | `achievement:unlock` |
| `fs` | File system | `fs:file:create`, `fs:file:update`, `fs:file:delete` |
| `drag` | Drag & drop | `drag:start`, `drag:move`, `drag:end` |
| `setting` | Settings | `setting:changed` |
| `desktop` | Desktop | `desktop:render`, `desktop:refresh` |

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

## Common Events

### Window Events

```javascript
// Window opened
EventBus.emit('window:open', { id, appId });

// Window closed
EventBus.emit('window:close', { id, appId });

// Window focused
EventBus.emit('window:focus', { id, previousId });

// Window minimized
EventBus.emit('window:minimize', { id });

// Window maximized
EventBus.emit('window:maximize', { id });

// Window restored
EventBus.emit('window:restore', { id });

// Window resized
EventBus.emit('window:resize', { id, width, height });
```

### App Events

```javascript
// Launch app
EventBus.emit('app:launch', { appId, params });

// App opened
EventBus.emit('app:open', { appId, windowId, instance });

// App closed
EventBus.emit('app:close', { appId, windowId });
```

### System Events

```javascript
// System ready (boot complete)
EventBus.emit('system:ready', { timestamp, bootTime });

// Shutdown
EventBus.emit('system:shutdown', { reason });

// Screensaver start
EventBus.emit('system:screensaver:start', { mode });

// Screensaver end
EventBus.emit('system:screensaver:end', {});
```

### UI Events

```javascript
// Start menu toggle
EventBus.emit('ui:menu:start:toggle', {});

// Context menu show
EventBus.emit('ui:menu:context:show', { x, y, items, target });

// Context menu hide
EventBus.emit('ui:menu:context:hide', {});

// Taskbar update
EventBus.emit('ui:taskbar:update', {});
```

## Backward Compatibility

All old event names are automatically mapped to new semantic names:

| Old Event Name | New Semantic Name |
|----------------|-------------------|
| `boot:complete` | `system:ready` |
| `startmenu:toggle` | `ui:menu:start:toggle` |
| `contextmenu:show` | `ui:menu:context:show` |
| `contextmenu:hide` | `ui:menu:context:hide` |
| `taskbar:update` | `ui:taskbar:update` |
| `screensaver:start` | `system:screensaver:start` |
| `screensaver:end` | `system:screensaver:end` |
| `pet:toggle` | `feature:pet:toggle` |
| `pet:change` | `feature:pet:change` |

**Your existing code continues to work without changes!**

## Configuration

Configure the event bus behavior:

```javascript
EventBus.configure({
    validation: true,      // Validate payloads (default: true)
    logging: false,        // Log events to console (default: false)
    timestamps: true,      // Add timestamps (default: true)
    trackHistory: true,    // Keep event history (default: true)
    warnUnknown: true     // Warn about unknown events (default: true)
});
```

## Statistics

Track event bus usage:

```javascript
EventBus.getStats();
// => {
//   emitted: 1234,
//   validated: 1200,
//   validationErrors: 5,
//   middlewareErrors: 0
// }

EventBus.resetStats(); // Reset counters
```

## Best Practices

### 1. Use Semantic Event Names

✅ **Good:**
```javascript
EventBus.emit('window:open', { id, appId });
EventBus.emit('app:launch', { appId });
```

❌ **Avoid:**
```javascript
EventBus.emit('open', { id }); // Too vague
EventBus.emit('windowOpened', { id }); // Inconsistent naming
```

### 2. Validate Payloads

Always provide the expected payload structure:

✅ **Good:**
```javascript
EventBus.emit('window:open', {
    id: 'window-1',
    appId: 'notepad'
});
```

❌ **Bad:**
```javascript
EventBus.emit('window:open', 'window-1'); // Missing required fields
```

### 3. Document Custom Events

If you add custom events, add them to `EventSchema.js`:

```javascript
'myapp:custom:action': {
    namespace: 'myapp',
    action: 'custom:action',
    description: 'My custom action',
    payload: {
        data: 'string'
    },
    example: {
        data: 'example'
    }
}
```

### 4. Use Wildcards Wisely

Wildcards are powerful but can impact performance if overused:

✅ **Good use cases:**
- Logging/analytics middleware
- Feature monitoring
- Global error handling

❌ **Avoid:**
- Business logic that should use specific events
- Performance-critical paths

### 5. Clean Up Listeners

Always unsubscribe when done:

```javascript
class MyApp {
    onMount() {
        // Store unsubscribe function
        this.unsubscribe = EventBus.on('window:open', this.handleOpen);
    }

    onClose() {
        // Clean up
        this.unsubscribe();
    }
}
```

Or use the AppBase/FeatureBase auto-cleanup:

```javascript
class MyApp extends AppBase {
    onMount() {
        // Automatically cleaned up on close!
        this.onEvent('window:open', this.handleOpen);
    }
}
```

## Migration Guide

### For New Code

Use semantic events from the start:

```javascript
// New code - use semantic events
EventBus.emit('system:ready', { timestamp: Date.now() });
EventBus.on('window:*', handler);
```

### For Existing Code

No changes required! But you can gradually adopt new features:

```javascript
// Old code - still works!
EventBus.emit('boot:complete');

// Gradually adopt new features
EventBus.on('window:*', handler); // Add wildcards
EventBus.getEventLog(); // Use debugging tools
```

## Architecture Benefits

The semantic event system provides:

1. **Type Safety** - Payloads are validated automatically
2. **Documentation** - Events are self-documenting
3. **Debugging** - Easy to trace event flow
4. **Discoverability** - Easy to find available events
5. **Flexibility** - Middleware and wildcards for advanced use cases
6. **Maintainability** - Clear contracts between components
7. **Testability** - Easy to mock and test event flows

## Examples

### Example 1: Monitor All App Events

```javascript
EventBus.on('app:*', (payload, metadata) => {
    console.log(`App ${metadata.name}:`, payload.appId);
});
```

### Example 2: Log All Events

```javascript
EventBus.use((event, next) => {
    console.log(`[${new Date().toISOString()}] ${event.name}`, event.payload);
    next();
});
```

### Example 3: Track Window Lifecycle

```javascript
const windowLifecycle = {
    opened: 0,
    closed: 0
};

EventBus.on('window:open', () => windowLifecycle.opened++);
EventBus.on('window:close', () => windowLifecycle.closed++);
```

### Example 4: Validate Custom Events

```javascript
// Add to EventSchema.js
'myapp:save': {
    namespace: 'myapp',
    action: 'save',
    payload: {
        data: 'string',
        timestamp: 'number'
    }
};

// Use in code - automatically validated!
EventBus.emit('myapp:save', {
    data: 'Hello',
    timestamp: Date.now()
});
```

## Learn More

- **Architecture Plan**: See `ARCHITECTURE_PLAN.md` for the complete architecture design
- **Event Schema**: See `core/EventSchema.js` for all event definitions
- **Semantic Event Bus**: See `core/SemanticEventBus.js` for implementation details

---

**Built with ❤️ for IlluminatOS**
